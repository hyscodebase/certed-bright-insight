
-- Update handle_new_user to also insert into user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := NEW.raw_user_meta_data ->> 'role';

  -- Always create a profiles record
  INSERT INTO public.profiles (user_id, company_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'company_name',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );

  -- Insert role if provided
  IF v_role IN ('investor', 'investee') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- If investee role, also create investee_profiles record
  IF v_role = 'investee' THEN
    INSERT INTO public.investee_profiles (
      user_id, company_name, business_registration_number, representative,
      industry, established_date, capital, employee_count, address, contact_email
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'business_registration_number', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'representative', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'industry', ''),
      CASE WHEN NEW.raw_user_meta_data ->> 'established_date' IS NOT NULL AND NEW.raw_user_meta_data ->> 'established_date' != ''
        THEN (NEW.raw_user_meta_data ->> 'established_date')::date ELSE NULL END,
      CASE WHEN NEW.raw_user_meta_data ->> 'capital' IS NOT NULL AND NEW.raw_user_meta_data ->> 'capital' != ''
        THEN (NEW.raw_user_meta_data ->> 'capital')::bigint ELSE 0 END,
      CASE WHEN NEW.raw_user_meta_data ->> 'employee_count' IS NOT NULL AND NEW.raw_user_meta_data ->> 'employee_count' != ''
        THEN (NEW.raw_user_meta_data ->> 'employee_count')::integer ELSE 0 END,
      NULLIF(NEW.raw_user_meta_data ->> 'address', ''),
      NEW.email
    );

    -- Auto-link any existing investee records
    UPDATE public.investees
    SET investee_user_id = NEW.id
    WHERE contact_email = NEW.email
      AND investee_user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;
