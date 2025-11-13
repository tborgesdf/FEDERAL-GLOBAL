-- ============================================================================
-- FEDERAL EXPRESS BRASIL - STORAGE POLICIES
-- Migration: Criar políticas RLS para buckets de storage
-- ============================================================================
-- 
-- ATENÇÃO: Os buckets 'documents' e 'selfies' devem ser criados manualmente
-- no Supabase Dashboard antes de rodar esta migration:
-- 
-- 1. Acesse: Supabase Dashboard > Storage
-- 2. Crie o bucket 'documents':
--    - Name: documents
--    - Public: false
--    - File size limit: 50 MB (52428800 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/jpg, application/pdf
-- 
-- 3. Crie o bucket 'selfies':
--    - Name: selfies
--    - Public: false
--    - File size limit: 10 MB (10485760 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/jpg
-- 
-- Esta migration criará apenas as políticas de segurança (RLS) para esses buckets.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2. POLÍTICAS PARA BUCKET DOCUMENTS
-- ----------------------------------------------------------------------------
-- Limpar políticas antigas
DROP POLICY IF EXISTS "documents_read_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_update_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_own" ON storage.objects;

-- Usuários podem ler seus próprios documentos
CREATE POLICY "documents_read_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuários podem fazer upload de seus próprios documentos
CREATE POLICY "documents_insert_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuários podem atualizar seus próprios documentos
CREATE POLICY "documents_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuários podem deletar seus próprios documentos
CREATE POLICY "documents_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ----------------------------------------------------------------------------
-- 3. POLÍTICAS PARA BUCKET SELFIES
-- ----------------------------------------------------------------------------
-- Limpar políticas antigas
DROP POLICY IF EXISTS "selfies_read_own" ON storage.objects;
DROP POLICY IF EXISTS "selfies_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "selfies_update_own" ON storage.objects;
DROP POLICY IF EXISTS "selfies_delete_own" ON storage.objects;

-- Usuários podem ler suas próprias selfies
CREATE POLICY "selfies_read_own" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuários podem fazer upload de suas próprias selfies
CREATE POLICY "selfies_insert_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuários podem atualizar suas próprias selfies
CREATE POLICY "selfies_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuários podem deletar suas próprias selfies
CREATE POLICY "selfies_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'selfies' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ----------------------------------------------------------------------------
-- 4. COMENTÁRIOS EXPLICATIVOS
-- ----------------------------------------------------------------------------
COMMENT ON POLICY "documents_read_own" ON storage.objects IS 'Usuários podem ler documentos da pasta {user_id}/...';
COMMENT ON POLICY "selfies_read_own" ON storage.objects IS 'Usuários podem ler selfies da pasta {user_id}/...';

-- ----------------------------------------------------------------------------
-- 5. ESTRUTURA DE PASTAS SUGERIDA
-- ----------------------------------------------------------------------------
-- documents/{user_id}/{application_id}/{doc_type}-{side}-{timestamp}.{ext}
-- selfies/{user_id}/{application_id}/selfie-{timestamp}.jpg

