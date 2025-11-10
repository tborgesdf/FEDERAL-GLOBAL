# Federal Express Brasil - Guia de Integração de APIs

## Visão Geral

Este documento descreve os placeholders de dados e estruturas preparadas para integração com APIs externas. Todos os componentes foram desenvolvidos com bindings nomeados para facilitar a implementação no ambiente de produção.

---

## 1. WeatherWidget (Header.tsx)

### Localização
Componente: `/components/Header.tsx`

### Estrutura de Dados

```typescript
interface WeatherData {
  location: string;          // "São Paulo, Brasil"
  tempC: number;            // Temperatura atual em Celsius
  description: string;       // Descrição do clima atual
  icon: string;             // Ícone do clima (emoji ou código)
  forecast: Array<{
    dateISO: string;        // Data no formato ISO (YYYY-MM-DD)
    minC: number;           // Temperatura mínima
    maxC: number;           // Temperatura máxima
    icon: string;           // Ícone da previsão
  }>;
  fetchedAt: string;        // Timestamp da última atualização (ISO)
}
```

### API Recomendadas
- OpenWeatherMap API
- WeatherAPI
- Visual Crossing Weather API

### Exemplo de Integração
```typescript
const fetchWeatherData = async (): Promise<WeatherData> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=São Paulo&units=metric&appid=${API_KEY}`
  );
  const data = await response.json();
  
  // Transformar resposta da API para nossa estrutura
  return {
    location: "São Paulo, Brasil",
    tempC: data.main.temp,
    description: data.weather[0].description,
    icon: mapWeatherIcon(data.weather[0].icon),
    forecast: await fetchForecast(),
    fetchedAt: new Date().toISOString()
  };
};
```

---

## 2. MarketTicker (MarketTicker.tsx)

### Localização
Componente: `/components/MarketTicker.tsx`

### Estrutura de Dados

```typescript
interface MarketIndex {
  symbol: 'NASDAQ' | 'SPX' | 'IBOV' | 'DAX' | 'NIKKEI';
  last: number;             // Último valor do índice
  changePct: number;        // Variação percentual
  fetchedAt: string;        // Timestamp ISO
}

interface FXRate {
  base: 'BRL';              // Moeda base (sempre BRL)
  quote: 'USD' | 'EUR' | 'GBP' | 'CAD';
  rate: number;             // Taxa de câmbio
  changePct: number;        // Variação percentual
  fetchedAt: string;        // Timestamp ISO
}

interface MarketTickerData {
  indexes: MarketIndex[];
  fx: FXRate[];
}
```

### APIs Recomendadas
- **Índices**: Alpha Vantage, Yahoo Finance API, Twelve Data
- **Câmbio**: Exchange Rates API, Fixer.io, Open Exchange Rates

### Exemplo de Integração
```typescript
const fetchMarketData = async (): Promise<MarketTickerData> => {
  const [indexesData, fxData] = await Promise.all([
    fetchIndexes(),
    fetchExchangeRates()
  ]);
  
  return {
    indexes: indexesData,
    fx: fxData
  };
};
```

### Nota Importante
O ticker utiliza scroll infinito automático. A atualização dos dados deve ocorrer em intervalos regulares (recomendado: 60-120 segundos) sem interromper a animação.

---

## 3. RSSCarousel_Migration (RSSCarousel.tsx)

### Localização
Componente: `/components/RSSCarousel.tsx`  
Uso: Seção "Atualidades sobre Migração e Turismo"

### Estrutura de Dados

```typescript
interface RSSItem {
  id: string;               // Identificador único do artigo
  image: string;            // URL da imagem destacada
  category: string;         // Sempre "Atualidades" para Migration
  title: string;            // Título do artigo
  excerpt: string;          // Resumo/descrição
  dateISO: string;          // Data de publicação (ISO)
  readMinutes: number;      // Tempo estimado de leitura
  href: string;             // Link para o artigo completo
}

interface RSSCarouselProps {
  items: RSSItem[];         // Exatamente 6 itens
}
```

### Fonte de Dados
- Feed RSS do blog institucional
- CMS (WordPress, Strapi, Contentful)
- API personalizada de conteúdo

### Exemplo de Integração
```typescript
const fetchMigrationArticles = async (): Promise<RSSItem[]> => {
  const response = await fetch('/api/blog/migration?limit=6');
  const articles = await response.json();
  
  return articles.map(article => ({
    id: article.id,
    image: article.featured_image || DEFAULT_IMAGE,
    category: "Atualidades",
    title: article.title,
    excerpt: article.excerpt,
    dateISO: article.published_at,
    readMinutes: calculateReadTime(article.content),
    href: `/blog/${article.slug}`
  }));
};
```

### Comportamento do Carrossel
- Auto-slide: 5 segundos por item
- Pausa ao hover/focus
- 6 slides no total
- Navegação por bullets clicáveis
- Setas de navegação anterior/próximo
- Barra de progresso visual

---

## 4. RSSCarousel_Travel (RSSCarousel.tsx)

### Localização
Componente: `/components/RSSCarousel.tsx`  
Uso: Seção "Dicas de Viagem"

### Estrutura de Dados
Idêntica ao RSSCarousel_Migration, com a seguinte diferença:

```typescript
interface RSSItem {
  // ... mesma estrutura
  category: string;         // Sempre "Dicas" para Travel
}
```

### Fonte de Dados
- Feed RSS da seção de Dicas de Viagem
- Mesmo CMS, categoria diferente
- API filtrada por categoria

---

## 5. Sistema de Data/Hora (Header.tsx)

### Implementação Atual
O relógio é atualizado via `setInterval` no lado do cliente a cada 1 segundo.

### Formato Brasileiro
```typescript
formatDate(new Date());
// Output: "sexta-feira, 7 de novembro de 2025 – 14:30"
```

### Considerações
- Usar `Intl.DateTimeFormat` para formatação robusta
- Considerar timezone do usuário ou fixo (America/Sao_Paulo)
- Sincronizar com servidor periodicamente para evitar drift

---

## 6. Multimídia - Embed YouTube/Spotify

### Localização
Componente: `/components/MultimediaSection.tsx`

### Placeholder Atual
Div com ícone de Play e informações do episódio.

### Integração Futura

#### YouTube
```typescript
<iframe
  width="100%"
  height="100%"
  src="https://www.youtube.com/embed/{VIDEO_ID}?autoplay=0"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  title="Canal Migratório Federal Express"
/>
```

#### Spotify
```typescript
<iframe
  style={{ borderRadius: '12px' }}
  src="https://open.spotify.com/embed/episode/{EPISODE_ID}"
  width="100%"
  height="352"
  frameBorder="0"
  allowFullScreen
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
/>
```

### Estrutura de Dados Dinâmica
```typescript
interface MultimediaContent {
  type: 'youtube' | 'spotify';
  id: string;               // Video/Episode ID
  title: string;            // Título do episódio
  description: string;      // Descrição
  guest?: string;           // Nome do convidado
  isLive: boolean;          // Status ON AIR
}
```

---

## 7. Considerações de Performance

### Cache
- Implementar cache de 5-15 minutos para dados de clima
- Cache de 30-60 segundos para dados de mercado
- Cache de 1-4 horas para artigos RSS

### Loading States
Adicionar skeletons/loading states para:
- WeatherWidget
- MarketTicker
- Carrosséis RSS
- Embed de multimídia

### Error Handling
Implementar fallbacks para:
- Falha de API (usar últimos dados em cache)
- Timeout de requisição
- Dados incompletos ou malformados

---

## 8. Variáveis de Ambiente Recomendadas

```env
# Weather
WEATHER_API_KEY=your_openweathermap_key
WEATHER_LOCATION=São Paulo,BR

# Market Data
MARKET_API_KEY=your_alpha_vantage_key
EXCHANGE_RATE_API_KEY=your_exchange_api_key

# Content/CMS
CMS_API_URL=https://your-cms.com/api
CMS_API_TOKEN=your_cms_token

# Multimedia
YOUTUBE_CHANNEL_ID=your_channel_id
SPOTIFY_SHOW_ID=your_show_id

# Cache
REDIS_URL=your_redis_url (opcional)
```

---

## 9. Checklist de Implementação

- [ ] Configurar APIs de clima (OpenWeatherMap)
- [ ] Configurar APIs de mercado (Alpha Vantage, Exchange Rates)
- [ ] Conectar CMS ou criar API de conteúdo
- [ ] Implementar sistema de cache
- [ ] Adicionar loading states e skeletons
- [ ] Implementar error boundaries
- [ ] Configurar variáveis de ambiente
- [ ] Testar responsividade em todos os breakpoints
- [ ] Validar acessibilidade (WCAG AA)
- [ ] Integrar embed de YouTube/Spotify
- [ ] Configurar QR Code do WhatsApp no footer
- [ ] Implementar analytics e tracking

---

## 10. Responsividade - Breakpoints

```css
/* Mobile First */
360px  - Mobile pequeno
768px  - Tablet
1024px - Desktop pequeno
1440px - Desktop padrão (design base)
```

### Ajustes por Breakpoint

#### Mobile (360-767px)
- Header: empilhar informações verticalmente
- Hero: fonte reduzida para 36-48px
- Carrosséis: 1 coluna, imagem acima do texto
- Footer: 1 coluna

#### Tablet (768-1023px)
- Hero: fonte 54-60px
- Carrosséis: manter 2 colunas, reduzir gaps
- Ticker: reduzir tamanho da fonte

#### Desktop (1024px+)
- Layout conforme especificação original
- Grid de 12 colunas com margens de 80px

---

## Contato para Suporte Técnico

Para dúvidas sobre a integração, contate a equipe de desenvolvimento:
- Email: dev@federalexpressbrasil.com.br
- Documentação interna: [Link para wiki interna]

---

**Última atualização:** 7 de novembro de 2025
