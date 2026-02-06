-- Create investees table for storing investee company information
CREATE TABLE public.investees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  is_smb BOOLEAN DEFAULT true,
  capital BIGINT DEFAULT 0,
  representative TEXT,
  established_date DATE,
  employee_count INTEGER DEFAULT 0,
  investment_stage TEXT DEFAULT 'Seed',
  total_investment BIGINT DEFAULT 0,
  average_salary BIGINT DEFAULT 0,
  address TEXT,
  contact_email TEXT,
  hire_count INTEGER DEFAULT 0,
  resign_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.investees ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own investees
CREATE POLICY "Users can view their own investees"
ON public.investees
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investees"
ON public.investees
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investees"
ON public.investees
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investees"
ON public.investees
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_investees_updated_at
BEFORE UPDATE ON public.investees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();