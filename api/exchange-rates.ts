/**
 * FEDERAL EXPRESS BRASIL
 * API: Exchange Rates
 * 
 * Busca taxas de câmbio da ExchangeRate-API e persiste no Supabase
 * Atualização automática: seg-sex, 9h-17h BRT, a cada 10 minutos
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
const EXCHANGE_API_KEY = '5837ee8ab0477e0ba169aaf3';
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`;

// Cache em memória (para múltiplas requisições na mesma execução)
let cachedRates: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// ============================================================================
// TIPOS
// ============================================================================
interface ExchangeRateAPIResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

interface ExchangeRate {
  base_code: string;
  currency_code: string;
  rate: number;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  fetched_at: string;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Verifica se é horário comercial (seg-sex, 9h-17h BRT)
 */
function isBusinessHours(): boolean {
  const now = new Date();
  
  // Converter para horário de Brasília (UTC-3)
  const brtOffset = -3 * 60; // minutos
  const localOffset = now.getTimezoneOffset();
  const brtTime = new Date(now.getTime() + (brtOffset - localOffset) * 60 * 1000);
  
  const dayOfWeek = brtTime.getDay(); // 0 = domingo, 6 = sábado
  const hour = brtTime.getHours();
  
  // Segunda (1) a Sexta (5), das 9h às 17h
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isDuringHours = hour >= 9 && hour < 17;
  
  return isWeekday && isDuringHours;
}

/**
 * Busca taxas da API externa
 */
async function fetchExchangeRates(): Promise<ExchangeRateAPIResponse> {
  try {
    const response = await fetch(EXCHANGE_API_URL);
    
    if (!response.ok) {
      throw new Error(`Exchange API error: ${response.status} ${response.statusText}`);
    }
    
    const data: ExchangeRateAPIResponse = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(`Exchange API returned: ${data.result}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

/**
 * Salva/atualiza taxas no Supabase
 */
async function saveExchangeRates(apiData: ExchangeRateAPIResponse): Promise<number> {
  const rates: ExchangeRate[] = Object.entries(apiData.conversion_rates).map(([currency, rate]) => ({
    base_code: apiData.base_code,
    currency_code: currency,
    rate,
    time_last_update_unix: apiData.time_last_update_unix,
    time_last_update_utc: apiData.time_last_update_utc,
    time_next_update_unix: apiData.time_next_update_unix,
    time_next_update_utc: apiData.time_next_update_utc,
    fetched_at: new Date().toISOString(),
  }));
  
  // Upsert em lote (atualiza se existir, insere se não)
  const { error, count } = await supabase
    .from('exchange_rates')
    .upsert(rates, {
      onConflict: 'base_code,currency_code',
      ignoreDuplicates: false,
    });
  
  if (error) {
    console.error('Error saving exchange rates:', error);
    throw error;
  }
  
  console.log(`✅ Saved ${count || rates.length} exchange rates to database`);
  return count || rates.length;
}

/**
 * Busca taxas do Supabase (cache de 10 min no DB)
 */
async function getExchangeRatesFromDB(): Promise<ExchangeRate[]> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('base_code', 'USD')
    .order('currency_code', { ascending: true });
  
  if (error) {
    console.error('Error fetching from DB:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Verifica se as taxas no DB estão desatualizadas (> 10 min)
 */
async function needsUpdate(): Promise<boolean> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('fetched_at')
    .eq('base_code', 'USD')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    // Se não há dados, precisa atualizar
    return true;
  }
  
  const lastFetch = new Date(data.fetched_at).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastFetch) / (60 * 1000);
  
  // Atualizar se passou mais de 10 minutos
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
    const { action } = req.query;
    
    // ========================================================================
    // ACTION: UPDATE (Forçar atualização - para cron/admin)
    // ========================================================================
    if (action === 'update' || req.method === 'POST') {
      console.log('🔄 Forced update requested');
      
      // Verificar se é horário comercial
      if (!isBusinessHours()) {
        console.log('⏰ Outside business hours (Mon-Fri, 9AM-5PM BRT)');
        return res.status(200).json({
          success: false,
          message: 'Fora do horário de atualização (seg-sex, 9h-17h BRT)',
          business_hours: false,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Buscar da API externa
      console.log('📡 Fetching from ExchangeRate-API...');
      const apiData = await fetchExchangeRates();
      
      // Salvar no Supabase
      const count = await saveExchangeRates(apiData);
      
      // Salvar snapshot no histórico (para gráficos futuros)
      await supabase.rpc('save_exchange_rates_snapshot');
      
      // Limpar cache em memória
      cachedRates = null;
      
      return res.status(200).json({
        success: true,
        message: `Taxas atualizadas com sucesso`,
        rates_updated: count,
        last_update: apiData.time_last_update_utc,
        next_update: apiData.time_next_update_utc,
        business_hours: true,
        timestamp: new Date().toISOString(),
      });
    }
    
    // ========================================================================
    // ACTION: GET (Retornar taxas atuais)
    // ========================================================================
    if (req.method === 'GET') {
      const { from, to, amount } = req.query;
      
      // Verificar cache em memória
      const now = Date.now();
      if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('💾 Returning from memory cache');
        
        // Se pediu conversão específica
        if (from && to && amount) {
          const fromRate = cachedRates[from as string] || 1;
          const toRate = cachedRates[to as string] || 1;
          const amountNum = parseFloat(amount as string);
          
          // Converter via USD: amount -> USD -> target
          const amountInUSD = amountNum / fromRate;
          const convertedAmount = amountInUSD * toRate;
          
          return res.status(200).json({
            from: from as string,
            to: to as string,
            amount: amountNum,
            converted_amount: parseFloat(convertedAmount.toFixed(2)),
            rate: parseFloat((toRate / fromRate).toFixed(8)),
            cached: true,
            timestamp: new Date(cacheTimestamp).toISOString(),
          });
        }
        
        // Retornar todas as taxas
        return res.status(200).json({
          base_code: 'USD',
          rates: cachedRates,
          cached: true,
          timestamp: new Date(cacheTimestamp).toISOString(),
        });
      }
      
      // Buscar do banco
      console.log('🗄️ Fetching from database...');
      const dbRates = await getExchangeRatesFromDB();
      
      if (dbRates.length === 0) {
        // Se DB vazio, buscar da API (primeira vez)
        console.log('📡 Database empty, fetching from API...');
        const apiData = await fetchExchangeRates();
        await saveExchangeRates(apiData);
        
        const ratesMap = apiData.conversion_rates;
        cachedRates = ratesMap;
        cacheTimestamp = now;
        
        return res.status(200).json({
          base_code: 'USD',
          rates: ratesMap,
          cached: false,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Converter array para objeto { currency: rate }
      const ratesMap: Record<string, number> = {};
      dbRates.forEach((rate) => {
        ratesMap[rate.currency_code] = rate.rate;
      });
      
      // Atualizar cache em memória
      cachedRates = ratesMap;
      cacheTimestamp = now;
      
      // Verificar se precisa atualizar (mas não bloquear resposta)
      const shouldUpdate = await needsUpdate();
      if (shouldUpdate && isBusinessHours()) {
        console.log('⚠️ Rates are outdated (>10 min), triggering background update...');
        // Trigger assíncrono (não aguardar)
        fetchExchangeRates()
          .then(saveExchangeRates)
          .then(() => console.log('✅ Background update completed'))
          .catch((err) => console.error('❌ Background update failed:', err));
      }
      
      // Se pediu conversão específica
      if (from && to && amount) {
        const fromRate = ratesMap[from as string] || 1;
        const toRate = ratesMap[to as string] || 1;
        const amountNum = parseFloat(amount as string);
        
        const amountInUSD = amountNum / fromRate;
        const convertedAmount = amountInUSD * toRate;
        
        return res.status(200).json({
          from: from as string,
          to: to as string,
          amount: amountNum,
          converted_amount: parseFloat(convertedAmount.toFixed(2)),
          rate: parseFloat((toRate / fromRate).toFixed(8)),
          cached: false,
          timestamp: dbRates[0]?.fetched_at || new Date().toISOString(),
        });
      }
      
      // Retornar todas as taxas
      return res.status(200).json({
        base_code: 'USD',
        rates: ratesMap,
        cached: false,
        last_update: dbRates[0]?.time_last_update_utc,
        timestamp: dbRates[0]?.fetched_at || new Date().toISOString(),
      });
    }
    
    // Método não suportado
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error: any) {
    console.error('❌ Exchange rates API error:', error);
    return res.status(500).json({
      error: 'Erro ao buscar taxas de câmbio',
      message: error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

