import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

// Credenciais do Super Admin
const SUPER_ADMIN_EMAIL = "tbogesdf.ai@gmail.com";
const SUPER_ADMIN_PASSWORD = "Ale290800";

export default function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Verificar credenciais do super admin
    if (email !== SUPER_ADMIN_EMAIL || password !== SUPER_ADMIN_PASSWORD) {
      toast.error("Credenciais inválidas. Acesso restrito.");
      return;
    }

    setIsLoading(true);

    try {
      // Tentar fazer login no Supabase (opcional, para manter sessão)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
      });

      // Mesmo se o login no Supabase falhar, permitir acesso se as credenciais estiverem corretas
      // Isso permite acesso mesmo se o usuário não existir no Supabase ainda
      
      // Capturar informações do dispositivo e geolocalização
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        deviceType: /mobile/i.test(navigator.userAgent) ? 'Mobile' : /tablet/i.test(navigator.userAgent) ? 'Tablet' : 'Desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 
                 navigator.userAgent.includes('Edge') ? 'Edge' : 'Outro',
        os: navigator.platform.includes('Win') ? 'Windows' : 
            navigator.platform.includes('Mac') ? 'macOS' : 
            navigator.platform.includes('Linux') ? 'Linux' : 
            /android/i.test(navigator.userAgent) ? 'Android' : 
            /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'iOS' : 'Outro',
      };

      // Tentar obter geolocalização
      let geoData: { latitude?: number; longitude?: number } = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
          geoData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (geoError) {
          console.warn("Geolocalização não disponível:", geoError);
        }
      }

      // Salvar log de acesso no banco de dados
      try {
        await fetch("/api/admin/log-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_email: SUPER_ADMIN_EMAIL,
            admin_name: "Thiago Ferreira Alves e Borges",
            admin_id: null, // Será preenchido quando o admin for criado no banco
            cpf: "027.692.569-63",
            phone: "(61) 998980312",
            ip_address: null, // Será capturado no backend
            user_agent: deviceInfo.userAgent,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            device_type: deviceInfo.deviceType,
            device_browser: deviceInfo.browser,
            device_os: deviceInfo.os,
            device_platform: deviceInfo.platform,
            device_language: deviceInfo.language,
            device_screen: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
            connection_type: "4G", // Pode ser melhorado com API de detecção
            carrier: null,
            login_successful: true,
          }),
        });
      } catch (logError) {
        console.error("Erro ao salvar log de acesso:", logError);
        // Não bloquear login se o log falhar
      }

      // Salvar sessão admin no localStorage
      localStorage.setItem("admin_authenticated", "true");
      localStorage.setItem("admin_email", SUPER_ADMIN_EMAIL);
      localStorage.setItem("admin_role", "super_admin");
      localStorage.setItem("admin_timestamp", new Date().toISOString());

      toast.success("Acesso autorizado! Bem-vindo, Super Admin.");
      
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } catch (err) {
      console.error("Erro no login admin:", err);
      // Mesmo com erro, permitir acesso se credenciais estiverem corretas
      localStorage.setItem("admin_authenticated", "true");
      localStorage.setItem("admin_email", SUPER_ADMIN_EMAIL);
      localStorage.setItem("admin_role", "super_admin");
      localStorage.setItem("admin_timestamp", new Date().toISOString());
      
      toast.success("Acesso autorizado! Bem-vindo, Super Admin.");
      
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A4B9E] via-[#0E5BB5] to-[#083A7A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin</h1>
            <p className="text-gray-600">Acesso restrito ao painel administrativo</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-semibold">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-semibold">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-14 border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Botão Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Acessar Painel Admin"
              )}
            </Button>

            {/* Botão Voltar */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o site
              </button>
            )}
          </form>

          {/* Aviso de Segurança */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-xs text-yellow-800 text-center">
              <Shield className="h-4 w-4 inline mr-1" />
              Acesso restrito. Apenas administradores autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

