
-- Change report_fields from text[] to jsonb to support per-frequency configuration
ALTER TABLE public.investees 
ALTER COLUMN report_fields DROP DEFAULT,
ALTER COLUMN report_fields TYPE jsonb USING to_jsonb(report_fields),
ALTER COLUMN report_fields SET DEFAULT '{"monthly":["contract_count","paid_customer_count","average_contract_value","mau","dau","conversion_rate","cac"],"quarterly":["contract_count","paid_customer_count","average_contract_value","mau","dau","conversion_rate","cac"],"semi_annual":["contract_count","paid_customer_count","average_contract_value","mau","dau","conversion_rate","cac"],"annual":["contract_count","paid_customer_count","average_contract_value","mau","dau","conversion_rate","cac"]}'::jsonb;

-- Also change report_requests.report_fields to text[] (keep as-is, it stores the resolved fields for a specific request)
