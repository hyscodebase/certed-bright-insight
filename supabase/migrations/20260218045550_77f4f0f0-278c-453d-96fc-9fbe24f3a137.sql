
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('investor', 'investee');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Create investee_profiles table (for investee company details)
CREATE TABLE public.investee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  business_registration_number text,
  representative text,
  industry text,
  established_date date,
  capital bigint DEFAULT 0,
  employee_count integer DEFAULT 0,
  address text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investee_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investee profile"
  ON public.investee_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investee profile"
  ON public.investee_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investee profile"
  ON public.investee_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Investors can view investee profiles of their connected investees
CREATE POLICY "Investors can view connected investee profiles"
  ON public.investee_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investees i
      WHERE i.contact_email = investee_profiles.contact_email
        AND i.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_investee_profiles_updated_at
  BEFORE UPDATE ON public.investee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Function to assign role during signup (called from client)
CREATE OR REPLACE FUNCTION public.assign_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := NEW.raw_user_meta_data ->> 'role';
  IF v_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (runs after handle_new_user)
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_role_on_signup();
