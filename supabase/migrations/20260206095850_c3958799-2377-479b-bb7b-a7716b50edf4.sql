-- Drop and recreate the function with proper RLS bypass
DROP FUNCTION IF EXISTS public.accept_invitation(text);

CREATE OR REPLACE FUNCTION public.accept_invitation(p_invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
  v_investee_id uuid;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM public.investee_invitations
  WHERE invitation_token = p_invitation_token;

  -- Check if invitation exists
  IF v_invitation IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invitation_not_found');
  END IF;

  -- Check if already accepted
  IF v_invitation.status = 'accepted' THEN
    RETURN json_build_object('success', true, 'already_accepted', true, 'company_name', v_invitation.company_name);
  END IF;

  -- Check if expired
  IF v_invitation.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  -- Update invitation status (this works because of SECURITY DEFINER)
  UPDATE public.investee_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;

  -- Create investee record bypassing RLS due to SECURITY DEFINER
  INSERT INTO public.investees (user_id, company_name, contact_email)
  VALUES (v_invitation.user_id, v_invitation.company_name, v_invitation.contact_email)
  RETURNING id INTO v_investee_id;

  RETURN json_build_object('success', true, 'company_name', v_invitation.company_name, 'investee_id', v_investee_id);

EXCEPTION WHEN OTHERS THEN
  -- Log the error and return failure
  RAISE LOG 'accept_invitation error: %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;