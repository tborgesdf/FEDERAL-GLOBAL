/**
 * API DE QUALIDADE DE SELFIE
 * Analisa qualidade da selfie e aceita/rejeita
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin, getUserIdFromToken, logAudit } from "./lib/supabase-admin";
import formidable from "formidable";
import fs from "fs";
import sharp from "sharp";

/**
 * Análise simples de qualidade de imagem
 * Em produção, use ML (Face Detection API, TensorFlow.js, etc)
 */
async function analyzeImageQuality(filePath: string): Promise<{
  accepted: boolean;
  qualityScore: number;
  rejectionReason?: string;
}> {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Verificar dimensões mínimas
    if (!metadata.width || !metadata.height) {
      return {
        accepted: false,
        qualityScore: 0,
        rejectionReason: "Não foi possível ler dimensões da imagem",
      };
    }

    if (metadata.width < 640 || metadata.height < 480) {
      return {
        accepted: false,
        qualityScore: 0.3,
        rejectionReason: "Resolução muito baixa (mínimo 640x480)",
      };
    }

    // Verificar tamanho do arquivo (muito pequeno = baixa qualidade)
    const stats = fs.statSync(filePath);
    if (stats.size < 50 * 1024) {
      // < 50KB
      return {
        accepted: false,
        qualityScore: 0.4,
        rejectionReason: "Arquivo muito pequeno (possível compressão excessiva)",
      };
    }

    // Calcular score baseado em dimensões e tamanho
    const dimensionScore = Math.min(
      (metadata.width * metadata.height) / (1920 * 1080),
      1
    );
    const sizeScore = Math.min(stats.size / (500 * 1024), 1);
    const qualityScore = (dimensionScore * 0.6 + sizeScore * 0.4);

    // Aceitar se score > 0.5
    if (qualityScore < 0.5) {
      return {
        accepted: false,
        qualityScore: parseFloat(qualityScore.toFixed(2)),
        rejectionReason: "Qualidade insuficiente. Tente com melhor iluminação e resolução.",
      };
    }

    return {
      accepted: true,
      qualityScore: parseFloat(qualityScore.toFixed(2)),
    };
  } catch (error: any) {
    console.error("Image analysis error:", error);
    return {
      accepted: false,
      qualityScore: 0,
      rejectionReason: "Erro ao analisar imagem: " + error.message,
    };
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2. Parse multipart
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req as any, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    const applicationId = Array.isArray(fields.application_id)
      ? fields.application_id[0]
      : fields.application_id;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!applicationId || !file) {
      return res.status(400).json({
        error: "Campos obrigatórios: application_id, file",
      });
    }

    // 3. Verificar se application pertence ao usuário
    const { data: app } = await supabaseAdmin
      .from("applications")
      .select("id, user_id")
      .eq("id", applicationId)
      .single();

    if (!app || app.user_id !== userId) {
      return res.status(403).json({ error: "Application não encontrada ou acesso negado" });
    }

    // 4. Analisar qualidade
    const analysis = await analyzeImageQuality(file.filepath);

    // 5. Se aceita, fazer upload
    let storagePath: string | null = null;
    if (analysis.accepted) {
      const timestamp = Date.now();
      storagePath = `applications/${applicationId}/selfie-${timestamp}.jpg`;

      const fileBuffer = fs.readFileSync(file.filepath);
      const { error: uploadError } = await supabaseAdmin.storage
        .from("selfies")
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return res.status(500).json({ error: "Falha ao salvar selfie" });
      }

      // 6. Persistir selfie no banco
      const { error: selfieError } = await supabaseAdmin
        .from("selfies")
        .insert({
          application_id: applicationId,
          storage_path: storagePath,
          file_size: file.size,
          mime_type: file.mimetype,
          quality_score: analysis.qualityScore,
          accepted: true,
        });

      if (selfieError) {
        console.error("Selfie insert error:", selfieError);
        return res.status(500).json({ error: "Falha ao persistir selfie" });
      }

      await logAudit({
        userId,
        applicationId,
        action: "selfie.uploaded",
        details: { qualityScore: analysis.qualityScore },
      });
    }

    // 7. Limpar arquivo temporário
    fs.unlinkSync(file.filepath);

    // 8. Retornar resultado
    return res.status(200).json({
      accepted: analysis.accepted,
      qualityScore: analysis.qualityScore,
      rejectionReason: analysis.rejectionReason,
      storagePath,
    });
  } catch (error: any) {
    console.error("Selfie quality API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

