/**
 * SELFIE SERVICE - Upload e validação de selfies
 */

import { supabase } from "@/utils/supabase";
import axios from "axios";
import { Selfie } from "@/types/application";

interface SelfieQualityResponse {
  accepted: boolean;
  qualityScore: number;
  rejectionReason?: string;
  storagePath?: string;
}

/**
 * Validar qualidade da selfie via API
 */
export async function validateSelfie(
  blob: Blob,
  applicationId: string
): Promise<SelfieQualityResponse> {
  try {
    // 1. Obter sessão
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    // 2. Preparar FormData
    const formData = new FormData();
    formData.append("file", blob, "selfie.jpg");
    formData.append("application_id", applicationId);

    // 3. Enviar para API
    const response = await axios.post<SelfieQualityResponse>(
      "/api/selfie-quality",
      formData,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Erro ao validar selfie:", error);
    throw new Error(
      error.response?.data?.error || "Erro ao validar selfie"
    );
  }
}

/**
 * Buscar selfie aprovada de uma aplicação
 */
export async function getSelfie(applicationId: string): Promise<Selfie | null> {
  const { data, error } = await supabase
    .from("selfies")
    .select("*")
    .eq("application_id", applicationId)
    .eq("accepted", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Buscar todas as selfies de uma aplicação
 */
export async function getAllSelfies(applicationId: string): Promise<Selfie[]> {
  const { data, error } = await supabase
    .from("selfies")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obter URL pública de uma selfie
 */
export async function getSelfieUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("selfies")
    .createSignedUrl(storagePath, 3600); // 1 hora

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Falha ao gerar URL");

  return data.signedUrl;
}

/**
 * Verificar se aplicação já tem selfie aprovada
 */
export async function hasSelfie(applicationId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("selfies")
    .select("id")
    .eq("application_id", applicationId)
    .eq("accepted", true)
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

/**
 * Deletar selfie
 */
export async function deleteSelfie(selfieId: string): Promise<void> {
  // 1. Buscar selfie para pegar storage_path
  const { data: selfie, error: fetchError } = await supabase
    .from("selfies")
    .select("storage_path")
    .eq("id", selfieId)
    .single();

  if (fetchError) throw fetchError;

  // 2. Deletar arquivo do Storage
  if (selfie.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("selfies")
      .remove([selfie.storage_path]);

    if (storageError) {
      console.warn("Erro ao deletar selfie do storage:", storageError);
    }
  }

  // 3. Deletar registro do banco
  const { error: deleteError } = await supabase
    .from("selfies")
    .delete()
    .eq("id", selfieId);

  if (deleteError) throw deleteError;
}

