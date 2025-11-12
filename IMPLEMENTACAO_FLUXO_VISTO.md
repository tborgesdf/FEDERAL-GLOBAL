# 📋 IMPLEMENTAÇÃO DO FLUXO DE APLICAÇÃO DE VISTO

## ✅ CONCLUÍDO

### 1. Variáveis de Ambiente
- ✅ Criado `.env.example` com todas as variáveis necessárias
- ✅ Documentado configuração para Vercel
- ✅ Separação correta entre variáveis client-side (VITE_*) e server-side

### 2. Migrations SQL do Supabase
- ✅ **Tabelas criadas**:
  - `profiles` - perfis de usuários
  - `payments` - histórico de pagamentos InfinitePay
  - `applications` - aplicações de visto (first/renewal)
  - `social_accounts` - redes sociais do aplicante
  - `documents` - documentos com OCR
  - `selfies` - selfies com análise de qualidade
  - `audit_logs` - log de auditoria

- ✅ **RLS habilitado** com políticas de segurança
- ✅ **Triggers** para updated_at automático
- ✅ **Function** para criar profile automaticamente

### 3. Vercel API Functions
- ✅ **`api/webhooks/infinitepay.ts`**
  - Recebe confirmação de pagamento
  - Valida assinatura HMAC-SHA256
  - Cria/atualiza payments
  - Cria application automaticamente quando status=paid

- ✅ **`api/ocr.ts`**
  - Recebe documento (multipart/form-data)
  - Upload para Supabase Storage
  - Extração de texto via Google Vision API
  - Persistência em documents com ocr_json

- ✅ **`api/selfie-quality.ts`**
  - Análise de qualidade de selfie
  - Verificação de resolução, tamanho, etc
  - Upload para Storage se aceita
  - Persistência em selfies

- ✅ **Libs compartilhadas**:
  - `api/lib/supabase-admin.ts` - Client com Service Role
  - `api/lib/crypto.ts` - Verificação de assinatura

### 4. Componentes UI Base
- ✅ **`StepLayout`** - Layout padrão com progress bar, header, footer, navegação
- ✅ **`PermissionModal`** - Modal para solicitar permissões
- ✅ **`CaptureOrUpload`** - Captura via câmera ou upload de arquivo

## 🚧 EM ANDAMENTO

### 5. Páginas do Fluxo
Próximos passos:
- [ ] `/flow` - Página principal que detecta step atual e redireciona
- [ ] `/flow/civil-status` - Estado civil (casado? sim/não)
- [ ] `/flow/socials` - Redes sociais (opcional)
- [ ] `/flow/passport` - Upload/captura de passaporte + OCR
- [ ] `/flow/previous-visa` - Upload de visto anterior (apenas renewal)
- [ ] `/flow/br-id` - RG/CNH (frente e verso)
- [ ] `/flow/marriage-cert` - Certidão de casamento (se casado)
- [ ] `/flow/selfie` - Captura de selfie + validação
- [ ] `/flow/questionnaire` - Questionário final

### 6. Componentes Adicionais Necessários
- [ ] `OcrReviewCard` - Revisar dados extraídos do OCR
- [ ] `SocialsForm` - Formulário de redes sociais
- [ ] `SelfieCapture` - Captura de selfie com preview
- [ ] `DocumentCard` - Card para exibir documento enviado

### 7. Lógica de Negócio
- [ ] Hook `useApplication` - Gerenciar estado da aplicação
- [ ] Hook `useDocuments` - Upload e gerenciamento de documentos
- [ ] Hook `useSelfie` - Captura e validação de selfie
- [ ] Service `applicationService` - CRUD de applications
- [ ] Service `documentService` - Upload e OCR
- [ ] Service `selfieService` - Upload e validação

## 📦 DEPENDÊNCIAS INSTALADAS

```json
{
  "dependencies": {
    "@vercel/node": "^latest",
    "@google-cloud/vision": "^latest",
    "formidable": "^latest",
    "sharp": "^latest"
  },
  "devDependencies": {
    "@types/formidable": "^latest"
  }
}
```

## 🗂️ ESTRUTURA DE ARQUIVOS

```
federal-global/
├── api/
│   ├── lib/
│   │   ├── supabase-admin.ts
│   │   └── crypto.ts
│   ├── webhooks/
│   │   └── infinitepay.ts
│   ├── ocr.ts
│   └── selfie-quality.ts
├── supabase/
│   └── migrations/
│       ├── 20250112000001_create_visa_application_tables.sql
│       └── 20250112000002_enable_rls_policies.sql
├── src/
│   ├── components/
│   │   ├── flow/
│   │   │   ├── StepLayout.tsx
│   │   │   ├── PermissionModal.tsx
│   │   │   └── CaptureOrUpload.tsx
│   │   └── ...
│   ├── hooks/
│   ├── services/
│   └── pages/
│       └── flow/
└── .env.example
```

## 🔐 SEGURANÇA IMPLEMENTADA

1. **RLS (Row Level Security)** - Usuários só acessam seus próprios dados
2. **Verificação de assinatura** - Webhook do InfinitePay validado via HMAC
3. **Autenticação** - Todas as APIs verificam JWT do Supabase
4. **Service Role** - Operações administrativas isoladas do client
5. **Audit Log** - Todas as ações críticas são registradas

## 📝 PRÓXIMAS AÇÕES

1. Criar hooks customizados para gerenciar estado
2. Implementar páginas do fluxo
3. Criar componentes de revisão de OCR
4. Adicionar validações de cada step
5. Implementar navegação entre steps
6. Adicionar tratamento de erros e retry
7. Configurar CI/CD (GitHub Actions)
8. Testar fluxo completo end-to-end
9. Deploy no Vercel

## 🌐 ENDPOINTS DA API

### Webhook
- `POST /api/webhooks/infinitepay` - Receber confirmação de pagamento

### Upload & OCR
- `POST /api/ocr` - Upload de documento + OCR
  - Headers: `Authorization: Bearer <token>`
  - Body (multipart): `file`, `application_id`, `doc_type`, `side`

### Selfie
- `POST /api/selfie-quality` - Upload e validação de selfie
  - Headers: `Authorization: Bearer <token>`
  - Body (multipart): `file`, `application_id`

## 📊 FLUXO DE STEPS

```
1. civil_status → define is_married
2. socials → opcional
3. passport → obrigatório
4. previous_visa → apenas se visa_type='renewal'
5. br_id → RG frente + verso
6. marriage_cert → apenas se is_married=true
7. selfie → validação de qualidade
8. questionnaire → finalização
```

## 🎯 CRITÉRIOS DE ACEITAÇÃO

- [x] Webhook do InfinitePay cria application automaticamente
- [x] OCR extrai texto de documentos
- [x] Selfie é validada por qualidade
- [x] RLS protege dados entre usuários
- [ ] Usuário consegue completar fluxo inteiro
- [ ] Navegação entre steps funciona
- [ ] Validações impedem avanço indevido
- [ ] Dados são persistidos corretamente
- [ ] Deploy no Vercel funciona
- [ ] CI/CD automatizado

