/**
 * FEDERAL EXPRESS BRASIL
 * Component: Currency Calculator
 * 
 * Calculadora de conversão de moedas com taxas em tempo real
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
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
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

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

  // Buscar última atualização ao montar e configurar auto-refresh
  useEffect(() => {
    // Buscar imediatamente
    const fetchAndUpdate = async (isAutoRefresh = false) => {
      try {
        if (isAutoRefresh) {
          setAutoRefreshing(true);
          console.log('🔄 Auto-refreshing exchange rates...');
        }
        
        const data = await getExchangeRates();
        if (data.timestamp) {
          setLastUpdate(new Date(data.timestamp).toLocaleString('pt-BR'));
        }
        
        // Se já há valores, reconverter automaticamente
        if (amount && fromCurrency && toCurrency && parseFloat(amount) > 0) {
          const amountNum = parseFloat(amount);
          const result = await convertCurrency(amountNum, fromCurrency, toCurrency);
          setConvertedAmount(result.converted_amount);
          setRate(result.rate);
          
          if (isAutoRefresh) {
            console.log('✅ Auto-refresh completed!');
          }
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        if (isAutoRefresh) {
          setTimeout(() => setAutoRefreshing(false), 2000);
        }
      }
    };
    
    // Executar imediatamente
    fetchAndUpdate(false);
    
    // Configurar intervalo de 10 minutos (600.000ms)
    const intervalId = setInterval(() => fetchAndUpdate(true), 10 * 60 * 1000);
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(intervalId);
  }, [amount, fromCurrency, toCurrency]);

  const getCurrencyInfo = (code: string): Currency | undefined => {
    return ALL_CURRENCIES.find((c) => c.code === code);
  };

  // Filtrar moedas por pesquisa
  const getFilteredCurrencies = (searchTerm: string) => {
    if (!searchTerm) return currenciesToShow;
    const term = searchTerm.toLowerCase();
    return currenciesToShow.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term)
    );
  };

  // Componente de Dropdown Customizado com Grid
  const CurrencyDropdown = ({
    value,
    onChange,
    isOpen,
    setIsOpen,
    search,
    setSearch,
    label,
  }: {
    value: string;
    onChange: (code: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    search: string;
    setSearch: (search: string) => void;
    label: string;
  }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedCurrency = getCurrencyInfo(value);
    const filteredCurrencies = getFilteredCurrencies(search);

    // Mostrar apenas moedas populares se não houver busca
    const currenciesToDisplay = search 
      ? filteredCurrencies 
      : (showAllCurrencies ? filteredCurrencies : POPULAR_CURRENCIES);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearch('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, setIsOpen, setSearch]);

    return (
      <div ref={dropdownRef} className="relative w-48">
        {/* Botão do Select */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-lg font-semibold text-[#111] bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A4B9E] cursor-pointer transition-all flex items-center justify-between hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <span className="text-2xl">{selectedCurrency?.flag}</span>
            <span>{value}</span>
          </span>
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown com Grid */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-[#D1D5DB] rounded-xl shadow-2xl w-[600px] max-h-[500px] overflow-hidden">
            {/* Campo de Busca */}
            <div className="p-4 border-b border-[#E5E7EB] sticky top-0 bg-white">
              <input
                type="text"
                placeholder="🔍 Buscar por código ou nome da moeda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4B9E]"
                onClick={(e) => e.stopPropagation()}
              />
              {!search && (
                <p className="mt-2 text-xs text-[#6B7280]">
                  {showAllCurrencies 
                    ? `Mostrando ${currenciesToDisplay.length} moedas` 
                    : 'Mostrando moedas populares'}
                </p>
              )}
            </div>

            {/* Grid de Moedas (3 colunas) */}
            <div className="overflow-y-auto max-h-[380px] p-2">
              {currenciesToDisplay.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {currenciesToDisplay.map((currency) => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => {
                        onChange(currency.code);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`px-3 py-2.5 text-left hover:bg-[#EFF6FF] transition-colors rounded-lg flex items-center gap-2 ${
                        value === currency.code ? 'bg-[#DBEAFE] ring-2 ring-[#0A4B9E]' : ''
                      }`}
                      title={currency.name}
                    >
                      <span className="text-xl flex-shrink-0">{currency.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#111]">{currency.code}</div>
                        <div className="text-xs text-[#6B7280] truncate">{currency.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center text-[#6B7280]">
                  <p className="text-lg mb-2">😕</p>
                  <p>Nenhuma moeda encontrada</p>
                  <p className="text-xs mt-1">Tente outro termo de busca</p>
                </div>
              )}
            </div>

            {/* Rodapé com toggle */}
            {!search && (
              <div className="p-3 border-t border-[#E5E7EB] bg-[#F9FAFB] sticky bottom-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllCurrencies(!showAllCurrencies);
                  }}
                  className="w-full text-sm text-[#0A4B9E] hover:text-[#083A7E] font-medium transition-colors"
                >
                  {showAllCurrencies
                    ? '← Mostrar apenas populares'
                    : `Ver todas as ${ALL_CURRENCIES.length} moedas →`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
          <div className="flex gap-4 items-center">
            {/* Currency Flag (Large Display) */}
            <div className="flex items-center justify-center w-16 h-16 text-4xl bg-white border-2 border-[#D1D5DB] rounded-xl shadow-sm">
              {getCurrencyInfo(fromCurrency)?.flag || '💱'}
            </div>

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
            <CurrencyDropdown
              value={fromCurrency}
              onChange={setFromCurrency}
              isOpen={showFromDropdown}
              setIsOpen={setShowFromDropdown}
              search={searchFrom}
              setSearch={setSearchFrom}
              label="De"
            />
          </div>
          {fromCurrency && (
            <p className="mt-2 text-sm text-[#6B7280] flex items-center gap-2">
              <span className="font-semibold">{getCurrencyInfo(fromCurrency)?.name}</span>
              {getCurrencyInfo(fromCurrency)?.symbol && (
                <span className="text-[#9CA3AF]">({getCurrencyInfo(fromCurrency)?.symbol})</span>
              )}
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
          <div className="flex gap-4 items-center">
            {/* Currency Flag (Large Display) */}
            <div className="flex items-center justify-center w-16 h-16 text-4xl bg-white border-2 border-[#BFDBFE] rounded-xl shadow-sm">
              {getCurrencyInfo(toCurrency)?.flag || '💱'}
            </div>

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
            <CurrencyDropdown
              value={toCurrency}
              onChange={setToCurrency}
              isOpen={showToDropdown}
              setIsOpen={setShowToDropdown}
              search={searchTo}
              setSearch={setSearchTo}
              label="Para"
            />
          </div>
          {toCurrency && (
            <p className="mt-2 text-sm text-[#6B7280] flex items-center gap-2">
              <span className="font-semibold">{getCurrencyInfo(toCurrency)?.name}</span>
              {getCurrencyInfo(toCurrency)?.symbol && (
                <span className="text-[#9CA3AF]">({getCurrencyInfo(toCurrency)?.symbol})</span>
              )}
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
        {autoRefreshing && (
          <div className="mb-3 inline-flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="font-semibold">Atualizando cotações...</span>
          </div>
        )}
        <p>
          💱 Cotações atualizadas automaticamente a cada 10 minutos
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
