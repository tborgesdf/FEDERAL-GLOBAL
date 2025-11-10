import { useState } from "react";
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
  FileText, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  LockKeyhole
} from "lucide-react";

interface RegisterPageProps {
  onBackToHome: () => void;
}

export default function RegisterPage({ onBackToHome }: RegisterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    cpf: "",
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Máscara para CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  // Máscara para telefone
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.cpf || !formData.name || !formData.phone || !formData.email || !formData.password) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar CPF (11 dígitos)
    const cpfClean = formData.cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) {
      toast.error("CPF inválido. Digite 11 dígitos.");
      return;
    }

    // Validar telefone (11 dígitos)
    const phoneClean = formData.phone.replace(/\D/g, "");
    if (phoneClean.length !== 11) {
      toast.error("Telefone inválido. Use o formato (00) 00000-0000");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Você deve aceitar os termos de uso e política de privacidade");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d805caa8/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            cpf: cpfClean,
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: phoneClean
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso! Redirecionando...");
      
      // Limpar formulário
      setFormData({
        cpf: "",
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      // Redirecionar para home após 2 segundos
      setTimeout(() => {
        onBackToHome();
      }, 2000);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente.");
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
        
        {/* Register Form Container */}
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
                Crie sua conta
              </h2>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* CPF */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="cpf"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E"
                    }}
                  >
                    CPF *
                  </Label>
                  <div className="relative">
                    <FileText 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                    />
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                      required
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px",
                        color: "#0A4B9E"
                      }}
                    />
                  </div>
                  <p 
                    className="text-sm"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#888888"
                    }}
                  >
                    Digite apenas números
                  </p>
                </div>

                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="name"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E"
                    }}
                  >
                    Nome Completo *
                  </Label>
                  <div className="relative">
                    <User 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                    />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.name}
                      onChange={handleInputChange}
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

                {/* Telefone Celular */}
                <div className="space-y-2">
                  <Label 
                    htmlFor="phone"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E"
                    }}
                  >
                    Telefone Celular *
                  </Label>
                  <div className="relative">
                    <Phone 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                    />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      required
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px",
                        color: "#0A4B9E"
                      }}
                    />
                  </div>
                  <p 
                    className="text-sm"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#888888"
                    }}
                  >
                    Formato: (00) 00000-0000
                  </p>
                </div>

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
                      value={formData.email}
                      onChange={handleInputChange}
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
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px"
                      }}
                    />
                  </div>
                  <p 
                    className="text-sm"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      color: "#888888"
                    }}
                  >
                    Mínimo de 6 caracteres
                  </p>
                </div>

                {/* Confirmar Senha */}
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
                    Confirmar Senha *
                  </Label>
                  <div className="relative">
                    <LockKeyhole 
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors peer-focus:text-[#0A4B9E]" 
                    />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg transition-all focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "16px"
                      }}
                    />
                  </div>
                </div>

                {/* Checkbox Termos de Uso */}
                <div className="flex items-start gap-3 p-4 bg-[#F5F6F8] rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 cursor-pointer accent-[#0A4B9E] border-2 border-gray-300 rounded transition-all"
                    required
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="cursor-pointer select-none"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#111111",
                      lineHeight: "1.6"
                    }}
                  >
                    Li e aceito os{" "}
                    <a 
                      href="#" 
                      className="text-[#0A4B9E] hover:underline"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Termos de Uso
                    </a>
                    {" "}e a{" "}
                    <a 
                      href="#" 
                      className="text-[#0A4B9E] hover:underline"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Política de Privacidade
                    </a>
                    {" "}*
                  </label>
                </div>

                {/* Botão Finalizar Cadastro */}
                <Button
                  type="submit"
                  disabled={isLoading || !acceptedTerms}
                  className="w-full h-[56px] bg-[#2BA84A] hover:brightness-110 active:scale-[0.97] text-white transition-all duration-300 rounded-xl shadow-[0_6px_12px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600
                  }}
                >
                  {isLoading ? "Processando..." : "Finalizar Cadastro"}
                </Button>
              </form>
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