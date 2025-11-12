-- ============================================================================
-- FEDERAL EXPRESS BRASIL - ROW LEVEL SECURITY (RLS)
-- Migration: Habilitar RLS e criar políticas de segurança
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selfies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. POLÍTICAS PARA PROFILES
-- ----------------------------------------------------------------------------
CREATE POLICY "users_can_view_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 3. POLÍTICAS PARA PAYMENTS
-- ----------------------------------------------------------------------------
CREATE POLICY "users_can_view_own_payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT só via service_role (webhook)
-- Não criar policy de INSERT para usuários normais

-- ----------------------------------------------------------------------------
-- 4. POLÍTICAS PARA APPLICATIONS
-- ----------------------------------------------------------------------------
CREATE POLICY "users_can_view_own_applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. POLÍTICAS PARA SOCIAL_ACCOUNTS
-- ----------------------------------------------------------------------------
CREATE POLICY "users_can_view_own_social_accounts"
  ON public.social_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = social_accounts.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_own_social_accounts"
  ON public.social_accounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = social_accounts.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_own_social_accounts"
  ON public.social_accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = social_accounts.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_delete_own_social_accounts"
  ON public.social_accounts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = social_accounts.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS PARA DOCUMENTS
-- ----------------------------------------------------------------------------
CREATE POLICY "users_can_view_own_documents"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_own_documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_own_documents"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. POLÍTICAS PARA SELFIES
-- ----------------------------------------------------------------------------
CREATE POLICY "users_can_view_own_selfies"
  ON public.selfies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = selfies.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_own_selfies"
  ON public.selfies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = selfies.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 8. POLÍTICAS PARA AUDIT_LOGS
-- ----------------------------------------------------------------------------
-- Apenas leitura dos próprios logs
CREATE POLICY "users_can_view_own_audit_logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT apenas via service_role
-- Não criar policy de INSERT para usuários normais

-- ----------------------------------------------------------------------------
-- 9. POLÍTICAS DE STORAGE (buckets)
-- ----------------------------------------------------------------------------
-- NOTA: Estas policies são aplicadas via Supabase Dashboard ou SQL específico
-- para o schema 'storage'

-- Bucket: documents
-- Policy: users_can_upload_own_documents
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Policy: users_can_view_own_documents_storage
-- CREATE POLICY "users_can_view_own_documents_storage"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'documents' AND
--     (storage.foldername(name))[1] = 'applications' AND
--     EXISTS (
--       SELECT 1 FROM public.applications
--       WHERE applications.id::text = (storage.foldername(name))[2]
--       AND applications.user_id = auth.uid()
--     )
--   );

-- Bucket: selfies
-- INSERT INTO storage.buckets (id, name, public) VALUES ('selfies', 'selfies', false);

-- Policy: users_can_upload_own_selfies_storage
-- CREATE POLICY "users_can_upload_own_selfies_storage"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'selfies' AND
--     (storage.foldername(name))[1] = 'applications' AND
--     EXISTS (
--       SELECT 1 FROM public.applications
--       WHERE applications.id::text = (storage.foldername(name))[2]
--       AND applications.user_id = auth.uid()
--     )
--   );

COMMENT ON POLICY "users_can_view_own_profile" ON public.profiles IS 'Usuários só podem ver seu próprio perfil';
COMMENT ON POLICY "users_can_view_own_applications" ON public.applications IS 'Usuários só podem ver suas próprias aplicações';
COMMENT ON POLICY "users_can_view_own_documents" ON public.documents IS 'Usuários só podem ver documentos de suas aplicações';

