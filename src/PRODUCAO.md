# 🚀 PREPARAÇÃO PARA PRODUÇÃO

## ✅ CHECKLIST PRÉ-DEPLOY

### 1️⃣ Remover Componentes de Teste

#### A. Remover BreakpointTester

**Arquivo:** `/App.tsx`

**Remover estas linhas:**
```typescript
// Linha ~10
import BreakpointTester from "./components/BreakpointTester"; // ❌ REMOVER

// Linha ~200 (dentro do return)
<BreakpointTester /> // ❌ REMOVER
```

**Resultado:**
```typescript
import Header from "./components/Header";
import Hero from "./components/Hero";
// ... outros imports (SEM BreakpointTester)

export default function App() {
  // ...
  
  return (
    <>
      <Toaster position="top-right" richColors />
      {/* BreakpointTester REMOVIDO */}
      {currentPage === "home" ? (
        // ...
```

---

#### B. Remover Botão "🚀 TESTE: Ver Dashboard"

**Arquivo:** `/App.tsx`

**Remover:**
1. Função `handleTestDashboard` (linhas ~30-37)
2. Div com botão flutuante (linhas ~210-245)

**Código a remover:**
```typescript
// ❌ REMOVER FUNÇÃO
const handleTestDashboard = () => {
  const testEmail = "teste@federalexpress.com.br";
  localStorage.setItem("access_token", "test-token-12345");
  localStorage.setItem("user_email", testEmail);
  setIsLoggedIn(true);
  setUserEmail(testEmail);
  setCurrentPage("dashboard");
};

// ❌ REMOVER DIV DO BOTÃO
<div style={{ 
  position: 'fixed', 
  bottom: '20px', 
  right: '20px', 
  zIndex: 9999 
}}>
  <button onClick={handleTestDashboard}>
    🚀 TESTE: Ver Dashboard
  </button>
</div>
```

---

#### C. Deletar Arquivo BreakpointTester (Opcional)

**Comando:**
```bash
rm /components/BreakpointTester.tsx
```

Ou manter para futuros testes (recomendado).

---

### 2️⃣ Configurar Variáveis de Ambiente

#### A. Criar arquivo `.env`

**Copiar de `.env.example`:**
```bash
cp .env.example .env
```

#### B. Preencher valores reais

**Editar `.env`:**
```bash
# Substituir pelos valores do seu projeto Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_API_URL=https://seu-projeto.supabase.co/functions/v1/make-server-d805caa8

NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo `.env` com valores reais
- Use `.env.example` apenas como template
- Em produção, configure as variáveis no painel de hosting

---

### 3️⃣ Build de Produção

#### A. Limpar build anterior
```bash
npm run clean
# ou
rm -rf dist/
```

#### B. Build otimizado
```bash
npm run build
```

**Saída esperada:**
```
vite v5.x.x building for production...
✓ 142 modules transformed.
dist/index.html                   1.2 kB │ gzip: 0.6 kB
dist/assets/index-a1b2c3d4.css   45.8 kB │ gzip: 8.2 kB
dist/assets/index-a1b2c3d4.js   312.4 kB │ gzip: 98.1 kB
✓ built in 5.23s
```

#### C. Preview local
```bash
npm run preview
```

**Testar em:** `http://localhost:4173`

---

### 4️⃣ Validação Pré-Deploy

#### Testes Funcionais
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Logout funciona
- [ ] Dashboard carrega corretamente
- [ ] TickerBar anima sem quebrar
- [ ] Calculadora PTAX calcula valores
- [ ] Navegação entre páginas funciona

#### Testes Visuais
- [ ] Todos os 5 breakpoints OK (360/430/768/1024/1440)
- [ ] Imagens carregam
- [ ] Fontes aplicadas (Poppins + Inter)
- [ ] Cores corretas
- [ ] Hover effects funcionam

#### Performance
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

#### SEO
- [ ] Meta tags presentes
- [ ] Title e description únicos por página
- [ ] Sitemap.xml (se aplicável)
- [ ] Robots.txt configurado

---

### 5️⃣ Deploy

#### Opção A: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Configurações no dashboard:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: adicionar todas do `.env`

---

#### Opção B: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Arquivo `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

#### Opção C: GitHub Pages

**Adicionar ao `package.json`:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Instalar gh-pages:**
```bash
npm install --save-dev gh-pages
```

**Deploy:**
```bash
npm run deploy
```

---

### 6️⃣ Configurar Supabase Edge Functions

#### A. Deploy do servidor

```bash
# Navegar para a pasta do projeto
cd /caminho/do/projeto

# Deploy da função
supabase functions deploy make-server-d805caa8
```

#### B. Configurar secrets

```bash
# Service Role Key (já configurado via dashboard)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key-here

# Outras variáveis se necessário
supabase secrets set SUPABASE_URL=your-url-here
supabase secrets set SUPABASE_ANON_KEY=your-anon-key-here
```

#### C. Testar endpoints

```bash
# Health check
curl https://seu-projeto.supabase.co/functions/v1/make-server-d805caa8/health

# Login (teste)
curl -X POST https://seu-projeto.supabase.co/functions/v1/make-server-d805caa8/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email":"test@example.com","password":"senha123"}'
```

---

### 7️⃣ Monitoramento Pós-Deploy

#### A. Logs do Servidor (Supabase)

```bash
# Ver logs em tempo real
supabase functions logs make-server-d805caa8 --tail
```

**Ou via Dashboard:**
1. Acesse dashboard.supabase.com
2. Vá em Edge Functions
3. Clique em "make-server-d805caa8"
4. Aba "Logs"

---

#### B. Analytics (Opcional)

**Google Analytics:**
```html
<!-- Adicionar no index.html antes do </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Vercel Analytics:**
```typescript
// App.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      {/* ... seu código ... */}
      <Analytics />
    </>
  );
}
```

---

#### C. Error Tracking (Sentry - Opcional)

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@yyy.ingest.sentry.io/zzz",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

### 8️⃣ Checklist Final

#### Código
- [ ] Componentes de teste removidos
- [ ] Console.logs de debug removidos
- [ ] Comentários desnecessários removidos
- [ ] Código minificado
- [ ] Source maps gerados (para debug em produção)

#### Segurança
- [ ] `.env` no `.gitignore`
- [ ] Service Role Key NUNCA exposta no frontend
- [ ] CORS configurado corretamente
- [ ] Rate limiting no servidor (opcional)
- [ ] HTTPS habilitado

#### Performance
- [ ] Build otimizado
- [ ] Assets comprimidos (gzip/brotli)
- [ ] CDN configurado (se aplicável)
- [ ] Caching headers configurados

#### SEO
- [ ] Meta tags otimizadas
- [ ] Open Graph tags (redes sociais)
- [ ] Favicon adicionado
- [ ] Sitemap.xml
- [ ] Robots.txt

#### Acessibilidade
- [ ] WCAG AA compliance
- [ ] Navegação por teclado funcional
- [ ] Screen reader testado
- [ ] Contraste de cores adequado

---

## 🎯 CRONOGRAMA DE DEPLOY

### Fase 1: Staging (Ambiente de Testes)
**Prazo:** 1-2 dias

1. Deploy em ambiente de staging
2. Testes completos (QA)
3. Ajustes finais
4. Aprovação do cliente

### Fase 2: Produção (Go Live)
**Prazo:** 1 dia

1. Deploy em produção
2. Smoke tests
3. Monitoramento 24h
4. Comunicação ao cliente

### Fase 3: Pós-Deploy
**Prazo:** 1 semana

1. Monitoramento de erros
2. Coleta de feedback
3. Hotfixes se necessário
4. Documentação final

---

## 🆘 ROLLBACK (Se algo der errado)

### Vercel
```bash
# Listar deployments
vercel ls

# Promover deployment anterior
vercel promote deployment-id
```

### Netlify
```bash
# Listar deployments
netlify deploy:list

# Restaurar deployment anterior
netlify rollback
```

### Supabase Functions
```bash
# Re-deploy versão anterior
git checkout commit-hash
supabase functions deploy make-server-d805caa8
```

---

## 📞 CONTATOS DE EMERGÊNCIA

**DevOps:** devops@federalexpress.com.br  
**Backend:** backend@federalexpress.com.br  
**Frontend:** frontend@federalexpress.com.br  
**Suporte Supabase:** https://supabase.com/support

---

## 📚 RECURSOS

- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

---

**Última atualização:** 2025-11-07  
**Versão:** 1.0 - Pronto para Deploy ✅
