# 🎨 Federal Express Brasil - Design System

## Sistema de Design Responsivo v2.0
**Equivalência 100% Figma ↔️ Cursor/Tailwind CSS**

---

## 📋 Índice

1. [Breakpoints](#breakpoints)
2. [Grid System](#grid-system)
3. [Tipografia](#tipografia)
4. [Cores Institucionais](#cores-institucionais)
5. [Spacing Tokens](#spacing-tokens)
6. [Componentes](#componentes)
7. [Auto Layout Guidelines](#auto-layout-guidelines)
8. [Critérios de Aceite](#critérios-de-aceite)

---

## 🖥️ Breakpoints

| Device   | Width  | Tailwind Prefix | Grid Columns | Gutter | Margin |
|----------|--------|----------------|--------------|--------|--------|
| Mobile   | 360px  | (default)      | 4            | 12px   | 16px   |
| Tablet   | 768px  | `md:`          | 8            | 16px   | 32px   |
| Laptop   | 1024px | `lg:`          | 12           | 24px   | 80px   |
| Desktop  | 1440px | `xl:`          | 12           | 24px   | 80px   |

### Implementaçéo no Figma:
```
Frame: Federal_Express_Site_Responsive
├── Mobile_360px
├── Tablet_768px
├── Laptop_1024px
└── Desktop_1440px
```

### Implementaçéo no Tailwind:
```tsx
<div className="
  px-4        // Mobile: 16px margin
  md:px-8     // Tablet: 32px margin
  lg:px-20    // Laptop/Desktop: 80px margin
">
```

---

## 📐 Grid System

### Desktop (12 colunas)
- **Colunas:** 12
- **Gutter:** 24px
- **Margens:** 80px laterais
- **Max Width:** 1440px

### Tablet (8 colunas)
- **Colunas:** 8
- **Gutter:** 16px
- **Margens:** 32px laterais

### Mobile (4 colunas)
- **Colunas:** 4
- **Gutter:** 12px
- **Margens:** 16px laterais

### Layout Constraints no Figma:
```
Elementos centrais → "Center"
Imagens → "Scale"
Textos e botões → "Hug contents"
Containers principais → "Fill container" com max-width
```

---

## 🔤 Tipografia

### Famílias de Fonte:
- **Títulos:** Poppins (400, 600, 700, 800, 900)
- **Corpo:** Inter (400, 500, 600)

### Escala Tipográfica com clamp():
| Token       | Figma Name | Min    | Preferred | Max   | Uso                          |
|-------------|------------|--------|-----------|-------|------------------------------|
| `--text-xs` | text-xs    | 12px   | 1.5vw     | 14px  | Disclaimers, notas de rodapé |
| `--text-sm` | text-sm    | 14px   | 1.75vw    | 16px  | Labels, captions             |
| `--text-base` | text-base | 16px | 2vw       | 18px  | Corpo de texto padréo        |
| `--text-lg` | text-lg    | 18px   | 2.25vw    | 20px  | Subtítulos                   |
| `--text-xl` | text-xl    | 20px   | 2.5vw     | 24px  | Heading 4                    |
| `--text-2xl` | text-2xl  | 24px   | 3vw       | 30px  | Heading 3                    |
| `--text-3xl` | text-3xl  | 30px   | 3.75vw    | 36px  | Heading 2                    |
| `--text-4xl` | text-4xl  | 36px   | 4.5vw     | 48px  | Heading 1 (hero)             |

### Text Styles no Figma:
```
Federal_Express/Heading/H1 → Poppins Bold 36px → clamp(36px, 4.5vw, 48px)
Federal_Express/Heading/H2 → Poppins Bold 30px → clamp(30px, 3.75vw, 36px)
Federal_Express/Body/Large → Inter Regular 18px → clamp(18px, 2.25vw, 20px)
Federal_Express/Body/Base → Inter Regular 16px → clamp(16px, 2vw, 18px)
```

### Implementaçéo CSS:
```css
h1 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: var(--text-4xl); /* clamp(36px, 4.5vw, 48px) */
  line-height: 1.2;
}
```

---

## 🎨 Cores Institucionais

### Cores Primárias:
| Nome               | Hex       | Uso                                    |
|--------------------|-----------|----------------------------------------|
| Brand Blue         | `#0A4B9E` | Títulos, CTAs primários, links         |
| Brand Blue Light   | `#0058CC` | Hover states, elementos secundários    |
| Brand Green        | `#2BA84A` | Botões de açéo, confirmações, sucesso  |
| Brand Purple       | `#7C6EE4` | Destaques especiais, badges            |

### Cores Neutras:
| Nome               | Hex       | Uso                                    |
|--------------------|-----------|----------------------------------------|
| Background Light   | `#F5F6F8` | Fundos de cards, containers            |
| Text Primary       | `#111111` | Texto principal de alta hierarquia     |
| Text Secondary     | `#666666` | Texto secundário, descrições           |
| Text Muted         | `#999999` | Placeholders, texto esmaecido          |
| White              | `#FFFFFF` | Backgrounds principais, textos sobre dark |

### Color Styles no Figma:
```
Federal_Express/Brand/Blue → #0A4B9E
Federal_Express/Brand/Green → #2BA84A
Federal_Express/Text/Primary → #111111
Federal_Express/Background/Light → #F5F6F8
```

---

## 📏 Spacing Tokens

| Token         | Valor | Figma Name | Tailwind      | Uso                              |
|---------------|-------|------------|---------------|----------------------------------|
| `--space-xs`  | 8px   | Space/XS   | `p-2`, `gap-2` | Padding interno pequeno         |
| `--space-sm`  | 12px  | Space/SM   | `p-3`, `gap-3` | Gap entre elementos relacionados |
| `--space-md`  | 24px  | Space/MD   | `p-6`, `gap-6` | Espaçamento padréo entre seções  |
| `--space-lg`  | 48px  | Space/LG   | `p-12`, `gap-12` | Separaçéo entre blocos         |
| `--space-xl`  | 80px  | Space/XL   | `p-20`, `gap-20` | Margens principais desktop     |

### Responsividade de Espaçamentos:
```tsx
// Seçéo com espaçamento responsivo
<section className="
  mt-8        // Mobile: 32px
  md:mt-12    // Tablet: 48px
  lg:mt-20    // Desktop: 80px
">
```

---

## 🧩 Componentes

### 1️⃣ Header
**Figma Component:** `Header_Component`

**Especificações:**
- Height: Auto
- Background: `#0A4B9E`
- Padding: `24px` (mobile) / `32px` (desktop)
- Position: Sticky (top: 0)
- Z-index: 50

**Auto Layout:**
- Direction: Horizontal
- Align: Space between
- Gap: 16px

**Tailwind Classes:**
```tsx
<header className="
  sticky top-0 z-50
  bg-[#0A4B9E]
  px-4 py-6
  md:px-8 md:py-8
  lg:px-20
">
```

---

### 2️⃣ Hero Section
**Figma Component:** `Hero_Section`

**Especificações:**
- Height: 400px (mobile) / 600px (desktop)
- Background: Image with overlay
- Padding: 48px (mobile) / 80px (desktop)

**Auto Layout:**
- Direction: Vertical
- Align: Center
- Gap: 24px

**Tailwind Classes:**
```tsx
<section className="
  relative
  h-[400px] lg:h-[600px]
  py-12 lg:py-20
  flex flex-col items-center justify-center
">
```

---

### 3️⃣ Button Primary
**Figma Component:** `Button/Primary`

**Especificações:**
- Height: 56px
- Background: `#2BA84A`
- Border Radius: 12px
- Shadow: `0 6px 12px rgba(0,0,0,0.25)`
- Font: Poppins 18px Semibold
- Padding: 24px horizontal

**States:**
- Hover: `brightness(110%)`
- Active: `scale(0.97)`
- Disabled: `opacity(50%)`

**Tailwind Classes:**
```tsx
<button className="
  h-[56px] px-6
  bg-[#2BA84A]
  text-white
  rounded-xl
  shadow-[0_6px_12px_rgba(0,0,0,0.25)]
  hover:brightness-110
  active:scale-[0.97]
  transition-all duration-300
  disabled:opacity-50
  disabled:cursor-not-allowed
">
```

---

### 4️⃣ Input Field
**Figma Component:** `Input/Default`

**Especificações:**
- Height: 52px
- Border: 1px solid `rgba(0,0,0,0.1)`
- Border Radius: 8px
- Padding: 16px
- Font: Inter 16px Regular
- Focus Border: `#0A4B9E`

**Tailwind Classes:**
```tsx
<input className="
  h-[52px]
  px-4
  border border-gray-300
  rounded-lg
  focus:border-[#0A4B9E]
  focus:ring-2
  focus:ring-[rgba(10,75,158,0.25)]
  transition-all
">
```

---

### 5️⃣ Card Container
**Figma Component:** `Card/Default`

**Especificações:**
- Background: `#FFFFFF`
- Border Radius: 16px
- Shadow: `0 8px 24px rgba(0,0,0,0.08)`
- Padding: 24px (mobile) / 48px (desktop)
- Max Width: 720px

**Tailwind Classes:**
```tsx
<div className="
  bg-white
  rounded-2xl
  p-6 md:p-12
  shadow-[0_8px_24px_rgba(0,0,0,0.08)]
  max-w-[720px]
  mx-auto
">
```

---

### 6️⃣ RSS Carousel
**Figma Component:** `RSSCarousel_Component`

**Especificações:**
- Gap between items: 24px
- Card width: 380px (desktop) / 100% (mobile)
- Auto Layout: Horizontal
- Overflow: Scroll (hidden scrollbar)

**Tailwind Classes:**
```tsx
<div className="
  flex
  gap-6
  overflow-x-auto
  scroll-smooth
  scrollbar-hide
  pb-4
">
  <article className="
    min-w-[280px] md:min-w-[380px]
    flex-shrink-0
  ">
```

---

## 🔄 Auto Layout Guidelines

### Regras de Componentizaçéo:

1. **Todos os componentes devem ter Auto Layout ativo**
2. **Nomenclatura padronizada:**
   ```
   ComponentName_Element_State
   Exemplo: Button_Primary_Hover
   ```

3. **Hierarquia de Constraints:**
   ```
   Container → "Fill container" ou "Hug contents"
   Imagens → "Scale"
   Textos → "Hug contents"
   Botões → "Hug contents" (width) + "Fixed" (height 56px)
   ```

4. **Padding vs Gap:**
   - Padding → espaçamento interno do container
   - Gap → espaçamento entre elementos filhos

5. **Direction:**
   - Vertical → stacks (hero, formulários)
   - Horizontal → navs, carrosséis

---

## ✅ Critérios de Aceite

### ✔️ Responsividade:
- [ ] Nenhum texto quebra entre breakpoints
- [ ] Todos os elementos escalam suavemente
- [ ] Imagens mantêm aspect ratio
- [ ] Grids se adaptam automaticamente

### ✔️ Tipografia:
- [ ] Todos os tamanhos usam clamp()
- [ ] Line-height adequado (1.2 para títulos, 1.6 para corpo)
- [ ] Peso de fonte consistente com hierarchy

### ✔️ Espaçamento:
- [ ] Spacing tokens usados consistentemente
- [ ] Margens laterais corretas em cada breakpoint
- [ ] Gaps entre elementos seguem escala definida

### ✔️ Componentes:
- [ ] Nomenclatura idêntica entre Figma e Cursor
- [ ] Auto Layout sem conflitos de constraints
- [ ] Estados (hover, active, focus) implementados

### ✔️ Cores:
- [ ] Cores institucionais aplicadas corretamente
- [ ] Contraste WCAG AA+ (mínimo 4.5:1)
- [ ] Nenhuma cor hardcoded sem token

### ✔️ Exportaçéo:
- [ ] Design tokens exportáveis como JSON
- [ ] Componentes reutilizáveis
- [ ] Equivalência perfeita Figma ↔️ Tailwind

---

## 📦 Arquivos de Referência

- **CSS Tokens:** `/styles/globals.css`
- **JSON Export:** `/design-tokens.json`
- **Componentes:** `/components/`

---

## 🔗 Recursos Úteis

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Figma Auto Layout](https://help.figma.com/hc/en-us/articles/360040451373)
- [Design Tokens Spec](https://tr.designtokens.org/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Verséo:** 2.0.0  
**Última atualizaçéo:** 2025-11-07  
**Mantido por:** Federal Express Brasil - Equipe de Design
