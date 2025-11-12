-- ============================================================================
-- FEDERAL EXPRESS BRASIL - USER PROFILES (CADASTRO RICO)
-- Migration: Criar tabela de perfis estendidos com endereço completo
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CRIAR TABELA USER_PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_mobile TEXT,
  phone_home TEXT,
  address_cep TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_district TEXT,
  address_city TEXT,
  address_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS 'Perfis estendidos dos usuários com dados pessoais e endereço completo';
COMMENT ON COLUMN public.user_profiles.cpf IS 'CPF do usuário (único)';
COMMENT ON COLUMN public.user_profiles.address_cep IS 'CEP do endereço (formato: 00000-000)';

-- ----------------------------------------------------------------------------
-- 2. ÍNDICES PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON public.user_profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ----------------------------------------------------------------------------
-- 3. HABILITAR RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. POLÍTICAS DE SEGURANÇA
-- ----------------------------------------------------------------------------
-- Usuário pode ver apenas seu próprio perfil
CREATE POLICY "users_can_view_own_profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Usuário pode inserir seu próprio perfil
CREATE POLICY "users_can_insert_own_profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "users_can_update_own_profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. FUNCTION PARA CRIAR PROFILE AUTOMATICAMENTE (OPCIONAL)
-- ----------------------------------------------------------------------------
-- Esta function pode ser chamada após signUp para criar profile básico
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_cpf TEXT
)
RETURNS UUID AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, cpf)
  VALUES (p_user_id, p_email, p_full_name, p_cpf)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_user_profile IS 'Cria perfil de usuário após signUp';

