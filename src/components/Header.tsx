import { MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import logoImage from "figma:asset/fdb4ef494a99e771ad2534fa1ee70561858f6471.png";
import { getWeatherData, initializeGeolocation } from "@/services/geolocationService";
import type { WeatherData } from "@/types/geolocation";
import { supabase } from "@/utils/supabase";

interface HeaderProps {
  onNavigateToRegister?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToCalculator?: () => void;
  currentPage?: "home" | "register" | "login" | "dashboard" | "calculator";
  isLoggedIn?: boolean;
  userEmail?: string;
}

// Dados padrão caso a API falhe
const defaultWeatherData: WeatherData = {
  location: "São Paulo, Brasil",
  tempC: 24,
  description: "Parcialmente nublado",
  icon: "⛅",
  fetchedAt: new Date().toISOString()
};

export default function Header({ onNavigateToRegister, onNavigateToLogin, onNavigateToHome, onNavigateToCalculator, currentPage = "home", isLoggedIn = false, userEmail = "" }: HeaderProps = {}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSticky, setIsSticky] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Carregar dados de clima ao montar o componente
  useEffect(() => {
    async function loadWeatherData() {
      try {
        setLoadingWeather(true);
        
        // Buscar user_id se estiver logado
        let userId: string | undefined;
        if (isLoggedIn) {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
        }

        // Buscar dados de clima (cache ou API)
        const data = await getWeatherData(userId);
        
        if (data) {
          setWeatherData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de clima:', error);
        // Mantém dados padrão em caso de erro
      } finally {
        setLoadingWeather(false);
      }
    }

    loadWeatherData();
  }, [isLoggedIn]);

  const formatDate = (date: Date) => {
    const days = [
      "domingo",
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado"
    ];
    const months = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${dayName}, ${day} de ${month} de ${year} – ${hours}:${minutes}`;
  };

  const getDayName = (dateISO: string) => {
    const date = new Date(dateISO);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[date.getDay()];
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        isSticky ? "shadow-lg" : "shadow-md"
      }`}
    >
      <div className="mx-auto max-w-[1920px] px-20">
        <div className="flex items-start justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div
              className="inline-block rounded-xl bg-white/60 p-3 shadow-[0_4px_12px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{ backdropFilter: "blur(8px)" }}
              onClick={onNavigateToHome}
            >
              <img
                src={logoImage}
                alt="Federal Express Brasil - Soluções Migratórias"
                className="h-24 w-auto"
              />
            </div>
          </div>

          {/* Informações à direita */}
          <div className="flex flex-col gap-4">
            {/* Botões Login e Cadastrar-se / User Info */}
            <div className="flex items-center justify-end gap-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-[#F5F6F8] px-4 py-2 border border-[#0A4B9E20]">
                    <div className="h-8 w-8 rounded-full bg-[#0A4B9E] flex items-center justify-center">
                      <span
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#FFFFFF"
                        }}
                      >
                        {userEmail?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0A4B9E"
                      }}
                    >
                      {userEmail || "Usuário"}
                    </span>
                  </div>
                  <button
                    onClick={onNavigateToLogin}
                    onMouseEnter={() => setHoveredButton("logout")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="rounded-xl px-6 py-2 shadow-lg transition-all duration-200"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      backgroundColor: "#FF4444",
                      color: "white",
                      opacity: hoveredButton === "logout" ? 0.9 : 1,
                      transform: hoveredButton === "logout" ? "scale(1.03)" : "scale(1)"
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onNavigateToCalculator}
                    onMouseEnter={() => setHoveredButton("calculator")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="rounded-xl px-6 py-2 shadow-lg transition-all duration-200"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      backgroundColor: "#10B981",
                      color: "white",
                      opacity: hoveredButton === "calculator" ? 0.9 : 1,
                      transform: hoveredButton === "calculator" ? "scale(1.03)" : "scale(1)"
                    }}
                    title="Calculadora de Moedas"
                  >
                    💱 Calculadora
                  </button>
                  
                  <button
                    onClick={onNavigateToLogin}
                    onMouseEnter={() => setHoveredButton("login")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="rounded-xl px-6 py-2 shadow-lg transition-all duration-200"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      backgroundColor: "#0058CC",
                      color: "white",
                      opacity: hoveredButton === "login" ? 0.9 : 1,
                      transform: hoveredButton === "login" ? "scale(1.03)" : "scale(1)"
                    }}
                  >
                    Login
                  </button>

                  <button
                    onClick={currentPage === "home" ? onNavigateToRegister : undefined}
                    onMouseEnter={() => setHoveredButton("signup")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="rounded-xl px-6 py-2 shadow-lg transition-all duration-200"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      backgroundColor: "#0058CC",
                      color: "white",
                      opacity: hoveredButton === "signup" ? 0.9 : 1,
                      transform: hoveredButton === "signup" ? "scale(1.03)" : "scale(1)"
                    }}
                  >
                    Cadastrar-se
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              {/* Localização */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0A4B9E]" />
                <span className="text-[#555]">
                  {loadingWeather ? "Carregando..." : weatherData.location}
                </span>
              </div>

              {/* Data e hora */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#0A4B9E]" />
                <span className="text-[#555]">{formatDate(currentTime)}</span>
              </div>

              {/* Clima atual */}
              <div className="flex items-center gap-2 rounded-lg bg-[#F7F8FA] px-3 py-2">
                {loadingWeather ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0A4B9E] border-t-transparent"></div>
                ) : (
                  <>
                    <span className="text-2xl">{weatherData.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-[#111]">{weatherData.tempC}°C</span>
                      <span className="text-xs text-[#555]">
                        {weatherData.description}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
