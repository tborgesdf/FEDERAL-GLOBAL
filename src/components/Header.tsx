import { MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import logoImage from "figma:asset/fdb4ef494a99e771ad2534fa1ee70561858f6471.png";

// Mock data structure para futura integração de API
interface WeatherData {
  location: string;
  tempC: number;
  description: string;
  icon: string;
  forecast: Array<{
    dateISO: string;
    minC: number;
    maxC: number;
    icon: string;
  }>;
  fetchedAt: string;
}

interface HeaderProps {
  onNavigateToRegister?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
  currentPage?: "home" | "register" | "login" | "dashboard";
  isLoggedIn?: boolean;
  userEmail?: string;
}

const mockWeatherData: WeatherData = {
  location: "São Paulo, Brasil",
  tempC: 24,
  description: "Parcialmente nublado",
  icon: "⛅",
  forecast: [
    { dateISO: "2025-11-07", minC: 18, maxC: 26, icon: "⛅" },
    { dateISO: "2025-11-08", minC: 19, maxC: 27, icon: "☀️" },
    { dateISO: "2025-11-09", minC: 17, maxC: 25, icon: "🌧️" },
    { dateISO: "2025-11-10", minC: 16, maxC: 23, icon: "⛈️" },
    { dateISO: "2025-11-11", minC: 18, maxC: 26, icon: "☀️" }
  ],
  fetchedAt: "2025-11-06T20:21:00Z"
};

export default function Header({ onNavigateToRegister, onNavigateToLogin, onNavigateToHome, currentPage = "home", isLoggedIn = false, userEmail = "" }: HeaderProps = {}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSticky, setIsSticky] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

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
                <span className="text-[#555]">{mockWeatherData.location}</span>
              </div>

              {/* Data e hora */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#0A4B9E]" />
                <span className="text-[#555]">{formatDate(currentTime)}</span>
              </div>

              {/* Clima atual */}
              <div className="flex items-center gap-2 rounded-lg bg-[#F7F8FA] px-3 py-2">
                <span className="text-2xl">{mockWeatherData.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[#111]">{mockWeatherData.tempC}°C</span>
                  <span className="text-xs text-[#555]">
                    {mockWeatherData.description}
                  </span>
                </div>
              </div>

              {/* Previsão 5 dias */}
              <div className="flex gap-2">
                {mockWeatherData.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center rounded-lg bg-[#F7F8FA] px-2 py-2"
                  >
                    <span className="text-xs text-[#555]">
                      {getDayName(day.dateISO)}
                    </span>
                    <span className="text-lg">{day.icon}</span>
                    <span className="text-xs text-[#111]">
                      {day.maxC}° / {day.minC}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}