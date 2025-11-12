-- ============================================================================
-- FEDERAL EXPRESS BRASIL - STORAGE BUCKETS
-- Migration: Criar buckets e políticas de storage
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CRIAR BUCKETS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']),
  ('selfies', 'selfies', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS 'Buckets de armazenamento: documents (50MB, docs/fotos) e selfies (10MB, apenas fotos)';

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

