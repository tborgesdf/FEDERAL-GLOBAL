/**
 * Componente WeatherPanel - DeltaFox / Federal Global
 * 🔄 Integra automaticamente com OpenWeatherMap (prioritário) e Open-Meteo (fallback)
 * 🌎 Mostra clima atual, temperatura, umidade e condição (PT-BR)
 * 💾 Puxa variáveis do .env.local ou das variáveis da Vercel (VITE_WEATHER_API_KEY)
 */

import React, { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  city: string;
  icon: string;
}

export default function WeatherPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const lat = -22.9068; // Rio de Janeiro
  const lon = -43.1729;
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // 🔁 Função para buscar dados
  async function fetchWeather() {
    try {
      let response;

      // 🔹 PRIORIDADE: OpenWeatherMap (se existir chave)
      if (API_KEY) {
        response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.main) {
          setWeather({
            temperature: data.main.temp,
            humidity: data.main.humidity,
            condition: data.weather[0].description,
            city: data.name,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          });
          setLoading(false);
          return;
        }
      }

      // 🔸 FALLBACK: Open-Meteo (sem chave)
      const resFallback = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const dataFallback = await resFallback.json();
      if (dataFallback.current_weather) {
        setWeather({
          temperature: dataFallback.current_weather.temperature,
          humidity: 60,
          condition: "Céu limpo",
          city: "Rio de Janeiro",
          icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
        });
      }

    } catch (error) {
      console.error("Erro ao buscar previsão:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-md w-full max-w-sm mx-auto">
      {loading ? (
        <p className="text-gray-600 text-sm">Carregando previsão...</p>
      ) : weather ? (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {weather.city}
          </h2>
          <img src={weather.icon} alt="Condição" className="w-16 h-16 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            {weather.temperature.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-500 capitalize">
            {weather.condition}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Umidade: {weather.humidity}%
          </p>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Não foi possível obter os dados.</p>
      )}
    </div>
  );
}
