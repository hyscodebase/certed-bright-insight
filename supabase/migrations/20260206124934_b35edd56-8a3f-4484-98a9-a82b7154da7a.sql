-- Create shareholder report requests table (for tracking report request emails)
CREATE TABLE public.report_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investee_id UUID NOT NULL REFERENCES public.investees(id) ON DELETE CASCADE,
  request_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '14 days'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create shareholder reports table with all the required and optional fields
CREATE TABLE public.shareholder_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investee_id UUID NOT NULL REFERENCES public.investees(id) ON DELETE CASCADE,
  report_request_id UUID REFERENCES public.report_requests(id) ON DELETE SET NULL,
  report_period TEXT NOT NULL, -- e.g., '2026-02' for February 2026
  
  -- Required fields (필수)
  monthly_summary TEXT NOT NULL, -- 이번 달 한 줄 요약
  problems_risks TEXT NOT NULL, -- 문제/리스크
  next_month_decisions TEXT NOT NULL, -- 다음 달 중요한 의사결정 포인트
  shareholder_input_needed TEXT NOT NULL, -- 주주 의견이 필요한 사안
  monthly_revenue BIGINT NOT NULL DEFAULT 0, -- 월 매출
  cumulative_revenue BIGINT NOT NULL DEFAULT 0, -- 누적 매출
  fixed_costs BIGINT NOT NULL DEFAULT 0, -- 고정비
  variable_costs BIGINT NOT NULL DEFAULT 0, -- 변동비
  cash_balance BIGINT NOT NULL DEFAULT 0, -- 현금 잔고
  runway_months INTEGER NOT NULL DEFAULT 0, -- Runway (개월)
  employee_count_change INTEGER NOT NULL DEFAULT 0, -- 인원 수 변화
  
  -- Optional fields (선택)
  contract_count INTEGER, -- 계약 수
  paid_customer_count INTEGER, -- 유료 고객 수
  average_contract_value BIGINT, -- 평균 계약 단가
  mau INTEGER, -- MAU
  dau INTEGER, -- DAU
  conversion_rate DECIMAL(5,2), -- 전환율 (%)
  cac BIGINT, -- CAC
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.report_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareholder_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for report_requests
CREATE POLICY "Users can view their investees report requests"
ON public.report_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.investees i
    WHERE i.id = investee_id AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create report requests for their investees"
ON public.report_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.investees i
    WHERE i.id = investee_id AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view report request by token"
ON public.report_requests FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update report request status"
ON public.report_requests FOR UPDATE
TO anon, authenticated
USING (true);

-- RLS policies for shareholder_reports
CREATE POLICY "Users can view their investees reports"
ON public.shareholder_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.investees i
    WHERE i.id = investee_id AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create reports with valid request"
ON public.shareholder_reports FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.report_requests rr
    WHERE rr.id = report_request_id
    AND rr.status = 'pending'
    AND rr.expires_at > now()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_shareholder_reports_updated_at
BEFORE UPDATE ON public.shareholder_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_report_requests_token ON public.report_requests(request_token);
CREATE INDEX idx_report_requests_investee ON public.report_requests(investee_id);
CREATE INDEX idx_shareholder_reports_investee ON public.shareholder_reports(investee_id);
CREATE INDEX idx_shareholder_reports_period ON public.shareholder_reports(report_period);