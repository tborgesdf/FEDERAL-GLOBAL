-- ============================================================================
-- FEDERAL EXPRESS BRASIL - IP GEOLOCATION TRACKING
-- Migration: Rastreamento de IP e geolocalização dos usuários
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELA DE GEOLOCATION LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.geolocation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id uuid, -- Para rastrear sessões anônimas
  
  -- Dados do IP-API
  ip_address text NOT NULL,
  country text,
  country_code text,
  region text,
  region_name text,
  city text,
  zip text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  timezone text,
  isp text,
  org text,
  as_info text, -- Autonomous System info
  
  -- Dados do OpenWeatherMap
  weather_temp numeric(5, 2), -- Temperatura em Celsius
  weather_feels_like numeric(5, 2),
  weather_temp_min numeric(5, 2),
  weather_temp_max numeric(5, 2),
  weather_pressure integer,
  weather_humidity integer,
  weather_description text,
  weather_icon text, -- código do ícone (ex: "01d")
  weather_wind_speed numeric(5, 2),
  weather_clouds integer, -- % de nuvens
  weather_fetched_at timestamp with time zone,
  
  -- Metadados
  user_agent text,
  page_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. ÍNDICES PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_geolocation_logs_user_id ON public.geolocation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_geolocation_logs_session_id ON public.geolocation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_geolocation_logs_ip_address ON public.geolocation_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_geolocation_logs_created_at ON public.geolocation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_geolocation_logs_country_code ON public.geolocation_logs(country_code);

-- ----------------------------------------------------------------------------
-- 3. RLS (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------
ALTER TABLE public.geolocation_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ler apenas seus próprios logs
CREATE POLICY "geolocation_logs_read_own" ON public.geolocation_logs
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Apenas o backend pode inserir/atualizar (via service role)
-- Usuários autenticados podem inserir seus próprios logs
CREATE POLICY "geolocation_logs_insert_own" ON public.geolocation_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- ----------------------------------------------------------------------------
-- 4. TRIGGER PARA UPDATED_AT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_geolocation_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER geolocation_logs_updated_at
  BEFORE UPDATE ON public.geolocation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_geolocation_logs_updated_at();

-- ----------------------------------------------------------------------------
-- 5. FUNÇÃO PARA BUSCAR GEOLOCALIZAÇÃO MAIS RECENTE DO USUÁRIO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_latest_geolocation(p_user_id uuid)
RETURNS TABLE (
  city text,
  region_name text,
  country text,
  latitude numeric,
  longitude numeric,
  weather_temp numeric,
  weather_description text,
  weather_icon text,
  weather_fetched_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gl.city,
    gl.region_name,
    gl.country,
    gl.latitude,
    gl.longitude,
    gl.weather_temp,
    gl.weather_description,
    gl.weather_icon,
    gl.weather_fetched_at
  FROM public.geolocation_logs gl
  WHERE gl.user_id = p_user_id
  ORDER BY gl.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. COMENTÁRIOS
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.geolocation_logs IS 'Logs de geolocalização e clima dos usuários para personalização do Header';
COMMENT ON COLUMN public.geolocation_logs.session_id IS 'UUID da sessão para rastrear visitantes anônimos';
COMMENT ON COLUMN public.geolocation_logs.ip_address IS 'Endereço IP do usuário (fonte: ip-api.com)';
COMMENT ON COLUMN public.geolocation_logs.weather_icon IS 'Código do ícone OpenWeatherMap (ex: 01d, 10n)';
COMMENT ON FUNCTION get_user_latest_geolocation IS 'Retorna a geolocalização e clima mais recentes do usuário';

-- ----------------------------------------------------------------------------
-- 7. LIMPEZA AUTOMÁTICA (OPCIONAL)
-- ----------------------------------------------------------------------------
-- Criar job para limpar logs antigos (>90 dias) periodicamente
-- Requer pg_cron extension (configurar no Supabase Dashboard)
-- 
-- SELECT cron.schedule(
--   'cleanup-old-geolocation-logs',
--   '0 3 * * *', -- Todo dia às 3h
--   $$DELETE FROM public.geolocation_logs WHERE created_at < now() - interval '90 days'$$
-- );

