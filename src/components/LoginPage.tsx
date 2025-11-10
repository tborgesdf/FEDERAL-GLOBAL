import { useState, useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MultimediaSection from "./MultimediaSection";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  ArrowLeft
} from "lucide-react";

interface LoginPageProps {
  onBackToHome: () => void;
  onNavigateToRegister: () => void;
  onLoginSuccess?: (email: string) => void;
}

type PageMode = "login" | "recover" | "reset";

export default function LoginPage({ onBackToHome, onNavigateToRegister, onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<PageMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [recoverData, setRecoverData] = useState({
    email: ""
  });

  const [resetData, setResetData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Verificar se há um token de reset na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setResetToken(token);
      setMode("reset");
    }
  }, []);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecoverData({ email: e.target.value });
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d805caa8/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      // Armazenar token de sessão
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_email", loginData.email);

      toast.success("Login realizado com sucesso! Redirecionando...");

      // Limpar formulário
      setLoginData({ email: "", password: "" });

      // Chamar callback de sucesso
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess(loginData.email);
        }, 1500);
      } else {
        // Fallback: Redirecionar para home
        setTimeout(() => {
          onBackToHome();
        }, 1500);
      }

    } catch (error) {
      console.error("Erro no login:", error);
      toast.error(error instanceof Error ? error.message : "Email ou senha incorretos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Recuperar senha
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoverData.email) {
      toast.error("Por favor, digite seu e-mail");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d805caa8/recover-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: recoverData.email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar e-mail de recuperação");
      }

      toast.success("Link de recuperação enviado. Verifique seu e-mail.");
      
      // Limpar formulário
      setRecoverData({ email: "" });

      // Voltar para login após 3 segundos
      setTimeout(() => {
        setMode("login");
      }, 3000);

    } catch (error) {
      console.error("Erro na recuperação:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar e-mail. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redefinir senha
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d805caa8/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            token: resetToken,
            newPassword: resetData.newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      toast.success("Senha redefinida com sucesso! Faça login com sua nova senha.");

      // Limpar formulário e token
      setResetData({ newPassword: "", confirmPassword: "" });
      setResetToken("");

      // Voltar para login
      setTimeout(() => {
        setMode("login");
      }, 2000);

    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onNavigateToRegister={onNavigateToRegister}
        onNavigateToHome={onBackToHome}
        currentPage="login" 
      />
      <main>
        <Hero />
        
        {/* Login Form Container */}
        <section 
          className="px-4 sm:px-6 md:px-8 lg:px-20"
          style={{
            marginTop: "64px",
            marginBottom: "96px"
          }}
        >
          <div className="mx-auto max-w-[720px]">
            <div 
              className="bg-white rounded-2xl px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12"
              style={{
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                border: "1px solid rgba(10, 75, 158, 0.1)"
              }}
            >
              {/* Título */}
              <h2
                className="text-center mb-6"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 700,
                  color: "#0A4B9E",
                  textShadow: "0 2px 4px rgba(0,0,0,0.15)"
                }}
              >
                {mode === "login" && "Acesse sua conta"}
                {mode === "recover" && "Recuperar senha"}
                {mode === "reset" && "Redefinir senha"}
              </h2>

              {/* Subtítulo (apenas modo recuperação) */}
              {mode === "recover" && (
                <p
                  className="text-center mb-8"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    color: "#666666"
                  }}
                >
                  Enviaremos um link para redefinir sua senha.
                </p>
              )}

              {/* MODO: LOGIN */}
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
                        color: "#0A4B9E"
                      }}
                    >
                      E-mail *
                    </Label>
                    <div className="relative">
                      <Mail 
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                      />
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
                          color: "#0A4B9E"
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
                        color: "#0A4B9E"
                      }}
                    >
                      Senha *
                    </Label>
                    <div className="relative">
                      <Lock 
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                      />
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
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "16px"
                        }}
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
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "18px",
                      fontWeight: 600
                    }}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  {/* Link Esqueci minha senha */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode("recover")}
                      className="text-[#0A4B9E] hover:underline transition-all"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500
                      }}
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
                        color: "#666666"
                      }}
                    >
                      Ainda não tem conta?{" "}
                      <button
                        type="button"
                        onClick={onNavigateToRegister}
                        className="text-[#2BA84A] hover:underline transition-all"
                        style={{
                          fontWeight: 600
                        }}
                      >
                        Criar conta
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* MODO: RECUPERAR SENHA */}
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
                        color: "#0A4B9E"
                      }}
                    >
                      E-mail *
                    </Label>
                    <div className="relative">
                      <Mail 
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                      />
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
                          color: "#0A4B9E"
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
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar ao login
                    </button>
                  </div>
                </form>
              )}

              {/* MODO: REDEFINIR SENHA */}
              {mode === "reset" && (
                <form onSubmit={handleReset} className="space-y-6">
                  {/* Nova Senha */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="newPassword"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E"
                      }}
                    >
                      Nova Senha *
                    </Label>
                    <div className="relative">
                      <Lock 
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                      />
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
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "16px"
                        }}
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

                  {/* Confirmar Nova Senha */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="confirmPassword"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E"
                      }}
                    >
                      Confirmar Nova Senha *
                    </Label>
                    <div className="relative">
                      <Lock 
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                      />
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
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "16px"
                        }}
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
                    disabled={isLoading}
                    className="w-full h-[56px] bg-[#2BA84A] hover:brightness-110 active:scale-[0.97] text-white transition-all duration-300 rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "18px",
                      fontWeight: 600
                    }}
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