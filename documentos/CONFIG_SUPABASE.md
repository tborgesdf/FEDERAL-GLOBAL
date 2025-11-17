# 🔧 CONFIGURAÇÃO DO SUPABASE - Federal Global

## 📋 **PASSO A PASSO PARA CONECTAR AO PROJETO federal-global**

### **1️⃣ Projeto Supabase Atual**

✅ **Projeto:** federal-global  
✅ **Project ID:** mhsuyzndkpprnyoqsbsz  
✅ **URL:** https://mhsuyzndkpprnyoqsbsz.supabase.co

#### **Acessar Dashboard do Projeto**

```
https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz
```

#### **Obter a SERVICE_ROLE_KEY**

🔗 Vá em: **Settings** → **API**  
📋 Link direto: https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/settings/api

Você verá:

```
┌─────────────────────────────────────────────────────────┐
│ Project URL (✅ já configurado)                          │
│ https://mhsuyzndkpprnyoqsbsz.supabase.co                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ anon / public (✅ já configurado)                        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ service_role / secret (❗ VOCÊ PRECISA COPIAR ESTA)     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                 │
│ ⚠️ NUNCA exponha esta chave! Backend apenas!            │
└─────────────────────────────────────────────────────────┘
```

---

### **2️⃣ Criar Arquivo .env.local**

Na **raiz do projeto**, crie o arquivo `.env.local`:

```bash
# ============================================================================
# FEDERAL GLOBAL - Configurações de Ambiente
# ============================================================================

# SUPABASE FRONTEND (✅ já preenchido)
VITE_SUPABASE_URL=https://mhsuyzndkpprnyoqsbsz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc3V5em5ka3Bwcm55b3FzYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzI0NjAsImV4cCI6MjA3ODMwODQ2MH0.COArtMyvcuZsivHARvR74IUa1LaVOOno6tlQRVLT1s8

# SUPABASE BACKEND (❗ COLE AQUI A SERVICE_ROLE_KEY)
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_SERVICE_ROLE_KEY_DO_SUPABASE

# GOOGLE VISION API (Opcional - para OCR)
GOOGLE_APPLICATION_CREDENTIALS_JSON=

# CONFIGURAÇÕES ADICIONAIS
VITE_NODE_ENV=development
VITE_SITE_URL=http://localhost:5173
VITE_BASE_PATH=/
```

**⚠️ IMPORTANTE:** Copie a `service_role (secret)` do link acima e cole no lugar de `COLE_AQUI_A_SERVICE_ROLE_KEY_DO_SUPABASE`

---

### **3️⃣ Configurar no Vercel (Produção)**

#### **A) Acessar o Dashboard do Vercel**

```
https://vercel.com/dashboard
```

Selecione o projeto **federal-global**

#### **B) Ir em Settings → Environment Variables**

As seguintes variáveis **JÁ DEVEM ESTAR CONFIGURADAS** (✅):

| Name                                  | Value                                                                                                                                                                                                            | Status |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `VITE_SUPABASE_URL`                   | https://mhsuyzndkpprnyoqsbsz.supabase.co                                                                                                                                                                         | ✅     |
| `VITE_SUPABASE_ANON_KEY`              | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc3V5em5ka3Bwcm55b3FzYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzI0NjAsImV4cCI6MjA3ODMwODQ2MH0.COArtMyvcuZsivHARvR74IUa1LaVOOno6tlQRVLT1s8 | ✅     |
| `SUPABASE_SERVICE_ROLE_KEY`           | ❗ Verifique se está configurada                                                                                                                                                                                 | ⚠️     |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | (Opcional - para OCR)                                                                                                                                                                                            | ⚠️     |

**Se `SUPABASE_SERVICE_ROLE_KEY` não estiver configurada:**

1. Copie do Supabase Dashboard (link na seção 1️⃣)
2. Adicione no Vercel para: Production, Preview, Development

---

### **4️⃣ Criar/Verificar Tabelas no Supabase**

Execute as migrações SQL para criar as tabelas necessárias:

#### **A) Tabela: documents (OCR)**

```sql
-- Tabela de documentos OCR
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'passport',
    'previous_visa',
    'rg',
    'cnh',
    'cnh_digital',
    'cin',
    'marriage_cert',
    'civil_union',
    'birth_cert'
  )),
  side TEXT CHECK (side IN ('front', 'back', 'single')),
  storage_path TEXT,
  ocr_json JSONB,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_verified ON documents(verified);

-- RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seus documentos
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM applications WHERE id = documents.application_id
  ));

-- Política: usuários podem inserir seus documentos
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM applications WHERE id = documents.application_id
  ));
```

#### **B) Tabela: applications (Solicitações de Visto)**

```sql
-- Tabela de aplicações de visto
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_type TEXT NOT NULL CHECK (application_type IN (
    'usa_visa',
    'passport_renewal',
    'other'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'completed'
  )),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);
```

#### **C) Tabela: exchange_rates (Cotações)**

```sql
-- Tabela de taxas de câmbio
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_code TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  rate DECIMAL(18, 6) NOT NULL,
  time_last_update_unix BIGINT,
  time_last_update_utc TEXT,
  time_next_update_unix BIGINT,
  time_next_update_utc TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_code, currency_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_code ON exchange_rates(base_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_code ON exchange_rates(currency_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched_at ON exchange_rates(fetched_at DESC);

-- RLS (público para leitura)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exchange rates are publicly readable"
  ON exchange_rates FOR SELECT
  USING (true);
```

#### **D) Tabela: crypto_rates (Criptomoedas)**

```sql
-- Tabela de cotações de criptomoedas
CREATE TABLE IF NOT EXISTS crypto_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crypto_id TEXT NOT NULL UNIQUE,
  crypto_symbol TEXT NOT NULL,
  crypto_name TEXT NOT NULL,
  price_usd DECIMAL(18, 8) NOT NULL,
  price_brl DECIMAL(18, 8) NOT NULL,
  price_eur DECIMAL(18, 8) NOT NULL,
  change_24h DECIMAL(10, 4),
  change_7d DECIMAL(10, 4),
  change_30d DECIMAL(10, 4),
  market_cap_usd DECIMAL(20, 2),
  volume_24h_usd DECIMAL(20, 2),
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crypto_rates_crypto_id ON crypto_rates(crypto_id);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_market_cap ON crypto_rates(market_cap_usd DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_fetched_at ON crypto_rates(fetched_at DESC);

-- RLS (público para leitura)
ALTER TABLE crypto_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crypto rates are publicly readable"
  ON crypto_rates FOR SELECT
  USING (true);
```

#### **E) Storage Bucket: documents**

```sql
-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao storage
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

### **5️⃣ Testar a Conexão**

#### **A) Reiniciar o Servidor**

```bash
npm run dev
```

#### **B) Verificar no Console**

Abra o DevTools (F12) e veja se há erros de conexão com Supabase.

#### **C) Testar Autenticação**

1. Tente fazer login
2. Tente criar uma conta
3. Verifique se os dados são salvos no Supabase Dashboard

---

### **6️⃣ Verificar Dados no Supabase Dashboard**

#### **A) Acessar Table Editor**

```
https://supabase.com/dashboard/project/[seu-projeto]/editor
```

#### **B) Verificar Tabelas**

- ✅ `applications` - deve ter registros após criar solicitações
- ✅ `documents` - deve ter registros após fazer upload
- ✅ `exchange_rates` - deve ter registros após atualizar cotações
- ✅ `crypto_rates` - deve ter registros após atualizar cripto

#### **C) Verificar Storage**

```
https://supabase.com/dashboard/project/[seu-projeto]/storage/buckets
```

- ✅ Bucket `documents` deve existir
- ✅ Arquivos devem aparecer após upload

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

Após configurar, verifique:

- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] Variáveis configuradas no Vercel (se em produção)
- [ ] Todas as tabelas SQL criadas no Supabase
- [ ] Storage bucket `documents` criado
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de acesso configuradas
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Login funciona sem erros
- [ ] Cadastro funciona sem erros
- [ ] Upload de documentos funciona
- [ ] Dados aparecem no Supabase Dashboard
- [ ] Console do navegador sem erros de Supabase

---

## 🆘 **TROUBLESHOOTING**

### **Erro: "Invalid API key"**

**Solução:** Verifique se copiou as chaves corretas do Supabase Dashboard.

### **Erro: "Failed to fetch"**

**Solução:** Verifique a URL do projeto. Deve ser `https://[project-id].supabase.co`

### **Erro: "Row Level Security"**

**Solução:** Execute as políticas RLS nas tabelas afetadas.

### **Erro: "Storage object not found"**

**Solução:** Verifique se o bucket `documents` existe e tem políticas configuradas.

---

## 📞 **PRÓXIMOS PASSOS**

Após configurar o Supabase:

1. ✅ Testar autenticação (login/cadastro)
2. ✅ Testar upload de documentos
3. ✅ Testar API de cotações
4. ✅ Verificar dados no Dashboard
5. ✅ Passar para a próxima tarefa

---

**Configuração criada para:** Federal Express Brasil  
**Data:** 2025-01-13  
**Versão:** 1.0
