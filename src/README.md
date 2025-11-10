# Federal Express Brasil - Landing Page

Landing page completa para Federal Express Brasil com sistema de autenticação, área do cliente e calculadora PTAX.

## 🎯 Funcionalidades

### 📄 Páginas Públicas
- **Home**: Hero, ticker de mercado, carrosséis RSS de notícias e seção multimídia
- **Cadastro**: Formulário de 7 campos integrado ao Supabase
- **Login**: Sistema completo com 3 modos (login, recuperar senha, redefinir senha)

### 🔐 Área do Cliente (Dashboard)
- **TickerBar**: Cotações em tempo real de 10 moedas (DKK, NOK, SEK, USD, AUD, CAD, EUR, CHF, JPY, GBP)
- **3 Cards de Açéo**:
  - Contratar Novo Serviço
  - Acompanhar Solicitaçéo em Andamento
  - Histórico de Solicitações
- **Calculadora PTAX**: Cálculo de câmbio com breakdown detalhado (IOF, VET, tarifas)
- **Card Resumo & Dicas**: Informações auxiliares

## 🎨 Design System

### Cores Institucionais
- Primária: `#0A4B9E`
- Secundária: `#0058CC`
- Açéo: `#2BA84A`
- Suporte CTA: `#56B544`
- Destaque: `#7C6EE4`
- Fundo Neutro: `#F5F6F8`

### Tipografia
- **Títulos**: Poppins (600-700)
- **Corpo de texto**: Inter (400-500)

### Breakpoints Responsivos
- **Desktop**: 1440px (12 col, gutter 24, margin 80)
- **Laptop**: 1024px (12 col, gutter 24, margin 48)
- **Tablet**: 768px (8 col, gutter 16, margin 32)
- **Mobile**: 360px (4 col, gutter 12, margin 16)

## 🏗️ Arquitetura

### Frontend (React + Vite)
```
/components
  ├── Header.tsx                  # Cabeçalho com clima/localizaçéo
  ├── Hero.tsx                    # seção hero com imagem
  ├── MarketTicker.tsx            # Ticker de mercado financeiro
  ├── RSSCarousel.tsx             # Carrossel de notícias
  ├── MultimediaSection.tsx       # seção multimídia
  ├── Footer.tsx                  # Rodapé completo
  ├── RegisterPage.tsx            # Página de cadastro
  ├── LoginPage.tsx               # Página de login (3 modos)
  ├── Dashboard.tsx               # Área do cliente
  ├── TickerBar.tsx              # Carrossel de cotações
  ├── DashboardActions.tsx        # Cards de açéo
  ├── CurrencyCalculator.tsx      # Calculadora PTAX
  └── SummaryTipsCard.tsx         # Card de dicas
```

### Backend (Supabase Edge Functions)
```
/supabase/functions/server
  ├── index.tsx                   # Servidor Hono
  └── kv_store.tsx               # Utilitário KV (protegido)
```

## 🚀 Instalaçéo

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produçéo
npm run build

# Preview do build
npm run preview
```

## 🔌 Integraçéo Backend

### autenticação
O sistema usa Supabase Auth com os seguintes endpoints:

**Login**
```typescript
POST /make-server-d805caa8/login
{
  "email": "user@example.com",
  "password": "senha123"
}
// Retorna: { access_token: string }
```

**Cadastro**
```typescript
POST /make-server-d805caa8/signup
{
  "cpf": "000.000.000-00",
  "nome": "Nome Completo",
  "telefone": "(11) 98888-8888",
  "email": "user@example.com",
  "senha": "senha123",
  "confirmarSenha": "senha123"
}
```

**Recuperar Senha**
```typescript
POST /make-server-d805caa8/recover-password
{
  "email": "user@example.com"
}
```

**Redefinir Senha**
```typescript
POST /make-server-d805caa8/reset-password
{
  "token": "reset-token-from-email",
  "newPassword": "novaSenha123"
}
```

### Persistência de Sesséo
O token de autenticação é armazenado no `localStorage`:
- `access_token`: Token JWT do Supabase
- `user_email`: Email do usuário logado

## 📱 Responsividade

Todos os componentes séo totalmente responsivos seguindo os breakpoints definidos:
- Mobile-first approach
- Grid system: 4/8/12 colunas
- Auto Layout com Hug/Fill containers
- Calculadora com largura fixa 440px no desktop, 100% no mobile

## 🎯 Roadmap

### Backend (Próximos Passos)
- [ ] Implementar rotas `/login`, `/signup` no servidor Supabase
- [ ] Integraçéo com API PTAX oficial do Banco Central
- [ ] SSE (Server-Sent Events) para atualizaçéo em tempo real
- [ ] Middleware de autenticação para rotas protegidas

### Frontend
- [ ] Páginas de serviços (Novo, Andamento, Histórico)
- [ ] Integraçéo com API de câmbio real
- [ ] Testes E2E com Playwright/Cypress
- [ ] PWA (Progressive Web App)

## 📝 Notas Importantes

### Arquivos Protegidos (NéO MODIFICAR)
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase.tsx`
- `/components/figma/ImageWithFallback.tsx`

### Tokens de Design
Definidos em `/styles/globals.css` - néo alterar sem solicitaçéo específica

### reCAPTCHA
Foi **completamente removido** de todos os formulários conforme solicitado

### Navegaçéo Login ↔ Cadastro
Botões de navegaçéo cruzada implementados e funcionais em todas as telas

## 🧪 Testes

```bash
# Testes E2E (quando implementado)
npm run test:e2e
```

## 📄 Licença

Propriedade de Federal Express Brasil. Todos os direitos reservados.

---

**Desenvolvido com** React + Vite + TypeScript + Tailwind CSS + Supabase
