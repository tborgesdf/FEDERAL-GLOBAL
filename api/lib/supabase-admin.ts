/**
 * SUPABASE ADMIN CLIENT (Server-side)
 * Usa Service Role Key para operações administrativas
 * NUNCA expor este client no browser
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas"
  );
}

// Client com privilégios de admin (bypassa RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verifica e extrai user_id de um JWT do Supabase
 */
export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/**
 * Registra ação em audit_logs
 */
export async function logAudit(params: {
  userId?: string;
  applicationId?: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      user_id: params.userId || null,
      application_id: params.applicationId || null,
      action: params.action,
      details: params.details || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}

