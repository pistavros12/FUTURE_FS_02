-- Move has_role() out of the public (API-exposed) schema so it can't be called via RPC by signed-in users.
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate policies to reference the relocated helper.
DROP POLICY IF EXISTS "admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "admins can delete leads" ON public.leads;
DROP POLICY IF EXISTS "admins read notes" ON public.lead_notes;
DROP POLICY IF EXISTS "admins write notes" ON public.lead_notes;
DROP POLICY IF EXISTS "admins delete own notes" ON public.lead_notes;
DROP POLICY IF EXISTS "admins update own notes" ON public.lead_notes;

CREATE POLICY "admins can read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins can delete leads" ON public.leads
  FOR DELETE TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins read notes" ON public.lead_notes
  FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins write notes" ON public.lead_notes
  FOR INSERT TO authenticated
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role) AND auth.uid() = author_id);

CREATE POLICY "admins update own notes" ON public.lead_notes
  FOR UPDATE TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role) AND auth.uid() = author_id)
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role) AND auth.uid() = author_id);

CREATE POLICY "admins delete own notes" ON public.lead_notes
  FOR DELETE TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role) AND auth.uid() = author_id);

-- Drop the public-schema copy that was exposed via the Data API.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);