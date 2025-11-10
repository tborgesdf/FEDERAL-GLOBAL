import { useState, useEffect } from "react";
import { Briefcase, Plane, ChevronLeft, ChevronRight } from "lucide-react";

interface RSSItem {
  id: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  dateISO: string;
  readMinutes: number;
  href: string;
}

interface RSSCarouselProps {
  title: string;
  icon: "briefcase" | "plane";
  items: RSSItem[];
  accentColor: string;
}

export default function RSSCarousel({ title, icon, items, accentColor }: RSSCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO);
    const day = date.getDate();
    const months = [
      "jan", "fev", "mar", "abr", "mai", "jun",
      "jul", "ago", "set", "out", "nov", "dez"
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const currentItem = items[currentIndex];
  const Icon = icon === "briefcase" ? Briefcase : Plane;

  // Calcular progresso
  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <section className="pb-[8px] pt-[24px] pr-[0px] pl-[0px]">
      <div className="mx-auto max-w-[1440px] px-20">
        {/* Cabeçalho */}
        <div className="mb-7 flex items-center gap-2">
          <Icon className="h-6 w-6" style={{ color: accentColor }} />
          <h2
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              color: accentColor
            }}
          >
            {title}
          </h2>
        </div>

        {/* Carrossel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-2 gap-5">
            {/* Esquerda - Imagem */}
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="h-[300px] w-full object-cover"
              />
              {/* Overlay para legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Direita - Conteúdo */}
            <div className="flex flex-col justify-center gap-4">
              {/* Eyebrow/Categoria */}
              <div
                className="inline-flex w-fit items-center rounded-full px-3 py-1"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "7px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  {currentItem.category}
                </span>
              </div>

              {/* Título */}
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#111",
                  lineHeight: "1.2"
                }}
              >
                {currentItem.title}
              </h3>

              {/* Resumo */}
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "#444",
                  lineHeight: "1.6"
                }}
              >
                {currentItem.excerpt}
              </p>

              {/* Metadados */}
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "8px",
                    fontWeight: 500,
                    color: "#555"
                  }}
                >
                  {formatDate(currentItem.dateISO)}
                </span>
                <span className="text-[#555]" style={{ fontSize: "8px" }}>•</span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "8px",
                    fontWeight: 500,
                    color: "#555"
                  }}
                >
                  {currentItem.readMinutes} min
                </span>
              </div>

              {/* CTA */}
              <button
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className="mt-2 w-fit rounded-lg px-4 py-2 shadow-lg transition-all duration-200"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  backgroundColor: "#2BA84A",
                  color: "white",
                  opacity: hoveredButton ? 0.9 : 1,
                  transform: hoveredButton ? "scale(1.03)" : "scale(1)"
                }}
              >
                Ler matéria completa
              </button>
            </div>
          </div>

          {/* Controles de navegação */}
          <div className="mt-5 flex items-center justify-between">
            {/* Bullets */}
            <div className="flex gap-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: currentIndex === index ? "20px" : "6px",
                    backgroundColor:
                      currentIndex === index ? accentColor : "#E0E0E0"
                  }}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Setas */}
            <div className="flex gap-1">
              <button
                onClick={goToPrevious}
                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-4 w-4" style={{ color: accentColor }} />
              </button>
              <button
                onClick={goToNext}
                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                aria-label="Próximo slide"
              >
                <ChevronRight className="h-4 w-4" style={{ color: accentColor }} />
              </button>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: accentColor
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}