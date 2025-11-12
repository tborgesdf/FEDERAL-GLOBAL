/**
 * PÁGINA: ESTADO CIVIL
 * Primeira etapa do fluxo - escolher estado civil
 */

import { useState } from "react";
import { Check, Heart, Users, User } from "lucide-react";
import StepLayout from "@/components/flow/StepLayout";
import { CivilStatus } from "@/types/application";

interface CivilStatusOption {
  value: CivilStatus;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CIVIL_STATUS_OPTIONS: CivilStatusOption[] = [
  {
    value: "single",
    title: "Não sou casado oficialmente",
    description: "Solteiro(a), divorciado(a) ou viúvo(a)",
    icon: <User className="h-8 w-8" />,
    color: "#0A4B9E",
  },
  {
    value: "married",
    title: "Sou casado(a) oficialmente",
    description: "Possuo certidão de casamento emitida por cartório brasileiro",
    icon: <Heart className="h-8 w-8" />,
    color: "#E63946",
  },
  {
    value: "stable_union",
    title: "União estável",
    description: "Possuo declaração de união estável registrada em cartório",
    icon: <Users className="h-8 w-8" />,
    color: "#06A77D",
  },
];

interface CivilStatusPageProps {
  currentApplication?: {
    id: string;
    civil_status?: CivilStatus;
    visa_type: 'first' | 'renewal';
  };
  onSave: (civilStatus: CivilStatus) => Promise<void>;
  onNext: () => void;
  onBack?: () => void;
}

export default function CivilStatusPage({
  currentApplication,
  onSave,
  onNext,
  onBack,
}: CivilStatusPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<CivilStatus | null>(
    currentApplication?.civil_status || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (status: CivilStatus) => {
    setSelectedStatus(status);
  };

  const handleNext = async () => {
    if (!selectedStatus) return;

    setIsLoading(true);
    try {
      await onSave(selectedStatus);
      onNext();
    } catch (error) {
      console.error("Erro ao salvar estado civil:", error);
      // Toast de erro será exibido pelo componente pai
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepLayout
      title="Qual é o seu estado civil?"
      subtitle="Esta informação é importante para definir os documentos necessários."
      currentStep={1}
      totalSteps={8}
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={!selectedStatus}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CIVIL_STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatus === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={isLoading}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-[#0A4B9E] bg-blue-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-[#0A4B9E] focus:ring-offset-2
                `}
                aria-pressed={isSelected}
              >
                {/* Check icon */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-[#0A4B9E] text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className="mb-4 flex items-center justify-center"
                  style={{ color: isSelected ? option.color : "#6B7280" }}
                >
                  {option.icon}
                </div>

                {/* Title */}
                <h3
                  className={`text-lg font-bold mb-2 ${
                    isSelected ? "text-[#0A4B9E]" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {option.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm text-gray-600 text-center"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Info box se casado ou união estável */}
        {(selectedStatus === "married" || selectedStatus === "stable_union") && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Você precisará enviar sua certidão
                </p>
                <p className="text-sm text-blue-800" style={{ fontFamily: "Inter, sans-serif" }}>
                  {selectedStatus === "married"
                    ? "Em uma das próximas etapas, você deverá enviar a certidão de casamento emitida por cartório brasileiro."
                    : "Em uma das próximas etapas, você deverá enviar a declaração de união estável registrada em cartório."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#0A4B9E] hover:underline text-sm font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Precisa de ajuda? Fale conosco
          </a>
        </div>
      </div>
    </StepLayout>
  );
}

