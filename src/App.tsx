import Header from "./components/Header";
import Hero from "./components/Hero";
import MarketTicker from "./components/MarketTicker";
import RSSCarousel from "./components/RSSCarousel";
import MultimediaSection from "./components/MultimediaSection";
import Footer from "./components/Footer";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import DashboardAdmin from "./components/DashboardAdmin";
import AdminLogin from "./components/AdminLogin";
import CurrencyCalculatorPage from "./pages/CurrencyCalculatorPage";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "register" | "login" | "dashboard" | "calculator" | "admin" | "admin-login">("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Verificar se há sessão ativa ao carregar
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const email = localStorage.getItem("user_email");
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setCurrentPage("dashboard");
    }

    // Verificar autenticação admin
    const adminAuth = localStorage.getItem("admin_authenticated");
    const adminTimestamp = localStorage.getItem("admin_timestamp");
    if (adminAuth === "true" && adminTimestamp) {
      // Verificar se a sessão não expirou (24 horas)
      const timestamp = new Date(adminTimestamp).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAdminAuthenticated(true);
      } else {
        // Sessão expirada
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_email");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_timestamp");
      }
    }

    // Verificar hash na URL para acesso direto
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin') {
      if (isAdminAuthenticated) {
        setCurrentPage('admin');
      } else {
        setCurrentPage('admin-login');
      }
    }
  }, [isAdminAuthenticated]);

  // Listener para mudanças no hash da URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        const adminAuth = localStorage.getItem("admin_authenticated");
        if (adminAuth === "true") {
          setIsAdminAuthenticated(true);
          setCurrentPage('admin');
        } else {
          setCurrentPage('admin-login');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_timestamp");
    setIsAdminAuthenticated(false);
    setCurrentPage('home');
  };

  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    setIsLoggedIn(false);
    setUserEmail("");
    setCurrentPage("home");
  };

  // Mock data para carrossel de Migração
  const migrationArticles = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1436491065779-59f58e6537c6?w=800&q=80",
      category: "Atualidades",
      title: "Novas regras para visto americano entram em vigor em 2025",
      excerpt: "O Departamento de Estado dos EUA anunciou mudanças significativas no processo de solicitação de vistos para brasileiros. As novas diretrizes visam simplificar o processo e reduzir o tempo de espera.",
      dateISO: "2025-11-05T10:30:00Z",
      readMinutes: 5,
      href: "#"
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      category: "Atualidades",
      title: "Canadá amplia programa de imigração para trabalhadores qualificados",
      excerpt: "O governo canadense divulgou os novos critérios do Express Entry, priorizando profissionais de tecnologia, saúde e engenharia. O programa deve receber 500 mil novos residentes permanentes.",
      dateISO: "2025-11-04T14:20:00Z",
      readMinutes: 7,
      href: "#"
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
      category: "Atualidades",
      title: "Portugal facilita cidadania para brasileiros descendentes",
      excerpt: "Nova legislação portuguesa simplifica o processo de obtenção de cidadania para descendentes. Saiba quais documentos são necessários e como dar entrada no processo.",
      dateISO: "2025-11-03T09:15:00Z",
      readMinutes: 6,
      href: "#"
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1554224311-beee2aca88c7?w=800&q=80",
      category: "Atualidades",
      title: "Acordo bilateral Brasil-Austrália amplia oportunidades de trabalho",
      excerpt: "Novo tratado entre Brasil e Austrália facilita a emissão de vistos de trabalho temporário para profissionais brasileiros em setores estratégicos como mineração e agricultura.",
      dateISO: "2025-11-02T16:45:00Z",
      readMinutes: 4,
      href: "#"
    },
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80",
      category: "Atualidades",
      title: "Reino Unido lança novo visto para empreendedores brasileiros",
      excerpt: "O Innovator Founder Visa oferece oportunidades para empresários que desejam estabelecer negócios inovadores no Reino Unido. Investimento mínimo e requisitos detalhados.",
      dateISO: "2025-11-01T11:30:00Z",
      readMinutes: 8,
      href: "#"
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80",
      category: "Atualidades",
      title: "Mudanças na política migratória europeia afetam brasileiros",
      excerpt: "União Europeia implementa novo sistema de controle de fronteiras (EES). Entenda como as mudanças impactam viajantes brasileiros e o que você precisa saber antes de viajar.",
      dateISO: "2025-10-31T13:00:00Z",
      readMinutes: 6,
      href: "#"
    }
  ];

  // Mock data para carrossel de Viagem
  const travelTips = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      category: "Dicas",
      title: "10 destinos imperdíveis para conhecer na Europa em 2025",
      excerpt: "Descubra cidades charmosas, praias paradisíacas e montanhas impressionantes que prometem tornar sua viagem inesquecível. De Lisboa a Praga, conheça os melhores roteiros.",
      dateISO: "2025-11-06T08:00:00Z",
      readMinutes: 10,
      href: "#"
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
      category: "Dicas",
      title: "Como economizar em viagens internacionais: guia completo",
      excerpt: "Dicas práticas para reduzir custos com passagens, hospedagem e alimentação sem abrir mão de experiências incríveis. Aprenda a viajar mais gastando menos.",
      dateISO: "2025-11-05T15:30:00Z",
      readMinutes: 12,
      href: "#"
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
      category: "Dicas",
      title: "Seguro viagem: tudo que você precisa saber antes de embarcar",
      excerpt: "Entenda a importância do seguro viagem, como escolher a melhor cobertura e quais países exigem este documento obrigatoriamente. Proteja-se contra imprevistos.",
      dateISO: "2025-11-04T10:20:00Z",
      readMinutes: 8,
      href: "#"
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
      category: "Dicas",
      title: "Documentos essenciais para viagens internacionais em família",
      excerpt: "Checklist completo de documentos necessários ao viajar com crianças e adolescentes. Evite contratempos no aeroporto com nosso guia detalhado.",
      dateISO: "2025-11-03T12:45:00Z",
      readMinutes: 6,
      href: "#"
    },
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80",
      category: "Dicas",
      title: "Melhores apps de viagem para usar em 2025",
      excerpt: "Selecionamos os aplicativos indispensáveis para planejar, organizar e aproveitar ao máximo sua viagem. Desde tradutores até guias turísticos offline.",
      dateISO: "2025-11-02T09:00:00Z",
      readMinutes: 7,
      href: "#"
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80",
      category: "Dicas",
      title: "Roteiros personalizados: como planejar a viagem dos sonhos",
      excerpt: "Aprenda a criar itinerários sob medida, equilibrando pontos turísticos populares com experiências autênticas locais. Transforme sua viagem em uma aventura única.",
      dateISO: "2025-11-01T14:15:00Z",
      readMinutes: 9,
      href: "#"
    }
  ];

  return (
    <>
      <Toaster position="top-right" richColors />
      
      {/* Botão Flutuante de Acesso ao Dashboard Admin */}
      {currentPage !== "admin" && (
        <button
          onClick={() => {
            window.location.hash = 'admin';
            setCurrentPage('admin');
          }}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#0A4B9E] to-[#083A7A] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 font-semibold text-sm flex items-center gap-2"
          title="Acessar Dashboard Admin"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Admin
        </button>
      )}
      
      {currentPage === "home" ? (
        <div className="min-h-screen bg-white">
          <Header 
            onNavigateToRegister={() => setCurrentPage("register")}
            onNavigateToLogin={() => setCurrentPage("login")}
            onNavigateToHome={() => setCurrentPage("home")}
            onNavigateToCalculator={() => setCurrentPage("calculator")}
            currentPage="home"
          />
          
          <main>
            <Hero />
            <MarketTicker />
            
            {/* Seção Atualidades sobre Migração e Turismo */}
            <RSSCarousel
              title="Atualidades sobre Migração e Turismo"
              icon="briefcase"
              items={migrationArticles}
              accentColor="#0A4B9E"
            />

            {/* Seção Dicas de Viagem */}
            <RSSCarousel
              title="Dicas de Viagem"
              icon="plane"
              items={travelTips}
              accentColor="#7C6EE4"
            />

            <MultimediaSection />
          </main>
          <Footer />
        </div>
      ) : currentPage === "register" ? (
        <RegisterPage 
          onBackToHome={() => setCurrentPage("home")}
          onNavigateToLogin={() => setCurrentPage("login")}
        />
      ) : currentPage === "login" ? (
        <LoginPage 
          onBackToHome={() => setCurrentPage("home")}
          onNavigateToRegister={() => setCurrentPage("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentPage === "calculator" ? (
        <CurrencyCalculatorPage />
      ) : currentPage === "admin-login" ? (
        <AdminLogin 
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={() => setCurrentPage("home")}
        />
      ) : currentPage === "admin" ? (
        isAdminAuthenticated ? (
          <DashboardAdmin onLogout={handleAdminLogout} />
        ) : (
          <AdminLogin 
            onLoginSuccess={handleAdminLoginSuccess}
            onBack={() => setCurrentPage("home")}
          />
        )
      ) : (
        <Dashboard 
          onLogout={handleLogout}
          userEmail={userEmail}
        />
      )}
    </>
  );
}
