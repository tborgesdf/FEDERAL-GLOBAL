# 📦 SETUP DE STORAGE - SUPABASE

## ⚠️ IMPORTANTE: CRIAR BUCKETS ANTES DAS MIGRATIONS

Os buckets de storage não podem ser criados via SQL migrations (requerem permissões especiais).
Você deve criá-los manualmente no Supabase Dashboard **ANTES** de rodar as migrations.

---

## 📋 Passo a Passo

### 1️⃣ Acessar o Storage no Supabase

1. Acesse: https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz
2. No menu lateral, clique em **Storage**
3. Clique no botão **"New bucket"**

---

### 2️⃣ Criar Bucket: `documents`

**Configurações:**
```
Name: documents
Public: ❌ false (privado)
File size limit: 52428800 (50 MB)
Allowed MIME types:
  - image/jpeg
  - image/png
  - image/jpg
  - application/pdf
```

**O que será armazenado:**
- Fotos de passaportes
- Fotos de vistos anteriores
- Fotos de RG/CNH
- Fotos de certidões de casamento
- Arquivos PDF de documentos
- DS-160 gerado (Excel)

**Estrutura de pastas:**
```
documents/
  {user_id}/
    {application_id}/
      passport-single-{timestamp}.jpg
      previous-visa-single-{timestamp}.jpg
      rg-front-{timestamp}.jpg
      rg-back-{timestamp}.jpg
      cnh-single-{timestamp}.jpg
      marriage-cert-single-{timestamp}.jpg
      DS160_{application_id}.xlsx
```

---

### 3️⃣ Criar Bucket: `selfies`

**Configurações:**
```
Name: selfies
Public: ❌ false (privado)
File size limit: 10485760 (10 MB)
Allowed MIME types:
  - image/jpeg
  - image/png
  - image/jpg
```

**O que será armazenado:**
- Selfies dos usuários (para validação de identidade)

**Estrutura de pastas:**
```
selfies/
  {user_id}/
    {application_id}/
      selfie-{timestamp}.jpg
```

---

## 3️⃣ Verificar Criação

Após criar os dois buckets, você deve ver:

```
Storage
  └── documents (private, 50MB)
  └── selfies (private, 10MB)
```

---

## 4️⃣ Rodar as Migrations

**Agora sim**, rode as migrations para criar as políticas RLS:

```bash
# No SQL Editor do Supabase, execute na ordem:
# 1. 20250112000001_create_visa_application_tables.sql
# 2. 20250112000002_enable_rls_policies.sql
# 3. 20250112000003_migrate_to_civil_status.sql
# 4. 20250112000004_user_profiles.sql
# 5. 20250112000005_social_accounts_extended.sql
# 6. 20250112000006_storage_buckets.sql ✅ Esta cria as políticas
```

---

## 5️⃣ Testar Políticas

Execute no SQL Editor para verificar se as políticas foram criadas:

```sql
-- Ver políticas do bucket documents
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE 'documents_%';

-- Ver políticas do bucket selfies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE 'selfies_%';
```

**Resultado esperado:** 4 políticas para `documents` e 4 para `selfies` (read, insert, update, delete).

---

## 🔒 Segurança (RLS)

As políticas criadas pela migration garantem que:

✅ Cada usuário só acessa arquivos na **sua pasta** (`{user_id}/...`)  
✅ Ninguém consegue ler/modificar arquivos de outros usuários  
✅ Admins (service role) podem acessar tudo  

**Padrão de path seguro:**
```
{bucket}/{user_id}/{application_id}/{filename}
                ↑
          Validado pelo RLS (auth.uid())
```

---

## 🧪 Teste Manual no Dashboard

1. Vá em **Storage > documents**
2. Clique em **Upload file**
3. Tente fazer upload de uma imagem
4. Verifique que a estrutura de pastas está correta
5. Repita para **selfies**

---

## ✅ Checklist Final

- [ ] Bucket `documents` criado (50MB, privado, 4 MIME types)
- [ ] Bucket `selfies` criado (10MB, privado, 3 MIME types)
- [ ] Migration `20250112000006_storage_buckets.sql` executada com sucesso
- [ ] 8 políticas RLS criadas (4 por bucket)
- [ ] Teste de upload manual OK

---

## 📞 Problemas?

**Erro: "Row level security is not enabled"**
- Execute `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`

**Erro: "new row violates row-level security policy"**
- Verifique se o path do arquivo segue o padrão `{user_id}/...`
- Confira se o usuário está autenticado (`auth.uid()` não é null)

**Erro: "bucket does not exist"**
- Os buckets devem ser criados manualmente no Dashboard primeiro
- Não tente criá-los via SQL (requer permissões de superusuário)

---

## 🚀 Próximos Passos

Depois de configurar o storage:
1. Rodar todas as migrations
2. Implementar as páginas do fluxo (`/flow/*`)
3. Testar upload de documentos
4. Testar captura de selfie
5. Testar geração de DS-160

---

**Dúvidas?** Consulte:
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

