/**
 * ===========================================================
 *  🔐 SUPABASE CLIENT CONFIGURAÇÃO (Frontend / React + Vite)
 * ===========================================================
 *
 * Este arquivo é responsável por inicializar a conexão
 * com o banco de dados Supabase, permitindo que toda a
 * aplicação use o mesmo "client" (objeto supabase)
 * para autenticação, leitura e escrita de dados.
 *
 * OBS:
 *  - Este código roda no navegador (Vercel/React/Vite)
 *  - As variáveis de ambiente vêm do Vite: import.meta.env
 *  - NÃO usa "jsr:@supabase/supabase-js" (que é apenas p/ Deno)
 *
 * ===========================================================
 */

import { createClient } from "@supabase/supabase-js";
/**
 * Importa a função "createClient" diretamente da biblioteca oficial do Supabase.
 * Essa função é o ponto de entrada para criar uma instância de conexão com o backend Supabase.
 *
 * OBS: a versão correta para apps React/Vite é "@supabase/supabase-js"
 * e NÃO "jsr:@supabase/supabase-js@..." (que quebra no navegador).
 */

/**
 * ===========================================================
 *  ⚙️ VARIÁVEIS DE AMBIENTE
 * ===========================================================
 * 
 * As variáveis começam com o prefixo `VITE_` porque o Vite
 * só expõe ao navegador variáveis que seguem este padrão.
 * 
 * Você deve configurá-las no:
 *   - .env.local (em ambiente de desenvolvimento)
 *   - Vercel → Settings → Environment Variables
 * 
 * Exemplo:
 *   VITE_SUPABASE_URL = https://mhsuyzndkpprnyoqsbsz.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

/**
 * O sufixo "!" indica ao TypeScript que essas variáveis são obrigatórias
 * e estarão sempre definidas (evita warnings de "possibly undefined").
 */

/**
 * ===========================================================
 *  🧠 CRIAÇÃO DO CLIENT SUPABASE
 * ===========================================================
 *
 * A função "createClient" gera um objeto configurado com:
 *  - o endpoint (supabaseUrl)
 *  - a chave pública (supabaseAnonKey)
 *
 * Esse objeto tem acesso a todos os módulos do Supabase:
 *  - auth (login, signup, recuperação de senha)
 *  - from() (para ler/escrever dados no banco)
 *  - storage (para upload/download de arquivos)
 */

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Agora qualquer componente da aplicação pode importar o client:
 *
 *   import { supabase } from "@/utils/supabase";
 *
 * E utilizar, por exemplo:
 *   const { data, error } = await supabase.from("users").select("*");
 *   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 *
 * ===========================================================
 *  🧾 RESUMO
 * ===========================================================
 *
 * 🔹 Este arquivo deve existir apenas uma vez no projeto.
 * 🔹 Centraliza a configuração do Supabase (sem repetições).
 * 🔹 Permite escalar o sistema sem duplicar conexões.
 * 🔹 Compatível 100% com Vite + React + Supabase v2.x.
 * 🔹 Corrige o erro “createClient is not defined” em produção.
 *
 * ===========================================================
 */
