
-- Enum de status de aprovação
DO $$ BEGIN
  CREATE TYPE public.approval_status AS ENUM ('aguardando_aprovacao', 'aprovado', 'rejeitado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Coluna em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_status public.approval_status NOT NULL DEFAULT 'aguardando_aprovacao',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Admin/moderador enxerga todos os perfis
DROP POLICY IF EXISTS "Admins veem todos os perfis" ON public.profiles;
CREATE POLICY "Admins veem todos os perfis"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Admin/moderador atualiza qualquer perfil (aprovar/rejeitar)
DROP POLICY IF EXISTS "Admins atualizam perfis" ON public.profiles;
CREATE POLICY "Admins atualizam perfis"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Função utilitária para checar aprovação
CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND approval_status = 'aprovado'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_approved(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_approved(UUID) TO authenticated, service_role;
