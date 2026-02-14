
ALTER TABLE public.report_requests
ADD COLUMN report_fields text[] DEFAULT NULL;
