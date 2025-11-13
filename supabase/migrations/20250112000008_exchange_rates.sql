-- ============================================================================
-- FEDERAL EXPRESS BRASIL - EXCHANGE RATES
-- Migration: Sistema de cotação de moedas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA DE TAXAS DE CÂMBIO
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_code text NOT NULL DEFAULT 'USD',
  currency_code text NOT NULL,
  rate numeric(20, 8) NOT NULL,
  
  -- Metadados da API
  time_last_update_unix bigint,
  time_last_update_utc text,
  time_next_update_unix bigint,
  time_next_update_utc text,
  
  -- Controle interno
  fetched_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraint: combinação única de base + currency
  UNIQUE(base_code, currency_code)
);

-- ----------------------------------------------------------------------------
-- 2. ÍNDICES PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_code ON public.exchange_rates(base_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_code ON public.exchange_rates(currency_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched_at ON public.exchange_rates(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_currency ON public.exchange_rates(base_code, currency_code);

-- ----------------------------------------------------------------------------
-- 3. TABELA DE HISTÓRICO (para gráficos futuros)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exchange_rates_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_code text NOT NULL,
  currency_code text NOT NULL,
  rate numeric(20, 8) NOT NULL,
  recorded_at timestamp with time zone DEFAULT now(),
  
  -- Índices para queries de histórico
  CONSTRAINT idx_history_base_currency_time UNIQUE(base_code, currency_code, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_exchange_history_currency_time ON public.exchange_rates_history(currency_code, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_history_recorded_at ON public.exchange_rates_history(recorded_at DESC);

-- ----------------------------------------------------------------------------
-- 4. RLS (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------
-- Exchange rates são públicas (read-only para todos)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates_history ENABLE ROW LEVEL SECURITY;

-- Todos podem ler
CREATE POLICY "exchange_rates_read_all" ON public.exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "exchange_history_read_all" ON public.exchange_rates_history
  FOR SELECT
  USING (true);

-- Apenas service role pode inserir/atualizar (via API)
-- (não criar policy de INSERT/UPDATE para usuários)

-- ----------------------------------------------------------------------------
-- 5. FUNÇÃO PARA BUSCAR TAXA ESPECÍFICA
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_base_code text DEFAULT 'USD',
  p_currency_code text DEFAULT 'BRL'
)
RETURNS numeric AS $$
DECLARE
  v_rate numeric;
BEGIN
  SELECT rate INTO v_rate
  FROM public.exchange_rates
  WHERE base_code = p_base_code
    AND currency_code = p_currency_code;
  
  RETURN COALESCE(v_rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. FUNÇÃO PARA CONVERTER VALORES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount numeric,
  p_from_currency text,
  p_to_currency text
)
RETURNS numeric AS $$
DECLARE
  v_rate_from numeric;
  v_rate_to numeric;
  v_amount_usd numeric;
  v_result numeric;
BEGIN
  -- Se mesma moeda, retornar valor original
  IF p_from_currency = p_to_currency THEN
    RETURN p_amount;
  END IF;
  
  -- Converter para USD primeiro (base)
  IF p_from_currency = 'USD' THEN
    v_amount_usd := p_amount;
  ELSE
    SELECT rate INTO v_rate_from
    FROM public.exchange_rates
    WHERE base_code = 'USD' AND currency_code = p_from_currency;
    
    v_amount_usd := p_amount / COALESCE(v_rate_from, 1);
  END IF;
  
  -- Converter de USD para moeda de destino
  IF p_to_currency = 'USD' THEN
    v_result := v_amount_usd;
  ELSE
    SELECT rate INTO v_rate_to
    FROM public.exchange_rates
    WHERE base_code = 'USD' AND currency_code = p_to_currency;
    
    v_result := v_amount_usd * COALESCE(v_rate_to, 1);
  END IF;
  
  RETURN ROUND(v_result, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 7. FUNÇÃO PARA SALVAR SNAPSHOT NO HISTÓRICO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION save_exchange_rates_snapshot()
RETURNS void AS $$
BEGIN
  -- Inserir snapshot de todas as taxas atuais
  INSERT INTO public.exchange_rates_history (base_code, currency_code, rate, recorded_at)
  SELECT base_code, currency_code, rate, now()
  FROM public.exchange_rates
  ON CONFLICT (base_code, currency_code, recorded_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 8. TRIGGER PARA UPDATED_AT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_exchange_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_rates_updated_at();

-- ----------------------------------------------------------------------------
-- 9. VIEW PARA MOEDAS MAIS USADAS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_popular_currencies AS
SELECT 
  currency_code,
  rate,
  fetched_at,
  CASE currency_code
    WHEN 'BRL' THEN 'Real Brasileiro'
    WHEN 'EUR' THEN 'Euro'
    WHEN 'GBP' THEN 'Libra Esterlina'
    WHEN 'JPY' THEN 'Iene Japonês'
    WHEN 'CAD' THEN 'Dólar Canadense'
    WHEN 'AUD' THEN 'Dólar Australiano'
    WHEN 'CHF' THEN 'Franco Suíço'
    WHEN 'CNY' THEN 'Yuan Chinês'
    WHEN 'ARS' THEN 'Peso Argentino'
    WHEN 'MXN' THEN 'Peso Mexicano'
    ELSE currency_code
  END as currency_name
FROM public.exchange_rates
WHERE base_code = 'USD'
  AND currency_code IN ('BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS', 'MXN')
ORDER BY currency_code;

-- ----------------------------------------------------------------------------
-- 10. COMENTÁRIOS
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.exchange_rates IS 'Taxas de câmbio atualizadas a cada 10 min (seg-sex, 9h-17h BRT)';
COMMENT ON TABLE public.exchange_rates_history IS 'Histórico de taxas para gráficos e análises';
COMMENT ON FUNCTION get_exchange_rate IS 'Retorna taxa de câmbio específica (base USD)';
COMMENT ON FUNCTION convert_currency IS 'Converte valor entre duas moedas quaisquer';
COMMENT ON FUNCTION save_exchange_rates_snapshot IS 'Salva snapshot de todas as taxas no histórico';
COMMENT ON VIEW v_popular_currencies IS 'View com as 10 moedas mais populares';

-- ----------------------------------------------------------------------------
-- 11. DADOS INICIAIS (SEED) - Opcional
-- ----------------------------------------------------------------------------
-- Inserir placeholder inicial (será atualizado pela API)
INSERT INTO public.exchange_rates (base_code, currency_code, rate)
VALUES ('USD', 'USD', 1.0)
ON CONFLICT (base_code, currency_code) DO NOTHING;

