-- Add a new INSERT policy that allows inserting when there's a valid invitation
-- This policy allows the insert if a matching invitation exists

CREATE POLICY "Allow insert via valid invitation"
ON investees FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM investee_invitations inv
    WHERE inv.user_id = user_id
    AND inv.company_name = company_name
    AND inv.contact_email = contact_email
    AND inv.expires_at > now()
  )
);