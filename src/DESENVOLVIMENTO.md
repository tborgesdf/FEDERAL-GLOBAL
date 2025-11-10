# 🚀 Guia de Desenvolvimento - Federal Express Brasil

## 📋 Checklist de Implementação Atual

### ✅ Concluído

#### Frontend
- [x] **Home Page** - Hero, ticker, carrosséis RSS, multimídia
- [x] **Página de Cadastro** - Formulário 7 campos + validação
- [x] **Página de Login** - 3 modos (login, recuperar, redefinir)
- [x] **Dashboard** - Área do cliente pós-login
- [x] **TickerBar** - Carrossel 10 moedas (DKK, NOK, SEK, USD, AUD, CAD, EUR, CHF, JPY, GBP)
- [x] **DashboardActions** - 3 cards de ação
- [x] **CurrencyCalculator** - Calculadora PTAX com breakdown IOF/VET
- [x] **SummaryTipsCard** - Card lateral com dicas
- [x] **Header** - Informação de usuário logado
- [x] **Sistema de Autenticação** - Login/logout com persistência localStorage

#### Backend
- [x] **Servidor Supabase** - Hono + Edge Functions
- [x] **POST /signup** - Criação de conta com validação CPF
- [x] **POST /login** - Autenticação com JWT
- [x] **POST /recover-password** - Geração de token de recuperação
- [x] **POST /reset-password** - Redefinição de senha

#### Design System
- [x] **Cores institucionais** - #0A4B9E, #0058CC, #2BA84A, #56B544, #7C6EE4
- [x] **Tipografia** - Poppins (títulos) + Inter (corpo)
- [x] **Breakpoints** - 360/768/1024/1440
- [x] **Componentes responsivos** - Mobile-first
- [x] **Remoção de reCAPTCHA** - Todos os formulários limpos

---

## 🎯 Próximos Passos (Roadmap)

### 1️⃣ Integração API PTAX Real

**Prioridade: Alta**

```typescript
// /supabase/functions/server/ptax.tsx
import { Hono } from "npm:hono";

const app = new Hono();

// Endpoint para buscar cotação do dia
app.get("/make-server-d805caa8/ptax/daily", async (c) => {
  const date = c.req.query("date") || new Date().toISOString().split("T")[0];
  
  try {
    // API Banco Central do Brasil
    const response = await fetch(
      `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${date}'&$format=json`
    );
    
    const data = await response.json();
    
    return c.json({
      date: date,
      rates: data.value,
      cached: false
    });
  } catch (error) {
    return c.json({ error: error.message }, { status: 500 });
  }
});

export default app;
```

**Tarefas:**
- [ ] Criar endpoint `/ptax/daily` no servidor
- [ ] Implementar cache no KV store (TTL 1 hora)
- [ ] Adicionar fallback para último dia útil
- [ ] Atualizar `CurrencyCalculator.tsx` para usar API real
- [ ] Atualizar `TickerBar.tsx` para usar API real

---

### 2️⃣ SSE (Server-Sent Events) - Atualização Tempo Real

**Prioridade: Média**

```typescript
// /supabase/functions/server/sse.tsx
app.get("/make-server-d805caa8/ptax/stream", async (c) => {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Enviar cotações a cada 30 segundos
      const interval = setInterval(async () => {
        const rates = await fetchCurrentRates();
        const data = `data: ${JSON.stringify(rates)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }, 30000);
      
      // Cleanup após 5 minutos
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 300000);
    }
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
});
```

**Frontend:**
```typescript
// /components/TickerBar.tsx
useEffect(() => {
  const eventSource = new EventSource(
    `https://${projectId}.supabase.co/functions/v1/make-server-d805caa8/ptax/stream`
  );
  
  eventSource.onmessage = (event) => {
    const rates = JSON.parse(event.data);
    setCurrencies(rates);
  };
  
  return () => eventSource.close();
}, []);
```

**Tarefas:**
- [ ] Implementar endpoint SSE no servidor
- [ ] Criar hook `usePtaxStream()` no frontend
- [ ] Atualizar TickerBar para usar SSE
- [ ] Adicionar fallback para polling se SSE falhar

---

### 3️⃣ Páginas de Serviços

**Prioridade: Alta**

#### A. Contratar Novo Serviço
```bash
/components/ServicosNovo.tsx
```
- Formulário de solicitação de câmbio
- Seleção de moeda origem/destino
- Valor e forma de pagamento
- Upload de documentos

#### B. Acompanhar Solicitações
```bash
/components/ServicosAndamento.tsx
```
- Lista de solicitações em processamento
- Status atual de cada solicitação
- Timeline de progresso
- Botão de cancelamento (se aplicável)

#### C. Histórico de Solicitações
```bash
/components/ServicosHistorico.tsx
```
- Tabela paginada de solicitações concluídas
- Filtros (data, tipo, status)
- Download de comprovantes
- Detalhes de cada transação

**Tarefas:**
- [ ] Criar componente `ServicosNovo.tsx`
- [ ] Criar componente `ServicosAndamento.tsx`
- [ ] Criar componente `ServicosHistorico.tsx`
- [ ] Atualizar `App.tsx` para roteamento
- [ ] Implementar endpoints backend (`/services/*`)

---

### 4️⃣ Guarda de Rota (Protected Routes)

**Prioridade: Alta**

```typescript
// /components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onUnauthorized: () => void;
}

export default function ProtectedRoute({ children, onUnauthorized }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setIsAuthorized(false);
        onUnauthorized();
        return;
      }
      
      try {
        // Verificar token com o servidor
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d805caa8/verify-token`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_email");
          setIsAuthorized(false);
          onUnauthorized();
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setIsAuthorized(false);
        onUnauthorized();
      }
    };
    
    verifyAuth();
  }, []);
  
  if (isAuthorized === null) {
    return <div>Carregando...</div>;
  }
  
  return isAuthorized ? <>{children}</> : null;
}
```

**Uso:**
```typescript
// App.tsx
<ProtectedRoute onUnauthorized={() => setCurrentPage("login")}>
  <Dashboard onLogout={handleLogout} userEmail={userEmail} />
</ProtectedRoute>
```

**Tarefas:**
- [ ] Criar componente `ProtectedRoute.tsx`
- [ ] Implementar endpoint `/verify-token` no servidor
- [ ] Envolver Dashboard em ProtectedRoute
- [ ] Adicionar loading state

---

### 5️⃣ Testes E2E

**Prioridade: Média**

```bash
npm install -D @playwright/test
```

```typescript
// /tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Clicar em Login
    await page.click('text=Login');
    
    // Preencher formulário
    await page.fill('input[type="email"]', 'teste@example.com');
    await page.fill('input[type="password"]', 'senha123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Área do Cliente')).toBeVisible();
  });
  
  test('deve fazer cadastro com sucesso', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    await page.click('text=Cadastrar-se');
    
    // Preencher todos os campos...
    // Asserções...
  });
});
```

**Tarefas:**
- [ ] Instalar Playwright
- [ ] Criar testes de autenticação
- [ ] Criar testes de navegação
- [ ] Criar testes de formulários
- [ ] Configurar CI/CD

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview

# Testes E2E (quando implementado)
npm run test:e2e

# Formatar código
npm run format

# Lint
npm run lint
```

---

## 📝 Convenções de Código

### Nomeação de Arquivos
- Componentes: `PascalCase.tsx` (ex: `DashboardActions.tsx`)
- Utils: `camelCase.ts` (ex: `formatCurrency.ts`)
- Hooks: `useCamelCase.ts` (ex: `useAuth.ts`)

### Estrutura de Componentes
```typescript
// Imports
import { useState } from "react";

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Component
export default function Component({ prop }: ComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => {};
  
  // Effects
  useEffect(() => {}, []);
  
  // Render
  return (
    <div>...</div>
  );
}
```

### Estilização
- Usar Tailwind classes quando possível
- Inline styles apenas para valores dinâmicos ou tokens específicos do design system
- Manter consistência com `/styles/globals.css`

---

## 🐛 Debug

### Backend (Supabase Functions)
```bash
# Ver logs do servidor
supabase functions logs make-server-d805caa8

# Testar endpoint local
curl -X POST http://localhost:54321/functions/v1/make-server-d805caa8/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}'
```

### Frontend
```typescript
// Adicionar logs de debug
console.log("[DEBUG] Estado atual:", state);

// Ver token armazenado
console.log("Token:", localStorage.getItem("access_token"));

// Verificar chamadas de API
// Abrir DevTools → Network → Filter: Fetch/XHR
```

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Hono Docs](https://hono.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [API Banco Central](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/aplicacao#!/recursos)

---

**Última atualização:** 2025-11-07
