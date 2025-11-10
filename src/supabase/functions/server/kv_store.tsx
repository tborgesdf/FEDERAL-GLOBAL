// src/supabase/functions/server/kv_store.ts
/**
 * KV Store util para Edge Functions (Deno).
 * - Zero hardcode de projeto.
 * - Tabela configurável via ENV: KV_TABLE (default: 'kv_store')
 * - Lê segredos: SB_URL e SB_SERVICE_ROLE_KEY (NÃO usar prefixo SUPABASE_)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const TABLE_NAME = Deno.env.get("KV_TABLE") ?? "kv_store";

function getClient() {
  const url = Deno.env.get("SB_URL");
  const serviceKey = Deno.env.get("SB_SERVICE_ROLE_KEY");

  if (!url) throw new Error("SB_URL não definido em Edge Function Secrets.");
  if (!serviceKey) throw new Error("SB_SERVICE_ROLE_KEY não definido em Edge Function Secrets.");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** Define (upsert) uma chave com um valor JSON. */
export const set = async (key: string, value: unknown): Promise<void> => {
  const supabase = getClient();
  const { error } = await supabase.from(TABLE_NAME).upsert({ key, value });
  if (error) throw new Error(error.message);
};

/** Lê o valor JSON de uma chave. Retorna `undefined` se não existir. */
export const get = async <T = unknown>(key: string): Promise<T | undefined> => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value as T | undefined;
};

/** Remove uma chave. */
export const del = async (key: string): Promise<void> => {
  const supabase = getClient();
  const { error } = await supabase.from(TABLE_NAME).delete().eq("key", key);
  if (error) throw new Error(error.message);
};

/** Define várias chaves de uma vez (keys[i] ↔ values[i]). */
export const mset = async (keys: string[], values: unknown[]): Promise<void> => {
  if (keys.length !== values.length) {
    throw new Error("mset: 'keys' e 'values' precisam ter o mesmo tamanho.");
  }
  const supabase = getClient();
  const rows = keys.map((k, i) => ({ key: k, value: values[i] }));
  const { error } = await supabase.from(TABLE_NAME).upsert(rows);
  if (error) throw new Error(error.message);
};

/** Lê várias chaves de uma vez, preservando a ordem de 'keys'. */
export const mget = async <T = unknown>(keys: string[]): Promise<(T | undefined)[]> => {
  if (keys.length === 0) return [];
  const supabase = getClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("key, value")
    .in("key", keys);
  if (error) throw new Error(error.message);

  const map = new Map<string, T>();
  (data ?? []).forEach((row: any) => map.set(row.key as string, row.value as T));
  return keys.map(k => map.get(k));
};

/** Remove várias chaves de uma vez. */
export const mdel = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;
  const supabase = getClient();
  const { error } = await supabase.from(TABLE_NAME).delete().in("key", keys);
  if (error) throw new Error(error.message);
};

/** Busca valores por prefixo de chave. */
export const getByPrefix = async <T = unknown>(prefix: string): Promise<T[]> => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("value")
    .like("key", `${prefix}%`);
  if (error) throw new Error(error.message);
  return (data ?? []).map((d: any) => d.value as T);
};
