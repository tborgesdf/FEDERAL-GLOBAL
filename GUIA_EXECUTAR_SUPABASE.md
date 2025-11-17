# 🚀 GUIA PARA EXECUTAR SQL NO SUPABASE

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Acessar o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: **federal-global**

### **PASSO 2: Abrir o SQL Editor**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique no botão **"New query"** (ou use o atalho `Ctrl+K`)

### **PASSO 3: Executar o Script SQL Consolidado**

1. Abra o arquivo: `supabase/SETUP_ADMIN_SYSTEM.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique no botão **"Run"** (ou use `Ctrl+Enter`)

### **PASSO 4: Verificar se Funcionou**

Após executar, você deve ver mensagens como:

```
NOTICE: Ultra Admin inserido com sucesso: [UUID]
NOTICE: SETUP DO SISTEMA ADMIN CONCLUÍDO!
```

### **PASSO 5: Verificar as Tabelas**

Execute no SQL Editor:

```sql
-- Verificar tabela admins
SELECT * FROM admins;

-- Verificar tabela admin_access_logs
SELECT * FROM admin_access_logs;
```

**Resultado esperado:**
- Tabela `admins`: Deve ter 1 registro (Ultra Admin)
- Tabela `admin_access_logs`: Pode estar vazia (normal, será preenchida ao fazer login)

---

## ✅ VERIFICAÇÃO FINAL

### **Teste 1: Verificar se as Tabelas Existem**

```sql
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('admins', 'admin_access_logs');
```

**Deve retornar 2 linhas.**

### **Teste 2: Verificar Ultra Admin**

```sql
SELECT 
    email,
    full_name,
    role,
    is_active
FROM admins
WHERE email = 'tbogesdf.ai@gmail.com';
```

**Deve retornar:**
- email: `tbogesdf.ai@gmail.com`
- full_name: `Thiago Ferreira Alves e Borges`
- role: `super_admin`
- is_active: `true`

### **Teste 3: Verificar Índices**

```sql
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('admins', 'admin_access_logs');
```

**Deve retornar vários índices criados.**

---

## 🔐 CRIAR USUÁRIO NO SUPABASE AUTH (OPCIONAL)

Se quiser criar o usuário no Supabase Auth também:

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Users"**
3. Clique em **"Add user"** → **"Create new user"**
4. Preencha:
   - **Email:** `tbogesdf.ai@gmail.com`
   - **Password:** `Ale290800`
   - **Auto Confirm User:** ✅ (marcar)
5. Clique em **"Create user"**

**Nota:** Isso é opcional. O sistema funciona mesmo sem criar no Auth, pois usa credenciais hardcoded.

---

## 🎯 PRÓXIMOS PASSOS

Após executar o SQL:

1. ✅ **Recarregue a página do dashboard**
2. ✅ **Acesse:** `http://localhost:3000#admin`
3. ✅ **Faça login** com:
   - Email: `tbogesdf.ai@gmail.com`
   - Senha: `Ale290800`
4. ✅ **Clique na tab "Admin"**
5. ✅ **Veja o log de acesso** aparecer na tabela!

---

## 🆘 TROUBLESHOOTING

### **Erro: "relation already exists"**

✅ **Solução:** Normal! Significa que as tabelas já existem. O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente.

### **Erro: "permission denied"**

✅ **Solução:** Verifique se você tem permissões de administrador no projeto Supabase.

### **Erro: "uuid-ossp extension"**

✅ **Solução:** O script já cria a extensão automaticamente. Se der erro, execute manualmente:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Tabelas não aparecem**

✅ **Solução:** 
1. Verifique se está no schema correto (`public`)
2. Recarregue a página do Supabase Dashboard
3. Verifique se o script foi executado completamente (sem erros)

---

## 📝 ARQUIVO SQL CONSOLIDADO

O arquivo `supabase/SETUP_ADMIN_SYSTEM.sql` contém:

- ✅ Criação da tabela `admins`
- ✅ Criação da tabela `admin_access_logs`
- ✅ Criação de índices
- ✅ Criação de funções e triggers
- ✅ Inserção do Ultra Admin
- ✅ Verificação final

**Tudo em um único script!** 🎉

---

## 🎉 APÓS EXECUTAR

**O sistema estará 100% funcional!**

- ✅ Tabelas criadas
- ✅ Ultra Admin configurado
- ✅ Logs de acesso funcionando
- ✅ Sistema completo operacional

**Execute o SQL e teste!** 🚀

