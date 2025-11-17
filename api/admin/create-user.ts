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
    const { email, password, user_metadata } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    // Criar usuário usando Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: user_metadata || {},
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      user: data.user,
      message: 'Usuário criado com sucesso',
    });
  } catch (error) {
    console.error('Erro no handler:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}

