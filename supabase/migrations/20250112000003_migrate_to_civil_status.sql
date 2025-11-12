-- ============================================================================
-- FEDERAL EXPRESS BRASIL - MIGRAÇÃO PARA CIVIL_STATUS
-- Migration: Substituir is_married por civil_status ENUM
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CRIAR ENUM DE ESTADO CIVIL
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.civil_status_type AS ENUM (
    'single',        -- Solteiro/Divorciado/Viúvo
    'married',       -- Casado oficialmente
    'stable_union',  -- União estável
    'divorced',      -- Divorciado
    'widowed'        -- Viúvo
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.civil_status_type IS 'Estado civil do aplicante: single, married, stable_union, divorced, widowed';

-- ----------------------------------------------------------------------------
-- 2. ADICIONAR COLUNA civil_status (nullable inicialmente)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.applications 
    ADD COLUMN civil_status public.civil_status_type;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 3. MIGRAR DADOS EXISTENTES (is_married → civil_status)
-- ----------------------------------------------------------------------------
-- Se is_married = true → civil_status = 'married'
-- Se is_married = false → civil_status = 'single'
-- Se is_married = NULL → manter NULL (usuário deve escolher)
UPDATE public.applications
SET civil_status = CASE 
  WHEN is_married = true THEN 'married'::public.civil_status_type
  WHEN is_married = false THEN 'single'::public.civil_status_type
  ELSE NULL
END
WHERE civil_status IS NULL AND is_married IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. REMOVER COLUNA is_married (após migração)
-- ----------------------------------------------------------------------------
-- ATENÇÃO: Descomentar apenas após confirmar que a migração está correta
-- ALTER TABLE public.applications DROP COLUMN IF EXISTS is_married;

-- ----------------------------------------------------------------------------
-- 5. ATUALIZAR STEP DEFAULT
-- ----------------------------------------------------------------------------
-- Garantir que novas applications começam em 'civil_status'
ALTER TABLE public.applications 
  ALTER COLUMN step SET DEFAULT 'civil_status';

-- ----------------------------------------------------------------------------
-- 6. ADICIONAR ÍNDICE PARA PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_applications_civil_status 
  ON public.applications(civil_status);

-- ----------------------------------------------------------------------------
-- 7. COMENTÁRIOS EXPLICATIVOS
-- ----------------------------------------------------------------------------
COMMENT ON COLUMN public.applications.civil_status IS 
  'Estado civil: single (solteiro/divorciado/viúvo), married (casado oficialmente), stable_union (união estável)';

-- ----------------------------------------------------------------------------
-- 8. FUNÇÃO HELPER PARA VERIFICAR SE PRECISA CERTIDÃO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.requires_marriage_certificate(app_civil_status public.civil_status_type)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN app_civil_status IN ('married', 'stable_union');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.requires_marriage_certificate IS 
  'Retorna true se o estado civil exige certidão de casamento/união estável';

