
ALTER TABLE public.investees
ADD COLUMN report_fields text[] NOT NULL DEFAULT ARRAY['contract_count', 'paid_customer_count', 'average_contract_value', 'mau', 'dau', 'conversion_rate', 'cac'];
