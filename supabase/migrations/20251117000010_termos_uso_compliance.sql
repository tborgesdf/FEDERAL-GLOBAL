-- ============================================================================
-- MIGRAÇÃO: Sistema de Termos de Uso e Dados Forenses para BI
-- Data: 2025-11-17
-- Descrição: Tabelas otimizadas para captura de dados de compliance e análise BI
-- ============================================================================

-- Tabela para registrar aceite de termos de uso
CREATE TABLE IF NOT EXISTS termos_uso_aceite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do Usuário
  nome_completo VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  data_nascimento VARCHAR(10) NOT NULL,
  idade_verificada INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  
  -- Dados do Aceite
  data_hora_aceite TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  versao_termos VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  ip_aceite VARCHAR(45) NOT NULL,
  
  -- Geolocalização do Dispositivo (GPS)
  geolocalizacao_dispositivo_lat DECIMAL(10, 8),
  geolocalizacao_dispositivo_lng DECIMAL(11, 8),
  geolocalizacao_dispositivo_precisao DECIMAL(10, 2),
  geolocalizacao_dispositivo_timestamp TIMESTAMPTZ,
  
  -- Geolocalização do IP
  geolocalizacao_ip_cidade VARCHAR(100),
  geolocalizacao_ip_estado VARCHAR(50),
  geolocalizacao_ip_pais VARCHAR(50),
  geolocalizacao_ip_lat DECIMAL(10, 8),
  geolocalizacao_ip_lng DECIMAL(11, 8),
  geolocalizacao_ip_timezone VARCHAR(50),
  
  -- Dados da Conexão
  tipo_conexao VARCHAR(50),
  operadora VARCHAR(100),
  velocidade_conexao VARCHAR(50),
  
  -- Dados do Dispositivo
  sistema_operacional VARCHAR(100),
  versao_sistema_operacional VARCHAR(50),
  navegador VARCHAR(100),
  versao_navegador VARCHAR(50),
  marca_dispositivo VARCHAR(100),
  modelo_dispositivo VARCHAR(100),
  tipo_dispositivo VARCHAR(50),
  resolucao_tela VARCHAR(50),
  
  -- Dados Técnicos Adicionais
  user_agent TEXT,
  idioma_navegador VARCHAR(10),
  timezone_navegador VARCHAR(50),
  platform VARCHAR(50),
  cookies_habilitados BOOLEAN,
  javascript_habilitado BOOLEAN,
  
  -- Dados de Referência (para análise de marketing)
  url_origem TEXT,
  url_pagina_aceite TEXT,
  referrer TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índices para consultas
  CONSTRAINT termos_uso_aceite_unique UNIQUE (user_id, data_hora_aceite)
);

-- Índices para otimização de queries de BI
CREATE INDEX IF NOT EXISTS idx_termos_aceite_user_id ON termos_uso_aceite(user_id);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_data_hora ON termos_uso_aceite(data_hora_aceite DESC);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_cpf ON termos_uso_aceite(cpf);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_ip ON termos_uso_aceite(ip_aceite);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_cidade ON termos_uso_aceite(geolocalizacao_ip_cidade);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_estado ON termos_uso_aceite(geolocalizacao_ip_estado);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_operadora ON termos_uso_aceite(operadora);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_sistema_op ON termos_uso_aceite(sistema_operacional);
CREATE INDEX IF NOT EXISTS idx_termos_aceite_dispositivo ON termos_uso_aceite(tipo_dispositivo);

-- Tabela de histórico de versões de termos
CREATE TABLE IF NOT EXISTS termos_uso_versoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  versao VARCHAR(20) UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_vigencia TIMESTAMPTZ NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir versão inicial dos termos
INSERT INTO termos_uso_versoes (versao, titulo, conteudo, data_vigencia, ativo)
VALUES (
  'v1.0',
  'Termos de Uso e Política de Privacidade - Federal Global',
  'TERMOS DE USO E POLÍTICA DE PRIVACIDADE

1. ACEITAÇÃO DOS TERMOS
Ao utilizar os serviços da Federal Global, você concorda com estes termos.

2. COLETA DE DADOS
Coletamos dados pessoais, de localização e de dispositivo para melhorar nossos serviços.

3. USO DE DADOS
Seus dados serão utilizados para processamento de serviços consulares e cambiais.

4. SEGURANÇA
Implementamos medidas de segurança para proteger suas informações.

5. CONSENTIMENTO
Você consente expressamente com a coleta e processamento de seus dados.',
  NOW(),
  true
) ON CONFLICT (versao) DO NOTHING;

-- View para análise BI
CREATE OR REPLACE VIEW vw_bi_termos_aceite AS
SELECT 
  t.*,
  EXTRACT(HOUR FROM t.data_hora_aceite) as hora_aceite,
  EXTRACT(DOW FROM t.data_hora_aceite) as dia_semana,
  DATE_TRUNC('day', t.data_hora_aceite) as data_aceite,
  DATE_TRUNC('week', t.data_hora_aceite) as semana_aceite,
  DATE_TRUNC('month', t.data_hora_aceite) as mes_aceite,
  u.email as user_email,
  u.created_at as user_created_at
FROM termos_uso_aceite t
LEFT JOIN auth.users u ON t.user_id = u.id;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_termos_aceite_updated_at
  BEFORE UPDATE ON termos_uso_aceite
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_termos_versoes_updated_at
  BEFORE UPDATE ON termos_uso_versoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE termos_uso_aceite ENABLE ROW LEVEL SECURITY;
ALTER TABLE termos_uso_versoes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios termos aceitos"
  ON termos_uso_aceite FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir termos aceitos"
  ON termos_uso_aceite FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem ver termos ativos"
  ON termos_uso_versoes FOR SELECT
  USING (ativo = true);

-- Comentários para documentação
COMMENT ON TABLE termos_uso_aceite IS 'Registros de aceite de termos com dados forenses completos para compliance e BI';
COMMENT ON TABLE termos_uso_versoes IS 'Versionamento de termos de uso';
COMMENT ON VIEW vw_bi_termos_aceite IS 'View otimizada para análise BI com dimensões temporais';

-- Mensagem de sucesso
SELECT 'Migração de Termos de Uso e Compliance criada com sucesso!' as status;

