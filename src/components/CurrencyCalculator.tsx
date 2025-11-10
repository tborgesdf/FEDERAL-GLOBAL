import { useState } from "react";
import { ArrowDownUp, DollarSign } from "lucide-react";
import { Button } from "./ui/button";

type TabMode = "receive" | "send";

interface CurrencyOption {
  code: string;
  name: string;
  rate: number;
}

const currencies: CurrencyOption[] = [
  { code: "USD", name: "Dólar Americano", rate: 5.3025 },
  { code: "EUR", name: "Euro", rate: 5.7850 },
  { code: "GBP", name: "Libra Esterlina", rate: 6.7215 },
  { code: "CAD", name: "Dólar Canadense", rate: 3.8940 },
  { code: "AUD", name: "Dólar Australiano", rate: 3.4560 },
  { code: "CHF", name: "Franco Suíço", rate: 6.0325 },
  { code: "JPY", name: "Iene Japonês", rate: 0.0357 },
];

export default function CurrencyCalculator() {
  const [mode, setMode] = useState<TabMode>("receive");
  const [amount, setAmount] = useState<string>("1000.00");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  const getCurrentRate = () => {
    return currencies.find(c => c.code === selectedCurrency)?.rate || 5.3025;
  };

  const calculateResult = () => {
    const numAmount = parseFloat(amount.replace(/[^\d.-]/g, "")) || 0;
    const rate = getCurrentRate();
    const iof = numAmount * rate * 0.0038; // 0.38%
    const ourCost = numAmount * rate * 0.01; // 1%
    const externalFees = 62.99; // Fixo
    const vet = rate * 0.974; // VET = taxa - 2.6%

    if (mode === "receive") {
      const total = numAmount * rate - iof - ourCost - externalFees;
      return {
        conversionLine: `1 ${selectedCurrency} = R$ ${rate.toFixed(4)}`,
        iofLine: `IOF 0,38% = R$ ${iof.toFixed(2)}`,
        costLine: `Nosso custo = R$ ${ourCost.toFixed(2)}`,
        feesLine: `Tarifas externas = R$ ${externalFees.toFixed(2)}`,
        vetLine: `VET = R$ ${vet.toFixed(4)}`,
        total: total
      };
    } else {
      const total = numAmount / rate + iof + ourCost + externalFees;
      return {
        conversionLine: `1 ${selectedCurrency} = R$ ${rate.toFixed(4)}`,
        iofLine: `IOF 0,38% = R$ ${iof.toFixed(2)}`,
        costLine: `Nosso custo = R$ ${ourCost.toFixed(2)}`,
        feesLine: `Tarifas externas = R$ ${externalFees.toFixed(2)}`,
        vetLine: `VET = R$ ${vet.toFixed(4)}`,
        total: total
      };
    }
  };

  const result = calculateResult();

  return (
    <div
      className="rounded-3xl p-6 md:p-8"
      style={{
        backgroundColor: "#063E74",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
      }}
    >
      {/* Título */}
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="h-6 w-6 text-[#8CD000]" />
        <h3
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "clamp(18px, 3vw, 24px)",
            fontWeight: 700,
            color: "#FFFFFF"
          }}
        >
          Calculadora de Câmbio PTAX
        </h3>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("receive")}
          className="flex-1 py-3 px-6 rounded-full transition-all duration-300"
          style={{
            backgroundColor: mode === "receive" ? "#8CD000" : "rgba(255,255,255,0.1)",
            color: mode === "receive" ? "#063E74" : "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          Receber
        </button>
        <button
          onClick={() => setMode("send")}
          className="flex-1 py-3 px-6 rounded-full transition-all duration-300"
          style={{
            backgroundColor: mode === "send" ? "#8CD000" : "rgba(255,255,255,0.1)",
            color: mode === "send" ? "#063E74" : "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          Enviar
        </button>
      </div>

      {/* Linha superior - Input */}
      <div className="mb-6">
        <label
          className="block mb-2"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)"
          }}
        >
          {mode === "receive" ? "Valor a receber" : "Valor a enviar"}
        </label>
        <div className="flex gap-3">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              minWidth: "100px"
            }}
          >
            {currencies.map(curr => (
              <option 
                key={curr.code} 
                value={curr.code}
                style={{ backgroundColor: "#063E74", color: "#FFFFFF" }}
              >
                {curr.code}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600
            }}
            placeholder="1000.00"
          />
        </div>
      </div>

      {/* Ícone de conversão */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/10 rounded-full p-2">
          <ArrowDownUp className="h-5 w-5 text-[#8CD000]" />
        </div>
      </div>

      {/* Lista de detalhes */}
      <div
        className="mb-6 p-4 rounded-lg"
        style={{
          backgroundColor: "rgba(0,0,0,0.2)"
        }}
      >
        <ul className="space-y-2">
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.9)"
            }}
          >
            • {result.conversionLine}
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.9)"
            }}
          >
            • {result.iofLine}
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.9)"
            }}
          >
            • {result.costLine}
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.9)"
            }}
          >
            • {result.feesLine}
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.9)"
            }}
          >
            • {result.vetLine}
          </li>
        </ul>
      </div>

      {/* Linha inferior - Resultado */}
      <div className="mb-6">
        <label
          className="block mb-2"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)"
          }}
        >
          {mode === "receive" ? "Você receberá" : "Custo total"}
        </label>
        <div className="flex gap-3">
          <div
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              minWidth: "100px"
            }}
          >
            BRL
          </div>
          <div
            className="flex-1 px-4 py-3 rounded-lg border border-[#8CD000]"
            style={{
              backgroundColor: "rgba(140, 208, 0, 0.1)",
              fontFamily: "Inter, sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              color: "#8CD000"
            }}
          >
            R$ {result.total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Rodapé de aviso */}
      <p
        className="mb-6 text-center"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          color: "rgba(255,255,255,0.6)",
          fontStyle: "italic"
        }}
      >
        *Taxas PTAX atualizam ao longo do dia. Valores estimados.
      </p>

      {/* Botão CTA */}
      <Button
        className="w-full h-[56px] rounded-xl transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
        style={{
          backgroundColor: "#56B544",
          color: "#FFFFFF",
          fontFamily: "Poppins, sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(86,181,68,0.3)"
        }}
      >
        RECEBER ONLINE
      </Button>
    </div>
  );
}
