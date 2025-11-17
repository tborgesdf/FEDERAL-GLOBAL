-- Migration: Sistema de Admin e Logs de Acesso
-- Data: 2025-11-18

-- Tabela de Admins
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

-- Tabela de Logs de Acesso Admin (não editável)
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin_id ON admin_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_email ON admin_access_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_timestamp ON admin_access_logs(access_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_cpf ON admins(cpf);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

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

-- Comentários
COMMENT ON TABLE admins IS 'Tabela de administradores e prestadores do sistema';
COMMENT ON TABLE admin_access_logs IS 'Logs imutáveis de acesso dos administradores';
COMMENT ON COLUMN admin_access_logs.created_at IS 'Timestamp de criação - não pode ser editado';

