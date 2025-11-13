-- ============================================================================
-- FEDERAL EXPRESS BRASIL - STORAGE POLICIES
-- Execute este script DIRETAMENTE no SQL Editor do Supabase Dashboard
-- após criar os buckets 'documents' e 'selfies'
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HABILITAR RLS (se necessário)
-- ----------------------------------------------------------------------------
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "documents_read_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_update_own" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_own" ON storage.objects;

DROP POLICY IF EXISTS "selfies_read_own" ON storage.objects;
DROP POLICY IF EXISTS "selfies_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "selfies_update_own" ON storage.objects;
DROP POLICY IF EXISTS "selfies_delete_own" ON storage.objects;

-- ----------------------------------------------------------------------------
-- 3. POLÍTICAS PARA BUCKET DOCUMENTS
-- ----------------------------------------------------------------------------

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
-- 4. POLÍTICAS PARA BUCKET SELFIES
-- ----------------------------------------------------------------------------

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
-- 5. VERIFICAÇÃO
-- ----------------------------------------------------------------------------
-- Execute esta query para verificar se as políticas foram criadas:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN policyname LIKE 'documents%' THEN '✅ documents'
    WHEN policyname LIKE 'selfies%' THEN '✅ selfies'
    ELSE '❌ outro'
  END as bucket
FROM pg_policies
WHERE tablename = 'objects' 
  AND (policyname LIKE 'documents_%' OR policyname LIKE 'selfies_%')
ORDER BY policyname;

-- Resultado esperado: 8 políticas (4 para documents + 4 para selfies)

