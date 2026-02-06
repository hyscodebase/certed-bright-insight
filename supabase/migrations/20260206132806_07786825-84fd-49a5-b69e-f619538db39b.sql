-- Add report_period column to report_requests table
ALTER TABLE public.report_requests 
ADD COLUMN report_period text;

-- Add a comment for clarity
COMMENT ON COLUMN public.report_requests.report_period IS 'The month for which the report is being requested (format: YYYY-MM)';