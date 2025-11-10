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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Fechar sidebar ao clicar fora
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

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

  const handleMenuItemClick = (action?: () => void) => {
    setSidebarOpen(false);
    if (action) action();
  };

  return (
    <>
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

            {/* Mobile/Tablet: Info mínima + Menu hambúrguer */}
            <div className="flex lg:hidden items-center gap-3 flex-shrink-0">
              {/* User info ou clima compacto */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2 rounded-lg bg-[#F5F6F8] px-2 py-1 border border-[#0A4B9E20]">
                  <div className="h-6 w-6 rounded-full bg-[#0A4B9E] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {userEmail?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#0A4B9E] max-w-[80px] truncate hidden sm:inline">
                    {userEmail || "User"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F8FA] px-2.5 py-1.5">
                  <span className="text-lg">{mockWeatherData.icon}</span>
                  <span className="text-xs font-medium text-[#111]">{mockWeatherData.tempC}°C</span>
                </div>
              )}

              {/* Botão Menu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg bg-[#0058CC] text-white shadow-md transition-transform active:scale-95"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header do Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#0A4B9E]">
            <h2 className="text-lg font-bold text-white">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo do Sidebar */}
          <div className="flex-1 overflow-y-auto">
            {/* User Info ou Botões de Auth */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-[#0A4B9E]/5 to-transparent">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-[#0A4B9E20]">
                    <div className="h-12 w-12 rounded-full bg-[#0A4B9E] flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {userEmail?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Conectado como</p>
                      <p className="text-sm font-semibold text-[#0A4B9E] truncate">
                        {userEmail || "Usuário"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMenuItemClick(onNavigateToLogin)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold bg-[#FF4444] text-white shadow-md transition-all hover:bg-[#FF3333] active:scale-98"
                  >
                    Sair da conta
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleMenuItemClick(onNavigateToLogin)}
                    className="w-full rounded-lg px-4 py-3 text-base font-semibold bg-[#0058CC] text-white shadow-md transition-all hover:bg-[#004BB5] active:scale-98"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => handleMenuItemClick(currentPage === "home" ? onNavigateToRegister : undefined)}
                    className="w-full rounded-lg px-4 py-3 text-base font-semibold bg-[#2BA84A] text-white shadow-md transition-all hover:bg-[#259640] active:scale-98"
                  >
                    Criar Conta
                  </button>
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="p-4 space-y-4">
              {/* Localização */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <MapPin className="h-5 w-5 text-[#0A4B9E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Localização</p>
                  <p className="text-sm font-medium text-gray-700">{mockWeatherData.location}</p>
                </div>
              </div>

              {/* Data e Hora */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <Calendar className="h-5 w-5 text-[#0A4B9E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Data e Hora</p>
                  <p className="text-sm font-medium text-gray-700">{formatDateShort(currentTime)}</p>
                </div>
              </div>

              {/* Clima Atual */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <p className="text-xs text-blue-600 mb-2 font-medium">Clima Atual</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{mockWeatherData.icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{mockWeatherData.tempC}°C</p>
                    <p className="text-sm text-blue-700">{mockWeatherData.description}</p>
                  </div>
                </div>
              </div>

              {/* Previsão */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Previsão dos Próximos Dias</p>
                <div className="grid grid-cols-2 gap-2">
                  {mockWeatherData.forecast.slice(0, 4).map((day, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-200"
                    >
                      <span className="text-xs text-gray-600 font-medium">
                        {getDayName(day.dateISO)}
                      </span>
                      <span className="text-2xl my-1">{day.icon}</span>
                      <span className="text-xs text-gray-700 font-medium">
                        {day.maxC}° / {day.minC}°
                    </span>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer do Sidebar */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-center text-gray-500">
              © 2025 Federal Express Brasil
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
