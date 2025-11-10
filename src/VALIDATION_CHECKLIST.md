# ✅ Checklist de Validaçéo - Federal Express Brasil

## Sistema de Design Responsivo v2.0

---

## 🎯 Validaçéo Completa (Colar no Figma Make)

### Prompt Figma Curto:

```
Mantenha os frames 360/768/1024/1440 com grid 12/8/4 colunas (24/16/12 gutter).

Hero, Form Cards e Ticker com Auto Layout e constraints (Center/Hug).

Exportar tokens de cores/spacing para Tailwind:

primário #0A4B9E, secundário #2BA84A, neutro #F5F6F8

shadow 0 8px 24px rgba(0,0,0,0.08), radius 16px.

Tipografia: Poppins (títulos), Inter (texto) — text styles mapeados text-2xl|3xl|4xl etc.

Garantir contraste AA e fornecer alt descritivo nas specs de imagem significativa e alt="" nas decorativas.

Usar nomes de componentes idênticos aos do Cursor (Header, Hero, CurrencyCarousel, Register_Form, Login_Form, AreaDoCliente, Footer).
```

---

## 🚀 Como Validar (Passo a Passo)

### 1️⃣ Instalaçéo

```bash
# Instalar dependências
npm install

# Instalar Playwright e navegadores
npm run test:install
```

**Esperado:** ✅ Instalaçéo sem erros

---

### 2️⃣ Build da Aplicaçéo

```bash
npm run build
```

**Esperado:** ✅ Build concluído sem erros

**Verificar:**
- [ ] Sem warnings de Tailwind
- [ ] Sem erros de TypeScript
- [ ] Arquivo `dist/` gerado

---

### 3️⃣ Executar Servidor de Desenvolvimento

```bash
npm run dev
```

**Esperado:** ✅ Servidor rodando em http://localhost:5173

**Verificar manualmente:**
- [ ] Home carrega sem erros no console
- [ ] Logo visível
- [ ] Header sticky funciona
- [ ] Botões Cadastro e Login funcionam
- [ ] Formulários carregam
- [ ] Design responsivo funciona (inspecionar com DevTools)

---

### 4️⃣ Executar Testes E2E (Nova Aba Terminal)

```bash
# Em outra aba do terminal
npm run test:e2e
```

**Esperado:** ✅ 66/66 testes passando

---

### 5️⃣ Abrir Relatório HTML

```bash
npm run test:e2e:report
```

Ou abrir manualmente:
```bash
open playwright-report/index.html
# ou no Windows:
start playwright-report/index.html
```

---

## 📊 Resultados Esperados

### Home - 11 Testes ✅

```
✅ Componentes principais carregam
✅ Responsividade 360px
✅ Responsividade 1440px
✅ Navegaçéo Cadastro
✅ Navegaçéo Login
✅ Logo → Home
✅ Contraste AA+
✅ Carrosséis RSS
✅ MultimediaSection
✅ Design tokens
✅ Sticky header
```

---

### Auth - 24 Testes ✅

#### Cadastro (9 testes)
```
✅ Todos os campos visíveis
✅ Botéo desabilitado sem termos
✅ Botéo habilitado com termos
✅ Máscara CPF
✅ Máscara telefone
✅ Validaçéo senhas diferentes
✅ reCAPTCHA presente
✅ Links termos de uso
✅ Responsivo mobile
```

#### Login (8 testes)
```
✅ Campos login visíveis
✅ Mostrar/ocultar senha
✅ Link esqueci senha
✅ Link criar conta
✅ Navegaçéo recuperaçéo
✅ Navegaçéo cadastro
✅ Voltar ao login
✅ Validaçéo campos vazios
```

#### Fluxo (2 testes)
```
✅ Cadastro completo
✅ Cores institucionais
```

#### Design System (5 testes)
```
✅ Input height 52px
✅ Button height 56px
✅ Border radius 16px
✅ Sombras aplicadas
✅ reCAPTCHA em todas telas
```

---

### Accessibility - 13 Testes ✅

```
✅ Estrutura semântica
✅ Alt text em imagens
✅ Labels em formulários
✅ Botões com texto/aria-label
✅ Navegaçéo por teclado
✅ Focus visible
✅ Contraste AA
✅ Links identificáveis
✅ Mensagens de erro
✅ Estados hover
✅ Checkboxes acessíveis
✅ reCAPTCHA descritivo
✅ Loading states
```

---

### Responsive - 18 Testes ✅

#### Mobile 360px (6 testes)
```
✅ Layout adaptado
✅ Textos néo quebram
✅ Botões largura adequada
✅ Inputs largura total
✅ Scroll horizontal carrosséis
✅ Margens 16px
```

#### Tablet 768px (4 testes)
```
✅ 8 colunas
✅ Formulários largura adequada
✅ Margens 32px
✅ Tipografia escala
```

#### Desktop 1440px (6 testes)
```
✅ 12 colunas
✅ Max-width 720px
✅ Margens 80px
✅ Hero altura adequada
✅ Múltiplos cards carrosséis
✅ Padding botões
```

#### Transições (3 testes)
```
✅ Escala suave
✅ Aspect ratio mantido
✅ Tipografia clamp()
```

---

## 🎨 Design System - Checklist

### Cores Institucionais
- [x] `#0A4B9E` - Brand Blue (aplicado)
- [x] `#0058CC` - Brand Blue Light (aplicado)
- [x] `#2BA84A` - Brand Green (aplicado)
- [x] `#7C6EE4` - Brand Purple (aplicado)
- [x] `#F5F6F8` - Background Light (aplicado)

### Spacing Tokens
- [x] `--space-xs: 8px`
- [x] `--space-sm: 12px`
- [x] `--space-md: 24px`
- [x] `--space-lg: 48px`
- [x] `--space-xl: 80px`

### Breakpoints
- [x] Mobile: 360px (4 colunas, gutter 12px, margin 16px)
- [x] Tablet: 768px (8 colunas, gutter 16px, margin 32px)
- [x] Laptop: 1024px (12 colunas, gutter 24px, margin 80px)
- [x] Desktop: 1440px (12 colunas, gutter 24px, margin 80px)

### Tipografia com clamp()
- [x] `text-xs`: clamp(12px, 1.5vw, 14px)
- [x] `text-sm`: clamp(14px, 1.75vw, 16px)
- [x] `text-base`: clamp(16px, 2vw, 18px)
- [x] `text-lg`: clamp(18px, 2.25vw, 20px)
- [x] `text-xl`: clamp(20px, 2.5vw, 24px)
- [x] `text-2xl`: clamp(24px, 3vw, 30px)
- [x] `text-3xl`: clamp(30px, 3.75vw, 36px)
- [x] `text-4xl`: clamp(36px, 4.5vw, 48px)

### Componentes
- [x] Header (sticky, z-50)
- [x] Hero (400px mobile / 600px desktop)
- [x] Button Primary (56px height, #2BA84A)
- [x] Button Secondary (56px height, #0A4B9E)
- [x] Input (52px height, border-radius 8px)
- [x] Card (border-radius 16px, shadow aplicada)
- [x] RSSCarousel (gap 24px, scroll horizontal)
- [x] Footer (completo)

### Sombras
- [x] `--shadow-card: 0 8px 24px rgba(0,0,0,0.08)`
- [x] `--shadow-button: 0 6px 12px rgba(0,0,0,0.25)`
- [x] `--shadow-hover: 0 12px 32px rgba(0,0,0,0.12)`

### Border Radius
- [x] `--radius-sm: 8px`
- [x] `--radius-md: 12px`
- [x] `--radius-lg: 16px`
- [x] `--radius-xl: 20px`

---

## 📁 Arquivos Criados

```
/
├── styles/
│   └── globals.css                 ✅ Design tokens CSS
├── components/
│   ├── Header.tsx                  ✅ Componente
│   ├── Hero.tsx                    ✅ Componente
│   ├── MarketTicker.tsx            ✅ Componente
│   ├── RSSCarousel.tsx             ✅ Componente
│   ├── MultimediaSection.tsx       ✅ Componente
│   ├── Footer.tsx                  ✅ Componente
│   ├── RegisterPage.tsx            ✅ Componente
│   └── LoginPage.tsx               ✅ Componente
├── tests/e2e/
│   ├── home.spec.ts                ✅ 11 testes
│   ├── auth.spec.ts                ✅ 24 testes
│   ├── accessibility.spec.ts       ✅ 13 testes
│   └── responsive.spec.ts          ✅ 18 testes
├── design-tokens.json              ✅ Tokens exportáveis
├── DESIGN_SYSTEM.md                ✅ Documentaçéo
├── TEST_GUIDE.md                   ✅ Guia de testes
├── VALIDATION_CHECKLIST.md         ✅ Este arquivo
├── playwright.config.ts            ✅ Config Playwright
├── package.json                    ✅ Scripts NPM
└── validate.sh                     ✅ Script validaçéo
```

---

## 🔍 Validaçéo Rápida (Script Automático)

```bash
chmod +x validate.sh
./validate.sh
```

**Esperado:**
```
✅ Arquivos de design system presentes
✅ Design tokens corretos no CSS
✅ JSON de design tokens válido
✅ Todos os componentes principais presentes (8)
✅ Todas as suites de teste presentes (4 arquivos)
✅ Configuraçéo do Playwright presente
✅ Scripts de teste configurados

✨ Sistema validado com sucesso!
```

---

## 🐛 Troubleshooting Comum

### Erro: "Port 5173 already in use"

**Soluçéo:**
```bash
kill -9 $(lsof -ti:5173)
npm run dev
```

---

### Erro: "Browser not found"

**Soluçéo:**
```bash
npx playwright install --with-deps
```

---

### Erro: Testes falhando no CI

**Soluçéo:** Adicionar ao GitHub Actions:
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps
- name: Run tests
  run: npm run test:e2e
```

---

### Erro: "Cannot find module"

**Soluçéo:**
```bash
npm install
npm run build
```

---

## 📸 Screenshots de Referência

### Desktop 1440px
- Header com logo e botões visíveis
- Hero com imagem de fundo
- Carrosséis com múltiplos cards
- Footer completo

### Tablet 768px
- Layout intermediário
- Carrosséis com scroll
- Formulários centralizados

### Mobile 360px
- Stack vertical
- Botões largura total
- Cards empilhados

---

## ✨ Critérios de Sucesso Final

### ✅ Build
- [ ] `npm run build` sem erros
- [ ] Tamanho do bundle razoável (<2MB)
- [ ] Sem warnings críticos

### ✅ Testes E2E
- [ ] 11/11 testes Home
- [ ] 24/24 testes Auth
- [ ] 13/13 testes Accessibility
- [ ] 18/18 testes Responsive
- [ ] **Total: 66/66 (100%)**

### ✅ Design System
- [ ] Cores institucionais aplicadas
- [ ] Spacing tokens usados
- [ ] Tipografia com clamp()
- [ ] Grid responsivo funciona
- [ ] Componentes nomenclatura correta

### ✅ Acessibilidade
- [ ] Contraste WCAG AA+
- [ ] Alt text em imagens
- [ ] Labels em formulários
- [ ] Navegaçéo por teclado
- [ ] Focus visible

### ✅ Responsividade
- [ ] Mobile 360px perfeito
- [ ] Tablet 768px perfeito
- [ ] Desktop 1440px perfeito
- [ ] Transições suaves
- [ ] Sem quebra de texto

---

## 🎓 Documentaçéo Adicional

- **Design System:** `/DESIGN_SYSTEM.md`
- **Guia de Testes:** `/TEST_GUIDE.md`
- **Design Tokens:** `/design-tokens.json`
- **Playwright Docs:** https://playwright.dev/

---

## 📞 Próximos Passos

1. ✅ Validaçéo estrutural (este checklist)
2. ✅ Testes E2E (npm run test:e2e)
3. ✅ Reviséo de acessibilidade
4. ✅ Testes de responsividade
5. 🚀 Deploy em produçéo

---

## 🏆 Status Final

Quando todos os itens acima estiverem ✅:

```
🎉 SISTEMA 100% VALIDADO E PRONTO PARA PRODUÇéO! 🎉

✅ Design System implementado
✅ 66 testes E2E passando
✅ Responsividade perfeita
✅ Acessibilidade AA+
✅ Documentaçéo completa
```

---

**Verséo:** 2.0.0  
**Data:** 2025-11-07  
**Status:** ✅ Pronto para Validaçéo  
**Mantido por:** Federal Express Brasil
