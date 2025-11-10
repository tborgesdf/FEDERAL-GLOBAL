import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d805caa8/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-d805caa8/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { cpf, email, password, name, phone } = body;

    // Validação básica
    if (!cpf || !email || !password || !name || !phone) {
      return c.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar CPF (11 dígitos)
    if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
      return c.json(
        { error: "CPF inválido. Deve conter 11 dígitos numéricos." },
        { status: 400 }
      );
    }

    // Validar telefone (11 dígitos)
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      return c.json(
        { error: "Telefone inválido. Deve conter 11 dígitos numéricos." },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com service role key para admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar se CPF já existe
    const existingUserByCPF = await kv.get(`user:cpf:${cpf}`);
    if (existingUserByCPF) {
      return c.json(
        { error: "CPF já cadastrado no sistema" },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { 
        name: name,
        phone: phone,
        cpf: cpf
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.error("Erro ao criar usuário no Supabase Auth:", authError);
      return c.json(
        { error: `Erro ao criar conta: ${authError.message}` },
        { status: 400 }
      );
    }

    // Salvar dados adicionais no KV Store
    const userId = authData.user?.id;
    if (userId) {
      const userData = {
        id: userId,
        cpf: cpf,
        name: name,
        email: email,
        phone: phone,
        createdAt: new Date().toISOString()
      };
      
      // Salvar por ID de usuário
      await kv.set(`user:${userId}`, userData);
      
      // Criar índice por CPF para verificação futura
      await kv.set(`user:cpf:${cpf}`, userId);
    }

    console.log(`Usuário criado com sucesso: ${email} (ID: ${userId}, CPF: ${cpf})`);

    return c.json({
      success: true,
      message: "Conta criada com sucesso",
      userId: userId
    });

  } catch (error) {
    console.error("Erro no endpoint de signup:", error);
    return c.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
});

// Login endpoint
app.post("/make-server-d805caa8/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return c.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Fazer login com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Erro ao fazer login:", error);
      return c.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      );
    }

    if (!data.session) {
      return c.json(
        { error: "Erro ao criar sessão" },
        { status: 500 }
      );
    }

    console.log(`Login realizado com sucesso: ${email} (User ID: ${data.user.id})`);

    return c.json({
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        phone: data.user.user_metadata?.phone
      }
    });

  } catch (error) {
    console.error("Erro no endpoint de login:", error);
    return c.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
});

// Recover password endpoint (enviar link de recuperação)
app.post("/make-server-d805caa8/recover-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar se o usuário existe
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    const userExists = userData?.users.some(u => u.email === email);
    
    if (!userExists) {
      // Por segurança, não revelamos que o email não existe
      console.log(`Tentativa de recuperação para email não existente: ${email}`);
      return c.json({
        success: true,
        message: "Se o email existir, um link de recuperação será enviado"
      });
    }

    // Gerar token de recuperação (simulado - em produção, usar Supabase email recovery)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hora

    // Salvar token no KV store
    await kv.set(`recovery:${token}`, {
      email: email,
      expiresAt: expiresAt,
      used: false
    });

    // Criar índice por email
    await kv.set(`recovery:email:${email}`, token);

    console.log(`Token de recuperação gerado para ${email}: ${token}`);
    console.log(`Link de recuperação: ?token=${token}`);

    // Em produção, enviar email aqui
    // Por enquanto, apenas retornar sucesso
    return c.json({
      success: true,
      message: "Link de recuperação enviado com sucesso",
      // Em desenvolvimento, retornar o token para teste
      token: token
    });

  } catch (error) {
    console.error("Erro no endpoint de recuperação:", error);
    return c.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
});

// Reset password endpoint (redefinir senha com token)
app.post("/make-server-d805caa8/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return c.json(
        { error: "Token e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return c.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar token no KV store
    const recoveryData = await kv.get(`recovery:${token}`);
    
    if (!recoveryData) {
      return c.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verificar se token já foi usado
    if (recoveryData.used) {
      return c.json(
        { error: "Token já foi utilizado" },
        { status: 400 }
      );
    }

    // Verificar expiração
    const expiresAt = new Date(recoveryData.expiresAt);
    if (expiresAt < new Date()) {
      return c.json(
        { error: "Token expirado" },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Buscar usuário por email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    const user = userData?.users.find(u => u.email === recoveryData.email);

    if (!user) {
      return c.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      return c.json(
        { error: `Erro ao redefinir senha: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Marcar token como usado
    await kv.set(`recovery:${token}`, {
      ...recoveryData,
      used: true,
      usedAt: new Date().toISOString()
    });

    console.log(`Senha redefinida com sucesso para ${recoveryData.email}`);

    return c.json({
      success: true,
      message: "Senha redefinida com sucesso"
    });

  } catch (error) {
    console.error("Erro no endpoint de reset de senha:", error);
    return c.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
});

Deno.serve(app.fetch);