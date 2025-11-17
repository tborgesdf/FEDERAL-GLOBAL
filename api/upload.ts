import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'uploads';

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = `${Date.now()}-${file.originalFilename || 'file'}`;
    const filePath = `${folder}/${fileName}`;

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      // Se o bucket não existir, criar
      if (uploadError.message.includes('Bucket not found')) {
        // Tentar criar bucket (pode falhar se não tiver permissão)
        console.warn('Bucket não encontrado, tentando criar...');
      }
      console.error('Erro no upload:', uploadError);
      return res.status(400).json({ error: uploadError.message });
    }

    // Obter URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filePath);

    // Limpar arquivo temporário
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      message: 'Arquivo enviado com sucesso',
    });
  } catch (error) {
    console.error('Erro no handler:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}

