-- ============================================================================
-- FEDERAL EXPRESS BRASIL - SOCIAL ACCOUNTS (ATUALIZADO)
-- Migration: Atualizar tabela de redes sociais com mais plataformas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ATUALIZAR CONSTRAINT DA TABELA SOCIAL_ACCOUNTS
-- ----------------------------------------------------------------------------
-- Remover constraint antiga se existir
ALTER TABLE public.social_accounts DROP CONSTRAINT IF EXISTS social_accounts_platform_check;

-- Adicionar constraint atualizada com todas as plataformas
ALTER TABLE public.social_accounts
  ADD CONSTRAINT social_accounts_platform_check 
  CHECK (platform IN (
    'facebook',
    'instagram',
    'x',
    'youtube',
    'linkedin',
    'tiktok',
    'snapchat',
    'pinterest',
    'kwai',
    'messenger',
    'telegram',
    'other'
  ));

COMMENT ON COLUMN public.social_accounts.platform IS 'Plataforma da rede social: facebook, instagram, x, youtube, linkedin, tiktok, snapchat, pinterest, kwai, messenger, telegram, other';

-- ----------------------------------------------------------------------------
-- 2. ÍNDICE PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform 
  ON public.social_accounts(platform);

-- ----------------------------------------------------------------------------
-- 3. FUNCTION HELPER PARA CONTAR REDES SOCIAIS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.count_social_accounts(p_application_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.social_accounts
    WHERE application_id = p_application_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.count_social_accounts IS 'Conta quantas redes sociais um aplicante possui';

-- ----------------------------------------------------------------------------
-- 4. FUNCTION HELPER PARA LISTAR PLATAFORMAS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_social_platforms(p_application_id UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT platform
    FROM public.social_accounts
    WHERE application_id = p_application_id
    ORDER BY created_at
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_social_platforms IS 'Retorna array com as plataformas que o aplicante possui';

