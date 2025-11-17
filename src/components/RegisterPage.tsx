import { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import MultimediaSection from "./MultimediaSection";
import Footer from "./Footer";
import TermosDeUsoSimples from "./TermosDeUsoSimples";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone, Calendar, CreditCard } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface RegisterPageProps {
  onBackToHome: () => void;
  onNavigateToLogin: () => void;
}

interface CaptchaOKResponse {
  data: {
    cpf: string;
    data_nascimento: string;
    nome_completo: string;
    sexo_genero: string;
  };
  status: string;
}

export default function RegisterPage({
  onBackToHome,
  onNavigateToLogin,
}: RegisterPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUnderageDialog, setShowUnderageDialog] = useState(false);
  const [isValidatingCPF, setIsValidatingCPF] = useState(false);
  const [showTermosDialog, setShowTermosDialog] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [form, setForm] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Função para validar CPF
  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, "");

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  // Função para calcular idade
  const calculateAge = (birthDate: string): number => {
    const [day, month, year] = birthDate.split("/").map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Função para consultar CPF na API CaptchaOK
  const consultCPF = async (cpf: string) => {
    try {
      setIsValidatingCPF(true);
      const cleanCPF = cpf.replace(/[^\d]/g, "");
      
      const response = await fetch(`https://captchaok.com/api/rf/busca-pessoa?cpf=${cleanCPF}`);
      const data: CaptchaOKResponse = await response.json();

      if (data.status === "success" && data.data) {
        // Preencher nome automaticamente se vazio
        if (!form.name) {
          setForm(prev => ({ ...prev, name: data.data.nome_completo }));
        }

        // Verificar idade
        const age = calculateAge(data.data.data_nascimento);
        if (age < 18) {
          setShowUnderageDialog(true);
          setForm(prev => ({ ...prev, cpf: "", birthDate: "" }));
          return false;
        }

        // Preencher data de nascimento se vazia
        if (!form.birthDate) {
          setForm(prev => ({ ...prev, birthDate: data.data.data_nascimento }));
        }

        toast.success("CPF validado com sucesso!");
        return true;
      } else {
        toast.error("CPF não encontrado na base de dados");
        return false;
      }
    } catch (error) {
      console.error("Erro ao consultar CPF:", error);
      toast.error("Erro ao validar CPF. Tente novamente.");
      return false;
    } finally {
      setIsValidatingCPF(false);
    }
  };

  // Função para formatar CPF
  const formatCPF = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  // Função para formatar telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  // Função para formatar data
  const formatDate = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 8) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2");
    }
    return value;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;

    // Formatar CPF
    if (name === "cpf") {
      formattedValue = formatCPF(value);
      setForm((prev) => ({ ...prev, [name]: formattedValue }));

      // Validar e consultar CPF quando completo
      const cleanCPF = formattedValue.replace(/[^\d]/g, "");
      if (cleanCPF.length === 11) {
        if (validateCPF(cleanCPF)) {
          await consultCPF(cleanCPF);
        } else {
          toast.error("CPF inválido");
        }
      }
      return;
    }

    // Formatar telefone
    if (name === "phone") {
      formattedValue = formatPhone(value);
    }

    // Formatar data
    if (name === "birthDate") {
      formattedValue = formatDate(value);
    }

    setForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos os campos obrigatórios
    if (!form.name || !form.cpf || !form.birthDate || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar CPF
    const cleanCPF = form.cpf.replace(/[^\d]/g, "");
    if (!validateCPF(cleanCPF)) {
      toast.error("CPF inválido");
      return;
    }

    // Validar data de nascimento
    if (form.birthDate.length !== 10) {
      toast.error("Data de nascimento inválida");
      return;
    }

    // Verificar idade
    const age = calculateAge(form.birthDate);
    if (age < 18) {
      setShowUnderageDialog(true);
      return;
    }

    // Validar telefone
    const cleanPhone = form.phone.replace(/[^\d]/g, "");
    if (cleanPhone.length !== 11) {
      toast.error("Telefone inválido. Use o formato (XX) XXXXX-XXXX");
      return;
    }

    // Validar senha
    if (form.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Validar aceite dos termos
    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os Termos de Uso para continuar");
      return;
    }

    // Solicitar geolocalização antes de criar conta
    toast.info("Solicitando permissão de localização...");
    
    // Solicitar permissão de geolocalização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("Geolocalização capturada:", geoData);
          toast.success("Localização capturada com sucesso!");
          // Criar conta com dados de geolocalização
          createAccount(geoData);
        },
        (error) => {
          console.warn("Geolocalização negada:", error);
          toast.warning("Localização não autorizada. Continuando sem GPS...");
          // Mesmo sem GPS, criar conta (sem dados de geolocalização)
          createAccount();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      toast.warning("Navegador não suporta geolocalização");
      createAccount();
    }
  };

  const createAccount = async (geoData?: { latitude: number; longitude: number }) => {
    setIsLoading(true);
    
    const cleanCPF = form.cpf.replace(/[^\d]/g, "");
    const cleanPhone = form.phone.replace(/[^\d]/g, "");

    // Capturar informações do dispositivo usando detecção avançada
    const { detectDevice } = await import('@/utils/deviceDetection');
    const deviceInfo = detectDevice();

    try {
      // Cadastro via Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            cpf: cleanCPF,
            birth_date: form.birthDate,
            phone: cleanPhone,
            termos_aceitos: true,
            data_aceite_termos: new Date().toISOString(),
            // Dados de geolocalização
            latitude: geoData?.latitude || null,
            longitude: geoData?.longitude || null,
            // Dados do dispositivo
            device_type: deviceInfo.type,
            device_browser: `${deviceInfo.browser} ${deviceInfo.browserVersion}`,
            device_os: `${deviceInfo.os} ${deviceInfo.osVersion}`,
            device_platform: deviceInfo.platform,
            device_language: deviceInfo.language,
            device_screen: deviceInfo.screenResolution,
            device_user_agent: deviceInfo.userAgent,
            device_brand: deviceInfo.brand,
            device_model: deviceInfo.model,
            device_full_name: deviceInfo.fullName,
            device_breakpoint: deviceInfo.breakpoint,
            device_is_touch: deviceInfo.isTouchDevice,
            device_is_retina: deviceInfo.isRetina,
          },
          emailRedirectTo: `${window.location.origin}?type=signup`,
        },
      });

      if (error) throw error;

      toast.success(
        "Conta criada com sucesso! Verifique seu e-mail para confirmar."
      );

      // Limpa formulário
      setForm({
        name: "",
        cpf: "",
        birthDate: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Redireciona para login
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
                {/* Nome Completo */}
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
                    Nome Completo *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="peer h-[52px] pl-12 border-gray-300 rounded-lg focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                    />
                  </div>
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label
                    htmlFor="cpf"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E",
                    }}
                  >
                    CPF *
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={handleChange}
                      maxLength={14}
                      required
                      className="peer h-[52px] pl-12 pr-12 border-gray-300 rounded-lg focus:border-[#0A4B9E] focus:ring-2 focus:ring-[rgba(10,75,158,0.25)]"
                    />
                    {isValidatingCPF && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A4B9E]"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Validação automática ao digitar
                  </p>
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label
                    htmlFor="birthDate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E",
                    }}
                  >
                    Data de Nascimento *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={form.birthDate}
                      onChange={handleChange}
                      maxLength={10}
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

                {/* Telefone Celular */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0A4B9E",
                    }}
                  >
                    Telefone Celular *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={15}
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

                {/* Checkbox Termos de Uso */}
                <div className="flex items-start space-x-3 py-4">
                  <Checkbox
                    id="accept-terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="accept-terms"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    Li e aceito os{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermosDialog(true);
                      }}
                      className="text-[#0A4B9E] font-semibold underline hover:text-[#083A7A] transition-colors"
                    >
                      Termos de Uso e Política de Privacidade
                    </button>
                  </label>
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

      {/* AlertDialog para usuários menores de 18 anos */}
      <AlertDialog open={showUnderageDialog} onOpenChange={setShowUnderageDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              Cadastro Negado
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-700 leading-relaxed pt-4">
              Apenas usuários <strong>maiores de 18 anos</strong> podem executar esta tarefa.
              <br />
              <br />
              Por favor, verifique suas informações e tente novamente quando atingir a idade mínima.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowUnderageDialog(false)}
              className="w-full bg-[#0A4B9E] hover:bg-[#083A7A] text-white font-semibold py-3 rounded-lg"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Termos de Uso (apenas visualização) */}
      <TermosDeUsoSimples
        isOpen={showTermosDialog}
        onClose={() => setShowTermosDialog(false)}
      />
    </div>
  );
}


