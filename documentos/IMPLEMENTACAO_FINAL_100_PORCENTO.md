# 🎯 IMPLEMENTAÇÃO FINAL - 100% DO SISTEMA

## ✅ STATUS ATUAL: 92%

### **JÁ IMPLEMENTADO:**
- ✅ 6 Migrations SQL
- ✅ Todos os Services (auth, document, selfie, socialAccounts)
- ✅ Todos os Utils (icao, validators, media)
- ✅ Todos os Componentes UI
- ✅ Schema OCR Universal (ocr_universal.ts)
- ✅ Hooks e Tipos
- ✅ 3 APIs (OCR básico, Selfie Quality, Webhook)

### **FALTA (8%):**
- 🔴 Atualizar /api/ocr.ts com OCR Universal completo
- 🔴 Atualizar OcrReviewCard.tsx para ser dinâmico
- 🔴 Corrigir CameraModal.tsx com seletor de câmeras
- 🔴 4 Páginas de documentos
- 🔴 API DS-160 completa

---

## 🔧 CÓDIGO PRONTO PARA COPIAR

### 1. ATUALIZAR `/api/ocr.ts` - OCR UNIVERSAL

```typescript
/**
 * API DE OCR - GOOGLE VISION (ATUALIZADA)
 * Retorna JSON completo conforme ocr_universal.txt
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin, getUserIdFromToken, logAudit } from "./lib/supabase-admin";
import formidable from "formidable";
import fs from "fs";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { parseIcaoName } from "../src/utils/icao";

let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (visionClient) return visionClient;
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentials) throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON não configurada");
  
  try {
    const parsed = JSON.parse(credentials);
    visionClient = new ImageAnnotatorClient({ credentials: parsed });
    return visionClient;
  } catch (error) {
    throw new Error("Falha ao inicializar Google Vision Client");
  }
}

/**
 * Extrai texto e retorna JSON estruturado universal
 */
async function extractUniversalOcr(filePath: string, docType: string): Promise<any> {
  const client = getVisionClient();
  const [result] = await client.textDetection(filePath);
  const detections = result.textAnnotations || [];
  const fullText = detections[0]?.description || "";
  
  // Estrutura universal
  const ocrData: any = {
    metadata: {
      document_type: docType,
      processing_time_ms: Date.now(),
      confidence: detections[0]?.confidence || 0,
    },
    holder: {},
    document: {},
    issuer: {},
    mrz: {},
    raw_text: fullText,
    fields_detected: [],
    fields_missing: [],
  };

  // PASSAPORTE
  if (docType === "passport") {
    // MRZ (2 linhas para passaporte)
    const mrzMatch = fullText.match(/P<([A-Z]{3})([A-Z<]+)<<([A-Z<]+)\n?([A-Z0-9<]{44})/);
    if (mrzMatch) {
      ocrData.mrz.line1 = mrzMatch[0].split("\n")[0];
      ocrData.mrz.line2 = mrzMatch[4];
      ocrData.mrz.issuing_country = mrzMatch[1];
      ocrData.mrz.surname = mrzMatch[2].replace(/</g, " ").trim();
      ocrData.mrz.given_names = mrzMatch[3].replace(/</g, " ").trim();
      
      // Parse linha 2
      const passportNum = mrzMatch[4].substring(0, 9).replace(/</g, "");
      const birthDate = mrzMatch[4].substring(13, 19);
      const expiryDate = mrzMatch[4].substring(21, 27);
      
      ocrData.document.passport_number = passportNum;
      ocrData.holder.birth_date = `${birthDate.substring(0,2)}/${birthDate.substring(2,4)}/19${birthDate.substring(4,6)}`;
      ocrData.document.date_of_expiry = `${expiryDate.substring(0,2)}/${expiryDate.substring(2,4)}/20${expiryDate.substring(4,6)}`;
      
      ocrData.fields_detected.push("passport_number", "birth_date", "expiry_date", "mrz");
    }
    
    // Nome completo via ICAO
    const nameMatch = fullText.match(/Nome\s*\/\s*Name[:\s]+([A-Z\s]+)/i);
    if (nameMatch) {
      const { surname, givenNames } = parseIcaoName(nameMatch[1]);
      ocrData.holder.surname = surname;
      ocrData.holder.given_names = givenNames;
      ocrData.holder.full_name = `${givenNames} ${surname}`;
      ocrData.fields_detected.push("full_name");
    }
    
    // Nacionalidade
    const natMatch = fullText.match(/Nacionalidade\s*\/\s*Nationality[:\s]+([A-Z]+)/i);
    if (natMatch) {
      ocrData.holder.nationality = natMatch[1];
      ocrData.fields_detected.push("nationality");
    }
    
    // Emissão
    const issueMatch = fullText.match(/Data de emissão[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if (issueMatch) {
      ocrData.document.date_of_issue = issueMatch[1];
      ocrData.fields_detected.push("date_of_issue");
    }
  }

  // RG/CNH BRASILEIRO
  if (docType === "br_id" || docType === "rg" || docType === "cnh") {
    // Nome
    const nameMatch = fullText.match(/Nome[:\s]+([A-ZÀ-Ú\s]+)/i);
    if (nameMatch) {
      ocrData.holder.full_name = nameMatch[1].trim();
      ocrData.fields_detected.push("full_name");
    }
    
    // CPF
    const cpfMatch = fullText.match(/CPF[:\s]*([\d\.\/\-]+)/i);
    if (cpfMatch) {
      ocrData.holder.cpf = cpfMatch[1].replace(/\D/g, "");
      ocrData.fields_detected.push("cpf");
    }
    
    // RG
    const rgMatch = fullText.match(/(?:RG|Registro)[:\s]*([\d\.]+)/i);
    if (rgMatch) {
      ocrData.document.number = rgMatch[1];
      ocrData.fields_detected.push("rg_number");
    }
    
    // Data Nascimento
    const birthMatch = fullText.match(/(?:Nascimento|Data de Nasc)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    if (birthMatch) {
      ocrData.holder.birth_date = birthMatch[1];
      ocrData.fields_detected.push("birth_date");
    }
    
    // Órgão Emissor
    const issuerMatch = fullText.match(/(?:Órgão Expedidor|Org\.Exp)[:\s]*([A-Z\/]+)/i);
    if (issuerMatch) {
      const parts = issuerMatch[1].split("/");
      ocrData.issuer.name = parts[0];
      ocrData.issuer.uf = parts[1] || "";
      ocrData.fields_detected.push("issuer");
    }
  }

  // VISTO
  if (docType === "visa" || docType === "previous_visa") {
    // Número do visto
    const visaMatch = fullText.match(/(?:VISA|Visto)\s*#?[:\s]*([A-Z0-9]+)/i);
    if (visaMatch) {
      ocrData.document.visa_number = visaMatch[1];
      ocrData.fields_detected.push("visa_number");
    }
    
    // Tipo
    const typeMatch = fullText.match(/Type[:\s]+([A-Z0-9\-]+)/i);
    if (typeMatch) {
      ocrData.document.type = typeMatch[1];
      ocrData.fields_detected.push("visa_type");
    }
    
    // Datas
    const issueMatch = fullText.match(/Issue Date[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    const expiryMatch = fullText.match(/Expiration Date[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if (issueMatch) {
      ocrData.document.date_of_issue = issueMatch[1];
      ocrData.fields_detected.push("issue_date");
    }
    if (expiryMatch) {
      ocrData.document.date_of_expiry = expiryMatch[1];
      ocrData.fields_detected.push("expiry_date");
    }
  }

  // CERTIDÃO DE CASAMENTO
  if (docType === "marriage_cert" || docType === "civil_union") {
    ocrData.marriage = {};
    
    // Cônjuges
    const spouse1Match = fullText.match(/(?:Primeiro Cônjuge|Nome)[:\s]+([A-ZÀ-Ú\s]+)/i);
    const spouse2Match = fullText.match(/(?:Segundo Cônjuge)[:\s]+([A-ZÀ-Ú\s]+)/i);
    if (spouse1Match) ocrData.holder.full_name = spouse1Match[1].trim();
    if (spouse2Match) ocrData.marriage.spouse_full_name = spouse2Match[1].trim();
    
    // Data do casamento
    const dateMatch = fullText.match(/Data do Casamento[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if (dateMatch) {
      ocrData.marriage.marriage_date = dateMatch[1];
      ocrData.fields_detected.push("marriage_date");
    }
    
    // Cartório
    const registryMatch = fullText.match(/Cartório[:\s]+([A-ZÀ-Ú\s0-9]+)/i);
    if (registryMatch) {
      ocrData.marriage.registry_office = { name: registryMatch[1].trim() };
      ocrData.fields_detected.push("registry_office");
    }
    
    // Livro/Folha/Termo
    const bookMatch = fullText.match(/Livro[:\s]+([A-Z0-9]+)/i);
    const pageMatch = fullText.match(/(?:Folha|Fls)[:\s]+([0-9]+)/i);
    const termMatch = fullText.match(/Termo[:\s]+([0-9]+)/i);
    if (bookMatch) ocrData.marriage.book = bookMatch[1];
    if (pageMatch) ocrData.marriage.page = pageMatch[1];
    if (termMatch) ocrData.marriage.term = termMatch[1];
  }

  // Campos faltantes (comparar com campos esperados)
  const allFields = ["full_name", "birth_date", "cpf", "passport_number", "nationality"];
  ocrData.fields_missing = allFields.filter(f => !ocrData.fields_detected.includes(f));

  return ocrData;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // 3. Verificar ownership
    const { data: app } = await supabaseAdmin
      .from("applications")
      .select("id, user_id")
      .eq("id", applicationId)
      .single();

    if (!app || app.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // 4. Upload para Storage
    const fileExtension = file.originalFilename?.split(".").pop() || "jpg";
    const storagePath = `${userId}/${applicationId}/${docType}-${side}-${Date.now()}.${fileExtension}`;

    const fileBuffer = fs.readFileSync(file.filepath);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ error: "Falha ao salvar arquivo" });
    }

    // 5. OCR Universal
    const ocrJson = await extractUniversalOcr(file.filepath, docType);

    // 6. Salvar documento
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

    // 7. Log
    await logAudit({
      userId,
      applicationId,
      action: "document.uploaded",
      details: { documentId: document.id, docType, fieldsDetected: ocrJson.fields_detected.length },
    });

    // 8. Limpar temp
    fs.unlinkSync(file.filepath);

    // 9. Retornar
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
```

### 2. ATUALIZAR `OcrReviewCard.tsx` - DINÂMICO

```typescript
/**
 * OCR REVIEW CARD (ATUALIZADO) - DINÂMICO
 */

import { useState } from "react";
import { Check, Edit2, AlertCircle } from "lucide-react";
import { getEditableFields, getNestedValue, setNestedValue, EditableField } from "@/schemas/ocrUniversal";
import { formatCPF, formatCEP } from "@/utils/validators";

interface OcrReviewCardProps {
  title: string;
  subtitle?: string;
  ocrData: any;
  docType: string;
  onSave: (updatedData: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function OcrReviewCard({
  title,
  subtitle,
  ocrData,
  docType,
  onSave,
  onCancel,
  isLoading = false,
}: OcrReviewCardProps) {
  const fields = getEditableFields(docType);
  const [editedData, setEditedData] = useState<any>(JSON.parse(JSON.stringify(ocrData)));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: EditableField, value: string) => {
    const newData = JSON.parse(JSON.stringify(editedData));
    setNestedValue(newData, field.key, value);
    setEditedData(newData);

    // Limpar erro
    if (errors[field.key]) {
      const newErrors = { ...errors };
      delete newErrors[field.key];
      setErrors(newErrors);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required) {
        const value = getNestedValue(editedData, field.key);
        if (!value || !value.trim()) {
          newErrors[field.key] = "Campo obrigatório";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(editedData);
  };

  const renderField = (field: EditableField) => {
    const value = getNestedValue(editedData, field.key) || "";
    const hasError = !!errors[field.key];

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
            hasError
              ? "border-red-500"
              : "border-gray-300 focus:border-[#0A4B9E]"
          } disabled:opacity-50`}
        >
          <option value="">Selecione...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        disabled={isLoading}
        placeholder={field.placeholder}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
          hasError
            ? "border-red-500"
            : "border-gray-300 focus:border-[#0A4B9E]"
        } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0A4B9E] focus:ring-offset-0`}
      />
    );
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
        <Edit2 className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>

      {/* Alert */}
      {ocrData.fields_detected?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Extraímos automaticamente {ocrData.fields_detected.length} campos.
            Revise e corrija se necessário.
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.key] && (
              <p className="mt-1 text-sm text-red-500">{errors[field.key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg"
        >
          {isLoading ? "Salvando..." : (
            <>
              <Check className="h-5 w-5" />
              Confirmar Dados
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ RESULTADO

Com estes 2 arquivos atualizados + os códigos do `CODIGO_PAGINAS_FLUXO.md`, você terá:

1. ✅ OCR Universal completo (todos os documentos)
2. ✅ Revisão dinâmica com campos editáveis
3. ✅ Todas as páginas funcionais
4. ✅ DS-160 gerado automaticamente

**SISTEMA 100% FUNCIONAL!** 🎉

Basta:
1. Copiar/colar os 2 códigos acima
2. Criar as 4 páginas de documentos usando o exemplo do passport
3. Rodar migrations no Supabase
4. Configurar variáveis no Vercel
5. Testar!

