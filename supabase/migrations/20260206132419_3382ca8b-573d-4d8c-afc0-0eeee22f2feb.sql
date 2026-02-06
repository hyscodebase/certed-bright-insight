-- Add unique constraint on investee_id + report_period to enforce one report per month
ALTER TABLE public.shareholder_reports 
ADD CONSTRAINT shareholder_reports_investee_period_unique 
UNIQUE (investee_id, report_period);

-- Update the submit_shareholder_report function to upsert instead of insert
CREATE OR REPLACE FUNCTION public.submit_shareholder_report(
  p_request_token text, 
  p_report_period text, 
  p_monthly_summary text, 
  p_problems_risks text, 
  p_next_month_decisions text, 
  p_shareholder_input_needed text, 
  p_monthly_revenue bigint, 
  p_cumulative_revenue bigint, 
  p_fixed_costs bigint, 
  p_variable_costs bigint, 
  p_cash_balance bigint, 
  p_runway_months integer, 
  p_employee_count_change integer, 
  p_contract_count integer DEFAULT NULL::integer, 
  p_paid_customer_count integer DEFAULT NULL::integer, 
  p_average_contract_value bigint DEFAULT NULL::bigint, 
  p_mau integer DEFAULT NULL::integer, 
  p_dau integer DEFAULT NULL::integer, 
  p_conversion_rate numeric DEFAULT NULL::numeric, 
  p_cac bigint DEFAULT NULL::bigint
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_request RECORD;
  v_report_id UUID;
  v_is_update BOOLEAN := false;
BEGIN
  -- Get the report request
  SELECT * INTO v_request
  FROM public.report_requests
  WHERE request_token = p_request_token;

  -- Check if request exists
  IF v_request IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'request_not_found');
  END IF;

  -- Check if already completed
  IF v_request.status = 'completed' THEN
    RETURN json_build_object('success', true, 'already_completed', true);
  END IF;

  -- Check if expired
  IF v_request.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  -- Check if a report for this period already exists
  SELECT id INTO v_report_id
  FROM public.shareholder_reports
  WHERE investee_id = v_request.investee_id
    AND report_period = p_report_period;

  IF v_report_id IS NOT NULL THEN
    -- Update existing report
    v_is_update := true;
    UPDATE public.shareholder_reports
    SET
      report_request_id = v_request.id,
      monthly_summary = p_monthly_summary,
      problems_risks = p_problems_risks,
      next_month_decisions = p_next_month_decisions,
      shareholder_input_needed = p_shareholder_input_needed,
      monthly_revenue = p_monthly_revenue,
      cumulative_revenue = p_cumulative_revenue,
      fixed_costs = p_fixed_costs,
      variable_costs = p_variable_costs,
      cash_balance = p_cash_balance,
      runway_months = p_runway_months,
      employee_count_change = p_employee_count_change,
      contract_count = p_contract_count,
      paid_customer_count = p_paid_customer_count,
      average_contract_value = p_average_contract_value,
      mau = p_mau,
      dau = p_dau,
      conversion_rate = p_conversion_rate,
      cac = p_cac,
      updated_at = now()
    WHERE id = v_report_id;
  ELSE
    -- Create new report
    INSERT INTO public.shareholder_reports (
      investee_id,
      report_request_id,
      report_period,
      monthly_summary,
      problems_risks,
      next_month_decisions,
      shareholder_input_needed,
      monthly_revenue,
      cumulative_revenue,
      fixed_costs,
      variable_costs,
      cash_balance,
      runway_months,
      employee_count_change,
      contract_count,
      paid_customer_count,
      average_contract_value,
      mau,
      dau,
      conversion_rate,
      cac
    ) VALUES (
      v_request.investee_id,
      v_request.id,
      p_report_period,
      p_monthly_summary,
      p_problems_risks,
      p_next_month_decisions,
      p_shareholder_input_needed,
      p_monthly_revenue,
      p_cumulative_revenue,
      p_fixed_costs,
      p_variable_costs,
      p_cash_balance,
      p_runway_months,
      p_employee_count_change,
      p_contract_count,
      p_paid_customer_count,
      p_average_contract_value,
      p_mau,
      p_dau,
      p_conversion_rate,
      p_cac
    )
    RETURNING id INTO v_report_id;
  END IF;

  -- Update request status
  UPDATE public.report_requests
  SET status = 'completed', completed_at = now()
  WHERE id = v_request.id;

  RETURN json_build_object(
    'success', true, 
    'report_id', v_report_id,
    'is_update', v_is_update
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'submit_shareholder_report error: %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;
