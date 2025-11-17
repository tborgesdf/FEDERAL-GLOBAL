# 📊 ESTRUTURA DE DADOS - Federal Express Brasil

## 🗄️ **VISÃO GERAL DO BANCO DE DADOS**

```
┌──────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  👤 auth.users (gerenciado pelo Supabase Auth)          │
│      ├── id (UUID)                                       │
│      ├── email                                           │
│      ├── encrypted_password                             │
│      └── created_at                                      │
│                                                           │
│  👥 user_profiles                                        │
│      ├── id → auth.users(id)                            │
│      ├── full_name                                       │
│      ├── cpf                                             │
│      ├── phone                                           │
│      ├── birth_date                                      │
│      └── address (JSONB)                                 │
│                                                           │
│  📋 applications (Solicitações de Visto)                │
│      ├── id (UUID)                                       │
│      ├── user_id → auth.users(id)                       │
│      ├── application_type                               │
│      ├── status                                          │
│      ├── current_step                                    │
│      ├── total_steps                                     │
│      ├── data (JSONB)                                    │
│      └── timestamps                                      │
│                                                           │
│  📄 documents (Documentos OCR)                           │
│      ├── id (UUID)                                       │
│      ├── application_id → applications(id)              │
│      ├── doc_type                                        │
│      ├── side                                            │
│      ├── storage_path                                    │
│      ├── ocr_json (JSONB)                               │
│      ├── verified                                        │
│      └── quality_score                                   │
│                                                           │
│  📱 social_accounts (Redes Sociais)                     │
│      ├── id (UUID)                                       │
│      ├── application_id → applications(id)              │
│      ├── platform                                        │
│      ├── username                                        │
│      ├── url                                             │
│      └── verified                                        │
│                                                           │
│  💰 exchange_rates (Cotações de Moedas)                 │
│      ├── base_code (USD, BRL, EUR...)                   │
│      ├── currency_code                                   │
│      ├── rate                                            │
│      └── fetched_at                                      │
│                                                           │
│  🪙 crypto_rates (Criptomoedas)                         │
│      ├── crypto_id (bitcoin, ethereum...)               │
│      ├── crypto_symbol (BTC, ETH...)                    │
│      ├── price_usd, price_brl, price_eur               │
│      ├── change_24h, change_7d                          │
│      └── market_cap_usd                                  │
│                                                           │
│  🌍 ip_geolocation (Rastreamento de IP)                 │
│      ├── user_id → auth.users(id)                       │
│      ├── ip_address                                      │
│      ├── country_code, city                             │
│      └── latitude, longitude                            │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 **FLUXO DE DADOS: SOLICITAÇÃO DE VISTO**

```
┌────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                          │
└────────────────────────────────────────────────────────────┘

1. CADASTRO DO USUÁRIO
   ↓
   auth.users (Supabase Auth)
   ├── email: usuario@email.com
   ├── password: [encrypted]
   └── id: uuid-123
   
   ↓
   
   user_profiles
   ├── id: uuid-123 (mesmo do auth.users)
   ├── full_name: "João Silva"
   ├── cpf: "123.456.789-00"
   ├── phone: "(11) 98765-4321"
   └── birth_date: "1990-05-15"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. CRIAÇÃO DA APLICAÇÃO
   ↓
   applications
   ├── id: uuid-app-001
   ├── user_id: uuid-123
   ├── application_type: "usa_visa"
   ├── status: "draft"
   ├── current_step: 1
   ├── total_steps: 8
   └── data: {}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. UPLOAD DE DOCUMENTOS (com OCR)
   
   3.1 - Upload para Storage
   ↓
   storage.objects (bucket: documents)
   └── documents/uuid-123/passport-front-1736802000.jpg
   
   3.2 - Processamento OCR (API Google Vision)
   ↓
   Extração de dados: 
   - Número do passaporte
   - Nome completo
   - Data de nascimento
   - Data de validade
   - etc.
   
   3.3 - Salvar metadados e OCR
   ↓
   documents
   ├── id: uuid-doc-001
   ├── application_id: uuid-app-001
   ├── doc_type: "passport"
   ├── storage_path: "documents/uuid-123/passport..."
   ├── ocr_json: {
   │     "document": {
   │       "passport_number": "BR123456",
   │       "date_of_issue": "2020-01-15",
   │       "date_of_expiry": "2030-01-15"
   │     },
   │     "holder": {
   │       "full_name": "JOAO SILVA",
   │       "birth_date": "1990-05-15",
   │       "nationality": "BRASILEIRA"
   │     }
   │   }
   ├── verified: false
   └── quality_score: 0.95

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. REDES SOCIAIS
   ↓
   social_accounts
   ├── application_id: uuid-app-001
   ├── platform: "facebook"
   ├── username: "joaosilva"
   ├── url: "https://facebook.com/joaosilva"
   └── verified: false

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. FINALIZAÇÃO
   ↓
   applications (UPDATE)
   ├── status: "submitted"
   ├── current_step: 8
   ├── submitted_at: "2025-01-13T20:00:00Z"
   └── data: { /* dados do formulário */ }
```

---

## 🔐 **SEGURANÇA: ROW LEVEL SECURITY (RLS)**

### **Como Funciona:**

```sql
-- Exemplo: Tabela applications

┌─────────────────────────────────────────────────────────┐
│ RLS HABILITADO ✅                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Usuário A (uuid-123):                                  │
│    ✅ Pode ver:      applications onde user_id = uuid-123│
│    ❌ NÃO pode ver:  applications de outros usuários    │
│                                                          │
│  Usuário B (uuid-456):                                  │
│    ✅ Pode ver:      applications onde user_id = uuid-456│
│    ❌ NÃO pode ver:  applications de outros usuários    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Políticas Implementadas:**

#### **📋 applications**
```sql
SELECT → Usuário vê apenas suas aplicações
INSERT → Usuário cria apenas para si mesmo
UPDATE → Usuário atualiza apenas suas aplicações
```

#### **📄 documents**
```sql
SELECT → Usuário vê documentos de suas aplicações
INSERT → Usuário insere documentos em suas aplicações
UPDATE → Usuário atualiza seus documentos
DELETE → Usuário deleta seus documentos
```

#### **👥 user_profiles**
```sql
SELECT → Usuário vê apenas seu perfil
INSERT → Usuário cria apenas seu perfil
UPDATE → Usuário atualiza apenas seu perfil
```

#### **💰 exchange_rates & 🪙 crypto_rates**
```sql
SELECT → PÚBLICO (qualquer um pode ler)
INSERT/UPDATE/DELETE → Apenas via API (service_role)
```

---

## 📦 **STORAGE: ORGANIZAÇÃO DE ARQUIVOS**

```
storage.buckets/documents/
│
├── {user_id}/                    ← Pasta do usuário
│   ├── passport-front-{timestamp}.jpg
│   ├── passport-back-{timestamp}.jpg
│   ├── rg-front-{timestamp}.jpg
│   ├── rg-back-{timestamp}.jpg
│   ├── cnh-front-{timestamp}.jpg
│   ├── marriage-cert-{timestamp}.pdf
│   └── selfie-{timestamp}.jpg
│
└── {outro_user_id}/
    └── ...

Política de Acesso:
✅ Cada usuário acessa apenas sua própria pasta
❌ Não pode acessar pastas de outros usuários
```

---

## 🔄 **ATUALIZAÇÃO AUTOMÁTICA DE DADOS**

### **Cotações de Moedas (exchange_rates)**

```
┌─────────────────────────────────────────┐
│  API: /api/exchange-rates               │
├─────────────────────────────────────────┤
│                                          │
│  Atualização: A cada 10 minutos         │
│  Fonte: ExchangeRate-API                │
│                                          │
│  Fluxo:                                  │
│  1. Cron job chama API                   │
│  2. API busca taxas externas             │
│  3. API salva no Supabase                │
│  4. Frontend lê do Supabase              │
│                                          │
└─────────────────────────────────────────┘
```

### **Cotações de Cripto (crypto_rates)**

```
┌─────────────────────────────────────────┐
│  API: /api/crypto-rates                 │
├─────────────────────────────────────────┤
│                                          │
│  Atualização: A cada 10 minutos         │
│  Fonte: CoinGecko API                   │
│                                          │
│  Fluxo:                                  │
│  1. Cron job chama API                   │
│  2. API busca preços do CoinGecko        │
│  3. API calcula variações                │
│  4. API salva no Supabase                │
│  5. Frontend lê do Supabase              │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📊 **TIPOS DE DADOS JSONB**

### **applications.data**

```json
{
  "personal": {
    "full_name": "João Silva",
    "birth_date": "1990-05-15",
    "birth_country": "Brazil",
    "birth_city": "São Paulo"
  },
  "passport": {
    "number": "BR123456",
    "issue_date": "2020-01-15",
    "expiry_date": "2030-01-15"
  },
  "travel": {
    "purpose": "tourism",
    "intended_date": "2025-06-15",
    "duration_days": 14
  },
  "contacts": {
    "address": "Rua Example, 123",
    "city": "São Paulo",
    "phone": "(11) 98765-4321",
    "email": "joao@email.com"
  }
}
```

### **documents.ocr_json**

```json
{
  "document": {
    "passport_number": "BR123456",
    "type": "P",
    "country_code": "BRA",
    "date_of_issue": "2020-01-15",
    "date_of_expiry": "2030-01-15",
    "place_of_issue": "POLÍCIA FEDERAL"
  },
  "holder": {
    "full_name": "JOAO SILVA",
    "birth_date": "1990-05-15",
    "birth_place": "SAO PAULO, SP",
    "nationality": "BRASILEIRA",
    "gender": "M"
  },
  "mrz": {
    "line1": "P<BRASILVA<<JOAO<<<<<<<<<<<<<<<<<<<<<<<<<",
    "line2": "BR1234567BRA9005155M3001155<<<<<<<<<<<<<<06"
  },
  "confidence": 0.95,
  "fields_detected": [
    "passport_number",
    "full_name",
    "birth_date",
    "nationality"
  ]
}
```

---

## 🎯 **CONCLUSÃO**

### **✅ Estrutura Completa Implementada:**

- ✅ 7 tabelas principais
- ✅ RLS em todas as tabelas sensíveis
- ✅ Storage com políticas de acesso
- ✅ Índices para performance
- ✅ Triggers para updated_at
- ✅ Relacionamentos (foreign keys)
- ✅ Validações (CHECK constraints)
- ✅ Dados JSONB para flexibilidade

### **🔒 Segurança Garantida:**

- ✅ Usuários acessam apenas seus dados
- ✅ Service Role Key protegida (backend)
- ✅ Anon Key segura (frontend)
- ✅ Storage isolado por usuário
- ✅ Senhas criptografadas (Supabase Auth)

### **📈 Performance Otimizada:**

- ✅ Índices em colunas frequentes
- ✅ JSONB para dados flexíveis
- ✅ Queries otimizadas
- ✅ Cache no frontend

---

**Documento criado para:** Federal Express Brasil  
**Data:** 2025-01-13  
**Status:** ✅ Completo

