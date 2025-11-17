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
  // Apenas GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { limit = 100, offset = 0 } = req.query;

    // Verificar se a tabela existe antes de consultar
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('admin_access_logs')
      .select('id')
      .limit(1);

    // Se a tabela não existir, retornar erro específico
    if (tableError) {
      console.error('Erro ao verificar tabela:', tableError);
      if (tableError.message.includes('relation') || tableError.message.includes('does not exist')) {
        return res.status(404).json({ 
          success: false,
          error: 'Tabela admin_access_logs não encontrada. Execute as migrations SQL no Supabase.',
          logs: [],
          total: 0,
        });
      }
      return res.status(400).json({ 
        success: false,
        error: tableError.message,
        logs: [],
        total: 0,
      });
    }

    // Buscar logs de acesso ordenados por data mais recente
    const { data, error, count } = await supabaseAdmin
      .from('admin_access_logs')
      .select('*', { count: 'exact' })
      .order('access_timestamp', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Erro ao buscar logs:', error);
      return res.status(400).json({ 
        success: false,
        error: error.message,
        logs: [],
        total: 0,
      });
    }

    return res.status(200).json({
      success: true,
      logs: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Erro no handler:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      logs: [],
      total: 0,
    });
  }
}

