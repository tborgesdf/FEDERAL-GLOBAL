/**
 * Serviço de Captura de Dados Forenses
 * 
 * Captura informações completas do dispositivo, conexão e localização
 * para compliance e análise BI
 */

export interface ForensicData {
  // Geolocalização do Dispositivo (GPS)
  geolocalizacaoDispositivo: {
    lat: number | null;
    lng: number | null;
    precisao: number | null;
    timestamp: string | null;
  };
  
  // Geolocalização do IP
  geolocalizacaoIP: {
    cidade: string | null;
    estado: string | null;
    pais: string | null;
    lat: number | null;
    lng: number | null;
    timezone: string | null;
  };
  
  // IP do Usuário
  ip: string | null;
  
  // Dados da Conexão
  conexao: {
    tipo: string | null;
    operadora: string | null;
    velocidade: string | null;
  };
  
  // Dados do Dispositivo
  dispositivo: {
    sistemaOperacional: string | null;
    versaoSistemaOperacional: string | null;
    navegador: string | null;
    versaoNavegador: string | null;
    marca: string | null;
    modelo: string | null;
    tipo: string | null;
    resolucaoTela: string | null;
  };
  
  // Dados Técnicos
  tecnicos: {
    userAgent: string;
    idiomaNavegador: string;
    timezoneNavegador: string;
    platform: string;
    cookiesHabilitados: boolean;
    javascriptHabilitado: boolean;
  };
  
  // Dados de Referência
  referencia: {
    urlOrigemm: string;
    urlPaginaAceite: string;
    referrer: string;
  };
}

/**
 * Detecta informações do navegador a partir do User Agent
 */
function detectBrowserInfo(userAgent: string): { navegador: string; versao: string } {
  let navegador = "Desconhecido";
  let versao = "N/A";

  if (userAgent.includes("Firefox")) {
    navegador = "Firefox";
    const match = userAgent.match(/Firefox\/([0-9.]+)/);
    versao = match ? match[1] : "N/A";
  } else if (userAgent.includes("Edg")) {
    navegador = "Microsoft Edge";
    const match = userAgent.match(/Edg\/([0-9.]+)/);
    versao = match ? match[1] : "N/A";
  } else if (userAgent.includes("Chrome")) {
    navegador = "Chrome";
    const match = userAgent.match(/Chrome\/([0-9.]+)/);
    versao = match ? match[1] : "N/A";
  } else if (userAgent.includes("Safari")) {
    navegador = "Safari";
    const match = userAgent.match(/Version\/([0-9.]+)/);
    versao = match ? match[1] : "N/A";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    navegador = "Opera";
    const match = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/);
    versao = match ? match[1] : "N/A";
  }

  return { navegador, versao };
}

/**
 * Detecta informações do sistema operacional a partir do User Agent
 */
function detectOSInfo(userAgent: string): { sistema: string; versao: string } {
  let sistema = "Desconhecido";
  let versao = "N/A";

  if (userAgent.includes("Windows NT 10.0")) {
    sistema = "Windows";
    versao = "10/11";
  } else if (userAgent.includes("Windows NT 6.3")) {
    sistema = "Windows";
    versao = "8.1";
  } else if (userAgent.includes("Windows NT 6.2")) {
    sistema = "Windows";
    versao = "8";
  } else if (userAgent.includes("Windows NT 6.1")) {
    sistema = "Windows";
    versao = "7";
  } else if (userAgent.includes("Mac OS X")) {
    sistema = "macOS";
    const match = userAgent.match(/Mac OS X ([0-9_]+)/);
    versao = match ? match[1].replace(/_/g, ".") : "N/A";
  } else if (userAgent.includes("Android")) {
    sistema = "Android";
    const match = userAgent.match(/Android ([0-9.]+)/);
    versao = match ? match[1] : "N/A";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    sistema = userAgent.includes("iPad") ? "iPadOS" : "iOS";
    const match = userAgent.match(/OS ([0-9_]+)/);
    versao = match ? match[1].replace(/_/g, ".") : "N/A";
  } else if (userAgent.includes("Linux")) {
    sistema = "Linux";
    versao = "N/A";
  }

  return { sistema, versao };
}

/**
 * Detecta tipo de dispositivo
 */
function detectDeviceType(userAgent: string): { tipo: string; marca: string; modelo: string } {
  let tipo = "Desktop";
  let marca = "Desconhecida";
  let modelo = "Desconhecido";

  if (/mobile|android|iphone|ipod/i.test(userAgent)) {
    tipo = "Smartphone";
    
    if (userAgent.includes("iPhone")) {
      marca = "Apple";
      const match = userAgent.match(/iPhone OS ([0-9_]+)/);
      modelo = match ? `iPhone (iOS ${match[1].replace(/_/g, ".")})` : "iPhone";
    } else if (userAgent.includes("iPad")) {
      marca = "Apple";
      tipo = "Tablet";
      modelo = "iPad";
    } else if (userAgent.includes("Samsung")) {
      marca = "Samsung";
      const match = userAgent.match(/SM-[A-Z0-9]+/);
      modelo = match ? match[0] : "Samsung Galaxy";
    } else if (userAgent.includes("Xiaomi")) {
      marca = "Xiaomi";
      modelo = "Xiaomi";
    } else if (userAgent.includes("Motorola")) {
      marca = "Motorola";
      modelo = "Moto";
    }
  } else if (/tablet|ipad/i.test(userAgent)) {
    tipo = "Tablet";
  }

  return { tipo, marca, modelo };
}

/**
 * Detecta tipo de conexão usando Network Information API
 */
function detectConnectionType(): { tipo: string; velocidade: string } {
  const nav = navigator as any;
  
  if (nav.connection || nav.mozConnection || nav.webkitConnection) {
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    const effectiveType = connection.effectiveType || "unknown";
    const downlink = connection.downlink ? `${connection.downlink} Mbps` : "N/A";
    
    let tipo = "Desconhecido";
    switch (effectiveType) {
      case "slow-2g":
        tipo = "2G Lento";
        break;
      case "2g":
        tipo = "2G";
        break;
      case "3g":
        tipo = "3G";
        break;
      case "4g":
        tipo = "4G";
        break;
      case "5g":
        tipo = "5G";
        break;
      default:
        tipo = effectiveType.toUpperCase();
    }
    
    return { tipo, velocidade: downlink };
  }
  
  return { tipo: "Desconhecido", velocidade: "N/A" };
}

/**
 * Obtém geolocalização do dispositivo via GPS
 */
async function getDeviceLocation(): Promise<{
  lat: number | null;
  lng: number | null;
  precisao: number | null;
  timestamp: string | null;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, precisao: null, timestamp: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          precisao: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => {
        console.warn("Geolocalização negada ou indisponível:", error);
        resolve({ lat: null, lng: null, precisao: null, timestamp: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Obtém IP público do usuário e geolocalização via IP
 */
async function getIPAndLocation(): Promise<{
  ip: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string | null;
  operadora: string | null;
}> {
  try {
    // Usando ipapi.co (gratuito, 30k requests/mês)
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    return {
      ip: data.ip || null,
      cidade: data.city || null,
      estado: data.region || null,
      pais: data.country_name || null,
      lat: data.latitude || null,
      lng: data.longitude || null,
      timezone: data.timezone || null,
      operadora: data.org || null,
    };
  } catch (error) {
    console.error("Erro ao obter IP e localização:", error);
    return {
      ip: null,
      cidade: null,
      estado: null,
      pais: null,
      lat: null,
      lng: null,
      timezone: null,
      operadora: null,
    };
  }
}

/**
 * Captura todos os dados forenses do usuário
 */
export async function captureForensicData(): Promise<ForensicData> {
  const userAgent = navigator.userAgent;
  const browserInfo = detectBrowserInfo(userAgent);
  const osInfo = detectOSInfo(userAgent);
  const deviceInfo = detectDeviceType(userAgent);
  const connectionInfo = detectConnectionType();
  
  // Captura localização do dispositivo (assíncrono)
  const deviceLocation = await getDeviceLocation();
  
  // Captura IP e localização (assíncrono)
  const ipLocation = await getIPAndLocation();

  return {
    geolocalizacaoDispositivo: {
      lat: deviceLocation.lat,
      lng: deviceLocation.lng,
      precisao: deviceLocation.precisao,
      timestamp: deviceLocation.timestamp,
    },
    
    geolocalizacaoIP: {
      cidade: ipLocation.cidade,
      estado: ipLocation.estado,
      pais: ipLocation.pais,
      lat: ipLocation.lat,
      lng: ipLocation.lng,
      timezone: ipLocation.timezone,
    },
    
    ip: ipLocation.ip,
    
    conexao: {
      tipo: connectionInfo.tipo,
      operadora: ipLocation.operadora,
      velocidade: connectionInfo.velocidade,
    },
    
    dispositivo: {
      sistemaOperacional: osInfo.sistema,
      versaoSistemaOperacional: osInfo.versao,
      navegador: browserInfo.navegador,
      versaoNavegador: browserInfo.versao,
      marca: deviceInfo.marca,
      modelo: deviceInfo.modelo,
      tipo: deviceInfo.tipo,
      resolucaoTela: `${window.screen.width}x${window.screen.height}`,
    },
    
    tecnicos: {
      userAgent,
      idiomaNavegador: navigator.language,
      timezoneNavegador: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      cookiesHabilitados: navigator.cookieEnabled,
      javascriptHabilitado: true,
    },
    
    referencia: {
      urlOrigemm: document.referrer || window.location.origin,
      urlPaginaAceite: window.location.href,
      referrer: document.referrer || "Acesso direto",
    },
  };
}

/**
 * Gera URL do Google Maps com a localização exata
 */
export function generateGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}&z=18`;
}

/**
 * Formata dados forenses para exibição amigável
 */
export function formatForensicDataForDisplay(data: ForensicData) {
  return {
    "Nome Completo": "(será preenchido)",
    "CPF": "(será preenchido)",
    "Data Nascimento": "(será preenchido)",
    "Idade Verificada": "(será preenchido)",
    "E-mail": "(será preenchido)",
    "Telefone Celular": "(será preenchido)",
    "Data/Hora": new Date().toLocaleString("pt-BR"),
    "IP do Usuário": data.ip || "Não capturado",
    "Geolocalização Dispositivo": data.geolocalizacaoDispositivo.lat && data.geolocalizacaoDispositivo.lng
      ? `Lat: ${data.geolocalizacaoDispositivo.lat.toFixed(4)}, Long: ${data.geolocalizacaoDispositivo.lng.toFixed(4)}`
      : "Não autorizado",
    "Geolocalização IP": data.geolocalizacaoIP.cidade && data.geolocalizacaoIP.estado
      ? `${data.geolocalizacaoIP.cidade}, ${data.geolocalizacaoIP.estado}`
      : "Não disponível",
    "Tipo de Conexão": data.conexao.tipo || "Desconhecido",
    "Operadora": data.conexao.operadora || "Não identificada",
    "Sistema Operacional": data.dispositivo.sistemaOperacional && data.dispositivo.versaoSistemaOperacional
      ? `${data.dispositivo.sistemaOperacional} ${data.dispositivo.versaoSistemaOperacional}`
      : "Desconhecido",
    "Navegador": data.dispositivo.navegador && data.dispositivo.versaoNavegador
      ? `${data.dispositivo.navegador} ${data.dispositivo.versaoNavegador}`
      : "Desconhecido",
    "Marca/Modelo": `${data.dispositivo.marca} ${data.dispositivo.modelo}`,
  };
}

