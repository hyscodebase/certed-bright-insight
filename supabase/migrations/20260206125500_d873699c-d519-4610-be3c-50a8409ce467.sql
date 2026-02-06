-- Create RPC function for submitting shareholder report (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.submit_shareholder_report(
  p_request_token TEXT,
  p_report_period TEXT,
  p_monthly_summary TEXT,
  p_problems_risks TEXT,
  p_next_month_decisions TEXT,
  p_shareholder_input_needed TEXT,
  p_monthly_revenue BIGINT,
  p_cumulative_revenue BIGINT,
  p_fixed_costs BIGINT,
  p_variable_costs BIGINT,
  p_cash_balance BIGINT,
  p_runway_months INTEGER,
  p_employee_count_change INTEGER,
  p_contract_count INTEGER DEFAULT NULL,
  p_paid_customer_count INTEGER DEFAULT NULL,
  p_average_contract_value BIGINT DEFAULT NULL,
  p_mau INTEGER DEFAULT NULL,
  p_dau INTEGER DEFAULT NULL,
  p_conversion_rate DECIMAL(5,2) DEFAULT NULL,
  p_cac BIGINT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request RECORD;
  v_report_id UUID;
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

  -- Create the shareholder report
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

  -- Update request status
  UPDATE public.report_requests
  SET status = 'completed', completed_at = now()
  WHERE id = v_request.id;

  RETURN json_build_object('success', true, 'report_id', v_report_id);

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'submit_shareholder_report error: %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;