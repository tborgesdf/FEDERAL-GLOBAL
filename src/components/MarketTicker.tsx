import { useEffect, useRef } from "react";

// Mock data structure para futura integração de API
interface MarketIndex {
  symbol: string;
  last: number;
  changePct: number;
  fetchedAt: string;
}

interface FXRate {
  base: string;
  quote: string;
  rate: number;
  changePct: number;
  fetchedAt: string;
}

interface MarketTickerData {
  indexes: MarketIndex[];
  fx: FXRate[];
}

const mockMarketData: MarketTickerData = {
  indexes: [
    { symbol: "NASDAQ", last: 16847.35, changePct: 1.24, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "S&P 500", last: 4783.45, changePct: 0.85, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "IBOV", last: 128456.78, changePct: -0.42, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "DAX", last: 16234.89, changePct: 0.67, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "NIKKEI", last: 33245.67, changePct: -0.15, fetchedAt: "2025-11-06T20:00:00Z" }
  ],
  fx: [
    { base: "BRL", quote: "USD", rate: 4.92, changePct: -0.32, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "EUR", rate: 5.34, changePct: 0.18, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "GBP", rate: 6.21, changePct: 0.45, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "CAD", rate: 3.58, changePct: -0.21, fetchedAt: "2025-11-06T20:00:00Z" }
  ]
};

export default function MarketTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const scrollWidth = ticker.scrollWidth;
    const clientWidth = ticker.clientWidth;
    let position = 0;

    const scroll = () => {
      position -= 1;
      if (Math.abs(position) >= scrollWidth / 2) {
        position = 0;
      }
      ticker.style.transform = `translateX(${position}px)`;
    };

    const intervalId = setInterval(scroll, 30);

    return () => clearInterval(intervalId);
  }, []);

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const renderItem = (label: string, value: string, changePct: number) => (
    <div className="inline-flex items-center gap-2 px-4">
      <span className="text-white">{label}</span>
      <span className="text-white">{value}</span>
      <span
        className={changePct >= 0 ? "text-[#00D26A]" : "text-[#FF3B3B]"}
      >
        {changePct >= 0 ? "+" : ""}
        {formatNumber(changePct)}%
      </span>
      <span className="text-[#444]">|</span>
    </div>
  );

  const tickerContent = (
    <>
      {mockMarketData.indexes.map((index, i) => (
        <span key={`index-${i}`}>
          {renderItem(
            index.symbol,
            formatNumber(index.last),
            index.changePct
          )}
        </span>
      ))}
      {mockMarketData.fx.map((fx, i) => (
        <span key={`fx-${i}`}>
          {renderItem(
            `${fx.base}/${fx.quote}`,
            formatNumber(fx.rate, 2),
            fx.changePct
          )}
        </span>
      ))}
    </>
  );

  return (
    <div className="h-10 overflow-hidden bg-[#111]">
      <div
        ref={tickerRef}
        className="flex h-full items-center whitespace-nowrap"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: 500
        }}
      >
        {/* Duplicar conteúdo para scroll infinito */}
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
}
