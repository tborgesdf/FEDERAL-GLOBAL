import { PlusCircle, Clock, FileText } from "lucide-react";

interface ActionCard {
  id: string;
  title: string;
  description: string;
  icon: "plus" | "clock" | "history";
  color: string;
}

const actionCards: ActionCard[] = [
  {
    id: "new-service",
    title: "Contratar Novo Serviço",
    description: "Solicite câmbio, remessas internacionais ou outros serviços financeiros",
    icon: "plus",
    color: "#0A4B9E"
  },
  {
    id: "in-progress",
    title: "Acompanhar Solicitação em Andamento",
    description: "Visualize o status das suas operaçéµes em processamento",
    icon: "clock",
    color: "#2BA84A"
  },
  {
    id: "history",
    title: "Histórico de Solicitaçéµes",
    description: "Acesse todas as suas transaçéµes e operaçéµes anteriores",
    icon: "history",
    color: "#7C6EE4"
  }
];

interface DashboardActionsProps {
  onCardClick?: (cardId: string) => void;
}

export default function DashboardActions({ onCardClick }: DashboardActionsProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "plus":
        return <PlusCircle className="h-8 w-8" />;
      case "clock":
        return <Clock className="h-8 w-8" />;
      case "history":
        return <FileText className="h-8 w-8" />;
      default:
        return <PlusCircle className="h-8 w-8" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actionCards.map((card) => (
        <button
          key={card.id}
          onClick={() => onCardClick?.(card.id)}
          className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(10, 75, 158, 0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
          }}
        >
          {/* Gradient overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${card.color} 0%, transparent 100%)`
            }}
          />

          {/* Conteúdo */}
          <div className="relative z-10">
            {/* écone */}
            <div
              className="inline-flex items-center justify-center rounded-xl p-3 mb-4 transition-all duration-300 group-hover:scale-110"
              style={{
                backgroundColor: `${card.color}15`,
                color: card.color
              }}
            >
              {getIcon(card.icon)}
            </div>

            {/* Título */}
            <h3
              className="mb-2"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "clamp(16px, 2vw, 20px)",
                fontWeight: 700,
                color: "#0A4B9E",
                lineHeight: "1.3"
              }}
            >
              {card.title}
            </h3>

            {/* Descrição */}
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#666666",
                lineHeight: "1.6"
              }}
            >
              {card.description}
            </p>

            {/* Indicador de ação */}
            <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: card.color
                }}
              >
                Acessar
              </span>
              <svg
                className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: card.color }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}


