import { Lightbulb, TrendingUp, Shield, Clock } from "lucide-react";

export default function SummaryTipsCard() {
  const tips = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Acompanhe a cotação",
      description: "Monitore as variações do câmbio ao longo do dia para fazer operações no melhor momento"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Segurança garantida",
      description: "Todas as operações são protegidas por criptografia de ponta e regulamentadas pelo Banco Central"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Agilidade nas remessas",
      description: "Transferências internacionais processadas em até2 dias úteis com rastreamento completo"
    }
  ];

  return (
    <div
      className="rounded-3xl p-6 md:p-8 h-full"
      style={{
        backgroundColor: "#F5F6F8",
        border: "1px solid rgba(10, 75, 158, 0.1)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
      }}
    >
      {/* Título */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="inline-flex items-center justify-center rounded-xl p-2"
          style={{
            backgroundColor: "#0A4B9E15"
          }}
        >
          <Lightbulb className="h-6 w-6 text-[#0A4B9E]" />
        </div>
        <h3
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "clamp(18px, 3vw, 24px)",
            fontWeight: 700,
            color: "#0A4B9E"
          }}
        >
          Resumo & Dicas
        </h3>
      </div>

      {/* Dicas */}
      <div className="space-y-6">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-4">
            <div
              className="flex-shrink-0 inline-flex items-center justify-center rounded-lg p-2 mt-1"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#2BA84A",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}
            >
              {tip.icon}
            </div>
            <div>
              <h4
                className="mb-1"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#0A4B9E"
                }}
              >
                {tip.title}
              </h4>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#666666",
                  lineHeight: "1.6"
                }}
              >
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Box de destaque */}
      <div
        className="mt-6 p-4 rounded-xl"
        style={{
          backgroundColor: "#FFFFFF",
          border: "2px solid #8CD000",
          boxShadow: "0 2px 8px rgba(140,208,0,0.1)"
        }}
      >
        <p
          className="mb-2"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            color: "#0A4B9E"
          }}
        >
          ’° Economia de até40%
        </p>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            color: "#666666",
            lineHeight: "1.5"
          }}
        >
          Nossas taxas são até40% menores que bancos tradicionais. Compare e comprove!
        </p>
      </div>

      {/* Footer info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#999999",
            lineHeight: "1.5",
            textAlign: "center"
          }}
        >
          Dúvidas? Entre em contato com nosso suporte 24/7
        </p>
      </div>
    </div>
  );
}


