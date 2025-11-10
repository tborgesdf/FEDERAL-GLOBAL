# 🧪 COMO USAR AS FERRAMENTAS DE TESTE

## 📍 LOCALIZAÇÃO

Quando você abrir a aplicação, verá **dois elementos flutuantes**:

### 1️⃣ BreakpointTester (Canto Inferior Esquerdo)
![Widget no canto inferior esquerdo]

**Aparência:**
- Box branco com borda colorida
- Ícone do dispositivo atual
- Informações em tempo real

### 2️⃣ Botão "Ver Dashboard" (Canto Inferior Direito)
![Botão verde no canto inferior direito]

**Aparência:**
- Botão verde grande
- Texto: "🚀 TESTE: Ver Dashboard"
- Visível apenas na home

---

## 🎮 COMO USAR O BREAKPOINT TESTER

### Passo 1: Visualizar Informações

Ao abrir a aplicação, o widget aparece automaticamente mostrando:

```
┌───────────────────────────────┐
│  📱 Mobile                    │
│  360px-429px                  │
├───────────────────────────────┤
│  Dimensões: 360 × 800px       │
│  Grid: 4 colunas              │
│  Gutter: 12px                 │
│  Margin: 16px                 │
├───────────────────────────────┤
│  ✓ Layout mobile ativo        │
└───────────────────────────────┘
```

### Passo 2: Redimensionar a Janela

**Opção A: Redimensionar manualmente**
1. Arraste a borda da janela do navegador
2. Observe as informações mudarem em tempo real
3. O widget muda de cor conforme o breakpoint

**Opção B: Usar DevTools (Recomendado)**
1. Pressione `F12` (ou `Cmd+Opt+I` no Mac)
2. Clique no ícone de celular no topo (ou `Cmd+Shift+M`)
3. Selecione um dispositivo no dropdown:
   - Galaxy S25 (360px)
   - iPhone 17 Pro Max (430px)
   - iPad Air (768px)
   - Laptop (1024px)
   - Desktop (1440px)

### Passo 3: Verificar Mudanças

Ao mudar de breakpoint, observe:

**Mobile → Tablet:**
```
Mobile (Verde)          Tablet (Azul)
4 colunas        →      8 colunas
Gutter 12px      →      Gutter 16px
Margin 16px      →      Margin 32px
```

**Tablet → Laptop:**
```
Tablet (Azul)           Laptop (Roxo)
8 colunas        →      12 colunas
Gutter 16px      →      Gutter 24px
Margin 32px      →      Margin 48px
```

**Laptop → Desktop:**
```
Laptop (Roxo)           Desktop (Azul Escuro)
Margin 48px      →      Margin 80px
(Grid mantém 12 colunas e gutter 24px)
```

### Passo 4: Minimizar o Widget

**Para minimizar:**
1. Clique no "×" no canto superior direito do widget
2. O widget se transforma em um **botão circular** com ícone

**Para expandir novamente:**
1. Clique no botão circular
2. O widget volta a aparecer completo

---

## 📊 CORES DOS BREAKPOINTS

O widget muda de cor para facilitar identificação:

| Breakpoint | Cor da Borda | Ícone |
|------------|--------------|-------|
| **Mobile** | Verde `#2BA84A` | 📱 Smartphone |
| **Phablet** | Verde `#2BA84A` | 📱 Smartphone |
| **Tablet** | Azul `#0A4B9E` | 📱 Tablet |
| **Laptop** | Roxo `#7C6EE4` | 💻 Laptop |
| **Desktop** | Azul Escuro `#0058CC` | 🖥️ Monitor |

---

## 🚀 COMO USAR O BOTÃO "VER DASHBOARD"

### Passo 1: Localizar o Botão

**Onde está:**
- Canto inferior direito
- Apenas visível na **home page**
- Botão verde grande

### Passo 2: Clicar

1. Clique no botão "🚀 TESTE: Ver Dashboard"
2. Você será **imediatamente redirecionado** para o dashboard
3. Um token de teste é salvo automaticamente

### Passo 3: Explorar o Dashboard

Você agora está na **área logada** com:
- ✅ TickerBar no topo (10 moedas)
- ✅ 3 cards de ação
- ✅ Calculadora PTAX
- ✅ Card de resumo & dicas
- ✅ Header mostrando email: `teste@federalexpress.com.br`

### Passo 4: Fazer Logout

1. No header, clique em "Sair"
2. Você volta para a home
3. O token é removido do localStorage

---

## 🔍 TESTES VISUAIS RECOMENDADOS

### Teste 1: Responsividade do Dashboard

**Objetivo:** Verificar se o dashboard adapta-se corretamente

**Passos:**
1. Clique em "🚀 TESTE: Ver Dashboard"
2. Observe o BreakpointTester no canto inferior esquerdo
3. Redimensione a janela de **1440px → 360px**
4. Observe as mudanças:

**1440px (Desktop):**
```
┌─────────────────────────────────────┐
│  [Header com logo + email + sair]  │
├─────────────────────────────────────┤
│  [TickerBar: 5+ moedas visíveis]   │
├─────────────────────────────────────┤
│  [ Card 1 ]  [ Card 2 ]  [ Card 3 ]│
├─────────────────────────────────────┤
│  [ Calculator ]  [ Summary & Tips ] │
│     (440px)         (flex-1)        │
└─────────────────────────────────────┘
```

**768px (Tablet):**
```
┌─────────────────────────────────────┐
│  [Header]                           │
├─────────────────────────────────────┤
│  [TickerBar: 2-3 moedas]           │
├─────────────────────────────────────┤
│  [ Card 1 ]  [ Card 2 ]  [ Card 3 ]│
├─────────────────────────────────────┤
│  [ Calculator ]                     │
│     (100%)                          │
│  [ Summary & Tips ]                 │
│     (100%)                          │
└─────────────────────────────────────┘
```

**360px (Mobile):**
```
┌─────────────────┐
│  [Header]       │
├─────────────────┤
│  [TickerBar]    │
│  (1 moeda)      │
├─────────────────┤
│  [ Card 1 ]     │
│  [ Card 2 ]     │
│  [ Card 3 ]     │
├─────────────────┤
│  [ Calculator ] │
│     (100%)      │
│  [ Summary ]    │
└─────────────────┘
```

### Teste 2: TickerBar Animation

**Objetivo:** Verificar scroll infinito

**Passos:**
1. Vá para o dashboard
2. Observe o TickerBar no topo
3. Aguarde 8 segundos
4. As moedas devem:
   - Mudar de valor (simulação)
   - Ícones de variação mudam (↗/↘)
   - Cores mudam (verde/vermelho)
5. Aguarde 60 segundos
6. O carrossel deve **completar um loop** sem quebras

### Teste 3: Calculadora PTAX

**Objetivo:** Testar funcionalidade completa

**Passos:**
1. No dashboard, localize a calculadora
2. Clique na aba "Receber"
3. Selecione uma moeda (ex: USD)
4. Digite um valor (ex: 1000)
5. Observe o breakdown:
   - Taxa de conversão
   - IOF 0,38%
   - Custos
   - VET destacado
6. Clique na aba "Enviar"
7. Repita o teste
8. Valores devem recalcular

### Teste 4: Cards de Ação

**Objetivo:** Verificar hover e click

**Passos:**
1. No dashboard, passe o mouse sobre cada card
2. Deve acontecer:
   - Escala aumenta (1.02)
   - Sombra fica maior
   - Transição suave 300ms
3. Clique em um card
4. Deve acontecer:
   - Escala diminui momentaneamente (0.98)
   - Feedback visual de clique

### Teste 5: Navegação Login ↔ Cadastro

**Objetivo:** Testar navegação cruzada

**Passos:**
1. Na home, clique em "Login"
2. Na página de login, clique em "Criar conta"
3. Você deve ir para a página de cadastro
4. Na página de cadastro, clique em "Já tenho conta"
5. Você deve voltar para a página de login

---

## 🎯 CHECKLIST DE VALIDAÇÃO VISUAL

Use este checklist ao testar:

### Home Page
- [ ] Hero carrega com imagem
- [ ] MarketTicker anima
- [ ] 2 carrosséis de notícias funcionam
- [ ] Botões "Login" e "Cadastrar" visíveis
- [ ] Botão de teste verde no canto direito

### Dashboard
- [ ] TickerBar no topo com 10 moedas
- [ ] 3 cards de ação visíveis
- [ ] Calculadora com abas Receber/Enviar
- [ ] Card de resumo ao lado (desktop) ou abaixo (mobile)
- [ ] Header mostra email do usuário
- [ ] Botão "Sair" funciona

### Responsividade
- [ ] Mobile (360px): 1 coluna, elementos empilhados
- [ ] Tablet (768px): 3 cards horizontais, calculadora 100%
- [ ] Desktop (1440px): Layout 2 colunas, calculadora 440px

### Interatividade
- [ ] Hover funciona em todos os botões
- [ ] Focus visível ao usar Tab
- [ ] Animações suaves (300ms)
- [ ] TickerBar scroll infinito sem quebras

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Widget não aparece

**Causa:** Componente não importado  
**Solução:** Verifique se `<BreakpointTester />` está no `App.tsx`

```typescript
// App.tsx
import BreakpointTester from "./components/BreakpointTester";

return (
  <>
    <BreakpointTester /> {/* ← Deve estar aqui */}
    {/* ... resto do código */}
  </>
);
```

### Problema 2: Botão "Ver Dashboard" não aparece

**Causa:** Você não está na home  
**Solução:** Navegue para a home page primeiro

### Problema 3: Dashboard não carrega após clicar no botão

**Causa:** Erro de estado  
**Solução:**
1. Abra o DevTools Console (`F12`)
2. Veja se há erros em vermelho
3. Limpe o localStorage:
   ```javascript
   localStorage.clear();
   ```
4. Recarregue a página (`Cmd+R` ou `Ctrl+R`)

### Problema 4: BreakpointTester mostra valores errados

**Causa:** Cache do navegador  
**Solução:** Hard refresh (`Cmd+Shift+R` ou `Ctrl+Shift+R`)

---

## 🗑️ REMOVER FERRAMENTAS DE TESTE (Produção)

**⚠️ IMPORTANTE:** Antes de fazer deploy, remova os componentes de teste!

### Passo 1: Editar App.tsx

**Remover linha ~10:**
```typescript
import BreakpointTester from "./components/BreakpointTester"; // ❌ DELETAR
```

**Remover linha ~200:**
```typescript
<BreakpointTester /> {/* ❌ DELETAR */}
```

**Remover função handleTestDashboard (~linha 30-37):**
```typescript
// ❌ DELETAR TUDO ISSO
const handleTestDashboard = () => {
  // ...
};
```

**Remover botão flutuante (~linha 210-245):**
```typescript
// ❌ DELETAR TODA ESSA DIV
<div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
  <button onClick={handleTestDashboard}>
    🚀 TESTE: Ver Dashboard
  </button>
</div>
```

### Passo 2: Verificar

```bash
# Procurar por referências
grep -r "BreakpointTester" src/
grep -r "handleTestDashboard" src/

# Resultado esperado: nenhum match
```

### Passo 3: Build

```bash
npm run build
npm run preview

# Testar em http://localhost:4173
# Não deve haver componentes de teste
```

---

## 📞 SUPORTE

**Encontrou algum problema?**
1. Veja a documentação em `/TESTES_VISUAIS.md`
2. Consulte `/DESENVOLVIMENTO.md` para troubleshooting
3. Abra uma issue no GitHub
4. Contate: suporte@federalexpress.com.br

---

## ✅ APROVEITANDO AO MÁXIMO

**Dicas:**
1. **Deixe o BreakpointTester sempre visível** durante desenvolvimento
2. **Use o botão de teste** para economizar tempo ao testar o dashboard
3. **Redimensione a janela gradualmente** para ver todas as transições
4. **Teste em navegadores diferentes** (Chrome, Firefox, Safari)
5. **Use modo dispositivo do DevTools** para simular touch

---

**Última atualização:** 2025-11-07  
**Versão:** 1.0 - Ferramentas de Teste ✅
