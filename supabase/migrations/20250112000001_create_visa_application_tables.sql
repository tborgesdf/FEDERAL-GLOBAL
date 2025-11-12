-- ============================================================================
-- FEDERAL EXPRESS BRASIL - VISA APPLICATION SYSTEM
-- Migration: Criar tabelas principais do sistema de aplicação de visto
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES (extensão do auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários vinculados ao Supabase Auth';

-- ----------------------------------------------------------------------------
-- 2. PAYMENTS (histórico de pagamentos via InfinitePay)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'infinitepay',
  provider_tx_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending' | 'paid' | 'failed' | 'refunded'
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'BRL',
  raw JSONB, -- payload completo do webhook
  metadata JSONB, -- visa_type, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx_id ON public.payments(provider_tx_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

COMMENT ON TABLE public.payments IS 'Histórico de pagamentos recebidos';

-- ----------------------------------------------------------------------------
-- 3. APPLICATIONS (uma aplicação de visto por pagamento)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  visa_type TEXT NOT NULL CHECK (visa_type IN ('first', 'renewal')),
  is_married BOOLEAN,
  step TEXT NOT NULL DEFAULT 'civil_status',
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress' | 'submitted' | 'review' | 'rejected' | 'approved'
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_payment_id ON public.applications(payment_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_visa_type ON public.applications(visa_type);

COMMENT ON TABLE public.applications IS 'Aplicações de visto (primeiro visto ou renovação)';

-- ----------------------------------------------------------------------------
-- 4. SOCIAL_ACCOUNTS (redes sociais do aplicante)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'facebook' | 'instagram' | 'x' | 'youtube' | 'linkedin' | 'tiktok'
  handle TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_application_id ON public.social_accounts(application_id);

COMMENT ON TABLE public.social_accounts IS 'Redes sociais fornecidas pelo aplicante';

-- ----------------------------------------------------------------------------
-- 5. DOCUMENTS (documentos enviados/capturados com OCR)
-- ----------------------------------------------------------------------------
CREATE TYPE public.document_type AS ENUM ('passport', 'previous_visa', 'br_id', 'marriage_cert');
CREATE TYPE public.document_side AS ENUM ('front', 'back', 'single');

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  doc_type public.document_type NOT NULL,
  side public.document_side NOT NULL DEFAULT 'single',
  storage_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  ocr_json JSONB,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_application_id ON public.documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON public.documents(doc_type);

COMMENT ON TABLE public.documents IS 'Documentos enviados com dados extraídos via OCR';

-- ----------------------------------------------------------------------------
-- 6. SELFIES (fotos de selfie com validação de qualidade)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.selfies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  quality_score NUMERIC(3,2), -- 0.00 a 1.00
  accepted BOOLEAN,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_selfies_application_id ON public.selfies(application_id);
CREATE INDEX IF NOT EXISTS idx_selfies_accepted ON public.selfies(accepted);

COMMENT ON TABLE public.selfies IS 'Selfies do aplicante com análise de qualidade';

-- ----------------------------------------------------------------------------
-- 7. AUDIT_LOGS (auditoria de ações críticas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID,
  application_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_application_id ON public.audit_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

COMMENT ON TABLE public.audit_logs IS 'Log de auditoria de todas as ações do sistema';

-- ----------------------------------------------------------------------------
-- 8. TRIGGERS para updated_at automático
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 9. FUNCTION para criar profile automaticamente ao criar usuário
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no auth.users (requer privilégios)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Cria profile automaticamente quando novo usuário é criado no Auth';

