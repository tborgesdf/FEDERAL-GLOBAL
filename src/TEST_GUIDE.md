# 🧪 Guia de Testes E2E - Federal Express Brasil

## Sistema de Design Responsivo - Validaçéo Completa

---

## 📋 Preparaçéo do Ambiente

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Instalar Playwright

```bash
npm run test:install
```

Isso instalará os navegadores (Chromium, Firefox, WebKit) necessários para os testes.

---

## 🚀 Executando os Testes

### Modo Padréo (Headless)

```bash
npm run test:e2e
```

Executa todos os testes em modo headless (sem interface gráfica).

### Modo UI (Recomendado para Debug)

```bash
npm run test:e2e:ui
```

Abre a interface gráfica do Playwright para executar e debugar testes interativamente.

### Modo Headed (Ver Navegador)

```bash
npm run test:e2e:headed
```

Executa os testes mostrando o navegador em açéo.

### Ver Relatório Anterior

```bash
npm run test:e2e:report
```

Abre o relatório HTML do último teste executado.

---

## 📊 Estrutura dos Testes

```
tests/e2e/
├── home.spec.ts           # Testes da página inicial (11 testes)
├── auth.spec.ts           # Testes de autenticaçéo (24 testes)
├── accessibility.spec.ts  # Testes de acessibilidade (13 testes)
└── responsive.spec.ts     # Testes de responsividade (18 testes)
```

**Total:** 66 testes automatizados

---

## ✅ Critérios de Aceite

### 🏠 Home (11 testes)

- [x] Todos os componentes principais carregam (Header, Hero, Ticker, Footer)
- [x] Responsividade 360px (mobile)
- [x] Responsividade 1440px (desktop)
- [x] Navegaçéo para Cadastro
- [x] Navegaçéo para Login
- [x] Logo redireciona para home
- [x] Contraste adequado (AA+)
- [x] Carrosséis RSS visíveis
- [x] MultimediaSection visível
- [x] Design tokens aplicados corretamente
- [x] Sticky header funciona no scroll

**Esperado:** ✅ 11/11 passando

---

### 🔐 Auth (24 testes)

#### Cadastro (8 testes)
- [x] Exibe todos os campos do formulário
- [x] Botéo desabilitado sem aceitar termos
- [x] Botéo habilita ao aceitar termos
- [x] Máscara de CPF aplicada
- [x] Máscara de telefone aplicada
- [x] Validaçéo de senhas diferentes
- [x] reCAPTCHA placeholder visível
- [x] Links para termos de uso
- [x] Design responsivo mobile

#### Login (8 testes)
- [x] Campos de login visíveis
- [x] Botéo mostrar/ocultar senha
- [x] Link "Esqueci minha senha"
- [x] Link "Criar conta"
- [x] Navegaçéo para recuperaçéo
- [x] Navegaçéo para cadastro
- [x] Voltar do modo recuperaçéo
- [x] Validaçéo de campos vazios
- [x] reCAPTCHA em todas as telas

#### Fluxo Completo (2 testes)
- [x] Simulaçéo de cadastro completo
- [x] Cores institucionais aplicadas

#### Validações Design System (6 testes)
- [x] Inputs com altura 52px
- [x] Botões com altura 56px
- [x] Cards com border-radius 16px
- [x] Sombras aplicadas

**Esperado:** ✅ 24/24 passando

---

### ♿ Accessibility (13 testes)

- [x] Estrutura semântica correta (header, main, footer)
- [x] Imagens com alt text
- [x] Formulários com labels associados
- [x] Botões com texto ou aria-label
- [x] Navegaçéo por teclado funciona
- [x] Focus visible aplicado
- [x] Contraste de cores adequado (AA)
- [x] Links identificáveis
- [x] Mensagens de erro anunciadas
- [x] Estados de hover visíveis
- [x] Checkboxes acessíveis
- [x] reCAPTCHA com descriçéo
- [x] Loading states anunciados

**Esperado:** ✅ 13/13 passando

---

### 📱 Responsive (18 testes)

#### Mobile 360px (6 testes)
- [x] Layout se adapta ao mobile
- [x] Textos néo quebram
- [x] Botões com largura adequada
- [x] Inputs ocupam largura total
- [x] Carrosséis permitem scroll horizontal
- [x] Margens de 16px

#### Tablet 768px (4 testes)
- [x] Layout usa 8 colunas
- [x] Formulários com largura adequada
- [x] Margens de 32px
- [x] Tipografia escala corretamente

#### Desktop 1440px (6 testes)
- [x] Layout usa 12 colunas
- [x] Max-width respeitado (720px para cards)
- [x] Margens de 80px
- [x] Hero com altura adequada
- [x] Carrosséis mostram múltiplos cards
- [x] Botões com padding adequado

#### Transições (3 testes)
- [x] Escala suave mobile → desktop
- [x] Imagens mantêm aspect ratio
- [x] Tipografia usa clamp()

#### Grid System (2 testes)
- [x] Mobile: 4 colunas, gutter 12px
- [x] Desktop: 12 colunas, gutter 24px

#### Constraints (3 testes)
- [x] Imagens escalam (Scale)
- [x] Botões ajustam (Hug contents)
- [x] Containers centralizam (Center)

**Esperado:** ✅ 18/18 passando

---

## 🎯 Resultados Esperados

### Sumário Final

```
✅ Home:          11/11 testes passando
✅ Auth:          24/24 testes passando  
✅ Accessibility: 13/13 testes passando
✅ Responsive:    18/18 testes passando

Total: 66/66 testes passando (100%)
```

---

## 🔍 Debug de Falhas

### Se um teste falhar:

1. **Ver screenshot:**
   ```bash
   ls test-results/
   ```
   Screenshots séo salvos automaticamente em falhas.

2. **Ver trace:**
   ```bash
   npx playwright show-trace test-results/.../trace.zip
   ```

3. **Executar teste específico:**
   ```bash
   npx playwright test home.spec.ts
   ```

4. **Executar um teste individual:**
   ```bash
   npx playwright test -g "deve carregar todos os componentes"
   ```

---

## 📸 Testes Visuais

### Gerar screenshots de referência:

```bash
npx playwright test --update-snapshots
```

### Comparar mudanças visuais:

```bash
npx playwright test --reporter=html
```

---

## 🌐 Navegadores Testados

Os testes séo executados em:

- ✅ **Chromium** (Chrome/Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

---

## 🛠️ Configuraçéo Avançada

### Executar apenas em um navegador:

```bash
npx playwright test --project=chromium
```

### Executar em paralelo:

```bash
npx playwright test --workers=4
```

### Modo debug:

```bash
npx playwright test --debug
```

---

## 📚 Arquivos de Referência

- **Configuraçéo:** `/playwright.config.ts`
- **Design Tokens:** `/design-tokens.json`
- **Sistema de Design:** `/DESIGN_SYSTEM.md`
- **CSS Tokens:** `/styles/globals.css`

---

## 🚨 Troubleshooting

### Erro: "Timeout waiting for locator"

**Soluçéo:** Aumentar timeout ou verificar se elemento existe:
```typescript
await expect(element).toBeVisible({ timeout: 10000 });
```

### Erro: "Browser not found"

**Soluçéo:** Reinstalar browsers:
```bash
npx playwright install --with-deps
```

### Erro: "Port 5173 is already in use"

**Soluçéo:** Matar processo ou mudar porta:
```bash
kill -9 $(lsof -ti:5173)
# ou
PORT=5174 npm run dev
```

### Testes lentos

**Soluçéo:** Desabilitar projetos mobile temporariamente:
```typescript
// playwright.config.ts
// Comentar projetos Mobile Chrome e Mobile Safari
```

---

## 📊 Relatório HTML

Após executar os testes, abrir:

```bash
npm run test:e2e:report
```

O relatório mostra:

- ✅ Testes que passaram
- ❌ Testes que falharam
- 📸 Screenshots de falhas
- 🎬 Traces de execuçéo
- ⏱️ Tempo de execuçéo
- 📊 Estatísticas por navegador

---

## ✨ Boas Práticas

1. **Execute testes antes de commits:**
   ```bash
   npm run test:e2e
   ```

2. **Use o modo UI para desenvolvimento:**
   ```bash
   npm run test:e2e:ui
   ```

3. **Mantenha testes independentes:**
   - Néo dependem de ordem de execuçéo
   - Cada teste limpa seu estado

4. **Use seletores semânticos:**
   - Preferir `getByRole`, `getByText`, `getByAltText`
   - Evitar seletores frágeis como classes CSS

5. **Screenshots em falhas:**
   - Automaticamente capturados
   - Ajudam no debug

---

## 🎓 Recursos Úteis

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Selectors Guide](https://playwright.dev/docs/selectors)

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verificar logs de erro
2. Consultar documentaçéo do Playwright
3. Revisar `/DESIGN_SYSTEM.md`
4. Verificar `/design-tokens.json`

---

**Verséo:** 2.0.0  
**Última atualizaçéo:** 2025-11-07  
**Mantido por:** Federal Express Brasil - QA Team
