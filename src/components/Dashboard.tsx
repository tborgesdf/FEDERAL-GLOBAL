import { useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import TickerBar from "./TickerBar";
import DashboardActions from "./DashboardActions";
import CurrencyCalculator from "./CurrencyCalculator";
import SummaryTipsCard from "./SummaryTipsCard";
import MultimediaSection from "./MultimediaSection";
import Footer from "./Footer";
import { toast } from "sonner@2.0.3";

interface DashboardProps {
  onLogout: () => void;
  userEmail?: string;
}

export default function Dashboard({ onLogout, userEmail }: DashboardProps) {
  const handleCardClick = (cardId: string) => {
    switch (cardId) {
      case "new-service":
        toast.info("Contratar Novo Serviço - Em desenvolvimento");
        break;
      case "in-progress":
        toast.info("Acompanhar Solicitações - Em desenvolvimento");
        break;
      case "history":
        toast.info("Histórico de Solicitações - Em desenvolvimento");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onNavigateToRegister={() => {}}
        onNavigateToLogin={onLogout}
        onNavigateToHome={() => {}}
        currentPage="dashboard"
        isLoggedIn={true}
        userEmail={userEmail}
      />
      
      <main>
        <Hero />
        <TickerBar />

        {/* Dashboard Content */}
        <section
          className="px-4 sm:px-6 md:px-8 lg:px-20"
          style={{
            marginTop: "64px",
            marginBottom: "48px"
          }}
        >
          <div className="max-w-[1440px] mx-auto">
            {/* Título da seção */}
            <h2
              className="mb-8"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "clamp(24px, 4vw, 36px)",
                fontWeight: 700,
                color: "#0A4B9E",
                textAlign: "center"
              }}
            >
              Área do Cliente
            </h2>

            {/* Cards de ação */}
            <div className="mb-12">
              <DashboardActions onCardClick={handleCardClick} />
            </div>

            {/* Calculadora + Resumo */}
            <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-8 items-start">
              {/* Calculadora */}
              <div>
                <CurrencyCalculator />
              </div>

              {/* Card Resumo & Dicas */}
              <div className="lg:sticky lg:top-24">
                <SummaryTipsCard />
              </div>
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
