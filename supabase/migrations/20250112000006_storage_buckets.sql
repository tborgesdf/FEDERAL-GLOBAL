-- ============================================================================
-- FEDERAL EXPRESS BRASIL - STORAGE SETUP
-- ============================================================================
-- 
-- ⚠️ IMPORTANTE: Storage policies devem ser criadas manualmente!
-- 
-- As tabelas storage.buckets e storage.objects são gerenciadas pelo sistema
-- do Supabase e requerem permissões especiais (service role).
-- 
-- Este arquivo serve apenas como DOCUMENTAÇÃO do que precisa ser feito.
-- 
-- ============================================================================
-- PASSO 1: CRIAR BUCKETS NO DASHBOARD
-- ============================================================================
-- 
-- Acesse: Supabase Dashboard > Storage > New bucket
-- 
-- Bucket 1: 'documents'
--   - Name: documents
--   - Public: false
--   - File size limit: 52428800 (50 MB)
--   - Allowed MIME types: image/jpeg, image/png, image/jpg, application/pdf
-- 
-- Bucket 2: 'selfies'
--   - Name: selfies
--   - Public: false
--   - File size limit: 10485760 (10 MB)
--   - Allowed MIME types: image/jpeg, image/png, image/jpg
-- 
-- ============================================================================
-- PASSO 2: CRIAR POLÍTICAS RLS
-- ============================================================================
-- 
-- Após criar os buckets, execute o arquivo:
--   supabase/storage-policies.sql
-- 
-- no SQL Editor do Supabase Dashboard.
-- 
-- Esse arquivo criará 8 políticas (4 por bucket):
--   - documents_read_own
--   - documents_insert_own
--   - documents_update_own
--   - documents_delete_own
--   - selfies_read_own
--   - selfies_insert_own
--   - selfies_update_own
--   - selfies_delete_own
-- 
-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- 
-- Execute no SQL Editor para confirmar:
-- 
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
--   AND (policyname LIKE 'documents_%' OR policyname LIKE 'selfies_%')
-- ORDER BY policyname;
-- 
-- Deve retornar 8 linhas.
-- 
-- ============================================================================
-- ESTRUTURA DE PASTAS
-- ============================================================================
-- 
-- documents/{user_id}/{application_id}/{doc_type}-{side}-{timestamp}.{ext}
-- selfies/{user_id}/{application_id}/selfie-{timestamp}.jpg
-- 
-- Exemplos:
--   documents/550e8400-e29b-41d4-a716-446655440000/abc123/passport-single-1704067200000.jpg
--   documents/550e8400-e29b-41d4-a716-446655440000/abc123/rg-front-1704067200000.jpg
--   selfies/550e8400-e29b-41d4-a716-446655440000/abc123/selfie-1704067200000.jpg
-- 
-- ============================================================================
-- SEGURANÇA (RLS)
-- ============================================================================
-- 
-- As políticas garantem que:
--   ✅ Cada usuário acessa APENAS arquivos da sua pasta ({user_id}/)
--   ✅ Validação via auth.uid() = primeira parte do path
--   ✅ Service role (backend) tem acesso total
--   ✅ Usuários anônimos não acessam nada
-- 
-- ============================================================================

-- Esta migration não executa SQL (apenas documenta)
-- Criar uma entrada no histórico para rastreamento
DO $$ 
BEGIN
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'STORAGE SETUP - Migration 20250112000006';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Esta migration é apenas DOCUMENTAÇÃO.';
  RAISE NOTICE '';
  RAISE NOTICE 'AÇÃO NECESSÁRIA:';
  RAISE NOTICE '1. Criar buckets no Supabase Dashboard (Storage)';
  RAISE NOTICE '2. Executar supabase/storage-policies.sql no SQL Editor';
  RAISE NOTICE '';
  RAISE NOTICE 'Consulte SUPABASE_STORAGE_SETUP.md para instruções detalhadas.';
  RAISE NOTICE '══════════════════════════════════════════════════════════════';
END $$;
