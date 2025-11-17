# 🎯 GUIA VISUAL - 3 PASSOS PARA MIGRAR O SUPABASE

---

## 📍 PASSO 1: COPIAR A SERVICE_ROLE_KEY

### 🔗 Abra este link:
```
https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/settings/api
```

### 👀 Procure por:
```
┌─────────────────────────────────────────────────────────┐
│ service_role                                             │
│ Secret                                                   │
│                                                          │
│ [ Reveal ]  [Botão que revela a chave]                  │
└─────────────────────────────────────────────────────────┘
```

### 📋 Clique em "Reveal" e COPIE a chave completa

**A chave começa com:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📍 PASSO 2: CRIAR O .env.local

### 📂 Na raiz do projeto, crie um arquivo chamado: `.env.local`

```
FEDERAL GLOBAL/
├── src/
├── api/
├── supabase/
├── package.json
├── .env.local  ← CRIAR ESTE ARQUIVO AQUI
```

### 📝 Cole este conteúdo dentro do arquivo:

```bash
# SUPABASE FRONTEND
VITE_SUPABASE_URL=https://mhsuyzndkpprnyoqsbsz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc3V5em5ka3Bwcm55b3FzYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzI0NjAsImV4cCI6MjA3ODMwODQ2MH0.COArtMyvcuZsivHARvR74IUa1LaVOOno6tlQRVLT1s8

# SUPABASE BACKEND (COLE A CHAVE AQUI)
SUPABASE_SERVICE_ROLE_KEY=COLE_A_CHAVE_DO_PASSO_1_AQUI

# CONFIGURAÇÕES ADICIONAIS
VITE_NODE_ENV=development
VITE_SITE_URL=http://localhost:5173
VITE_BASE_PATH=/
```

### ⚠️ SUBSTITUA:
```
SUPABASE_SERVICE_ROLE_KEY=COLE_A_CHAVE_DO_PASSO_1_AQUI
```

### ✅ POR:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (a chave que você copiou)
```

### 💾 SALVE o arquivo!

---

## 📍 PASSO 3: EXECUTAR O SQL NO SUPABASE

### 🔗 Abra o SQL Editor:
```
https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/editor
```

### 📝 No Supabase Dashboard:

1. **Clique em:** SQL Editor (menu lateral esquerdo)
2. **Clique em:** "New query" (botão azul)
3. **Você verá:** Um editor de texto vazio

### 📂 No seu projeto:

4. **Abra o arquivo:** `supabase/SETUP_DATABASE.sql`
5. **Selecione tudo:** Ctrl+A
6. **Copie tudo:** Ctrl+C

### 🔙 Volte ao Supabase Dashboard:

7. **Cole no editor:** Ctrl+V
8. **Execute:** Clique em "Run" (ou Ctrl+Enter)
9. **Aguarde:** Vai aparecer "Database setup complete!"

### ✅ Pronto! Suas tabelas foram criadas!

---

## 🧪 TESTAR O SISTEMA

### 🖥️ No terminal:

```bash
npm run dev
```

### 🌐 No navegador:

Abra: http://localhost:5173

### ✅ Checklist de testes:

- [ ] Página carrega sem erros
- [ ] Console do navegador (F12) sem erros vermelhos
- [ ] Tente fazer login/cadastro
- [ ] Teste a calculadora de moedas
- [ ] Veja se as cotações aparecem no ticker

---

## 🎉 SUCESSO!

Se tudo funcionou:

✅ Supabase conectado ao projeto federal-global  
✅ Banco de dados criado e configurado  
✅ Frontend e backend funcionando  
✅ Sistema pronto para desenvolvimento!

---

## 📊 VERIFICAR NO SUPABASE DASHBOARD

### 🔗 Table Editor:
```
https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/editor
```

### ✅ Você deve ver estas tabelas:

```
┌─────────────────────────────────────┐
│ 📋 TABELAS CRIADAS                   │
├─────────────────────────────────────┤
│ ✓ profiles                          │
│ ✓ user_profiles                     │
│ ✓ payments                          │
│ ✓ applications                      │
│ ✓ social_accounts                   │
│ ✓ documents                         │
│ ✓ selfies                           │
│ ✓ audit_logs                        │
│ ✓ exchange_rates                    │
│ ✓ fx_rates                          │
│ ✓ crypto_rates                      │
│ ✓ crypto_rates_history              │
│ ✓ ip_geolocation_logs               │
└─────────────────────────────────────┘
```

### 🔗 Storage:
```
https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/storage/buckets
```

### ✅ Você deve ver:

```
┌─────────────────────────────────────┐
│ 📦 BUCKET                            │
├─────────────────────────────────────┤
│ ✓ documents (private)               │
└─────────────────────────────────────┘
```

---

## 🆘 ERROS COMUNS

### ❌ Erro: "Invalid API key"

**Problema:** SERVICE_ROLE_KEY incorreta ou com espaços extras

**Solução:**
1. Vá em: https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/settings/api
2. Copie novamente a service_role key
3. Cole no `.env.local` (sem espaços antes ou depois)
4. Salve e reinicie o servidor

---

### ❌ Erro: "Cannot find module '.env.local'"

**Problema:** Arquivo `.env.local` não está na raiz

**Solução:**
```
❌ NÃO coloque em: src/.env.local
❌ NÃO coloque em: api/.env.local
✅ DEVE estar em: FEDERAL GLOBAL/.env.local (raiz do projeto)
```

---

### ❌ Erro: "relation 'documents' does not exist"

**Problema:** SQL não foi executado no Supabase

**Solução:**
1. Vá em: https://supabase.com/dashboard/project/mhsuyzndkpprnyoqsbsz/editor
2. Execute o SQL novamente (SETUP_DATABASE.sql)
3. Verifique se apareceu "Database setup complete!"

---

### ❌ Console mostra: "Failed to fetch"

**Problema:** Supabase URL incorreta ou projeto offline

**Solução:**
1. Verifique se o projeto está online no dashboard
2. Verifique se a URL no `.env.local` está correta:
   ```
   https://mhsuyzndkpprnyoqsbsz.supabase.co
   ```

---

## 📞 TUDO FUNCIONANDO?

✅ Se você conseguiu:
- Criar o `.env.local`
- Executar o SQL no Supabase
- Ver as tabelas criadas
- Rodar `npm run dev` sem erros

🎉 **PARABÉNS!** A migração está completa!

---

**📅 Data:** 2025-11-13  
**🏢 Projeto:** Federal Global  
**⏱️ Tempo estimado:** 5-10 minutos  
**✅ Dificuldade:** Fácil (seguir passo a passo)

