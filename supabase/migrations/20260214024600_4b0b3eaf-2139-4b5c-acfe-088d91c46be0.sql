
-- 1. Funds table
CREATE TABLE public.funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funds" ON public.funds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own funds" ON public.funds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own funds" ON public.funds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own funds" ON public.funds FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_funds_updated_at BEFORE UPDATE ON public.funds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Fund-Investee junction table (many-to-many)
CREATE TABLE public.fund_investees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.funds(id) ON DELETE CASCADE,
  investee_id UUID NOT NULL REFERENCES public.investees(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fund_id, investee_id)
);

ALTER TABLE public.fund_investees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their fund-investee mappings" ON public.fund_investees FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.funds f WHERE f.id = fund_investees.fund_id AND f.user_id = auth.uid()));
CREATE POLICY "Users can create fund-investee mappings" ON public.fund_investees FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.funds f WHERE f.id = fund_investees.fund_id AND f.user_id = auth.uid()));
CREATE POLICY "Users can delete fund-investee mappings" ON public.fund_investees FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.funds f WHERE f.id = fund_investees.fund_id AND f.user_id = auth.uid()));

-- 3. Add report_frequency to investees (monthly, quarterly, semi_annual, annual)
ALTER TABLE public.investees ADD COLUMN report_frequency TEXT NOT NULL DEFAULT 'monthly';
