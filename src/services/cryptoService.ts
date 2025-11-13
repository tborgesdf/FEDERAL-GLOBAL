/**
 * FEDERAL EXPRESS BRASIL
 * Service: Crypto Rates
 * 
 * Gerencia cotações de criptomoedas e conversões
 */

import type { CryptoRatesResponse, CryptoConversionResponse, CryptoRate } from '@/types/crypto';

// Cache local (10 minutos)
const CACHE_KEY = 'crypto_rates_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

interface CachedCryptoRates {
  data: CryptoRatesResponse;
  timestamp: number;
}

/**
 * Busca todas as taxas de criptomoedas
 */
export async function getCryptoRates(): Promise<CryptoRatesResponse> {
  try {
    // Verificar cache local primeiro
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: CachedCryptoRates = JSON.parse(cached);
      const now = Date.now();
      
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        console.log('💾 Crypto rates from cache');
        return parsedCache.data;
      }
    }
    
    // Determinar URL da API (desenvolvimento vs produção)
    const isDevelopment = import.meta.env.DEV;
    const apiUrl = isDevelopment
      ? 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,ripple,polkadot,dogecoin,avalanche-2,polygon,chainlink,litecoin,uniswap,stellar,tron&vs_currencies=usd,brl,eur&include_24hr_change=true&include_7d_change=true&include_market_cap=true&include_24h_vol=true'
      : '/api/crypto-rates';
    
    console.log('📡 Fetching crypto rates from API...', isDevelopment ? '(CoinGecko direct)' : '(backend)');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const rawData = await response.json();
    
    // Normalizar resposta
    let data: CryptoRatesResponse;
    
    if (isDevelopment) {
      // Converter resposta direta do CoinGecko para nosso formato
      const cryptos: CryptoRate[] = Object.entries(rawData).map(([id, prices]: [string, any]) => ({
        crypto_id: id,
        crypto_symbol: id.toUpperCase().slice(0, 4),
        crypto_name: id.charAt(0).toUpperCase() + id.slice(1),
        price_usd: prices.usd,
        price_brl: prices.brl,
        price_eur: prices.eur,
        change_24h: prices.usd_24h_change || null,
        change_7d: prices.usd_7d_change || null,
        change_30d: null,
        market_cap_usd: prices.usd_market_cap || null,
        volume_24h_usd: prices.usd_24h_vol || null,
        fetched_at: new Date().toISOString(),
      }));
      
      data = {
        cryptos,
        cached: false,
        timestamp: new Date().toISOString(),
      };
    } else {
      data = rawData;
    }
    
    // Salvar no cache
    const cacheData: CachedCryptoRates = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    console.log('✅ Crypto rates loaded:', data.cryptos.length, 'cryptocurrencies');
    
    return data;
  } catch (error) {
    console.error('Error fetching crypto rates:', error);
    
    // Tentar retornar cache antigo se houver
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: CachedCryptoRates = JSON.parse(cached);
      console.warn('⚠️ Using stale cache due to API error');
      return parsedCache.data;
    }
    
    throw error;
  }
}

/**
 * Converte valor fiat para criptomoeda
 */
export async function convertToCrypto(
  amount: number,
  currency: 'usd' | 'brl' | 'eur',
  cryptoId: string
): Promise<CryptoConversionResponse> {
  try {
    // Em produção, usar endpoint específico
    if (!import.meta.env.DEV) {
      const response = await fetch(`/api/crypto-rates?crypto=${cryptoId}&currency=${currency}&amount=${amount}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    }
    
    // Em desenvolvimento, calcular manualmente
    const rates = await getCryptoRates();
    const crypto = rates.cryptos.find((c) => c.crypto_id === cryptoId || c.crypto_symbol === cryptoId);
    
    if (!crypto) {
      throw new Error('Criptomoeda não encontrada');
    }
    
    const priceKey = `price_${currency}` as keyof CryptoRate;
    const price = crypto[priceKey] as number;
    
    if (!price) {
      throw new Error(`Moeda ${currency} não suportada`);
    }
    
    const cryptoAmount = amount / price;
    
    return {
      crypto: crypto.crypto_symbol,
      crypto_name: crypto.crypto_name,
      currency: currency.toUpperCase(),
      fiat_amount: amount,
      crypto_amount: parseFloat(cryptoAmount.toFixed(8)),
      price,
      change_24h: crypto.change_24h,
      timestamp: crypto.fetched_at,
    };
  } catch (error) {
    console.error('Error converting to crypto:', error);
    throw error;
  }
}

/**
 * Busca preço de cripto específica
 */
export async function getCryptoPrice(cryptoId: string, currency: 'usd' | 'brl' | 'eur' = 'brl'): Promise<number> {
  try {
    const rates = await getCryptoRates();
    const crypto = rates.cryptos.find((c) => c.crypto_id === cryptoId || c.crypto_symbol === cryptoId);
    
    if (!crypto) {
      throw new Error('Criptomoeda não encontrada');
    }
    
    const priceKey = `price_${currency}` as keyof CryptoRate;
    return crypto[priceKey] as number;
  } catch (error) {
    console.error('Error getting crypto price:', error);
    throw error;
  }
}

/**
 * Formata valor como criptomoeda
 */
export function formatCrypto(amount: number, symbol: string): string {
  return `${amount.toFixed(8)} ${symbol}`;
}

/**
 * Formata variação percentual
 */
export function formatChange(change: number | null): string {
  if (change === null) return 'N/A';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Limpa cache local
 */
export function clearCryptoCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Crypto rates cache cleared');
}

/**
 * Força atualização das taxas (apenas para admin/teste)
 */
export async function forceUpdateCryptoRates(): Promise<void> {
  try {
    const response = await fetch('/api/crypto-rates?action=update', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Crypto rates updated:', data);
    
    // Limpar cache local
    clearCryptoCache();
  } catch (error) {
    console.error('Error forcing update:', error);
    throw error;
  }
}

