/**
 * FEDERAL EXPRESS BRASIL
 * API: OCR Universal
 * 
 * Processa documentos enviados e extrai dados via Google Vision API
 * Suporta: passport, previous_visa, rg, cnh, cnh_digital, marriage_cert
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Google Vision Client
const visionCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
const visionClient = new ImageAnnotatorClient({
  credentials: visionCredentials,
});

// Tipos
interface OcrResult {
  doc_type: string;
  confidence: number;
  fields_detected: string[];
  fields_missing: string[];
  ocr_json: any;
}

// Configuração do formidable
const parseForm = (req: VercelRequest): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ 
      maxFileSize: 50 * 1024 * 1024, // 50MB
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
    const docType = Array.isArray(fields.doc_type) ? fields.doc_type[0] : fields.doc_type;
    const side = Array.isArray(fields.side) ? fields.side[0] : fields.side || 'single';
    const applicationId = Array.isArray(fields.application_id) ? fields.application_id[0] : fields.application_id;

    if (!file || !docType || !applicationId) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: file, doc_type, application_id' 
      });
    }

    // 2. Ler arquivo
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.filepath);

    // 3. Chamar Google Vision API
    const [result] = await visionClient.textDetection(fileBuffer);
    const detections = result.textAnnotations || [];
    
    if (detections.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum texto detectado no documento' 
      });
    }

    const fullText = detections[0]?.description || '';
    const lines = fullText.split('\n').filter(l => l.trim());

    // 4. Processar OCR baseado no tipo de documento
    const ocrResult = processOcrByDocType(docType, lines, fullText);

    // 5. Upload para Supabase Storage
    const fileName = `${applicationId}/${docType}-${side}-${Date.now()}.${file.originalFilename?.split('.').pop() || 'jpg'}`;
    const storagePath = `documents/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return res.status(500).json({ error: 'Erro ao salvar documento' });
    }

    // 6. Salvar registro no banco
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        application_id: applicationId,
        doc_type: docType,
        side: side,
        storage_path: storagePath,
        ocr_json: ocrResult.ocr_json,
        verified: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      return res.status(500).json({ error: 'Erro ao salvar no banco' });
    }

    // 7. Retornar resultado
    return res.status(200).json({
      success: true,
      document: document,
      ocr: ocrResult,
    });

  } catch (error: any) {
    console.error('Erro no OCR:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar documento',
      details: error.message,
    });
  }
}

/**
 * Processa OCR baseado no tipo de documento
 */
function processOcrByDocType(docType: string, lines: string[], fullText: string): OcrResult {
  switch (docType) {
    case 'passport':
      return extractPassportData(lines, fullText);
    case 'previous_visa':
      return extractPreviousVisaData(lines, fullText);
    case 'rg':
    case 'cnh':
    case 'cnh_digital':
      return extractBrazilianIdData(lines, fullText, docType);
    case 'marriage_cert':
      return extractMarriageCertData(lines, fullText);
    default:
      return {
        doc_type: docType,
        confidence: 0,
        fields_detected: [],
        fields_missing: [],
        ocr_json: { raw_text: fullText },
      };
  }
}

/**
 * Extrai dados de passaporte
 */
function extractPassportData(lines: string[], fullText: string): OcrResult {
  const data: any = {
    document: {},
    holder: {},
    mrz: {},
    issuer: {},
  };

  const fields_detected: string[] = [];
  const fields_missing: string[] = [];

  // Extrair MRZ (Machine Readable Zone)
  const mrzLines = lines.filter(l => l.length >= 30 && /^[A-Z0-9<]+$/.test(l));
  if (mrzLines.length >= 2) {
    data.mrz.line1 = mrzLines[0];
    data.mrz.line2 = mrzLines[1];
    fields_detected.push('mrz');

    // Parsear MRZ
    const mrzData = parseMRZ(mrzLines);
    Object.assign(data, mrzData);
  }

  // Número do passaporte
  const passportNumMatch = fullText.match(/\b([A-Z]{2}\d{6,9})\b/);
  if (passportNumMatch) {
    data.document.passport_number = passportNumMatch[1];
    fields_detected.push('passport_number');
  } else {
    fields_missing.push('passport_number');
  }

  // Nome completo
  const namePatterns = [
    /Nome\/Name[:\s]*([A-ZÀ-Ú\s]+)/i,
    /Surname[:\s]*([A-ZÀ-Ú\s]+)/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      data.holder.full_name = match[1].trim();
      fields_detected.push('full_name');
      break;
    }
  }

  if (!data.holder.full_name) {
    fields_missing.push('full_name');
  }

  // Data de nascimento
  const dobMatch = fullText.match(/\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\b/);
  if (dobMatch) {
    data.holder.birth_date = normalizeDate(dobMatch[1]);
    fields_detected.push('birth_date');
  } else {
    fields_missing.push('birth_date');
  }

  // Nacionalidade
  const nationalityMatch = fullText.match(/Nacional[ia]dade\/Nationality[:\s]*([A-ZÀ-Ú\s]+)/i);
  if (nationalityMatch) {
    data.holder.nationality = nationalityMatch[1].trim();
    fields_detected.push('nationality');
  } else {
    fields_missing.push('nationality');
  }

  // Data de emissão
  const issueDateMatch = fullText.match(/Emissão\/Issue[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (issueDateMatch) {
    data.document.date_of_issue = normalizeDate(issueDateMatch[1]);
    fields_detected.push('date_of_issue');
  } else {
    fields_missing.push('date_of_issue');
  }

  // Data de validade
  const expiryDateMatch = fullText.match(/Validade\/Expiry[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (expiryDateMatch) {
    data.document.date_of_expiry = normalizeDate(expiryDateMatch[1]);
    fields_detected.push('date_of_expiry');
  } else {
    fields_missing.push('date_of_expiry');
  }

  return {
    doc_type: 'passport',
    confidence: fields_detected.length / (fields_detected.length + fields_missing.length),
    fields_detected,
    fields_missing,
    ocr_json: data,
  };
}

/**
 * Parseia MRZ (Machine Readable Zone)
 */
function parseMRZ(mrzLines: string[]): any {
  if (mrzLines.length < 2) return {};

  const line1 = mrzLines[0];
  const line2 = mrzLines[1];

  return {
    mrz: {
      document_code: line1.substring(0, 2),
      issuing_country: line1.substring(2, 5).replace(/</g, ''),
      surname: line1.substring(5).split('<<')[0].replace(/</g, ' ').trim(),
      given_names: line1.substring(5).split('<<')[1]?.replace(/</g, ' ').trim() || '',
    },
    document: {
      passport_number: line2.substring(0, 9).replace(/</g, ''),
    },
    holder: {
      nationality: line2.substring(10, 13).replace(/</g, ''),
      birth_date: parseMRZDate(line2.substring(13, 19)),
      gender: line2.charAt(20) === 'M' ? 'M' : line2.charAt(20) === 'F' ? 'F' : 'X',
    },
  };
}

/**
 * Parseia data do MRZ (YYMMDD)
 */
function parseMRZDate(mrzDate: string): string {
  if (mrzDate.length !== 6) return '';
  
  let year = parseInt(mrzDate.substring(0, 2));
  const month = mrzDate.substring(2, 4);
  const day = mrzDate.substring(4, 6);
  
  // Assumir século baseado no ano
  year += year > 50 ? 1900 : 2000;
  
  return `${year}-${month}-${day}`;
}

/**
 * Normaliza data para formato ISO (YYYY-MM-DD)
 */
function normalizeDate(dateStr: string): string {
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length !== 3) return dateStr;
  
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Extrai dados de visto anterior
 */
function extractPreviousVisaData(lines: string[], fullText: string): OcrResult {
  const data: any = {
    document: {},
    holder: {},
  };

  const fields_detected: string[] = [];
  const fields_missing: string[] = [];

  // Número do visto
  const visaNumMatch = fullText.match(/\b(\d{8,12})\b/);
  if (visaNumMatch) {
    data.document.number = visaNumMatch[1];
    fields_detected.push('visa_number');
  } else {
    fields_missing.push('visa_number');
  }

  // Tipo de visto
  const visaTypeMatch = fullText.match(/(?:Type|Tipo)[:\s]*([A-Z]\d?)/i);
  if (visaTypeMatch) {
    data.document.type = visaTypeMatch[1];
    fields_detected.push('visa_type');
  } else {
    fields_missing.push('visa_type');
  }

  // Data de emissão
  const issueDateMatch = fullText.match(/Issue Date[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
  if (issueDateMatch) {
    data.document.date_of_issue = normalizeDate(issueDateMatch[1]);
    fields_detected.push('date_of_issue');
  } else {
    fields_missing.push('date_of_issue');
  }

  // Data de expiração
  const expiryDateMatch = fullText.match(/Expir(?:ation|y) Date[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
  if (expiryDateMatch) {
    data.document.date_of_expiry = normalizeDate(expiryDateMatch[1]);
    fields_detected.push('date_of_expiry');
  } else {
    fields_missing.push('date_of_expiry');
  }

  return {
    doc_type: 'previous_visa',
    confidence: fields_detected.length / (fields_detected.length + fields_missing.length),
    fields_detected,
    fields_missing,
    ocr_json: data,
  };
}

/**
 * Extrai dados de documento brasileiro (RG/CNH)
 */
function extractBrazilianIdData(lines: string[], fullText: string, docType: string): OcrResult {
  const data: any = {
    document: { type: docType },
    holder: {},
    issuer: {},
  };

  const fields_detected: string[] = [];
  const fields_missing: string[] = [];

  // Número do documento
  const docNumMatch = fullText.match(/\b(\d{2}\.\d{3}\.\d{3}-\d{1,2}|\d{11})\b/);
  if (docNumMatch) {
    data.document.number = docNumMatch[1];
    fields_detected.push('document_number');
  } else {
    fields_missing.push('document_number');
  }

  // Nome
  const nameMatch = fullText.match(/Nome[:\s]*([A-ZÀ-Ú\s]+)/i);
  if (nameMatch) {
    data.holder.full_name = nameMatch[1].trim();
    fields_detected.push('full_name');
  } else {
    fields_missing.push('full_name');
  }

  // CPF
  const cpfMatch = fullText.match(/CPF[:\s]*(\d{3}\.\d{3}\.\d{3}-\d{2})/i);
  if (cpfMatch) {
    data.holder.cpf = cpfMatch[1];
    fields_detected.push('cpf');
  } else {
    fields_missing.push('cpf');
  }

  // Data de nascimento
  const dobMatch = fullText.match(/Nascimento[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (dobMatch) {
    data.holder.birth_date = normalizeDate(dobMatch[1]);
    fields_detected.push('birth_date');
  } else {
    fields_missing.push('birth_date');
  }

  // UF emissor (para RG)
  if (docType === 'rg') {
    const ufMatch = fullText.match(/\b([A-Z]{2})\b/);
    if (ufMatch) {
      data.issuer.uf = ufMatch[1];
      fields_detected.push('issuer_uf');
    } else {
      fields_missing.push('issuer_uf');
    }
  }

  return {
    doc_type: docType,
    confidence: fields_detected.length / (fields_detected.length + fields_missing.length),
    fields_detected,
    fields_missing,
    ocr_json: data,
  };
}

/**
 * Extrai dados de certidão de casamento
 */
function extractMarriageCertData(lines: string[], fullText: string): OcrResult {
  const data: any = {
    marriage: {},
    spouse: {},
    registry_office: {},
  };

  const fields_detected: string[] = [];
  const fields_missing: string[] = [];

  // Nome do cônjuge
  const spouseMatch = fullText.match(/(?:Cônjuge|Spouse)[:\s]*([A-ZÀ-Ú\s]+)/i);
  if (spouseMatch) {
    data.spouse.full_name = spouseMatch[1].trim();
    fields_detected.push('spouse_name');
  } else {
    fields_missing.push('spouse_name');
  }

  // Data do casamento
  const marriageDateMatch = fullText.match(/Data[:\s]*(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (marriageDateMatch) {
    data.marriage.date = normalizeDate(marriageDateMatch[1]);
    fields_detected.push('marriage_date');
  } else {
    fields_missing.push('marriage_date');
  }

  // Cartório
  const registryMatch = fullText.match(/Cartório[:\s]*([A-ZÀ-Ú0-9\s]+)/i);
  if (registryMatch) {
    data.registry_office.name = registryMatch[1].trim();
    fields_detected.push('registry_office');
  } else {
    fields_missing.push('registry_office');
  }

  // UF
  const ufMatch = fullText.match(/\b([A-Z]{2})\b/);
  if (ufMatch) {
    data.registry_office.uf = ufMatch[1];
    fields_detected.push('registry_uf');
  } else {
    fields_missing.push('registry_uf');
  }

  return {
    doc_type: 'marriage_cert',
    confidence: fields_detected.length / (fields_detected.length + fields_missing.length),
    fields_detected,
    fields_missing,
    ocr_json: data,
  };
}

// Export config para Vercel
export const config = {
  api: {
    bodyParser: false, // Desabilitar body parser padrão (formidable cuida disso)
  },
};
