ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user'::app_role;

CREATE POLICY "admins update own notes" ON public.lead_notes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = author_id)
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = author_id);