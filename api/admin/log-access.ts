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
      admin_email,
      admin_name,
      admin_id,
      ip_address,
      user_agent,
      latitude,
      longitude,
      geolocation_city,
      geolocation_state,
      geolocation_country,
      device_type,
      device_brand,
      device_model,
      device_full_name,
      device_browser,
      device_os,
      device_platform,
      device_language,
      device_screen,
      device_breakpoint,
      device_is_touch,
      device_is_retina,
      connection_type,
      carrier,
      login_successful = true,
    } = req.body;

    if (!admin_email || !admin_name) {
      return res.status(400).json({ error: 'E-mail e nome do admin são obrigatórios' });
    }

    // Buscar admin_id pelo email se não foi fornecido
    let finalAdminId = admin_id;
    if (!finalAdminId) {
      const { data: adminData } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('email', admin_email)
        .single();
      
      if (adminData) {
        finalAdminId = adminData.id;
      }
    }

    // Capturar IP do cliente
    const clientIP = ip_address || 
                     (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     req.socket.remoteAddress || 
                     null;

    // Inserir log de acesso (não editável)
    const { data, error } = await supabaseAdmin
      .from('admin_access_logs')
      .insert({
        admin_id: finalAdminId || null,
        admin_email,
        admin_name,
        ip_address: clientIP,
        user_agent: user_agent || req.headers['user-agent'] || null,
        latitude: latitude || null,
        longitude: longitude || null,
        geolocation_city: geolocation_city || null,
        geolocation_state: geolocation_state || null,
        geolocation_country: geolocation_country || null,
        device_type: device_type || null,
        device_brand: device_brand || null,
        device_model: device_model || null,
        device_full_name: device_full_name || null,
        device_browser: device_browser || null,
        device_os: device_os || null,
        device_platform: device_platform || null,
        device_language: device_language || null,
        device_screen: device_screen || null,
        device_breakpoint: device_breakpoint || null,
        device_is_touch: device_is_touch || null,
        device_is_retina: device_is_retina || null,
        connection_type: connection_type || null,
        carrier: carrier || null,
        login_successful,
        access_timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar log de acesso:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      log: data,
      message: 'Log de acesso salvo com sucesso',
    });
  } catch (error) {
    console.error('Erro no handler:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}

