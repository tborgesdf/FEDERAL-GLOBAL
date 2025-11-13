/**
 * FEDERAL EXPRESS BRASIL
 * Service: Exchange Rates
 * 
 * Gerencia cotações de moedas e conversões
 */

import type { ExchangeRatesResponse, ConversionResponse } from '@/types/exchange';

// Cache local (10 minutos)
const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

interface CachedRates {
  data: ExchangeRatesResponse;
  timestamp: number;
}

/**
 * Busca todas as taxas de câmbio
 */
export async function getExchangeRates(): Promise<ExchangeRatesResponse> {
  try {
    // Verificar cache local primeiro
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: CachedRates = JSON.parse(cached);
      const now = Date.now();
      
      if (now - parsedCache.timestamp < CACHE_DURATION) {
        console.log('💾 Exchange rates from cache');
        return parsedCache.data;
      }
    }
    
    // Buscar da API
    console.log('📡 Fetching exchange rates from API...');
    const response = await fetch('/api/exchange-rates');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data: ExchangeRatesResponse = await response.json();
    
    // Salvar no cache
    const cacheData: CachedRates = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Tentar retornar cache antigo se houver
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: CachedRates = JSON.parse(cached);
      console.warn('⚠️ Using stale cache due to API error');
      return parsedCache.data;
    }
    
    throw error;
  }
}

/**
 * Converte valor entre duas moedas
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<ConversionResponse> {
  try {
    const response = await fetch(`/api/exchange-rates?from=${from}&to=${to}&amount=${amount}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data: ConversionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
}

/**
 * Busca taxa de câmbio específica
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  try {
    const rates = await getExchangeRates();
    
    const fromRate = rates.rates[from] || 1;
    const toRate = rates.rates[to] || 1;
    
    // Calcular taxa direta: from -> USD -> to
    const rate = toRate / fromRate;
    
    return rate;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    throw error;
  }
}

/**
 * Formata valor como moeda
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    // Mapeamento de códigos para locales
    const localeMap: Record<string, string> = {
      BRL: 'pt-BR',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      CAD: 'en-CA',
      AUD: 'en-AU',
      CHF: 'de-CH',
      CNY: 'zh-CN',
      ARS: 'es-AR',
      MXN: 'es-MX',
    };
    
    const locale = localeMap[currencyCode] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback simples
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Limpa cache local
 */
export function clearExchangeCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Exchange rates cache cleared');
}

/**
 * Força atualização das taxas (apenas para admin/teste)
 */
export async function forceUpdateRates(): Promise<void> {
  try {
    const response = await fetch('/api/exchange-rates?action=update', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Update failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Rates updated:', data);
    
    // Limpar cache local
    clearExchangeCache();
  } catch (error) {
    console.error('Error forcing update:', error);
    throw error;
  }
}

