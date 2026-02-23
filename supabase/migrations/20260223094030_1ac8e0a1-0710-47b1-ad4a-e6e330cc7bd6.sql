
-- Email verification codes table
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  user_id UUID NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'invite', -- 'invite', 'verify'
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own verifications"
ON public.email_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verifications"
ON public.email_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
ON public.email_verifications FOR UPDATE
USING (auth.uid() = user_id);

-- Connection requests table (bidirectional: investor↔investee)
CREATE TABLE public.connection_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_user_id UUID NOT NULL,
  requester_role TEXT NOT NULL, -- 'investor' or 'investee'
  target_email TEXT NOT NULL,
  target_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '14 days')
);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Requester can create/view their requests
CREATE POLICY "Users can create connection requests"
ON public.connection_requests FOR INSERT
WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Users can view their sent requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = requester_user_id);

-- Target can view/update requests sent to them
CREATE POLICY "Target users can view received requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = target_user_id);

CREATE POLICY "Target users can update received requests"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = target_user_id);

-- Index for quick lookup
CREATE INDEX idx_connection_requests_target_email ON public.connection_requests(target_email);
CREATE INDEX idx_connection_requests_target_user ON public.connection_requests(target_user_id);
CREATE INDEX idx_email_verifications_email_code ON public.email_verifications(email, code);
