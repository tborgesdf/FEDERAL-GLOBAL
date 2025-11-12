/**
 * SCHEMA OCR UNIVERSAL
 * Baseado em ocr_universal.txt - Estrutura completa de todos os documentos
 */

import { z } from "zod";

// ============================================================================
// TIPOS BASE
// ============================================================================

export const DocumentMetadataSchema = z.object({
  document_type: z.string(),
  document_subtype: z.string().optional(),
  issuing_country: z.string().optional(),
  language: z.string().optional(),
  confidence: z.number().optional(),
  processing_time_ms: z.number().optional(),
});

export const HolderSchema = z.object({
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  surname: z.string().optional(),
  given_names: z.string().optional(),
  gender: z.enum(["M", "F", "MALE", "FEMALE", "MASCULINO", "FEMININO"]).optional(),
  birth_date: z.string().optional(),
  birth_place: z.string().optional(),
  nationality: z.string().optional(),
  cpf: z.string().optional(),
  rg_number: z.string().optional(),
});

export const DocumentSchema = z.object({
  number: z.string().optional(),
  type: z.string().optional(),
  date_of_issue: z.string().optional(),
  date_of_expiry: z.string().optional(),
  issuing_authority: z.string().optional(),
  passport_number: z.string().optional(),
  visa_number: z.string().optional(),
});

export const IssuerSchema = z.object({
  name: z.string().optional(),
  uf: z.string().optional(),
  country: z.string().optional(),
});

export const MrzSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  line3: z.string().optional(),
  document_type: z.string().optional(),
  issuing_country: z.string().optional(),
  document_number: z.string().optional(),
  document_number_raw: z.string().optional(),
  check_digit_number: z.string().optional(),
  nationality: z.string().optional(),
  birth_date: z.string().optional(),
  check_digit_birth_date: z.string().optional(),
  gender: z.string().optional(),
  expiry_date: z.string().optional(),
  check_digit_expiry: z.string().optional(),
  personal_number: z.string().optional(),
  check_digit_personal: z.string().optional(),
  check_digit_composite: z.string().optional(),
  surname: z.string().optional(),
  given_names: z.string().optional(),
});

export const MarriageSchema = z.object({
  spouse_full_name: z.string().optional(),
  spouse_first_name: z.string().optional(),
  spouse_last_name: z.string().optional(),
  marriage_date: z.string().optional(),
  registry_office: z.object({
    name: z.string().optional(),
    uf: z.string().optional(),
    municipality: z.string().optional(),
  }).optional(),
  book: z.string().optional(),
  page: z.string().optional(),
  term: z.string().optional(),
});

export const AddressSchema = z.object({
  full_address: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
});

// ============================================================================
// SCHEMA COMPLETO OCR
// ============================================================================

export const OcrUniversalSchema = z.object({
  metadata: DocumentMetadataSchema.optional(),
  holder: HolderSchema.optional(),
  document: DocumentSchema.optional(),
  issuer: IssuerSchema.optional(),
  mrz: MrzSchema.optional(),
  marriage: MarriageSchema.optional(),
  address: AddressSchema.optional(),
  raw_text: z.string().optional(),
  blocks: z.array(z.any()).optional(),
  fields_detected: z.array(z.string()).optional(),
  fields_missing: z.array(z.string()).optional(),
});

export type OcrUniversal = z.infer<typeof OcrUniversalSchema>;

// ============================================================================
// CAMPOS EDITÁVEIS POR TIPO DE DOCUMENTO
// ============================================================================

export interface EditableField {
  key: string;
  label: string;
  type: "text" | "date" | "select";
  required?: boolean;
  options?: string[];
  mask?: string;
  placeholder?: string;
}

export const PASSPORT_FIELDS: EditableField[] = [
  { key: "document.passport_number", label: "Número do Passaporte", type: "text", required: true },
  { key: "holder.surname", label: "Sobrenome", type: "text", required: true },
  { key: "holder.given_names", label: "Nomes", type: "text", required: true },
  { key: "holder.nationality", label: "Nacionalidade", type: "text", required: true },
  { key: "holder.birth_date", label: "Data de Nascimento", type: "date", required: true },
  { key: "holder.gender", label: "Sexo", type: "select", required: true, options: ["M", "F"] },
  { key: "holder.birth_place", label: "Local de Nascimento", type: "text" },
  { key: "document.date_of_issue", label: "Data de Emissão", type: "date", required: true },
  { key: "document.date_of_expiry", label: "Data de Validade", type: "date", required: true },
  { key: "issuer.country", label: "País Emissor", type: "text", required: true },
];

export const BR_ID_FIELDS: EditableField[] = [
  { key: "document.number", label: "Número do RG", type: "text", required: true },
  { key: "holder.full_name", label: "Nome Completo", type: "text", required: true },
  { key: "holder.cpf", label: "CPF", type: "text", required: true, mask: "999.999.999-99" },
  { key: "holder.birth_date", label: "Data de Nascimento", type: "date", required: true },
  { key: "document.date_of_issue", label: "Data de Emissão", type: "date" },
  { key: "issuer.name", label: "Órgão Emissor", type: "text" },
  { key: "issuer.uf", label: "UF", type: "text" },
];

export const VISA_FIELDS: EditableField[] = [
  { key: "document.visa_number", label: "Número do Visto", type: "text", required: true },
  { key: "document.type", label: "Tipo de Visto", type: "text", required: true },
  { key: "document.date_of_issue", label: "Data de Emissão", type: "date", required: true },
  { key: "document.date_of_expiry", label: "Data de Validade", type: "date", required: true },
  { key: "issuer.country", label: "País Emissor", type: "text", required: true },
];

export const MARRIAGE_CERT_FIELDS: EditableField[] = [
  { key: "holder.full_name", label: "Nome Completo", type: "text", required: true },
  { key: "marriage.spouse_full_name", label: "Nome do Cônjuge", type: "text", required: true },
  { key: "marriage.marriage_date", label: "Data do Casamento", type: "date", required: true },
  { key: "marriage.registry_office.name", label: "Cartório", type: "text" },
  { key: "marriage.registry_office.uf", label: "UF", type: "text" },
  { key: "marriage.book", label: "Livro", type: "text" },
  { key: "marriage.page", label: "Folha", type: "text" },
  { key: "marriage.term", label: "Termo", type: "text" },
];

/**
 * Retorna campos editáveis baseado no tipo de documento
 */
export function getEditableFields(docType: string): EditableField[] {
  switch (docType) {
    case "passport":
      return PASSPORT_FIELDS;
    case "br_id":
    case "rg":
    case "cnh":
      return BR_ID_FIELDS;
    case "visa":
    case "previous_visa":
      return VISA_FIELDS;
    case "marriage_cert":
    case "civil_union":
      return MARRIAGE_CERT_FIELDS;
    default:
      return [];
  }
}

/**
 * Extrai valor de um campo aninhado
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

/**
 * Define valor em um campo aninhado
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split(".");
  const last = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {};
    return acc[part];
  }, obj);
  target[last] = value;
}

