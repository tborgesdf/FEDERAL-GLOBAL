/**
 * FEDERAL EXPRESS BRASIL
 * Types: Geolocation & Weather
 */

// Response da API ip-api.com
export interface IpApiResponse {
  status: 'success' | 'fail';
  message?: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string; // IP address
}

// Response da API OpenWeatherMap
export interface OpenWeatherMapResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Dados consolidados de geolocalização
export interface GeolocationData {
  // IP Info
  ipAddress: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  org: string;
  asInfo: string;
  
  // Weather Info
  weatherTemp: number;
  weatherFeelsLike: number;
  weatherTempMin: number;
  weatherTempMax: number;
  weatherPressure: number;
  weatherHumidity: number;
  weatherDescription: string;
  weatherIcon: string;
  weatherWindSpeed: number;
  weatherClouds: number;
  weatherFetchedAt: Date;
}

// Para o Header
export interface WeatherData {
  location: string; // "City, Country"
  tempC: number;
  description: string;
  icon: string; // Emoji ou código
  forecast?: Array<{
    dateISO: string;
    minC: number;
    maxC: number;
    icon: string;
  }>;
  fetchedAt: string;
}

// Para salvar no banco
export interface GeolocationLog {
  id?: string;
  user_id?: string;
  session_id?: string;
  ip_address: string;
  country?: string;
  country_code?: string;
  region?: string;
  region_name?: string;
  city?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as_info?: string;
  weather_temp?: number;
  weather_feels_like?: number;
  weather_temp_min?: number;
  weather_temp_max?: number;
  weather_pressure?: number;
  weather_humidity?: number;
  weather_description?: string;
  weather_icon?: string;
  weather_wind_speed?: number;
  weather_clouds?: number;
  weather_fetched_at?: Date;
  user_agent?: string;
  page_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

