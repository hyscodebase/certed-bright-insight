-- Create investee_invitations table to track pending invitations
CREATE TABLE public.investee_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.investee_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own invitations
CREATE POLICY "Users can view their own invitations"
ON public.investee_invitations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create invitations
CREATE POLICY "Users can create invitations"
ON public.investee_invitations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Anyone can view invitation by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
ON public.investee_invitations
FOR SELECT
USING (true);

-- Policy: Allow updating invitation status (for accepting)
CREATE POLICY "Allow updating invitation status"
ON public.investee_invitations
FOR UPDATE
USING (true);