/**
 * FEDERAL EXPRESS BRASIL
 * Component: Currency Calculator
 * 
 * Calculadora de conversão de moedas com taxas em tempo real
 */

import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp, Calendar } from 'lucide-react';
import { POPULAR_CURRENCIES, ALL_CURRENCIES } from '@/types/exchange';
import type { Currency } from '@/types/exchange';
import { getExchangeRates, convertCurrency, formatCurrency } from '@/services/exchangeService';

export default function CurrencyCalculator() {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('BRL');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  const currenciesToShow = showAllCurrencies ? ALL_CURRENCIES : POPULAR_CURRENCIES;

  // Função para converter
  const handleConvert = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    setLoading(true);
    try {
      const result = await convertCurrency(amountNum, fromCurrency, toCurrency);
      setConvertedAmount(result.converted_amount);
      setRate(result.rate);
      setLastUpdate(new Date(result.timestamp).toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Inverter moedas
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
    setRate(null);
  };

  // Auto-converter quando mudar amount, from ou to (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && fromCurrency && toCurrency) {
        handleConvert();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, fromCurrency, toCurrency]);

  // Buscar última atualização ao montar
  useEffect(() => {
    getExchangeRates()
      .then((data) => {
        if (data.timestamp) {
          setLastUpdate(new Date(data.timestamp).toLocaleString('pt-BR'));
        }
      })
      .catch(console.error);
  }, []);

  const getCurrencyInfo = (code: string): Currency | undefined => {
    return ALL_CURRENCIES.find((c) => c.code === code);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[#0A4B9E] mb-2">
          Calculadora de Moedas
        </h2>
        <p className="text-[#555] flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          Última atualização: {lastUpdate || 'Carregando...'}
        </p>
      </div>

      {/* Calculadora */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#E5E7EB]">
        {/* From Currency */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            De
          </label>
          <div className="flex gap-4">
            {/* Amount Input */}
            <div className="flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Digite o valor"
                className="w-full px-4 py-3 text-2xl font-bold text-[#111] bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A4B9E] focus:border-transparent transition-all"
                min="0"
                step="0.01"
              />
            </div>

            {/* Currency Selector */}
            <div className="w-48">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-4 py-3 text-lg font-semibold text-[#111] bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A4B9E] cursor-pointer transition-all"
              >
                {currenciesToShow.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {fromCurrency && (
            <p className="mt-2 text-sm text-[#6B7280]">
              {getCurrencyInfo(fromCurrency)?.name}
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-4">
          <button
            onClick={handleSwap}
            className="p-3 rounded-full bg-[#0A4B9E] hover:bg-[#083A7E] text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
            title="Inverter moedas"
          >
            <ArrowRightLeft className="h-6 w-6" />
          </button>
        </div>

        {/* To Currency */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Para
          </label>
          <div className="flex gap-4">
            {/* Converted Amount (Read-only) */}
            <div className="flex-1">
              <input
                type="text"
                value={
                  loading
                    ? 'Convertendo...'
                    : convertedAmount !== null
                    ? convertedAmount.toFixed(2)
                    : '0.00'
                }
                readOnly
                className="w-full px-4 py-3 text-2xl font-bold text-[#0A4B9E] bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl cursor-not-allowed"
              />
            </div>

            {/* Currency Selector */}
            <div className="w-48">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-4 py-3 text-lg font-semibold text-[#111] bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A4B9E] cursor-pointer transition-all"
              >
                {currenciesToShow.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {toCurrency && (
            <p className="mt-2 text-sm text-[#6B7280]">
              {getCurrencyInfo(toCurrency)?.name}
            </p>
          )}
        </div>

        {/* Exchange Rate Info */}
        {rate !== null && convertedAmount !== null && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] rounded-xl border border-[#BFDBFE]">
            <div className="flex items-center gap-2 text-[#1E40AF] mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold text-sm">Taxa de Câmbio</span>
            </div>
            <p className="text-2xl font-bold text-[#0A4B9E]">
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </p>
            <p className="text-sm text-[#6B7280] mt-2">
              {formatCurrency(parseFloat(amount), fromCurrency)} ={' '}
              {formatCurrency(convertedAmount, toCurrency)}
            </p>
          </div>
        )}

        {/* Toggle All Currencies */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllCurrencies(!showAllCurrencies)}
            className="text-[#0A4B9E] hover:text-[#083A7E] font-medium text-sm underline transition-colors"
          >
            {showAllCurrencies
              ? '← Mostrar apenas moedas populares'
              : 'Ver todas as moedas disponíveis →'}
          </button>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleConvert}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A4B9E] hover:bg-[#083A7E] disabled:bg-[#9CA3AF] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Atualizando...' : 'Atualizar Cotação'}
          </button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-[#6B7280]">
        <p>
          💱 Cotações atualizadas automaticamente a cada 10 minutos (seg-sex, 9h-17h BRT)
        </p>
        <p className="mt-1">
          Fonte:{' '}
          <a
            href="https://www.exchangerate-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A4B9E] hover:underline"
          >
            ExchangeRate-API
          </a>
        </p>
      </div>
    </div>
  );
}
