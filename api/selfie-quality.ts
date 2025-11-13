/**
 * FEDERAL EXPRESS BRASIL
 * API: Selfie Quality Check
 * 
 * Valida qualidade de selfie (versão simplificada)
 * Versão 1: Validação básica (tamanho, formato)
 * Versão 2: Face detection com TensorFlow/MediaPipe (futuro)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import sharp from 'sharp';

// Configuração do formidable
const parseForm = (req: VercelRequest): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ 
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Parse multipart form
    const { fields, files } = await parseForm(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ 
        error: 'Arquivo não fornecido' 
      });
    }

    // 2. Ler arquivo
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.filepath);

    // 3. Analisar imagem com Sharp
    const metadata = await sharp(fileBuffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return res.status(400).json({ 
        error: 'Não foi possível analisar a imagem' 
      });
    }

    // 4. Validações básicas
    const checks = {
      min_width: metadata.width >= 640,
      min_height: metadata.height >= 480,
      aspect_ratio: checkAspectRatio(metadata.width, metadata.height),
      file_size: file.size >= 50 * 1024 && file.size <= 10 * 1024 * 1024, // 50KB - 10MB
      format: ['jpeg', 'jpg', 'png'].includes(metadata.format || ''),
    };

    // 5. Detectar blur (básico)
    const stats = await sharp(fileBuffer)
      .greyscale()
      .stats();
    
    const blurScore = calculateBlurScore(stats);
    checks['not_blurry'] = blurScore > 0.3; // Threshold simples

    // 6. Calcular score geral
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const qualityScore = passedChecks / totalChecks;

    // 7. Decisão: aceitar ou rejeitar
    const accepted = qualityScore >= 0.7; // Threshold: 70%

    // 8. Motivos de rejeição
    const reasons: string[] = [];
    if (!checks.min_width || !checks.min_height) {
      reasons.push('Resolução muito baixa (mínimo: 640x480)');
    }
    if (!checks.aspect_ratio) {
      reasons.push('Proporção da imagem incorreta (use orientação retrato)');
    }
    if (!checks.file_size) {
      reasons.push('Tamanho do arquivo inválido (50KB - 10MB)');
    }
    if (!checks.format) {
      reasons.push('Formato não suportado (use JPEG ou PNG)');
    }
    if (!checks.not_blurry) {
      reasons.push('Imagem muito embaçada ou com pouca luz');
    }

    // 9. Retornar resultado
    return res.status(200).json({
      accepted,
      quality_score: Math.round(qualityScore * 100) / 100,
      checks,
      reasons: accepted ? [] : reasons,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size_bytes: file.size,
        blur_score: Math.round(blurScore * 100) / 100,
      },
    });

  } catch (error: any) {
    console.error('Erro ao validar selfie:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar selfie',
      details: error.message,
    });
  }
}

/**
 * Verifica aspect ratio (deve ser retrato ou quadrado)
 */
function checkAspectRatio(width: number, height: number): boolean {
  const ratio = width / height;
  // Aceitar de 0.5 (retrato) até 1.2 (quase quadrado)
  return ratio >= 0.5 && ratio <= 1.2;
}

/**
 * Calcula score de blur (0 = muito embaçado, 1 = nítido)
 * Baseado em variância de pixels (método Laplaciano simplificado)
 */
function calculateBlurScore(stats: sharp.Stats): number {
  // Usar desvio padrão dos canais como proxy para nitidez
  // Imagens nítidas têm maior variação de pixels (maior desvio padrão)
  const avgStdDev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
  
  // Normalizar para 0-1 (assumindo que stdev > 30 = nítido)
  const normalizedScore = Math.min(avgStdDev / 30, 1);
  
  return normalizedScore;
}

// Export config para Vercel
export const config = {
  api: {
    bodyParser: false, // Desabilitar body parser padrão (formidable cuida disso)
  },
};
