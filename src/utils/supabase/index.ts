/**
 * SUPABASE CLIENT - React + Vite
 * Único ponto de inicialização do client.
 */
import { createClient } from "@supabase/supabase-js";

// Variáveis expostas pelo Vite (dev: .env.local | prod: Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas nas variáveis de ambiente"
  );
}

// Instância do client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uso:
 *   import { supabase } from "@/utils/supabase";
 *   await supabase.auth.signInWithPassword({ email, password })
 *   await supabase.from("tabela").select("*")
 */


