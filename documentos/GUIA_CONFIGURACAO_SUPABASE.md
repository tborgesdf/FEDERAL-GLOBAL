# 🚀 GUIA COMPLETO: Configuração do Supabase

## 📋 **TAREFA 1: MIGRAR PARA NOVO PROJETO SUPABASE**

---

## **PASSO 1: Obter Credenciais do Supabase** 🔑

### **1.1 - Acessar Dashboard**
```
https://supabase.com/dashboard
```

### **1.2 - Selecionar/Criar Projeto**

**Se o projeto já existe:**
- Clique no projeto "Federal Express Brasil"

**Se precisa criar:**
1. Clique em "**New Project**"
2. Preencha:
   - **Name:** Federal Express Brasil
   - **Database Password:** [crie uma senha forte]
   - **Region:** South America (São Paulo)
3. Clique em "**Create new project**"
4. Aguarde ~2 minutos (criação do banco)

### **1.3 - Copiar as 3 Credenciais**

No dashboard do projeto, vá em:
```
Settings → API
```

Você verá estas informações:

#### **📍 Project URL**
```
https://xxxxxxxxxx.supabase.co
```
👆 Copie este endereço

#### **🔓 anon / public key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```
👆 Copie esta chave (é segura para frontend)

#### **🔐 service_role key (secret)**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```
👆 Copie esta chave (⚠️ NUNCA exponha no frontend!)

---

## **PASSO 2: Configurar Localmente** 💻

### **2.1 - Criar arquivo .env.local**

Na **raiz do projeto** (mesmo nível do `package.json`), crie o arquivo `.env.local`:

```bash
# SUPABASE - Frontend
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SUPABASE - Backend (APIs Vercel)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GOOGLE VISION API (Opcional - para OCR)
GOOGLE_APPLICATION_CREDENTIALS_JSON=
```

**⚠️ IMPORTANTE:**
- Substitua os `xxxxx` pelos valores REAIS que você copiou
- Não commite este arquivo no Git (já está no .gitignore)
- Cole as chaves completas, sem espaços ou quebras de linha

### **2.2 - Verificar o arquivo**

Seu `.env.local` deve ficar assim:

```bash
VITE_SUPABASE_URL=https://mhsuyzndkpprnyoqsbsz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc3V5em5ka3Bwcm55b3FzYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MzI0NjAsImV4cCI6MjA1MjMwODQ2MH0.COArtMyvcuZsivHARvR74IUa1LaVOOno6tlQRVLT1s8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc3V5em5ka3Bwcm55b3FzYnN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjczMjQ2MCwiZXhwIjoyMDUyMzA4NDYwfQ.xpto123exemplo
```

---

## **PASSO 3: Criar Tabelas no Supabase** 🗄️

### **3.1 - Acessar SQL Editor**

No dashboard do Supabase:
```
SQL Editor (menu lateral) → New query
```

### **3.2 - Executar SQL de Setup**

1. Abra o arquivo `supabase/SETUP_DATABASE.sql` que criamos
2. **Copie TODO o conteúdo** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (canto inferior direito)
5. Aguarde a execução (pode levar ~10-20 segundos)

**✅ Você verá:** "Success. No rows returned"

### **3.3 - Verificar Tabelas Criadas**

Vá em: **Table Editor** (menu lateral)

Você deve ver estas tabelas:
```
✅ applications
✅ documents
✅ user_profiles
✅ social_accounts
✅ exchange_rates
✅ crypto_rates
✅ ip_geolocation
```

### **3.4 - Verificar Storage**

Vá em: **Storage** (menu lateral)

Você deve ver este bucket:
```
✅ documents (private)
```

---

## **PASSO 4: Configurar no Vercel (Produção)** ☁️

### **4.1 - Acessar Dashboard do Vercel**
```
https://vercel.com/dashboard
```

### **4.2 - Selecionar o Projeto**
Clique no projeto "Federal Express Brasil"

### **4.3 - Ir em Settings → Environment Variables**

### **4.4 - Adicionar Cada Variável**

Clique em "**Add New**" para cada uma:

#### **Variável 1:**
```
Name: VITE_SUPABASE_URL
Value: https://xxxxxxxxxx.supabase.co
Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

#### **Variável 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

#### **Variável 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

#### **Variável 4 (Opcional - Google Vision):**
```
Name: GOOGLE_APPLICATION_CREDENTIALS_JSON
Value: {"type":"service_account","project_id":"..."}
Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

### **4.5 - Salvar**
Clique em "**Save**" em cada variável.

### **4.6 - Redeploy**
1. Vá na aba "**Deployments**"
2. Clique nos 3 pontinhos do último deploy
3. Clique em "**Redeploy**"
4. Aguarde o deploy completar (~2-3 minutos)

---

## **PASSO 5: Testar a Conexão** 🧪

### **5.1 - Reiniciar o Servidor Local**

No terminal:
```bash
# Parar o servidor (Ctrl + C)
# Iniciar novamente
npm run dev
```

### **5.2 - Testar no Navegador**

Abra: `http://localhost:5173`

### **5.3 - Testar Autenticação**

#### **Teste 1: Criar Conta**
1. Clique em "**Cadastrar**"
2. Preencha o formulário
3. Clique em "**Criar conta**"
4. ✅ Deve aparecer: "Conta criada com sucesso!"

#### **Teste 2: Fazer Login**
1. Use o email e senha cadastrados
2. Clique em "**Entrar**"
3. ✅ Deve entrar no Dashboard

#### **Teste 3: Verificar Dados no Supabase**
1. Volte ao Dashboard do Supabase
2. Vá em **Authentication** → **Users**
3. ✅ Deve aparecer o usuário criado

4. Vá em **Table Editor** → **user_profiles**
5. ✅ Deve ter 1 registro com os dados do usuário

---

## **PASSO 6: Validação Final** ✅

### **Checklist de Validação:**

Execute cada teste e marque:

#### **Configuração:**
- [ ] Arquivo `.env.local` criado com 3 variáveis
- [ ] Variáveis configuradas no Vercel (se em produção)
- [ ] SQL executado sem erros no Supabase

#### **Banco de Dados:**
- [ ] 7 tabelas criadas no Table Editor
- [ ] Bucket `documents` criado no Storage
- [ ] RLS habilitado em todas as tabelas

#### **Testes Funcionais:**
- [ ] Cadastro de usuário funciona
- [ ] Login funciona
- [ ] Dados aparecem no Table Editor
- [ ] Console do navegador sem erros

#### **APIs:**
- [ ] `/api/exchange-rates` funciona
- [ ] `/api/crypto-rates` funciona
- [ ] `/api/ocr` está configurado (opcional)

---

## **🎯 RESULTADO ESPERADO**

Após completar todos os passos:

```
┌─────────────────────────────────────────────┐
│  ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!        │
├─────────────────────────────────────────────┤
│  ✅ Supabase configurado                   │
│  ✅ Tabelas criadas                        │
│  ✅ Storage configurado                    │
│  ✅ RLS habilitado                         │
│  ✅ Frontend conectado                     │
│  ✅ Backend conectado                      │
│  ✅ Autenticação funcionando               │
│  ✅ Dados sendo salvos corretamente        │
└─────────────────────────────────────────────┘
```

---

## **🆘 TROUBLESHOOTING**

### **❌ Erro: "Invalid API key"**
**Solução:** 
- Verifique se copiou as chaves corretas
- Certifique-se de não ter espaços antes/depois
- Reinicie o servidor (`npm run dev`)

### **❌ Erro: "Failed to fetch"**
**Solução:**
- Verifique a URL: deve ter `https://`
- Verifique se não tem espaços na URL
- Teste a URL no navegador (deve dar erro 404, mas conectar)

### **❌ Erro: "Row Level Security"**
**Solução:**
- Execute novamente o SQL de setup
- Verifique se RLS está habilitado nas tabelas

### **❌ Erro: "Storage object not found"**
**Solução:**
- Verifique se bucket `documents` existe
- Execute a parte de Storage do SQL novamente

### **❌ Console mostra erro de CORS**
**Solução:**
- Verifique se a URL está correta
- Aguarde alguns minutos (DNS pode estar propagando)

---

## **📞 PRÓXIMOS PASSOS**

✅ **TAREFA 1 COMPLETA!**

Agora que o Supabase está configurado:
1. ✅ Todos os dados são salvos no banco correto
2. ✅ Autenticação funciona
3. ✅ Storage está pronto
4. ✅ APIs conectadas

**Aguarde instruções para a TAREFA 2!** 🚀

---

**Guia criado para:** Federal Express Brasil  
**Data:** 2025-01-13  
**Versão:** 1.0  
**Status:** ✅ Completo

