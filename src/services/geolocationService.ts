/**
 * FEDERAL EXPRESS BRASIL
 * Service: Geolocation & Weather
 * 
 * Integra com ip-api.com e OpenWeatherMap para obter localização e clima
 */

import axios from 'axios';
import { supabase } from '@/utils/supabase';
import type { IpApiResponse, OpenWeatherMapResponse, GeolocationData, WeatherData, GeolocationLog } from '@/types/geolocation';

// Constantes
const IP_API_URL = 'http://ip-api.com/json/';
const IP_API_FIELDS = 'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query';
const OPENWEATHER_API_KEY = '09f658ba4de5826449168ce978dfcc9c';
const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Busca informações de IP e geolocalização
 */
export async function getIpInfo(): Promise<IpApiResponse | null> {
  try {
    const response = await axios.get<IpApiResponse>(
      `${IP_API_URL}?fields=${IP_API_FIELDS}`,
      { timeout: 5000 }
    );

    if (response.data.status === 'success') {
      return response.data;
    } else {
      console.error('IP-API error:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar informações de IP:', error);
    return null;
  }
}

/**
 * Busca informações de clima baseado em lat/lon
 */
export async function getWeatherInfo(lat: number, lon: number): Promise<OpenWeatherMapResponse | null> {
  try {
    const response = await axios.get<OpenWeatherMapResponse>(
      `${OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`,
      { timeout: 5000 }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar informações de clima:', error);
    return null;
  }
}

/**
 * Busca informações completas de geolocalização e clima
 */
export async function getGeolocationAndWeather(): Promise<GeolocationData | null> {
  try {
    // 1. Buscar info de IP
    const ipInfo = await getIpInfo();
    if (!ipInfo) return null;

    // 2. Buscar info de clima
    const weatherInfo = await getWeatherInfo(ipInfo.lat, ipInfo.lon);
    if (!weatherInfo) {
      // Retornar apenas dados de IP se clima falhar
      console.warn('Clima não disponível, retornando apenas dados de IP');
    }

    // 3. Consolidar dados
    const geolocationData: GeolocationData = {
      // IP Info
      ipAddress: ipInfo.query,
      country: ipInfo.country,
      countryCode: ipInfo.countryCode,
      region: ipInfo.region,
      regionName: ipInfo.regionName,
      city: ipInfo.city,
      zip: ipInfo.zip,
      latitude: ipInfo.lat,
      longitude: ipInfo.lon,
      timezone: ipInfo.timezone,
      isp: ipInfo.isp,
      org: ipInfo.org,
      asInfo: ipInfo.as,
      
      // Weather Info
      weatherTemp: weatherInfo?.main.temp || 0,
      weatherFeelsLike: weatherInfo?.main.feels_like || 0,
      weatherTempMin: weatherInfo?.main.temp_min || 0,
      weatherTempMax: weatherInfo?.main.temp_max || 0,
      weatherPressure: weatherInfo?.main.pressure || 0,
      weatherHumidity: weatherInfo?.main.humidity || 0,
      weatherDescription: weatherInfo?.weather[0]?.description || '',
      weatherIcon: weatherInfo?.weather[0]?.icon || '',
      weatherWindSpeed: weatherInfo?.wind.speed || 0,
      weatherClouds: weatherInfo?.clouds.all || 0,
      weatherFetchedAt: new Date(),
    };

    return geolocationData;
  } catch (error) {
    console.error('Erro ao buscar geolocalização e clima:', error);
    return null;
  }
}

/**
 * Salva log de geolocalização no banco
 */
export async function saveGeolocationLog(
  geolocationData: GeolocationData,
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    const log: Partial<GeolocationLog> = {
      user_id: userId,
      session_id: sessionId,
      ip_address: geolocationData.ipAddress,
      country: geolocationData.country,
      country_code: geolocationData.countryCode,
      region: geolocationData.region,
      region_name: geolocationData.regionName,
      city: geolocationData.city,
      zip: geolocationData.zip,
      latitude: geolocationData.latitude,
      longitude: geolocationData.longitude,
      timezone: geolocationData.timezone,
      isp: geolocationData.isp,
      org: geolocationData.org,
      as_info: geolocationData.asInfo,
      weather_temp: geolocationData.weatherTemp,
      weather_feels_like: geolocationData.weatherFeelsLike,
      weather_temp_min: geolocationData.weatherTempMin,
      weather_temp_max: geolocationData.weatherTempMax,
      weather_pressure: geolocationData.weatherPressure,
      weather_humidity: geolocationData.weatherHumidity,
      weather_description: geolocationData.weatherDescription,
      weather_icon: geolocationData.weatherIcon,
      weather_wind_speed: geolocationData.weatherWindSpeed,
      weather_clouds: geolocationData.weatherClouds,
      weather_fetched_at: geolocationData.weatherFetchedAt.toISOString(),
      user_agent: navigator.userAgent,
      page_url: window.location.href,
    };

    const { error } = await supabase
      .from('geolocation_logs')
      .insert(log);

    if (error) {
      console.error('Erro ao salvar log de geolocalização:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar log de geolocalização:', error);
  }
}

/**
 * Busca a última geolocalização do usuário
 */
export async function getUserLatestGeolocation(userId: string): Promise<GeolocationLog | null> {
  try {
    const { data, error } = await supabase
      .from('geolocation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar geolocalização do usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar geolocalização do usuário:', error);
    return null;
  }
}

/**
 * Converte dados de geolocalização para formato do Header
 */
export function convertToWeatherData(geolocationData: GeolocationData | GeolocationLog): WeatherData {
  const isGeolocationData = 'ipAddress' in geolocationData;
  
  const city = isGeolocationData 
    ? geolocationData.city 
    : (geolocationData as GeolocationLog).city || '';
  
  const country = isGeolocationData 
    ? geolocationData.country 
    : (geolocationData as GeolocationLog).country || '';
  
  const temp = isGeolocationData 
    ? geolocationData.weatherTemp 
    : (geolocationData as GeolocationLog).weather_temp || 0;
  
  const description = isGeolocationData 
    ? geolocationData.weatherDescription 
    : (geolocationData as GeolocationLog).weather_description || '';
  
  const iconCode = isGeolocationData 
    ? geolocationData.weatherIcon 
    : (geolocationData as GeolocationLog).weather_icon || '';
  
  const fetchedAt = isGeolocationData 
    ? geolocationData.weatherFetchedAt 
    : (geolocationData as GeolocationLog).weather_fetched_at 
      ? new Date((geolocationData as GeolocationLog).weather_fetched_at!)
      : new Date();

  return {
    location: `${city}, ${country}`,
    tempC: Math.round(temp),
    description: description.charAt(0).toUpperCase() + description.slice(1),
    icon: mapWeatherIconToEmoji(iconCode),
    fetchedAt: fetchedAt.toISOString(),
  };
}

/**
 * Mapeia código de ícone do OpenWeatherMap para emoji
 */
function mapWeatherIconToEmoji(iconCode: string): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️',
  };

  return iconMap[iconCode] || '☁️';
}

/**
 * Hook para usar geolocalização e clima automaticamente
 */
export async function initializeGeolocation(userId?: string): Promise<WeatherData | null> {
  try {
    // 1. Buscar geolocalização e clima
    const geolocationData = await getGeolocationAndWeather();
    if (!geolocationData) return null;

    // 2. Salvar log no banco (se usuário estiver logado ou gerar sessionId)
    const sessionId = sessionStorage.getItem('geoSessionId') || crypto.randomUUID();
    if (!sessionStorage.getItem('geoSessionId')) {
      sessionStorage.setItem('geoSessionId', sessionId);
    }

    await saveGeolocationLog(geolocationData, userId, sessionId);

    // 3. Converter para formato do Header
    const weatherData = convertToWeatherData(geolocationData);

    // 4. Armazenar no localStorage para cache (30 min)
    localStorage.setItem('weatherData', JSON.stringify({
      data: weatherData,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutos
    }));

    return weatherData;
  } catch (error) {
    console.error('Erro ao inicializar geolocalização:', error);
    return null;
  }
}

/**
 * Busca dados de clima do cache ou API
 */
export async function getWeatherData(userId?: string): Promise<WeatherData | null> {
  // 1. Verificar cache
  const cached = localStorage.getItem('weatherData');
  if (cached) {
    const { data, expiresAt } = JSON.parse(cached);
    if (Date.now() < expiresAt) {
      return data;
    }
  }

  // 2. Se não tiver cache ou expirou, buscar novo
  return await initializeGeolocation(userId);
}

