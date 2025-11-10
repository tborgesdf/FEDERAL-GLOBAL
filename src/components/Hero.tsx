import { useState } from "react";
import familyImage from "figma:asset/8d6a7ac840cd502128aee5ff530de943ed079f42.png";

export default function Hero() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <section className="relative h-[500px] w-full overflow-hidden">
      {/* Background image com overlay */}
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${familyImage})`,
            opacity: 0.3
          }}
        />
        {/* Degradê vertical de preto para transparente */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)"
          }}
        />
      </div>

      {/* Conteúdo central */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-20">
        {/* Headline */}
        <h1
          className="mb-6 text-right"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "72px",
            fontWeight: 900,
            color: "#0048BA",
            letterSpacing: "-1.5%",
            lineHeight: "110%",
            opacity: 0.95,
            mixBlendMode: "multiply",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.35), 0 0 24px rgba(255, 255, 255, 0.25)"
          }}
        >
          Unindo pessoas, culturas e oportunidades
        </h1>

        {/* CTA Primário (Verde) */}
        <button
          onMouseEnter={() => setHoveredButton("primary")}
          onMouseLeave={() => setHoveredButton(null)}
          className="rounded-xl px-12 py-4 transition-all duration-200 active:scale-95"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "20px",
            fontWeight: 600,
            backgroundColor: "#2BA84A",
            color: "#FFFFFF",
            boxShadow: hoveredButton === "primary" 
              ? "0 6px 14px rgba(0, 0, 0, 0.25), inset 0 -2px 8px rgba(255, 255, 255, 0.3)" 
              : "0 6px 14px rgba(0, 0, 0, 0.25), inset 0 -2px 8px rgba(255, 255, 255, 0.3)",
            filter: hoveredButton === "primary" ? "brightness(1.1)" : "brightness(1)",
            transform: hoveredButton === "primary" ? "scale(1.03)" : "scale(1)",
            alignSelf: "flex-end"
          }}
        >
          Assessoria Migratória Completa
        </button>
      </div>
    </section>
  );
}