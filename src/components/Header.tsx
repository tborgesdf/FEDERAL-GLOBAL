import { MapPin, Calendar, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    
    return `${dayName}, ${day} de ${month} de ${year} — ${hours}:${minutes}`;
  };

  const formatDateShort = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${day}/${month} — ${hours}:${minutes}`;
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
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div
              className="inline-block rounded-lg md:rounded-xl bg-white/60 p-2 md:p-3 shadow-[0_4px_12px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{ backdropFilter: "blur(8px)" }}
              onClick={onNavigateToHome}
            >
              <img
                src={logoImage}
                alt="Federal Express Brasil - Soluções Migratórias"
                className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto"
              />
            </div>
          </div>

          {/* Desktop: Informações à direita */}
          <div className="hidden lg:flex flex-col gap-3 flex-shrink-0">
            {/* Botões Login e Cadastrar-se / User Info */}
            <div className="flex items-center justify-end gap-2 lg:gap-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg bg-[#F5F6F8] px-3 py-1.5 border border-[#0A4B9E20]">
                    <div className="h-7 w-7 rounded-full bg-[#0A4B9E] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {userEmail?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#0A4B9E] max-w-[100px] xl:max-w-[150px] truncate">
                      {userEmail || "Usuário"}
                    </span>
                  </div>
                  <button
                    onClick={onNavigateToLogin}
                    onMouseEnter={() => setHoveredButton("logout")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="rounded-lg px-4 lg:px-5 py-1.5 text-sm font-semibold shadow-md transition-all duration-200"
                    style={{
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
                    className="rounded-lg px-4 lg:px-5 py-1.5 text-sm font-semibold shadow-md transition-all duration-200"
                    style={{
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
                    className="rounded-lg px-4 lg:px-5 py-1.5 text-sm font-semibold shadow-md transition-all duration-200 whitespace-nowrap"
                    style={{
                      backgroundColor: "#0058CC",
                      color: "white",
                      opacity: hoveredButton === "signup" ? 0.9 : 1,
                      transform: hoveredButton === "signup" ? "scale(1.03)" : "scale(1)"
                    }}
                  >
                    Cadastrar
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 flex-wrap justify-end">
              {/* Data e hora */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#0A4B9E] flex-shrink-0" />
                <span className="text-xs text-[#555] whitespace-nowrap">{formatDateShort(currentTime)}</span>
              </div>

              {/* Clima atual */}
              <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F8FA] px-2.5 py-1.5">
                <span className="text-lg">{mockWeatherData.icon}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-[#111]">{mockWeatherData.tempC}°C</span>
                  <span className="text-[10px] text-[#555] leading-tight">
                    {mockWeatherData.description}
                  </span>
                </div>
              </div>

              {/* Previsão - apenas em telas muito grandes */}
              <div className="hidden 2xl:flex gap-1.5">
                {mockWeatherData.forecast.slice(0, 3).map((day, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center rounded-lg bg-[#F7F8FA] px-1.5 py-1.5"
                  >
                    <span className="text-[10px] text-[#555]">
                      {getDayName(day.dateISO)}
                    </span>
                    <span className="text-sm">{day.icon}</span>
                    <span className="text-[10px] text-[#111]">
                      {day.maxC}°/{day.minC}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tablet: Versão simplificada */}
          <div className="hidden md:flex lg:hidden flex-col gap-2 flex-shrink-0 items-end ml-3">
            {/* Botões */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg bg-[#F5F6F8] px-2.5 py-1.5 border border-[#0A4B9E20]">
                    <div className="h-6 w-6 rounded-full bg-[#0A4B9E] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {userEmail?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#0A4B9E] max-w-[80px] truncate">
                      {userEmail || "User"}
                    </span>
                  </div>
                  <button
                    onClick={onNavigateToLogin}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#FF4444] text-white shadow-md transition-all hover:opacity-90"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onNavigateToLogin}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#0058CC] text-white shadow-md transition-all hover:opacity-90"
                  >
                    Login
                  </button>
                  <button
                    onClick={currentPage === "home" ? onNavigateToRegister : undefined}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#0058CC] text-white shadow-md transition-all hover:opacity-90 whitespace-nowrap"
                  >
                    Cadastrar
                  </button>
                </>
              )}
            </div>

            {/* Info compacta */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-[#F7F8FA] px-2 py-1">
                <span className="text-base">{mockWeatherData.icon}</span>
                <span className="text-xs font-medium text-[#111]">{mockWeatherData.tempC}°C</span>
              </div>
            </div>
          </div>

          {/* Mobile: Menu hambúrguer */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 rounded-md bg-[#F7F8FA] px-2 py-1">
              <span className="text-base">{mockWeatherData.icon}</span>
              <span className="text-xs font-medium text-[#111]">{mockWeatherData.tempC}°C</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#0058CC] text-white shadow-md transition-transform active:scale-95"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4 animate-in slide-in-from-top duration-200">
            {/* User info ou botões de autenticação */}
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-[#F5F6F8] px-4 py-3 border border-[#0A4B9E20]">
                  <div className="h-10 w-10 rounded-full bg-[#0A4B9E] flex items-center justify-center">
                    <span className="text-base font-bold text-white">
                      {userEmail?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[#0A4B9E]">
                    {userEmail || "Usuário"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onNavigateToLogin?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg px-4 py-3 text-base font-semibold bg-[#FF4444] text-white shadow-md transition-all active:scale-98"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigateToLogin?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg px-4 py-3 text-base font-semibold bg-[#0058CC] text-white shadow-md transition-all active:scale-98"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    if (currentPage === "home") onNavigateToRegister?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg px-4 py-3 text-base font-semibold bg-[#0058CC] text-white shadow-md transition-all active:scale-98"
                >
                  Cadastrar-se
                </button>
              </div>
            )}

            {/* Informações */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-[#555]">
                <MapPin className="h-4 w-4 text-[#0A4B9E]" />
                <span>{mockWeatherData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#555]">
                <Calendar className="h-4 w-4 text-[#0A4B9E]" />
                <span>{formatDateShort(currentTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#F7F8FA] px-3 py-2">
                <span className="text-2xl">{mockWeatherData.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#111]">{mockWeatherData.tempC}°C</span>
                  <span className="text-xs text-[#555]">{mockWeatherData.description}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
