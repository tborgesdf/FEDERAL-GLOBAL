/**
 * Componente para exibir informações do dispositivo em tempo real
 * Mostra marca, modelo, breakpoint e ajusta responsividade automaticamente
 */

import { useEffect, useState } from 'react';
import { useDeviceDetection, detectDevice } from '@/utils/deviceDetection';
import { Smartphone, Tablet, Monitor, Info } from 'lucide-react';

export default function DeviceInfoDisplay() {
  const deviceInfo = useDeviceDetection();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Mostrar informações do dispositivo"
      >
        <Info className="h-5 w-5" />
      </button>
    );
  }

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case 'Mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'Tablet':
        return <Tablet className="h-6 w-6" />;
      default:
        return <Monitor className="h-6 w-6" />;
    }
  };

  const getBreakpointColor = () => {
    switch (deviceInfo.breakpoint) {
      case 'xs':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'sm':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'md':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'lg':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'xl':
        return 'bg-red-100 text-red-700 border-red-300';
      case '2xl':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 max-w-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getDeviceIcon()}
          <h3 className="font-bold text-gray-900">Informações do Dispositivo</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Breakpoint Badge */}
      <div className={`mb-3 px-3 py-1.5 rounded-lg border-2 text-center font-semibold text-sm ${getBreakpointColor()}`}>
        Breakpoint: <span className="uppercase">{deviceInfo.breakpoint}</span>
        <span className="ml-2 text-xs">
          ({deviceInfo.viewportWidth}px × {deviceInfo.viewportHeight}px)
        </span>
      </div>

      {/* Informações do Dispositivo */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Dispositivo:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.fullName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Marca:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.brand}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Modelo:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.model}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tipo:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.type}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Sistema:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.os} {deviceInfo.osVersion}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Navegador:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.browser} {deviceInfo.browserVersion}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Resolução:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.screenResolution}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Pixel Ratio:</span>
          <span className="font-semibold text-gray-900">{deviceInfo.pixelRatio}x</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Touch:</span>
          <span className={`font-semibold ${deviceInfo.isTouchDevice ? 'text-green-600' : 'text-gray-600'}`}>
            {deviceInfo.isTouchDevice ? 'Sim' : 'Não'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Retina:</span>
          <span className={`font-semibold ${deviceInfo.isRetina ? 'text-green-600' : 'text-gray-600'}`}>
            {deviceInfo.isRetina ? 'Sim' : 'Não'}
          </span>
        </div>
      </div>

      {/* Footer - Responsividade Automática */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          ✅ Responsividade automática ativa via Tailwind CSS
        </p>
      </div>
    </div>
  );
}

