-- ============================================================================
-- FEDERAL EXPRESS BRASIL - CRYPTO RATES
-- Migration: Sistema de cotação de criptomoedas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA DE TAXAS DE CRIPTOMOEDAS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_id text NOT NULL,
  crypto_symbol text NOT NULL,
  crypto_name text NOT NULL,
  
  -- Preços em diferentes moedas
  price_usd numeric(20, 8),
  price_brl numeric(20, 8),
  price_eur numeric(20, 8),
  
  -- Variações
  change_24h numeric(10, 4),
  change_7d numeric(10, 4),
  change_30d numeric(10, 4),
  
  -- Market data
  market_cap_usd numeric(20, 2),
  volume_24h_usd numeric(20, 2),
  
  -- Metadados
  fetched_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraint: crypto_id único
  UNIQUE(crypto_id)
);

-- ----------------------------------------------------------------------------
-- 2. ÍNDICES PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_crypto_rates_id ON public.crypto_rates(crypto_id);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_symbol ON public.crypto_rates(crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_fetched_at ON public.crypto_rates(fetched_at DESC);

-- ----------------------------------------------------------------------------
-- 3. TABELA DE HISTÓRICO (para gráficos futuros)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crypto_rates_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_id text NOT NULL,
  price_usd numeric(20, 8) NOT NULL,
  price_brl numeric(20, 8) NOT NULL,
  change_24h numeric(10, 4),
  recorded_at timestamp with time zone DEFAULT now(),
  
  -- Índices para queries de histórico
  CONSTRAINT idx_history_crypto_time UNIQUE(crypto_id, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_crypto_history_id_time ON public.crypto_rates_history(crypto_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_history_recorded_at ON public.crypto_rates_history(recorded_at DESC);

-- ----------------------------------------------------------------------------
-- 4. RLS (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------
-- Crypto rates são públicas (read-only para todos)
ALTER TABLE public.crypto_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_rates_history ENABLE ROW LEVEL SECURITY;

-- Todos podem ler
CREATE POLICY "crypto_rates_read_all" ON public.crypto_rates
  FOR SELECT
  USING (true);

CREATE POLICY "crypto_history_read_all" ON public.crypto_rates_history
  FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- 5. FUNÇÃO PARA BUSCAR PREÇO ESPECÍFICO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_crypto_price(
  p_crypto_id text DEFAULT 'bitcoin',
  p_currency text DEFAULT 'brl'
)
RETURNS numeric AS $$
DECLARE
  v_price numeric;
BEGIN
  IF p_currency = 'usd' THEN
    SELECT price_usd INTO v_price FROM public.crypto_rates WHERE crypto_id = p_crypto_id;
  ELSIF p_currency = 'brl' THEN
    SELECT price_brl INTO v_price FROM public.crypto_rates WHERE crypto_id = p_crypto_id;
  ELSIF p_currency = 'eur' THEN
    SELECT price_eur INTO v_price FROM public.crypto_rates WHERE crypto_id = p_crypto_id;
  ELSE
    SELECT price_usd INTO v_price FROM public.crypto_rates WHERE crypto_id = p_crypto_id;
  END IF;
  
  RETURN COALESCE(v_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. FUNÇÃO PARA CONVERTER VALORES EM CRIPTO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION convert_to_crypto(
  p_amount numeric,
  p_currency text,
  p_crypto_id text
)
RETURNS numeric AS $$
DECLARE
  v_crypto_price numeric;
  v_result numeric;
BEGIN
  -- Buscar preço da cripto na moeda desejada
  v_crypto_price := get_crypto_price(p_crypto_id, p_currency);
  
  IF v_crypto_price = 0 OR v_crypto_price IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calcular quantos tokens com o valor fornecido
  v_result := p_amount / v_crypto_price;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 7. FUNÇÃO PARA SALVAR SNAPSHOT NO HISTÓRICO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION save_crypto_rates_snapshot()
RETURNS void AS $$
BEGIN
  -- Inserir snapshot de todas as taxas atuais
  INSERT INTO public.crypto_rates_history (crypto_id, price_usd, price_brl, change_24h, recorded_at)
  SELECT crypto_id, price_usd, price_brl, change_24h, now()
  FROM public.crypto_rates
  ON CONFLICT (crypto_id, recorded_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 8. TRIGGER PARA UPDATED_AT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_crypto_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crypto_rates_updated_at
  BEFORE UPDATE ON public.crypto_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_rates_updated_at();

-- ----------------------------------------------------------------------------
-- 9. VIEW PARA CRIPTOS PRINCIPAIS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_top_cryptos AS
SELECT 
  crypto_id,
  crypto_symbol,
  crypto_name,
  price_brl,
  change_24h,
  market_cap_usd,
  fetched_at,
  CASE 
    WHEN change_24h > 0 THEN 'alta'
    WHEN change_24h < 0 THEN 'baixa'
    ELSE 'estavel'
  END as tendencia
FROM public.crypto_rates
ORDER BY market_cap_usd DESC NULLS LAST
LIMIT 20;

-- ----------------------------------------------------------------------------
-- 10. COMENTÁRIOS
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.crypto_rates IS 'Taxas de criptomoedas atualizadas a cada 10 min via CoinGecko API';
COMMENT ON TABLE public.crypto_rates_history IS 'Histórico de preços para gráficos e análises';
COMMENT ON FUNCTION get_crypto_price IS 'Retorna preço de cripto em moeda específica (usd/brl/eur)';
COMMENT ON FUNCTION convert_to_crypto IS 'Converte valor fiat para quantidade de tokens';
COMMENT ON FUNCTION save_crypto_rates_snapshot IS 'Salva snapshot de todos os preços no histórico';
COMMENT ON VIEW v_top_cryptos IS 'View com top 20 criptos por market cap';

-- ----------------------------------------------------------------------------
-- 11. DADOS INICIAIS (SEED) - Lista de criptos principais
-- ----------------------------------------------------------------------------
INSERT INTO public.crypto_rates (crypto_id, crypto_symbol, crypto_name, price_usd, price_brl)
VALUES 
  ('bitcoin', 'BTC', 'Bitcoin', 0, 0),
  ('ethereum', 'ETH', 'Ethereum', 0, 0),
  ('binancecoin', 'BNB', 'BNB', 0, 0),
  ('cardano', 'ADA', 'Cardano', 0, 0),
  ('solana', 'SOL', 'Solana', 0, 0),
  ('ripple', 'XRP', 'XRP', 0, 0),
  ('polkadot', 'DOT', 'Polkadot', 0, 0),
  ('dogecoin', 'DOGE', 'Dogecoin', 0, 0),
  ('avalanche-2', 'AVAX', 'Avalanche', 0, 0),
  ('polygon', 'MATIC', 'Polygon', 0, 0),
  ('chainlink', 'LINK', 'Chainlink', 0, 0),
  ('litecoin', 'LTC', 'Litecoin', 0, 0),
  ('uniswap', 'UNI', 'Uniswap', 0, 0),
  ('stellar', 'XLM', 'Stellar', 0, 0),
  ('tron', 'TRX', 'TRON', 0, 0)
ON CONFLICT (crypto_id) DO NOTHING;

