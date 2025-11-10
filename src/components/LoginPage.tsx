import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MultimediaSection from "./MultimediaSection";
import Footer from "./Footer";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// toast de feedback visual
import { toast } from "sonner";

// client central do Supabase (sempre importar daqui)
import { supabase } from "@/utils/supabase";

// ícones
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

/* -------------------------------------------------------------------------------------------------
   Tipagens simples dos props e do modo de tela
--------------------------------------------------------------------------------------------------*/
interface LoginPageProps {
  onBackToHome: () => void;
  onNavigateToRegister: () => void;
  onLoginSuccess?: (email: string) => void;
}
type PageMode = "login" | "recover" | "reset";

/* -------------------------------------------------------------------------------------------------
   Componente principal
--------------------------------------------------------------------------------------------------*/
export default function LoginPage({
  onBackToHome,
  onNavigateToRegister,
  onLoginSuccess,
}: LoginPageProps) {
  /* -----------------------------
     Estados locais dos formulários
  ------------------------------*/
  const [mode, setMode] = useState<PageMode>("login");
  const [isLoading, setIsLoading] = useState(false);

  // toggles para mostrar/ocultar senha nos inputs
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // quando voltamos do link de recuperação do Supabase, teremos sessão ativa
  // (hash na URL com access_token). Guardamos um flag simples para UX.
  const [recoveryReady, setRecoveryReady] = useState(false);

  // dados de cada formulário
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [recoverData, setRecoverData] = useState({ email: "" });
  const [resetData, setResetData] = useState({ newPassword: "", confirmPassword: "" });

  /* -------------------------------------------------------------------------------------------------
     Efeito 1 — Detecta o fluxo de recuperação ao entrar pela URL do e-mail

     - No "resetPasswordForEmail", definimos redirectTo = `${origin}?type=recovery`
     - O Supabase redireciona de volta com hash (#access_token...) e type=recovery.
     - Aqui fazemos duas coisas:
        1) Entramos em modo "reset"
        2) Conferimos se já existe sessão (getSession): se existir, podemos chamar updateUser
  --------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");
    if (type === "recovery") {
      setMode("reset");
      // tenta obter a sessão que o Supabase injeta a partir do hash da URL
      supabase.auth.getSession().then(({ data }) => {
        setRecoveryReady(!!data.session);
      });
    }
  }, []);

  /* -------------------------------------------------------------------------------------------------
     Handlers de alteração dos formulários
  --------------------------------------------------------------------------------------------------*/
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };
  const handleRecoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecoverData({ email: e.target.value });
  };
  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------------------------------------------------------------------------------------
     AÇÃO: Login

     Usa supabase.auth.signInWithPassword.
     Em caso de sucesso:
       - opcionalmente dispara callback onLoginSuccess
       - senão, volta para a Home após breve delay
  --------------------------------------------------------------------------------------------------*/
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      if (error) throw error;

      toast.success("Login realizado com sucesso!");

      // limpa formulário
      setLoginData({ email: "", password: "" });

      // redirecionamento
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(loginData.email);
        else onBackToHome();
      }, 1200);
    } catch (err) {
      console.error("Erro no login:", err);
      toast.error(
        err instanceof Error ? err.message : "Email ou senha incorretos. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------------------------------------------
     AÇÃO: Enviar e-mail de recuperação de senha

     Usa supabase.auth.resetPasswordForEmail com redirect para esta mesma origem,
     marcando `?type=recovery` para entrarmos no modo "reset" ao voltar.
  --------------------------------------------------------------------------------------------------*/
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoverData.email) {
      toast.error("Por favor, digite seu e-mail");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoverData.email, {
        redirectTo: `${window.location.origin}?type=recovery`,
      });
      if (error) throw error;

      toast.success("Link de recuperação enviado. Verifique seu e-mail.");
      setRecoverData({ email: "" });

      // volta para login após alguns segundos
      setTimeout(() => setMode("login"), 3000);
    } catch (err) {
      console.error("Erro na recuperação:", err);
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar e-mail. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------------------------------------------
     AÇÃO: Redefinir senha

     Pré-condições:
       - O usuário deve ter acessado esta tela pelo link do Supabase (type=recovery)
       - Isso cria uma sessão temporária (getSession() !== null)
     Implementação:
       - Chama supabase.auth.updateUser({ password: novaSenha })
  --------------------------------------------------------------------------------------------------*/
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetData.newPassword || !resetData.confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (resetData.newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      // garante que temos sessão de recuperação válida
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error(
          "Sessão de recuperação inválida. Abra o link enviado por e-mail e tente novamente."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: resetData.newPassword,
      });
      if (error) throw error;

      toast.success("Senha redefinida com sucesso!");

      // limpa formulário
      setResetData({ newPassword: "", confirmPassword: "" });

      // volta para login
      setTimeout(() => setMode("login"), 1500);
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      toast.error(
        err instanceof Error ? err.message : "Erro ao redefinir senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------------------------------------------------------
     Renderização
  --------------------------------------------------------------------------------------------------*/
  return (
    <div className="min-h-screen bg-white">
      <Header
        onNavigateToRegister={onNavigateToRegister}
        onNavigateToHome={onBackToHome}
        currentPage="login"
      />

      <main>
        <Hero />

        {/* Container do formulário */}
        <section
          className="px-4 sm:px-6 md:px-8 lg:px-20"
          style={{ marginTop: "64px", marginBottom: "96px" }}
        >
          <div className="mx-auto max-w-[720px]">
            <div
              className="bg-white rounded-2xl px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12"
              style={{
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                border: "1px solid rgba(10, 75, 158, 0.1)",
              }}
            >
              {/* Título dinâmico */}
              <h2
                className="text-center mb-6"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 700,
                  color: "#0A4B9E",
                  textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}
              >
                {mode === "login" && "Acesse sua conta"}
                {mode === "recover" && "Recuperar senha"}
                {mode === "reset" && "Redefinir senha"}
              </h2>

              {/* Subtítulo do modo de recuperação */}
              {mode === "recover" && (
                <p
                  className="text-center mb-8"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    color: "#666666",
                  }}
                >
                  Enviaremos um link para redefinir sua senha.
                </p>
              )}

              {/* =======================
                  MODO: LOGIN
              ======================== */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* E-mail */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E",
                      }}
                    >
                      E-mail *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        className="peer h-[52px] pl-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "16px",
                          color: "#0A4B9E",
                        }}
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E",
                      }}
                    >
                      Senha *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        minLength={6}
                        className="peer h-[52px] pl-12 pr-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "16px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A4B9E] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Botão Entrar */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[56px] bg-[#0A4B9E] hover:brightness-110 active:scale-[0.97] text-white transition-all duration-300 rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                    style={{ fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 600 }}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  {/* Link Esqueci minha senha */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode("recover")}
                      className="text-[#0A4B9E] hover:underline transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500 }}
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  {/* Link Criar conta */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#666666",
                      }}
                    >
                      Ainda não tem conta?{" "}
                      <button
                        type="button"
                        onClick={onNavigateToRegister}
                        className="text-[#2BA84A] hover:underline transition-all"
                        style={{ fontWeight: 600 }}
                      >
                        Criar conta
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* =======================
                  MODO: RECUPERAR SENHA
              ======================== */}
              {mode === "recover" && (
                <form onSubmit={handleRecover} className="space-y-6">
                  {/* E-mail */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="recover-email"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E",
                      }}
                    >
                      E-mail *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" />
                      <Input
                        id="recover-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={recoverData.email}
                        onChange={handleRecoverChange}
                        required
                        className="peer h-[52px] pl-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "16px",
                          color: "#0A4B9E",
                        }}
                      />
                    </div>
                  </div>

                  {/* Botão Enviar link */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[56px] bg-[#2BA84A] hover:brightness-110 active:scale-[0.97] text-white transition-all duration-300 rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                  >
                    {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>

                  {/* Link Voltar ao login */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="flex items-center justify-center gap-2 mx-auto text-[#0A4B9E] hover:underline transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500 }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar ao login
                    </button>
                  </div>
                </form>
              )}

              {/* =======================
                  MODO: REDEFINIR SENHA
              ======================== */}
              {mode === "reset" && (
                <form onSubmit={handleReset} className="space-y-6">
                  {/* Aviso caso a página não tenha sido aberta pelo link válido */}
                  {!recoveryReady && (
                    <div className="text-center text-sm text-red-600">
                      Abra esta página através do link recebido por e-mail para concluir a
                      redefinição de senha.
                    </div>
                  )}

                  {/* Nova senha */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E",
                      }}
                    >
                      Nova Senha *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={resetData.newPassword}
                        onChange={handleResetChange}
                        required
                        minLength={6}
                        className="peer h-[52px] pl-12 pr-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "16px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A4B9E] transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar nova senha */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E",
                      }}
                    >
                      Confirmar Nova Senha *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Digite a senha novamente"
                        value={resetData.confirmPassword}
                        onChange={handleResetChange}
                        required
                        minLength={6}
                        className="peer h-[52px] pl-12 pr-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "16px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A4B9E] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Botão Redefinir Senha */}
                  <Button
                    type="submit"
                    disabled={isLoading || !recoveryReady}
                    className="w-full h-[56px] bg-[#2BA84A] hover:brightness-110 active:scale-[0.97] text-white transition-all duration-300 rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                    style={{ fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 600 }}
                  >
                    {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Canal Migratório Federal Express */}
        <MultimediaSection />
      </main>

      <Footer />
    </div>
  );
}
