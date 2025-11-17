# 🚀 GUIA COMPLETO PARA COLOCAR O SISTEMA ONLINE

## 📋 CHECKLIST PRÉ-DEPLOY

Antes de começar, verifique se você tem:
- [ ] Acesso ao Supabase Dashboard
- [ ] Acesso ao Vercel Dashboard
- [ ] Acesso ao GitHub (repositório)
- [ ] Variáveis de ambiente configuradas

---

## 🔥 PASSO 1: EXECUTAR MIGRATIONS SQL NO SUPABASE

### **1.1 Acessar o Supabase Dashboard**

1. Acesse: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Selecione o projeto: **federal-global**

### **1.2 Abrir o SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New query"** (ou use o atalho `Ctrl+K`)

### **1.3 Executar o Script SQL**

1. Abra o arquivo: `supabase/SETUP_ADMIN_SYSTEM.sql` (no seu projeto local)
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique no botão **"Run"** (ou use `Ctrl+Enter`)

### **1.4 Verificar se Funcionou**

Após executar, você deve ver mensagens como:

```
NOTICE: Ultra Admin inserido com sucesso: [UUID]
NOTICE: SETUP DO SISTEMA ADMIN CONCLUÍDO!
```

### **1.5 Verificar as Tabelas**

Execute no SQL Editor para confirmar:

```sql
-- Verificar tabela admins
SELECT * FROM admins;

-- Verificar tabela admin_access_logs
SELECT * FROM admin_access_logs;
```

**Resultado esperado:**
- ✅ Tabela `admins`: Deve ter 1 registro (Ultra Admin)
- ✅ Tabela `admin_access_logs`: Pode estar vazia (normal, será preenchida ao fazer login)

---

## 🔐 PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

### **2.1 Acessar o Vercel Dashboard**

1. Acesse: **https://vercel.com/dashboard**
2. Faça login na sua conta
3. Selecione o projeto: **FEDERAL-GLOBAL** (ou o nome do seu projeto)

### **2.2 Abrir Configurações**

1. Clique no projeto
2. Vá em **"Settings"** (Configurações)
3. Clique em **"Environment Variables"** (Variáveis de Ambiente)

### **2.3 Adicionar/Verificar Variáveis**

Adicione ou verifique as seguintes variáveis:

#### **Variáveis Obrigatórias:**

1. **`VITE_SUPABASE_URL`**
   - Valor: `https://mhsuyzndkpprnyoqsbsz.supabase.co`
   - Ambiente: Production, Preview, Development

2. **`VITE_SUPABASE_ANON_KEY`**
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc3V5em5ka3Bwcm55b3FzYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzI0NjAsImV4cCI6MjA3ODMwODQ2MH0.COArtMyvcuZsivHARvR74IUa1LaVOOno6tlQRVLT1s8`
   - Ambiente: Production, Preview, Development

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - Valor: Cole a Service Role Key do Supabase
   - Como obter:
     1. No Supabase Dashboard, vá em **"Settings"** → **"API"**
     2. Role até **"service_role"** (secret)
     3. Clique em **"Reveal"** e copie a chave
   - Ambiente: Production, Preview, Development
   - ⚠️ **IMPORTANTE:** Esta chave é sensível, não compartilhe!

#### **Variáveis Opcionais (para OCR):**

4. **`GOOGLE_APPLICATION_CREDENTIALS_JSON`**
   - Valor: Cole o JSON completo da Service Account do Google Cloud
   - Ambiente: Production, Preview, Development
   - ⚠️ **Opcional:** Só necessário se usar OCR com Google Vision

5. **`USE_REAL_OCR`**
   - Valor: `true` ou `false`
   - Ambiente: Production, Preview, Development
   - ⚠️ **Opcional:** Só necessário se usar OCR

### **2.4 Salvar Variáveis**

1. Após adicionar cada variável, clique em **"Save"**
2. Repita para todas as variáveis
3. Verifique se todas estão marcadas para **Production**

---

## 🚀 PASSO 3: VERIFICAR DEPLOY AUTOMÁTICO

### **3.1 Verificar Integração com GitHub**

1. No Vercel Dashboard, vá em **"Settings"** → **"Git"**
2. Verifique se o repositório está conectado
3. Deve mostrar: **"Connected to GitHub"**

### **3.2 Verificar Deploy Automático**

1. Vá em **"Deployments"** (Deployments)
2. Verifique se há um deploy recente
3. Se não houver, faça um novo deploy:
   - Clique em **"Deployments"**
   - Clique em **"Redeploy"** no último deploy
   - Ou faça um novo commit no GitHub

### **3.3 Aguardar Deploy**

1. O deploy pode levar 2-5 minutos
2. Acompanhe o progresso na página de Deployments
3. Aguarde até ver **"Ready"** (verde)

---

## 🧪 PASSO 4: TESTAR O SISTEMA ONLINE

### **4.1 Acessar o Site**

1. Após o deploy, acesse a URL do seu projeto
2. Geralmente: `https://federal-global.vercel.app` (ou sua URL customizada)
3. Verifique se a página carrega corretamente

### **4.2 Testar Login Admin**

1. Acesse: `https://sua-url.vercel.app#admin`
2. Faça login com:
   - **Email:** `tbogesdf.ai@gmail.com`
   - **Senha:** `Ale290800`
3. Verifique se o login funciona

### **4.3 Testar Tab Admin**

1. Após fazer login, clique na tab **"Admin"**
2. Verifique se:
   - ✅ A tabela de logs aparece (ou mensagem informativa)
   - ✅ Não há erros no console
   - ✅ A página carrega corretamente

### **4.4 Testar Criar Admin**

1. Na tab **"Admin"**, clique em **"Criar Admin"**
2. Preencha o formulário
3. Verifique se o admin é criado com sucesso

### **4.5 Verificar Logs de Acesso**

1. Faça logout
2. Faça login novamente
3. Vá para tab **"Admin"**
4. Verifique se aparece um novo log de acesso

---

## 🔍 PASSO 5: VERIFICAÇÕES FINAIS

### **5.1 Verificar no Supabase**

Execute no SQL Editor do Supabase:

```sql
-- Verificar se o Ultra Admin existe
SELECT email, full_name, role FROM admins WHERE email = 'tbogesdf.ai@gmail.com';

-- Verificar logs de acesso
SELECT COUNT(*) as total_logs FROM admin_access_logs;
```

### **5.2 Verificar no Vercel**

1. Vá em **"Functions"** (Funções)
2. Verifique se as APIs estão funcionando:
   - `/api/admin/get-access-logs`
   - `/api/admin/log-access`
   - `/api/admin/create-admin`
   - `/api/admin/create-user`

### **5.3 Verificar Console do Navegador**

1. Abra o DevTools (F12)
2. Vá na aba **"Console"**
3. Verifique se não há erros vermelhos
4. Verifique se não há erros de API (Network tab)

---

## 🆘 TROUBLESHOOTING

### **Problema: Erro 403 ao acessar API**

**Solução:**
1. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada no Vercel
2. Verifique se a chave está correta
3. Verifique se está marcada para **Production**

### **Problema: Tabela não encontrada**

**Solução:**
1. Execute novamente o script SQL no Supabase
2. Verifique se as tabelas foram criadas:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name IN ('admins', 'admin_access_logs');
   ```

### **Problema: Deploy falha**

**Solução:**
1. Verifique os logs do deploy no Vercel
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Verifique se não há erros de build

### **Problema: Login não funciona**

**Solução:**
1. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
2. Verifique se o usuário existe no Supabase Auth (opcional)
3. O sistema funciona com credenciais hardcoded, então deve funcionar mesmo sem criar no Auth

### **Problema: Logs não aparecem**

**Solução:**
1. Verifique se a tabela `admin_access_logs` existe
2. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada
3. Verifique os logs do Vercel para erros de API

---

## 📝 CHECKLIST FINAL

Antes de considerar o sistema 100% online, verifique:

- [ ] ✅ Migrations SQL executadas no Supabase
- [ ] ✅ Tabelas `admins` e `admin_access_logs` criadas
- [ ] ✅ Ultra Admin inserido na tabela
- [ ] ✅ Variáveis de ambiente configuradas no Vercel
- [ ] ✅ Deploy realizado com sucesso
- [ ] ✅ Site acessível online
- [ ] ✅ Login admin funcionando
- [ ] ✅ Tab Admin carregando sem erros
- [ ] ✅ Logs de acesso sendo salvos
- [ ] ✅ Criar admin funcionando
- [ ] ✅ Sem erros no console do navegador

---

## 🎯 RESUMO RÁPIDO

### **3 Passos Principais:**

1. **Supabase:** Execute `SETUP_ADMIN_SYSTEM.sql` no SQL Editor
2. **Vercel:** Configure variáveis de ambiente (principalmente `SUPABASE_SERVICE_ROLE_KEY`)
3. **Teste:** Acesse o site e teste o login admin

---

## 🎉 APÓS CONCLUIR

**O sistema estará 100% online e funcional!**

- ✅ Dashboard Admin acessível
- ✅ Logs de acesso funcionando
- ✅ Criar admin funcionando
- ✅ Tudo integrado e operacional

**Boa sorte com o deploy!** 🚀

