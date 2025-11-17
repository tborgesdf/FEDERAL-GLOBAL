import { useEffect, useRef } from "react";

// Mock data structure para futura integração de API
interface FXRate {
  base: string;
  quote: string;
  rate: number;
  changePct: number;
  fetchedAt: string;
}

interface CryptoRate {
  symbol: string;
  name: string;
  priceUSD: number;
  changePct: number;
  fetchedAt: string;
}

interface MarketTickerData {
  fx: FXRate[];
  crypto: CryptoRate[];
}

const mockMarketData: MarketTickerData = {
  fx: [
    { base: "BRL", quote: "USD", rate: 4.92, changePct: -0.32, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "EUR", rate: 5.34, changePct: 0.18, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "GBP", rate: 6.21, changePct: 0.45, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "CAD", rate: 3.58, changePct: -0.21, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "JPY", rate: 0.0357, changePct: -0.41, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "CHF", rate: 6.03, changePct: 0.09, fetchedAt: "2025-11-06T20:00:00Z" },
    { base: "BRL", quote: "AUD", rate: 3.46, changePct: -0.18, fetchedAt: "2025-11-06T20:00:00Z" }
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin", priceUSD: 43250.50, changePct: 2.15, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "ETH", name: "Ethereum", priceUSD: 2285.30, changePct: 1.85, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "BNB", name: "BNB", priceUSD: 312.45, changePct: -0.75, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "SOL", name: "Solana", priceUSD: 98.75, changePct: 3.42, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "XRP", name: "XRP", priceUSD: 0.62, changePct: -1.20, fetchedAt: "2025-11-06T20:00:00Z" },
    { symbol: "ADA", name: "Cardano", priceUSD: 0.45, changePct: 0.85, fetchedAt: "2025-11-06T20:00:00Z" }
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
      {mockMarketData.fx.map((fx, i) => (
        <span key={`fx-${i}`}>
          {renderItem(
            `${fx.base}/${fx.quote}`,
            formatNumber(fx.rate, fx.quote === 'JPY' ? 4 : 2),
            fx.changePct
          )}
        </span>
      ))}
      {mockMarketData.crypto.map((crypto, i) => (
        <span key={`crypto-${i}`}>
          {renderItem(
            crypto.symbol,
            `$${formatNumber(crypto.priceUSD, crypto.priceUSD < 1 ? 4 : 2)}`,
            crypto.changePct
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


