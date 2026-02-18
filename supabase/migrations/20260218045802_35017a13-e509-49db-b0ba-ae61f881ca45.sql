
-- 1. Add investee_user_id to investees table for linking investee accounts
ALTER TABLE public.investees ADD COLUMN investee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. RLS: Investee users can view their own investee records
CREATE POLICY "Investee users can view their linked records"
  ON public.investees FOR SELECT
  USING (auth.uid() = investee_user_id);

-- 3. RLS: Investee users can view report requests for their linked investees  
CREATE POLICY "Investee users can view their report requests"
  ON public.report_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investees i
      WHERE i.id = report_requests.investee_id
        AND i.investee_user_id = auth.uid()
    )
  );

-- 4. RLS: Investee users can view their shareholder reports
CREATE POLICY "Investee users can view their reports"
  ON public.shareholder_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.investees i
      WHERE i.id = shareholder_reports.investee_id
        AND i.investee_user_id = auth.uid()
    )
  );

-- 5. RLS: Investee users can insert shareholder reports for their linked investees
CREATE POLICY "Investee users can create reports"
  ON public.shareholder_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investees i
      WHERE i.id = shareholder_reports.investee_id
        AND i.investee_user_id = auth.uid()
    )
  );

-- 6. RLS: Investee users can update report request status
CREATE POLICY "Investee users can update their report requests"
  ON public.report_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.investees i
      WHERE i.id = report_requests.investee_id
        AND i.investee_user_id = auth.uid()
    )
  );

-- 7. Function to auto-link investee records when investee user signs up
CREATE OR REPLACE FUNCTION public.auto_link_investee_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_email text;
BEGIN
  v_role := NEW.raw_user_meta_data ->> 'role';
  v_email := NEW.email;
  
  IF v_role = 'investee' AND v_email IS NOT NULL THEN
    UPDATE public.investees
    SET investee_user_id = NEW.id
    WHERE contact_email = v_email
      AND investee_user_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_auto_link_investee
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_investee_on_signup();
