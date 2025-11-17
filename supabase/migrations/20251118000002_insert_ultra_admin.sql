-- Migration: Inserir Ultra Admin
-- Data: 2025-11-18

-- Inserir Ultra Admin na tabela admins
-- Nota: A senha será gerenciada pelo Supabase Auth
-- Primeiro, criar o usuário no Supabase Auth (deve ser feito manualmente ou via API)
-- Depois, inserir na tabela admins com o ID do Auth

-- Este script assume que o usuário já existe no Supabase Auth
-- Se não existir, será criado automaticamente na primeira tentativa de login

-- Verificar se já existe
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

-- Comentário
COMMENT ON TABLE admins IS 'Tabela de administradores - Ultra Admin: tbogesdf.ai@gmail.com';

