-- Allow users to delete their own roles (needed for CompleteProfile role reassignment)
CREATE POLICY "Users can delete their own roles"
ON public.user_roles
FOR DELETE
USING (auth.uid() = user_id);