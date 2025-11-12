/**
 * DOCUMENT SERVICE - Upload e gerenciamento de documentos
 */

import { supabase } from "@/utils/supabase";
import axios from "axios";
import { Document, DocumentType, DocumentSide } from "@/types/application";

/**
 * Upload de documento com OCR
 */
export async function uploadDocument(
  file: File | Blob,
  applicationId: string,
  docType: DocumentType,
  side?: DocumentSide
): Promise<{ document: Document; ocrData: any }> {
  try {
    // 1. Obter sessão
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    // 2. Preparar FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("application_id", applicationId);
    formData.append("doc_type", docType);
    formData.append("side", side || "single");

    // 3. Enviar para API OCR
    const response = await axios.post("/api/ocr", formData, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erro ao fazer upload de documento:", error);
    throw new Error(error.response?.data?.error || "Erro ao fazer upload");
  }
}

/**
 * Buscar documentos de uma aplicação
 */
export async function getDocuments(applicationId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Buscar documentos por tipo
 */
export async function getDocumentsByType(
  applicationId: string,
  docType: DocumentType
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("application_id", applicationId)
    .eq("doc_type", docType)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Atualizar dados OCR de um documento (após revisão)
 */
export async function updateDocumentOcr(
  documentId: string,
  ocrData: any
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({
      ocr_json: ocrData,
      verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) throw error;
}

/**
 * Deletar documento
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // 1. Buscar documento para pegar storage_path
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Deletar arquivo do Storage
  if (doc.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.storage_path]);

    if (storageError) {
      console.warn("Erro ao deletar arquivo do storage:", storageError);
    }
  }

  // 3. Deletar registro do banco
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) throw deleteError;
}

/**
 * Obter URL pública de um documento
 */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 3600); // 1 hora

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Falha ao gerar URL");

  return data.signedUrl;
}

/**
 * Verificar se documento já foi enviado
 */
export async function hasDocument(
  applicationId: string,
  docType: DocumentType,
  side?: DocumentSide
): Promise<boolean> {
  let query = supabase
    .from("documents")
    .select("id")
    .eq("application_id", applicationId)
    .eq("doc_type", docType);

  if (side) {
    query = query.eq("side", side);
  }

  const { data, error } = await query.limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

