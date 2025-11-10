import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CurrencyData {
  code: string;
  name: string;
  buy: number;
  sell: number;
  variation: number;
}

export default function TickerBar() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([
    { code: "USD", name: "Dólar Americano", buy: 5.3025, sell: 5.3125, variation: 0.45 },
    { code: "EUR", name: "Euro", buy: 5.7850, sell: 5.7950, variation: -0.23 },
    { code: "GBP", name: "Libra Esterlina", buy: 6.7215, sell: 6.7315, variation: 0.12 },
    { code: "CAD", name: "Dólar Canadense", buy: 3.8940, sell: 3.9040, variation: 0.34 },
    { code: "AUD", name: "Dólar Australiano", buy: 3.4560, sell: 3.4660, variation: -0.18 },
    { code: "CHF", name: "Franco Suíço", buy: 6.0325, sell: 6.0425, variation: 0.09 },
    { code: "JPY", name: "Iene Japonês", buy: 0.0357, sell: 0.0359, variation: -0.41 },
    { code: "DKK", name: "Coroa Dinamarquesa", buy: 0.7756, sell: 0.7786, variation: -0.15 },
    { code: "NOK", name: "Coroa Norueguesa", buy: 0.4892, sell: 0.4912, variation: 0.28 },
    { code: "SEK", name: "Coroa Sueca", buy: 0.5124, sell: 0.5144, variation: 0.11 }
  ]);

  // Simula atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencies(prev =>
        prev.map(curr => ({
          ...curr,
          buy: curr.buy * (1 + (Math.random() - 0.5) * 0.002),
          sell: curr.sell * (1 + (Math.random() - 0.5) * 0.002),
          variation: (Math.random() - 0.5) * 2
        }))
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="w-full overflow-hidden border-y"
      style={{
        backgroundColor: "#063E74",
        borderColor: "rgba(255,255,255,0.1)"
      }}
    >
      <div className="relative flex">
        {/* Primeira passagem */}
        <div className="flex animate-scroll">
          {currencies.map((currency, idx) => (
            <div
              key={`${currency.code}-1-${idx}`}
              className="flex items-center gap-3 px-6 py-3 border-r"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                minWidth: "280px"
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                    color: "#FFFFFF"
                  }}
                >
                  {currency.code}
                </span>
                {currency.variation >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-[#2BA84A]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-[#FF4444]" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.7)"
                      }}
                    >
                      C:
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#8CD000"
                      }}
                    >
                      R$ {currency.buy.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.7)"
                      }}
                    >
                      V:
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#FFFFFF"
                      }}
                    >
                      R$ {currency.sell.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Segunda passagem (duplicada para loop infinito) */}
        <div className="flex animate-scroll" aria-hidden="true">
          {currencies.map((currency, idx) => (
            <div
              key={`${currency.code}-2-${idx}`}
              className="flex items-center gap-3 px-6 py-3 border-r"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                minWidth: "280px"
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                    color: "#FFFFFF"
                  }}
                >
                  {currency.code}
                </span>
                {currency.variation >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-[#2BA84A]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-[#FF4444]" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.7)"
                      }}
                    >
                      C:
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#8CD000"
                      }}
                    >
                      R$ {currency.buy.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.7)"
                      }}
                    >
                      V:
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#FFFFFF"
                      }}
                    >
                      R$ {currency.sell.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
