import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const {
      email,
      password,
      full_name,
      cpf,
      phone,
      birth_date,
      profile_photo_url,
      latitude,
      longitude,
      device_type,
      device_browser,
      device_os,
      device_platform,
      device_language,
      device_screen,
      device_user_agent,
      role = 'admin',
    } = req.body;

    if (!email || !password || !full_name || !cpf || !phone || !birth_date) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Primeiro criar no Supabase Auth
    let authUser = null;
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          cpf,
          phone,
          birth_date,
          role: 'admin',
        },
      });

      if (authError) {
        console.error('Erro ao criar no Auth:', authError);
        return res.status(400).json({ error: authError.message });
      }

      authUser = authData.user;
    } catch (authError) {
      console.error('Erro ao criar no Auth:', authError);
      return res.status(400).json({ 
        error: authError instanceof Error ? authError.message : 'Erro ao criar usuário no sistema de autenticação' 
      });
    }

    // Inserir admin na tabela admins (sem senha, pois será gerenciada pelo Auth)
    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert({
        id: authUser?.id, // Usar o mesmo ID do Auth
        email,
        password_hash: 'managed_by_auth', // Senha gerenciada pelo Supabase Auth
        full_name,
        cpf,
        phone,
        birth_date,
        profile_photo_url: profile_photo_url || null,
        role,
        latitude: latitude || null,
        longitude: longitude || null,
        device_type: device_type || null,
        device_browser: device_browser || null,
        device_os: device_os || null,
        device_platform: device_platform || null,
        device_language: device_language || null,
        device_screen: device_screen || null,
        device_user_agent: device_user_agent || null,
        termos_aceitos: true,
        data_aceite_termos: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar admin na tabela:', error);
      // Tentar deletar o usuário do Auth se a tabela falhar
      if (authUser?.id) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      }
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      admin: data,
      message: 'Admin criado com sucesso',
    });
  } catch (error) {
    console.error('Erro no handler:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}

