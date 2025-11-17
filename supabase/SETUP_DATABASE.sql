-- ============================================================================
-- FEDERAL EXPRESS BRASIL - Setup Completo do Banco de Dados
-- ============================================================================
-- 
-- Execute este arquivo no SQL Editor do Supabase para criar todas as tabelas
-- e configurações necessárias.
--
-- Dashboard → SQL Editor → New query → Cole este arquivo → Run
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABELA: applications (Solicitações de Visto)
-- ============================================================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_type TEXT NOT NULL DEFAULT 'usa_visa' CHECK (application_type IN (
    'usa_visa',
    'passport_renewal',
    'passport_first_time',
    'other'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'completed',
    'cancelled'
  )),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 8,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TABELA: documents (Documentos OCR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'passport',
    'previous_visa',
    'rg',
    'cnh',
    'cnh_digital',
    'cin',
    'marriage_cert',
    'civil_union',
    'birth_cert',
    'selfie'
  )),
  side TEXT DEFAULT 'single' CHECK (side IN ('front', 'back', 'single')),
  storage_path TEXT,
  ocr_json JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_verified ON documents(verified);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigger
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TABELA: user_profiles (Perfis de Usuário)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  cpf TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON user_profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);

-- Trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABELA: social_accounts (Redes Sociais)
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'tiktok',
    'youtube',
    'other'
  )),
  username TEXT,
  url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_social_accounts_application_id ON social_accounts(application_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);

-- ============================================================================
-- 5. TABELA: exchange_rates (Cotações de Moedas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_code TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  rate DECIMAL(18, 6) NOT NULL,
  time_last_update_unix BIGINT,
  time_last_update_utc TEXT,
  time_next_update_unix BIGINT,
  time_next_update_utc TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_code, currency_code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_code ON exchange_rates(base_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_code ON exchange_rates(currency_code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched_at ON exchange_rates(fetched_at DESC);

-- ============================================================================
-- 6. TABELA: crypto_rates (Cotações de Criptomoedas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS crypto_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crypto_id TEXT NOT NULL UNIQUE,
  crypto_symbol TEXT NOT NULL,
  crypto_name TEXT NOT NULL,
  price_usd DECIMAL(18, 8) NOT NULL,
  price_brl DECIMAL(18, 8) NOT NULL,
  price_eur DECIMAL(18, 8) NOT NULL,
  change_24h DECIMAL(10, 4),
  change_7d DECIMAL(10, 4),
  change_30d DECIMAL(10, 4),
  market_cap_usd DECIMAL(20, 2),
  volume_24h_usd DECIMAL(20, 2),
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crypto_rates_crypto_id ON crypto_rates(crypto_id);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_symbol ON crypto_rates(crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_market_cap ON crypto_rates(market_cap_usd DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_crypto_rates_fetched_at ON crypto_rates(fetched_at DESC);

-- ============================================================================
-- 7. TABELA: ip_geolocation (Rastreamento de IP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ip_geolocation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ip_geolocation_user_id ON ip_geolocation(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_geolocation_ip ON ip_geolocation(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_geolocation_created_at ON ip_geolocation(created_at DESC);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_geolocation ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. POLÍTICAS RLS: applications
-- ============================================================================

-- Usuários podem ver apenas suas próprias aplicações
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias aplicações
CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias aplicações
CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 10. POLÍTICAS RLS: documents
-- ============================================================================

-- Usuários podem ver documentos de suas aplicações
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Usuários podem inserir documentos em suas aplicações
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar seus documentos
CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Usuários podem deletar seus documentos
CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 11. POLÍTICAS RLS: user_profiles
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 12. POLÍTICAS RLS: social_accounts
-- ============================================================================

CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = social_accounts.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own social accounts"
  ON social_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = social_accounts.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 13. POLÍTICAS RLS: exchange_rates & crypto_rates (Público)
-- ============================================================================

CREATE POLICY "Exchange rates are publicly readable"
  ON exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Crypto rates are publicly readable"
  ON crypto_rates FOR SELECT
  USING (true);

-- ============================================================================
-- 14. POLÍTICAS RLS: ip_geolocation
-- ============================================================================

CREATE POLICY "Users can view own IP logs"
  ON ip_geolocation FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 15. STORAGE: Bucket documents
-- ============================================================================

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 16. FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para salvar snapshot de taxas de câmbio (histórico)
CREATE OR REPLACE FUNCTION save_exchange_rates_snapshot()
RETURNS void AS $$
BEGIN
  -- Implementar lógica de snapshot se necessário
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar snapshot de crypto (histórico)
CREATE OR REPLACE FUNCTION save_crypto_rates_snapshot()
RETURNS void AS $$
BEGIN
  -- Implementar lógica de snapshot se necessário
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ✅ SETUP COMPLETO!
-- ============================================================================
-- 
-- Próximos passos:
-- 1. Verificar se todas as tabelas foram criadas no Table Editor
-- 2. Verificar se o bucket 'documents' aparece no Storage
-- 3. Testar autenticação no frontend
-- 4. Testar upload de documentos
-- 5. Verificar se os dados são salvos corretamente
-- 
-- ============================================================================

