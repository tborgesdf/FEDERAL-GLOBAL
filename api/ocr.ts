/**
 * API DE OCR - GOOGLE VISION
 * Recebe documento, faz upload para Storage e extrai texto via Vision API
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin, getUserIdFromToken, logAudit } from "./lib/supabase-admin";
import formidable from "formidable";
import fs from "fs";
import { ImageAnnotatorClient } from "@google-cloud/vision";

// Configurar Google Vision Client
let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (visionClient) return visionClient;

  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentials) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON não configurada");
  }

  try {
    const parsed = JSON.parse(credentials);
    visionClient = new ImageAnnotatorClient({ credentials: parsed });
    return visionClient;
  } catch (error) {
    throw new Error("Falha ao inicializar Google Vision Client");
  }
}

/**
 * Extrai texto de imagem usando Google Vision
 */
async function extractTextFromImage(filePath: string): Promise<any> {
  const client = getVisionClient();
  const [result] = await client.textDetection(filePath);
  const detections = result.textAnnotations || [];
  
  // Primeiro elemento contém o texto completo
  const fullText = detections[0]?.description || "";
  
  // Tentar estruturar dados comuns (heurísticas simples)
  const structured: any = {
    fullText,
    lines: detections.slice(1).map((d) => d.description),
  };

  // Heurísticas para passaporte (exemplo)
  if (fullText.includes("PASSPORT") || fullText.includes("PASSAPORTE")) {
    structured.documentType = "passport";
    // Tentar extrair número (padrão comum: 2 letras + 6 dígitos)
    const passportNumber = fullText.match(/[A-Z]{2}\d{6}/);
    if (passportNumber) structured.passportNumber = passportNumber[0];
  }

  // Heurísticas para RG
  if (fullText.includes("REPÚBLICA FEDERATIVA") || fullText.includes("CARTEIRA DE IDENTIDADE")) {
    structured.documentType = "br_id";
  }

  return structured;
}

export const config = {
  api: {
    bodyParser: false, // Necessário para formidable
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

    // 2. Parse multipart/form-data
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
    const docType = Array.isArray(fields.doc_type)
      ? fields.doc_type[0]
      : fields.doc_type;
    const side = Array.isArray(fields.side) ? fields.side[0] : fields.side || "single";

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!applicationId || !docType || !file) {
      return res.status(400).json({
        error: "Campos obrigatórios: application_id, doc_type, file",
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

    // 4. Upload para Supabase Storage
    const fileExtension = file.originalFilename?.split(".").pop() || "jpg";
    const storagePath = `applications/${applicationId}/${docType}-${side}.${fileExtension}`;

    const fileBuffer = fs.readFileSync(file.filepath);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ error: "Falha ao salvar arquivo" });
    }

    // 5. OCR com Google Vision
    let ocrJson: any = null;
    try {
      ocrJson = await extractTextFromImage(file.filepath);
    } catch (ocrError: any) {
      console.error("OCR error:", ocrError);
      ocrJson = { error: "OCR falhou", message: ocrError.message };
    }

    // 6. Salvar documento no banco
    const { data: document, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({
        application_id: applicationId,
        doc_type: docType,
        side: side,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.mimetype,
        ocr_json: ocrJson,
        verified: false,
      })
      .select()
      .single();

    if (docError) {
      console.error("Document insert error:", docError);
      return res.status(500).json({ error: "Falha ao persistir documento" });
    }

    // 7. Log de auditoria
    await logAudit({
      userId,
      applicationId,
      action: "document.uploaded",
      details: { documentId: document.id, docType, side },
    });

    // 8. Limpar arquivo temporário
    fs.unlinkSync(file.filepath);

    // 9. Retornar resultado
    return res.status(200).json({
      ok: true,
      document: {
        id: document.id,
        storage_path: storagePath,
        ocr_json: ocrJson,
      },
    });
  } catch (error: any) {
    console.error("OCR API error:", error);
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

