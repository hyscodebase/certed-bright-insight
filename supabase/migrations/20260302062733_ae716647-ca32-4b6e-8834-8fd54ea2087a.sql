
-- Add report config columns to investee_invitations
ALTER TABLE public.investee_invitations 
  ADD COLUMN IF NOT EXISTS representative text,
  ADD COLUMN IF NOT EXISTS report_frequency text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS report_fields jsonb NOT NULL DEFAULT '{"monthly": ["contract_count", "paid_customer_count", "average_contract_value", "mau", "dau", "conversion_rate", "cac"]}'::jsonb,
  ADD COLUMN IF NOT EXISTS fund_ids jsonb DEFAULT '[]'::jsonb;

-- Replace accept_invitation function to include report config
CREATE OR REPLACE FUNCTION public.accept_invitation(p_invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invitation record;
  v_investee_id uuid;
  v_fund_id text;
BEGIN
  SELECT * INTO v_invitation
  FROM public.investee_invitations
  WHERE invitation_token = p_invitation_token;

  IF v_invitation IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invitation_not_found');
  END IF;

  IF v_invitation.status = 'accepted' THEN
    RETURN json_build_object('success', true, 'already_accepted', true, 'company_name', v_invitation.company_name);
  END IF;

  IF v_invitation.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  UPDATE public.investee_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;

  INSERT INTO public.investees (
    user_id, company_name, contact_email, representative,
    report_frequency, report_fields
  )
  VALUES (
    v_invitation.user_id,
    v_invitation.company_name,
    v_invitation.contact_email,
    v_invitation.representative,
    v_invitation.report_frequency,
    v_invitation.report_fields
  )
  RETURNING id INTO v_investee_id;

  -- Assign to funds if any
  IF v_invitation.fund_ids IS NOT NULL AND jsonb_array_length(v_invitation.fund_ids) > 0 THEN
    FOR v_fund_id IN SELECT jsonb_array_elements_text(v_invitation.fund_ids)
    LOOP
      INSERT INTO public.fund_investees (fund_id, investee_id)
      VALUES (v_fund_id::uuid, v_investee_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN json_build_object('success', true, 'company_name', v_invitation.company_name, 'investee_id', v_investee_id);

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'accept_invitation error: %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;
