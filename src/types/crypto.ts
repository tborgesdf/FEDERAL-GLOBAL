/**
 * FEDERAL EXPRESS BRASIL
 * Types: Crypto Rates
 */

export interface CryptoRate {
  crypto_id: string;
  crypto_symbol: string;
  crypto_name: string;
  price_usd: number;
  price_brl: number;
  price_eur: number;
  change_24h: number | null;
  change_7d: number | null;
  change_30d: number | null;
  market_cap_usd: number | null;
  volume_24h_usd: number | null;
  fetched_at: string;
}

export interface CryptoRatesResponse {
  cryptos: CryptoRate[];
  cached: boolean;
  timestamp: string;
}

export interface CryptoConversionResponse {
  crypto: string;
  crypto_name: string;
  currency: string;
  fiat_amount: number;
  crypto_amount: number;
  price: number;
  change_24h: number | null;
  timestamp: string;
}

export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
}

export const POPULAR_CRYPTOS: Cryptocurrency[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', icon: '🔶' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', icon: '₳' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', icon: '✕' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', icon: '●' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', icon: '🔺' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon', icon: '⬢' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', icon: '🔗' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', icon: 'Ł' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', icon: '*' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', icon: '⚡' },
];

export const FIAT_CURRENCIES = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

