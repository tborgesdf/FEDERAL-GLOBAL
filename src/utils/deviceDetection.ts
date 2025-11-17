/**
 * Utilitário para Detecção Avançada de Dispositivos
 * Detecta marca, modelo, tipo, OS, navegador e ajusta responsividade automaticamente
 */

import React from 'react';

export interface DeviceInfo {
  // Identificação básica
  type: 'Mobile' | 'Tablet' | 'Desktop';
  brand: string;
  model: string;
  fullName: string;
  
  // Sistema
  os: string;
  osVersion: string;
  platform: string;
  
  // Navegador
  browser: string;
  browserVersion: string;
  
  // Tela
  screenWidth: number;
  screenHeight: number;
  screenResolution: string;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  
  // Outros
  language: string;
  timezone: string;
  userAgent: string;
  
  // Responsividade
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isTouchDevice: boolean;
  isRetina: boolean;
}

/**
 * Detecta marca e modelo do dispositivo a partir do User Agent
 */
function detectBrandAndModel(userAgent: string): { brand: string; model: string; fullName: string } {
  const ua = userAgent.toLowerCase();
  
  // iPhone
  if (ua.includes('iphone')) {
    const modelMatch = ua.match(/iphone\s*(\d+)/i);
    const model = modelMatch ? `iPhone ${modelMatch[1]}` : 'iPhone';
    return { brand: 'Apple', model, fullName: `${model} (Apple)` };
  }
  
  // iPad
  if (ua.includes('ipad')) {
    const modelMatch = ua.match(/ipad[^;]*os\s*(\d+)/i);
    const model = modelMatch ? `iPad (iOS ${modelMatch[1]})` : 'iPad';
    return { brand: 'Apple', model, fullName: `${model} (Apple)` };
  }
  
  // Android - Samsung
  if (ua.includes('samsung') || ua.includes('sm-')) {
    const modelMatch = ua.match(/sm-([a-z0-9]+)/i) || ua.match(/samsung[^;]*([a-z0-9\s]+)/i);
    const model = modelMatch ? `Galaxy ${modelMatch[1].toUpperCase()}` : 'Galaxy';
    return { brand: 'Samsung', model, fullName: `Samsung ${model}` };
  }
  
  // Android - Xiaomi
  if (ua.includes('xiaomi') || ua.includes('mi ')) {
    const modelMatch = ua.match(/mi\s*([a-z0-9\s]+)/i) || ua.match(/xiaomi[^;]*([a-z0-9\s]+)/i);
    const model = modelMatch ? `Mi ${modelMatch[1]}` : 'Mi';
    return { brand: 'Xiaomi', model, fullName: `Xiaomi ${model}` };
  }
  
  // Android - Motorola
  if (ua.includes('motorola') || ua.includes('moto')) {
    const modelMatch = ua.match(/moto[^;]*([a-z0-9\s]+)/i);
    const model = modelMatch ? `Moto ${modelMatch[1]}` : 'Moto';
    return { brand: 'Motorola', model, fullName: `Motorola ${model}` };
  }
  
  // Android - LG
  if (ua.includes('lg-') || ua.includes('lg ')) {
    const modelMatch = ua.match(/lg[-\s]([a-z0-9]+)/i);
    const model = modelMatch ? modelMatch[1].toUpperCase() : 'LG';
    return { brand: 'LG', model, fullName: `LG ${model}` };
  }
  
  // Android - Google Pixel
  if (ua.includes('pixel')) {
    const modelMatch = ua.match(/pixel\s*(\d+)/i);
    const model = modelMatch ? `Pixel ${modelMatch[1]}` : 'Pixel';
    return { brand: 'Google', model, fullName: `Google ${model}` };
  }
  
  // Android - OnePlus
  if (ua.includes('oneplus') || ua.includes('one plus')) {
    const modelMatch = ua.match(/oneplus[^;]*([a-z0-9\s]+)/i);
    const model = modelMatch ? modelMatch[1] : 'OnePlus';
    return { brand: 'OnePlus', model, fullName: `OnePlus ${model}` };
  }
  
  // Android - Huawei
  if (ua.includes('huawei') || ua.includes('honor')) {
    const modelMatch = ua.match(/(huawei|honor)[^;]*([a-z0-9\s]+)/i);
    const model = modelMatch ? modelMatch[2] : 'Huawei';
    return { brand: 'Huawei', model, fullName: `Huawei ${model}` };
  }
  
  // Android - Outros
  if (ua.includes('android')) {
    const modelMatch = ua.match(/android[^;]*;\s*([a-z0-9\s]+)\s*build/i);
    const model = modelMatch ? modelMatch[1] : 'Android Device';
    return { brand: 'Android', model, fullName: `${model} (Android)` };
  }
  
  // Desktop - Windows
  if (ua.includes('windows')) {
    const versionMatch = ua.match(/windows\s*nt\s*(\d+\.\d+)/i);
    const version = versionMatch ? versionMatch[1] : '';
    return { brand: 'Microsoft', model: `Windows ${version}`, fullName: `Windows ${version} (Microsoft)` };
  }
  
  // Desktop - macOS
  if (ua.includes('mac os') || ua.includes('macintosh')) {
    const versionMatch = ua.match(/mac\s*os\s*x\s*[_\s](\d+[_\s]\d+)/i);
    const version = versionMatch ? versionMatch[1].replace(/_/g, '.') : '';
    return { brand: 'Apple', model: `macOS ${version}`, fullName: `macOS ${version} (Apple)` };
  }
  
  // Desktop - Linux
  if (ua.includes('linux')) {
    return { brand: 'Linux', model: 'Linux', fullName: 'Linux' };
  }
  
  // Padrão
  return { brand: 'Unknown', model: 'Unknown', fullName: 'Unknown Device' };
}

/**
 * Detecta versão do navegador
 */
function detectBrowserVersion(userAgent: string, browser: string): string {
  const ua = userAgent.toLowerCase();
  
  if (browser === 'Chrome') {
    const match = ua.match(/chrome\/(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }
  
  if (browser === 'Firefox') {
    const match = ua.match(/firefox\/(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }
  
  if (browser === 'Safari') {
    const match = ua.match(/version\/(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }
  
  if (browser === 'Edge') {
    const match = ua.match(/edg\/(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }
  
  return 'Unknown';
}

/**
 * Detecta versão do OS
 */
function detectOSVersion(userAgent: string, os: string): string {
  const ua = userAgent.toLowerCase();
  
  if (os === 'iOS') {
    const match = ua.match(/os\s*(\d+[_\s]\d+)/i);
    return match ? match[1].replace(/_/g, '.') : 'Unknown';
  }
  
  if (os === 'Android') {
    const match = ua.match(/android\s*(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }
  
  if (os === 'Windows') {
    const match = ua.match(/windows\s*nt\s*(\d+\.\d+)/i);
    return match ? match[1] : 'Unknown';
  }
  
  if (os === 'macOS') {
    const match = ua.match(/mac\s*os\s*x\s*[_\s](\d+[_\s]\d+)/i);
    return match ? match[1].replace(/_/g, '.') : 'Unknown';
  }
  
  return 'Unknown';
}

/**
 * Detecta breakpoint baseado na largura da viewport
 */
function detectBreakpoint(width: number): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (width < 640) return 'xs';      // Mobile
  if (width < 768) return 'sm';      // Phablet
  if (width < 1024) return 'md';     // Tablet
  if (width < 1280) return 'lg';     // Laptop
  if (width < 1536) return 'xl';     // Desktop
  return '2xl';                       // Large Desktop
}

/**
 * Função principal para detectar todas as informações do dispositivo
 */
export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const { brand, model, fullName } = detectBrandAndModel(userAgent);
  
  // Detectar tipo de dispositivo
  const isMobile = /mobile|android|iphone|ipod|blackberry|opera|mini|windows\s+ce|palm|smartphone|iemobile/i.test(userAgent);
  const isTablet = /tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(userAgent);
  const type: 'Mobile' | 'Tablet' | 'Desktop' = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';
  
  // Detectar navegador
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
  
  const browserVersion = detectBrowserVersion(userAgent, browser);
  
  // Detectar OS
  let os = 'Unknown';
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac os|macintosh/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  
  const osVersion = detectOSVersion(userAgent, os);
  
  // Informações de tela
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const pixelRatio = window.devicePixelRatio || 1;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isRetina = pixelRatio > 1;
  
  // Breakpoint
  const breakpoint = detectBreakpoint(viewportWidth);
  
  // Touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    type,
    brand,
    model,
    fullName,
    os,
    osVersion,
    platform: navigator.platform,
    browser,
    browserVersion,
    screenWidth,
    screenHeight,
    screenResolution: `${screenWidth}x${screenHeight}`,
    pixelRatio,
    viewportWidth,
    viewportHeight,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent,
    breakpoint,
    isTouchDevice,
    isRetina,
  };
}

/**
 * Hook React para usar detecção de dispositivo com atualização automática
 */
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => detectDevice());
  
  React.useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(detectDevice());
    };
    
    // Atualizar ao redimensionar
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}

// Import React para o hook
import React from 'react';

