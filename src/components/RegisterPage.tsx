import { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MultimediaSection from "./MultimediaSection";
import Footer from "./Footer";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from "lucide-react";

interface RegisterPageProps {
  onBackToHome: () => void;
  onNavigateToLogin: () => void;
}

export default function RegisterPage({
  onBackToHome,
  onNavigateToLogin,
}: RegisterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      // Cadastro via Supabase Auth (sem Edge Functions)
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        // dados opcionais para o user (metadata)
        options: {
          data: { full_name: form.name },
          // se quiser forçar o link de confirmação a voltar para o seu site:
          emailRedirectTo: `${window.location.origin}?type=signup`,
        },
      });
      if (error) throw error;

      toast.success(
        "Conta criada! Verifique seu e-mail para confirmar (se a confirmação estiver habilitada)."
      );

      // limpa formulário
      setForm({ name: "", email: "", password: "", confirmPassword: "" });

      // direciona para login
      setTimeout(() => onNavigateToLogin(), 1500);
    } catch (err) {
      console.error("Erro no cadastro:", err);
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar a conta. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onNavigateToRegister={() => {}}
        onNavigateToHome={onBackToHome}
        currentPage="register"
      />
      <main>
        <Hero />

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
                Crie sua conta
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E",
                    }}
                  >
                    Nome *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                    />
                  </div>
                </div>

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
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
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
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="peer h-[52px] pl-12 pr-12 border-gray-300 rounded-lg focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A4B9E]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar senha */}
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
                    Confirmar senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="peer h-[52px] pl-12 pr-12 border-gray-300 rounded-lg focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A4B9E]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Botão Cadastrar */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[56px] bg-[#2BA84A] hover:brightness-110 active:scale-[0.97] text-white rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.25)] disabled:opacity-50"
                >
                  {isLoading ? "Cadastrando..." : "Criar conta"}
                </Button>

                {/* Link para login */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="flex items-center justify-center gap-2 mx-auto text-[#0A4B9E] hover:underline transition-all"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500 }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Já tenho conta (entrar)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <MultimediaSection />
      </main>
      <Footer />
    </div>
  );
}
