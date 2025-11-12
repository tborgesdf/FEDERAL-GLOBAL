/**
 * CAMERA MODAL
 * Modal com preview ao vivo da câmera e captura de foto
 */

import { useState, useRef, useEffect } from 'react';
import { X, Camera, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  requestCameraAccess,
  stopMediaStream,
  captureFrameFromVideo,
  getUserFacingConstraints,
  getEnvironmentFacingConstraints,
} from '@/utils/media';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (blob: Blob) => void;
  title?: string;
  instructions?: string;
  maxWidth?: number;
  facingMode?: 'user' | 'environment'; // 'user' = frontal, 'environment' = traseira
}

export default function CameraModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Capturar Foto',
  instructions = 'Posicione-se no centro da tela e clique em "Tirar Foto"',
  maxWidth = 1280,
  facingMode = 'user',
}: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Inicializar câmera ao abrir
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const initCamera = async () => {
      setIsLoading(true);
      setError(null);

      const constraints = facingMode === 'user' 
        ? getUserFacingConstraints() 
        : getEnvironmentFacingConstraints();

      const { stream: mediaStream, error: accessError } = await requestCameraAccess(constraints);

      if (!mounted) {
        if (mediaStream) stopMediaStream(mediaStream);
        return;
      }

      if (accessError || !mediaStream) {
        setError(accessError || 'Não foi possível acessar a câmera.');
        setIsLoading(false);
        toast.error(accessError || 'Erro ao acessar câmera');
        return;
      }

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setIsLoading(false);
    };

    initCamera();

    return () => {
      mounted = false;
    };
  }, [isOpen, facingMode]);

  // Limpar ao fechar
  useEffect(() => {
    if (!isOpen) {
      stopMediaStream(stream);
      setStream(null);
      setCapturedBlob(null);
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
        setCapturedUrl(null);
      }
      setError(null);
      setIsLoading(true);
    }
  }, [isOpen]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      stopMediaStream(stream);
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !stream) return;

    const blob = await captureFrameFromVideo(videoRef.current, 0.95);
    
    if (!blob) {
      toast.error('Erro ao capturar foto. Tente novamente.');
      return;
    }

    // Para o stream após captura
    stopMediaStream(stream);
    setStream(null);

    // Cria preview
    const url = URL.createObjectURL(blob);
    setCapturedBlob(blob);
    setCapturedUrl(url);
  };

  const handleRetake = async () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    setCapturedBlob(null);
    setCapturedUrl(null);
    
    // Reiniciar câmera
    setIsLoading(true);
    const constraints = facingMode === 'user' 
      ? getUserFacingConstraints() 
      : getEnvironmentFacingConstraints();
    
    const { stream: mediaStream, error: accessError } = await requestCameraAccess(constraints);
    
    if (accessError || !mediaStream) {
      setError(accessError || 'Não foi possível acessar a câmera.');
      setIsLoading(false);
      return;
    }

    setStream(mediaStream);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    setIsLoading(false);
  };

  const handleConfirm = () => {
    if (!capturedBlob) return;
    onConfirm(capturedBlob);
    onClose();
  };

  const handleClose = () => {
    stopMediaStream(stream);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6" />
            <h2 
              id="camera-modal-title"
              className="text-xl font-bold"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Instructions */}
          <p 
            className="text-center text-gray-600 mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {instructions}
          </p>

          {/* Video/Preview Area */}
          <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">{error}</p>
                  <p className="text-sm opacity-75">
                    Verifique as permissões do navegador ou use a opção de upload.
                  </p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                  <p className="text-sm">Abrindo câmera...</p>
                </div>
              </div>
            ) : capturedUrl ? (
              <img 
                src={capturedUrl} 
                alt="Foto capturada" 
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Safe Area Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-4 border-white/30 rounded-xl m-4"></div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!error && (
            <div className="flex gap-3">
              {capturedBlob ? (
                <>
                  <button
                    onClick={handleRetake}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <RotateCcw className="h-5 w-5" />
                    Refazer
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Usar Foto
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCapture}
                    disabled={isLoading || !stream}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Camera className="h-5 w-5" />
                    Tirar Foto
                  </button>
                </>
              )}
            </div>
          )}

          {error && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Entendi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

