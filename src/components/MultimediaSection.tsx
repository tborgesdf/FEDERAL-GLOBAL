import { useState, useEffect } from "react";
import { Play } from "lucide-react";

export default function MultimediaSection() {
  const [hoveredButton, setHoveredButton] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#F7F8FA] py-20">
      <div className="mx-auto max-w-[1200px] px-20">
        <div
          className="grid grid-cols-2 gap-10 rounded-2xl p-10"
          style={{
            border: "2px solid #FF0000",
            boxShadow: "0 8px 24px rgba(255, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          {/* Esquerda - Texto e CTA */}
          <div className="flex flex-col justify-center gap-5">
            <h2
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "32px",
                fontWeight: 700,
                color: "#0A4B9E",
                lineHeight: "1.2"
              }}
            >
              Canal Migratório Federal Express
            </h2>

            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#444",
                lineHeight: "1.6"
              }}
            >
              Acompanhe nosso programa ao vivo com especialistas em imigração,
              entrevistas exclusivas e discussões sobre as últimas mudanças nas
              políticas migratórias globais. Confira nosso próximo episódio sobre
              as mudanças no sistema de vistos americano.
            </p>

            <button
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              className="mt-3 w-fit rounded-xl px-5 py-2.5 shadow-lg transition-all duration-200"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#0058CC",
                color: "white",
                opacity: hoveredButton ? 0.9 : 1,
                transform: hoveredButton ? "scale(1.03)" : "scale(1)"
              }}
            >
              Assistir agora
            </button>

            <p
              className="mt-2"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#555"
              }}
            >
              <span className="text-[#0A4B9E]">Próximo episódio:</span>{" "}
              Mudanças no sistema de vistos americano
            </p>
          </div>

          {/* Direita - Player de vídeo/áudio placeholder */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0A4B9E] to-[#0058CC] shadow-[0_6px_24px_rgba(0,0,0,0.12)]">
              {/* Placeholder para embed futuro (YouTube/Spotify) */}
              <div className="flex aspect-video items-center justify-center">
                <div className="relative">
                  {/* écone de play */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
                    <Play className="h-10 w-10 fill-white text-white" />
                  </div>
                </div>
              </div>

              {/* Selo ON AIR com efeito pulsante */}
              <div className="absolute right-3 top-3">
                <div className="relative flex items-center gap-2 rounded-full bg-[#FF3B3B] px-3 py-1.5 shadow-lg">
                  {/* Ponto pulsante */}
                  <div className="relative">
                    <div
                      className={`h-2.5 w-2.5 rounded-full bg-white transition-opacity duration-500 ${
                        isPulsing ? "opacity-100" : "opacity-50"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 h-2.5 w-2.5 rounded-full bg-white transition-all duration-1000 ${
                        isPulsing ? "scale-150 opacity-0" : "scale-100 opacity-100"
                      }`}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "white",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}
                  >
                    ON AIR
                  </span>
                </div>
              </div>

              {/* Informações de overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                <p
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "white"
                  }}
                >
                  Episódio #47: Vistos Americanos 2025
                </p>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "white/80"
                  }}
                >
                  Com Dr. Carlos Mendes, especialista em imigração
                </p>
              </div>
            </div>

            {/* Nota sobre embed futuro */}
            <p
              className="mt-3 text-center"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "#555"
              }}
            >
              * Espaço preparado para integração com YouTube/Spotify
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

