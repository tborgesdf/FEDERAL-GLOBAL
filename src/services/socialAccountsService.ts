/**
 * SOCIAL ACCOUNTS SERVICE - Gerenciamento de redes sociais
 */

import { supabase } from "@/utils/supabase";
import { SocialAccount } from "@/types/application";

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "x"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "snapchat"
  | "pinterest"
  | "kwai"
  | "messenger"
  | "telegram"
  | "other";

/**
 * Criar conta de rede social
 */
export async function createSocialAccount(
  applicationId: string,
  platform: SocialPlatform,
  handle: string
): Promise<SocialAccount> {
  const { data, error } = await supabase
    .from("social_accounts")
    .insert({
      application_id: applicationId,
      platform,
      handle: handle.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Buscar redes sociais de uma aplicação
 */
export async function getSocialAccounts(
  applicationId: string
): Promise<SocialAccount[]> {
  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Atualizar handle de uma rede social
 */
export async function updateSocialAccount(
  id: string,
  handle: string
): Promise<void> {
  const { error } = await supabase
    .from("social_accounts")
    .update({ handle: handle.trim() })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Deletar rede social
 */
export async function deleteSocialAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Criar múltiplas redes sociais de uma vez
 */
export async function bulkCreateSocialAccounts(
  applicationId: string,
  accounts: Array<{ platform: SocialPlatform; handle: string }>
): Promise<void> {
  // Filtrar handles vazios
  const validAccounts = accounts.filter((acc) => acc.handle.trim());

  if (validAccounts.length === 0) return;

  // Deletar redes sociais antigas
  await deleteAllSocialAccounts(applicationId);

  // Inserir novas
  const inserts = validAccounts.map((acc) => ({
    application_id: applicationId,
    platform: acc.platform,
    handle: acc.handle.trim(),
  }));

  const { error } = await supabase.from("social_accounts").insert(inserts);

  if (error) throw error;
}

/**
 * Deletar todas as redes sociais de uma aplicação
 */
export async function deleteAllSocialAccounts(
  applicationId: string
): Promise<void> {
  const { error } = await supabase
    .from("social_accounts")
    .delete()
    .eq("application_id", applicationId);

  if (error) throw error;
}

/**
 * Verificar se aplicação tem redes sociais
 */
export async function hasSocialAccounts(
  applicationId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("application_id", applicationId)
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

/**
 * Contar redes sociais de uma aplicação
 */
export async function countSocialAccounts(
  applicationId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("social_accounts")
    .select("*", { count: "exact", head: true })
    .eq("application_id", applicationId);

  if (error) throw error;
  return count || 0;
}

