/**
 * FEDERAL EXPRESS BRASIL
 * API: Crypto Rates
 * 
 * Busca taxas de criptomoedas da CoinGecko API e persiste no Supabase
 * Atualização automática: 24/7, a cada 10 minutos (crypto nunca dorme!)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE ADMIN CLIENT
// ============================================================================
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Lista de criptomoedas principais
const CRYPTO_IDS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'cardano',
  'solana',
  'ripple',
  'polkadot',
  'dogecoin',
  'avalanche-2',
  'polygon',
  'chainlink',
  'litecoin',
  'uniswap',
  'stellar',
  'tron',
  'monero',
  'cosmos',
  'toncoin',
  'shiba-inu',
  'dai',
].join(',');

// Cache em memória (para múltiplas requisições na mesma execução)
let cachedRates: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// ============================================================================
// TIPOS
// ============================================================================
interface CoinGeckoPrice {
  usd: number;
  brl: number;
  eur: number;
  usd_24h_change?: number;
  usd_7d_change?: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
}

interface CryptoRate {
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

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Busca taxas da CoinGecko API
 */
async function fetchCryptoRates(): Promise<Record<string, CoinGeckoPrice>> {
  try {
    // Buscar preços em USD, BRL e EUR com dados de mercado
    const url = `${COINGECKO_API_URL}/simple/price?ids=${CRYPTO_IDS}&vs_currencies=usd,brl,eur&include_24hr_change=true&include_7d_change=true&include_market_cap=true&include_24h_vol=true`;
    
    console.log('📡 Fetching from CoinGecko API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${Object.keys(data).length} cryptos from CoinGecko`);
    
    return data;
  } catch (error) {
    console.error('Error fetching crypto rates:', error);
    throw error;
  }
}

/**
 * Busca informações detalhadas das criptos (nome, símbolo)
 */
async function fetchCryptoInfo(): Promise<Record<string, { symbol: string; name: string }>> {
  try {
    const url = `${COINGECKO_API_URL}/coins/list`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Converter array para objeto { id: { symbol, name } }
    const info: Record<string, { symbol: string; name: string }> = {};
    data.forEach((coin: any) => {
      info[coin.id] = {
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
      };
    });
    
    return info;
  } catch (error) {
    console.error('Error fetching crypto info:', error);
    // Retornar fallback com símbolos conhecidos
    return {
      bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
      ethereum: { symbol: 'ETH', name: 'Ethereum' },
      binancecoin: { symbol: 'BNB', name: 'BNB' },
      cardano: { symbol: 'ADA', name: 'Cardano' },
      solana: { symbol: 'SOL', name: 'Solana' },
      ripple: { symbol: 'XRP', name: 'XRP' },
      polkadot: { symbol: 'DOT', name: 'Polkadot' },
      dogecoin: { symbol: 'DOGE', name: 'Dogecoin' },
      'avalanche-2': { symbol: 'AVAX', name: 'Avalanche' },
      polygon: { symbol: 'MATIC', name: 'Polygon' },
      chainlink: { symbol: 'LINK', name: 'Chainlink' },
      litecoin: { symbol: 'LTC', name: 'Litecoin' },
      uniswap: { symbol: 'UNI', name: 'Uniswap' },
      stellar: { symbol: 'XLM', name: 'Stellar' },
      tron: { symbol: 'TRX', name: 'TRON' },
    };
  }
}

/**
 * Salva/atualiza taxas no Supabase
 */
async function saveCryptoRates(prices: Record<string, CoinGeckoPrice>): Promise<number> {
  try {
    // Buscar informações adicionais (símbolos e nomes)
    const cryptoInfo = await fetchCryptoInfo();
    
    const rates: CryptoRate[] = Object.entries(prices).map(([id, price]) => ({
      crypto_id: id,
      crypto_symbol: cryptoInfo[id]?.symbol || id.toUpperCase().slice(0, 4),
      crypto_name: cryptoInfo[id]?.name || id,
      price_usd: price.usd,
      price_brl: price.brl,
      price_eur: price.eur,
      change_24h: price.usd_24h_change || null,
      change_7d: price.usd_7d_change || null,
      change_30d: null, // CoinGecko free não tem 30d
      market_cap_usd: price.usd_market_cap || null,
      volume_24h_usd: price.usd_24h_vol || null,
      fetched_at: new Date().toISOString(),
    }));
    
    // Upsert em lote
    const { error, count } = await supabase
      .from('crypto_rates')
      .upsert(rates, {
        onConflict: 'crypto_id',
        ignoreDuplicates: false,
      });
    
    if (error) {
      console.error('Error saving crypto rates:', error);
      throw error;
    }
    
    console.log(`✅ Saved ${count || rates.length} crypto rates to database`);
    return count || rates.length;
  } catch (error) {
    console.error('Error in saveCryptoRates:', error);
    throw error;
  }
}

/**
 * Busca taxas do Supabase
 */
async function getCryptoRatesFromDB(): Promise<CryptoRate[]> {
  const { data, error } = await supabase
    .from('crypto_rates')
    .select('*')
    .order('market_cap_usd', { ascending: false, nullsFirst: false });
  
  if (error) {
    console.error('Error fetching from DB:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Verifica se precisa atualizar (> 10 min)
 */
async function needsUpdate(): Promise<boolean> {
  const { data, error } = await supabase
    .from('crypto_rates')
    .select('fetched_at')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return true;
  }
  
  const lastFetch = new Date(data.fetched_at).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastFetch) / (60 * 1000);
  
  return diffMinutes >= 10;
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { action, crypto, currency, amount } = req.query;
    
    // ========================================================================
    // ACTION: UPDATE (Forçar atualização)
    // ========================================================================
    if (action === 'update' || req.method === 'POST') {
      console.log('🔄 Forced update requested');
      
      // Buscar da CoinGecko
      const prices = await fetchCryptoRates();
      
      // Salvar no Supabase
      const count = await saveCryptoRates(prices);
      
      // Salvar snapshot no histórico
      await supabase.rpc('save_crypto_rates_snapshot');
      
      // Limpar cache em memória
      cachedRates = null;
      
      return res.status(200).json({
        success: true,
        message: 'Taxas de criptomoedas atualizadas com sucesso',
        cryptos_updated: count,
        timestamp: new Date().toISOString(),
      });
    }
    
    // ========================================================================
    // ACTION: CONVERT (Converter valor)
    // ========================================================================
    if (crypto && currency && amount) {
      // Garantir que os parâmetros sejam strings (podem vir como arrays)
      const cryptoStr = Array.isArray(crypto) ? crypto[0] : crypto;
      const currencyStr = Array.isArray(currency) ? currency[0] : currency;
      const amountStr = Array.isArray(amount) ? amount[0] : amount;
      
      const dbRates = await getCryptoRatesFromDB();
      const cryptoData = dbRates.find((c) => c.crypto_id === cryptoStr || c.crypto_symbol === cryptoStr);
      
      if (!cryptoData) {
        return res.status(404).json({ error: 'Criptomoeda não encontrada' });
      }
      
      const amountNum = parseFloat(amountStr);
      const priceKey = `price_${currencyStr}` as keyof CryptoRate;
      const price = cryptoData[priceKey] as number;
      
      if (!price) {
        return res.status(400).json({ error: `Moeda ${currencyStr} não suportada` });
      }
      
      const cryptoAmount = amountNum / price;
      
      return res.status(200).json({
        crypto: cryptoData.crypto_symbol,
        crypto_name: cryptoData.crypto_name,
        currency: currencyStr.toUpperCase(),
        fiat_amount: amountNum,
        crypto_amount: parseFloat(cryptoAmount.toFixed(8)),
        price,
        change_24h: cryptoData.change_24h,
        timestamp: cryptoData.fetched_at,
      });
    }
    
    // ========================================================================
    // ACTION: GET (Retornar taxas atuais)
    // ========================================================================
    if (req.method === 'GET') {
      // Verificar cache em memória
      const now = Date.now();
      if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('💾 Returning from memory cache');
        return res.status(200).json({
          cryptos: cachedRates,
          cached: true,
          timestamp: new Date(cacheTimestamp).toISOString(),
        });
      }
      
      // Buscar do banco
      console.log('🗄️ Fetching from database...');
      const dbRates = await getCryptoRatesFromDB();
      
      if (dbRates.length === 0) {
        // Se DB vazio, buscar da API (primeira vez)
        console.log('📡 Database empty, fetching from CoinGecko...');
        const prices = await fetchCryptoRates();
        await saveCryptoRates(prices);
        const freshRates = await getCryptoRatesFromDB();
        
        cachedRates = freshRates;
        cacheTimestamp = now;
        
        return res.status(200).json({
          cryptos: freshRates,
          cached: false,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Atualizar cache em memória
      cachedRates = dbRates;
      cacheTimestamp = now;
      
      // Verificar se precisa atualizar (mas não bloquear resposta)
      const shouldUpdate = await needsUpdate();
      if (shouldUpdate) {
        console.log('⚠️ Rates are outdated (>10 min), triggering background update...');
        // Trigger assíncrono
        fetchCryptoRates()
          .then(saveCryptoRates)
          .then(() => console.log('✅ Background update completed'))
          .catch((err) => console.error('❌ Background update failed:', err));
      }
      
      return res.status(200).json({
        cryptos: dbRates,
        cached: false,
        timestamp: dbRates[0]?.fetched_at || new Date().toISOString(),
      });
    }
    
    // Método não suportado
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error: any) {
    console.error('❌ Crypto rates API error:', error);
    return res.status(500).json({
      error: 'Erro ao buscar taxas de criptomoedas',
      message: error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

