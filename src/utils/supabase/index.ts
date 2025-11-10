// src/utils/supabase/index.ts
import { supabase } from '@/utils/supabase'

export const projectUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// opcional, só se alguma parte do código quer o ID textual do projeto:
export const projectId = projectUrl?.match(/^https:\/\/([^.]+)\.supabase\.co/i)?.[1] ?? '';

export const supabase = createClient(projectUrl, publicAnonKey);
