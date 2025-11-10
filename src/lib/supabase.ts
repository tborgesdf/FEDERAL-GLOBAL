
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// DEBUG: log seguro (mostra só domínio, não a chave inteira)
console.log('[ENV CHECK]', {
  url,
  anonStartsWith: anon?.slice(0, 12),
});

export const supabase = createClient(url, anon);
