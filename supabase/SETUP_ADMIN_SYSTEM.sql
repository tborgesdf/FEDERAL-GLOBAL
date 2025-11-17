-- ============================================================================
-- SISTEMA ADMIN COMPLETO - SETUP COMPLETO
-- ============================================================================
-- Este script consolida todas as migrations do sistema admin
-- Execute este script no Supabase SQL Editor
-- Data: 2025-11-18
-- ============================================================================

-- Habilitar extensão uuid-ossp se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA DE ADMINS
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    birth_date VARCHAR(10) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo_url TEXT,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'prestador')),
    is_active BOOLEAN DEFAULT true,
    
    -- Dados de geolocalização
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Dados do dispositivo (primeiro acesso)
    device_type VARCHAR(50),
    device_browser VARCHAR(50),
    device_os VARCHAR(50),
    device_platform VARCHAR(100),
    device_language VARCHAR(10),
    device_screen VARCHAR(20),
    device_user_agent TEXT,
    
    -- Metadados
    termos_aceitos BOOLEAN DEFAULT true,
    data_aceite_termos TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT admins_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT admins_cpf_format CHECK (cpf ~* '^\d{3}\.\d{3}\.\d{3}-\d{2}$')
);

-- ============================================================================
-- TABELA DE LOGS DE ACESSO ADMIN (IMUTÁVEL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    admin_email VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    
    -- Dados de acesso
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Dados de geolocalização
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    geolocation_city VARCHAR(100),
    geolocation_state VARCHAR(50),
    geolocation_country VARCHAR(50),
    
    -- Dados do dispositivo
    device_type VARCHAR(50),
    device_browser VARCHAR(50),
    device_os VARCHAR(50),
    device_platform VARCHAR(100),
    device_language VARCHAR(10),
    device_screen VARCHAR(20),
    
    -- Tipo de conexão
    connection_type VARCHAR(20),
    carrier VARCHAR(50),
    
    -- Status
    login_successful BOOLEAN DEFAULT true,
    logout_timestamp TIMESTAMP WITH TIME ZONE,
    session_duration_minutes INTEGER,
    
    -- Metadados (não editáveis após criação)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraint para garantir que não seja editado
    CONSTRAINT admin_access_logs_immutable CHECK (created_at = created_at)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin_id ON admin_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_email ON admin_access_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_timestamp ON admin_access_logs(access_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_cpf ON admins(cpf);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- ============================================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_admins_updated_at ON admins;
CREATE TRIGGER trigger_update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_admins_updated_at();

-- Função para prevenir edição de logs (garantir imutabilidade)
CREATE OR REPLACE FUNCTION prevent_admin_logs_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.created_at != NEW.created_at THEN
        RAISE EXCEPTION 'Logs de acesso não podem ser editados';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para prevenir edição
DROP TRIGGER IF EXISTS trigger_prevent_admin_logs_edit ON admin_access_logs;
CREATE TRIGGER trigger_prevent_admin_logs_edit
    BEFORE UPDATE ON admin_access_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_admin_logs_edit();

-- ============================================================================
-- INSERIR ULTRA ADMIN
-- ============================================================================
DO $$
DECLARE
    admin_exists BOOLEAN;
    admin_uuid UUID;
BEGIN
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM admins WHERE email = 'tbogesdf.ai@gmail.com') INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Gerar UUID para o admin
        admin_uuid := uuid_generate_v4();
        
        -- Inserir Ultra Admin
        INSERT INTO admins (
            id,
            email,
            full_name,
            cpf,
            birth_date,
            phone,
            password_hash,
            role,
            is_active,
            termos_aceitos,
            data_aceite_termos
        ) VALUES (
            admin_uuid,
            'tbogesdf.ai@gmail.com',
            'Thiago Ferreira Alves e Borges',
            '027.692.569-63',
            '08/02/1981',
            '61998980312', -- Sem formatação para armazenamento
            'managed_by_auth', -- Senha gerenciada pelo Supabase Auth
            'super_admin',
            true,
            true,
            NOW()
        );
        
        RAISE NOTICE 'Ultra Admin inserido com sucesso: %', admin_uuid;
    ELSE
        RAISE NOTICE 'Ultra Admin já existe na tabela';
        
        -- Atualizar dados se necessário
        UPDATE admins SET
            full_name = 'Thiago Ferreira Alves e Borges',
            cpf = '027.692.569-63',
            birth_date = '08/02/1981',
            phone = '61998980312',
            role = 'super_admin',
            updated_at = NOW()
        WHERE email = 'tbogesdf.ai@gmail.com';
        
        RAISE NOTICE 'Dados do Ultra Admin atualizados';
    END IF;
END $$;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================
COMMENT ON TABLE admins IS 'Tabela de administradores e prestadores do sistema';
COMMENT ON TABLE admin_access_logs IS 'Logs imutáveis de acesso dos administradores';
COMMENT ON COLUMN admin_access_logs.created_at IS 'Timestamp de criação - não pode ser editado';
COMMENT ON TABLE admins IS 'Tabela de administradores - Ultra Admin: tbogesdf.ai@gmail.com';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP DO SISTEMA ADMIN CONCLUÍDO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  - admins';
    RAISE NOTICE '  - admin_access_logs';
    RAISE NOTICE '';
    RAISE NOTICE 'Ultra Admin configurado:';
    RAISE NOTICE '  - Email: tbogesdf.ai@gmail.com';
    RAISE NOTICE '  - Nome: Thiago Ferreira Alves e Borges';
    RAISE NOTICE '  - Role: super_admin';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Criar usuário no Supabase Auth com email: tbogesdf.ai@gmail.com';
    RAISE NOTICE '  2. Senha: Ale290800';
    RAISE NOTICE '  3. Testar login no dashboard admin';
    RAISE NOTICE '========================================';
END $$;

-- Verificar se tudo foi criado corretamente
SELECT 
    'admins' as tabela,
    COUNT(*) as registros
FROM admins
UNION ALL
SELECT 
    'admin_access_logs' as tabela,
    COUNT(*) as registros
FROM admin_access_logs;

