/**
 * STEP LAYOUT
 * Layout padrão para todas as páginas do fluxo de aplicação
 */

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  isLoading?: boolean;
}

export default function StepLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Próximo",
  isLoading = false,
}: StepLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <Header
        onNavigateToRegister={() => {}}
        onNavigateToLogin={() => {}}
        onNavigateToHome={() => {}}
        currentPage="dashboard"
        isLoggedIn={true}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Etapa {currentStep} de {totalSteps}
              </span>
              <span className="text-sm font-medium text-[#0A4B9E]">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            {children}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            {onBack ? (
              <button
                onClick={onBack}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <ChevronLeft className="h-5 w-5" />
                Voltar
              </button>
            ) : (
              <div />
            )}

            {onNext && (
              <button
                onClick={onNext}
                disabled={nextDisabled || isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {isLoading ? "Processando..." : nextLabel}
                {!isLoading && <ChevronRight className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

