/**
 * CAPTURE OR UPLOAD
 * Componente para capturar via câmera (com modal) ou fazer upload de arquivo
 */

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import CameraModal from "./CameraModal";
import { hasVideoInput, blobToFile } from "@/utils/media";

interface CaptureOrUploadProps {
  label: string;
  description?: string;
  accept?: string;
  onCapture?: (blob: Blob) => void;
  onUpload?: (file: File) => void;
  preview?: string | null;
  onRemove?: () => void;
  disabled?: boolean;
  enableCamera?: boolean; // Se true, oferece opção de câmera
  cameraOnly?: boolean; // Se true, força uso de câmera (para selfie)
  cameraTitle?: string;
  cameraInstructions?: string;
  facingMode?: 'user' | 'environment'; // 'user' = frontal, 'environment' = traseira
}

export default function CaptureOrUpload({
  label,
  description,
  accept = "image/jpeg,image/png,image/jpg,application/pdf",
  onCapture,
  onUpload,
  preview,
  onRemove,
  disabled = false,
  enableCamera = true,
  cameraOnly = false,
  cameraTitle = "Capturar Foto",
  cameraInstructions = "Posicione-se no centro da tela e clique em 'Tirar Foto'",
  facingMode = "user",
}: CaptureOrUploadProps) {
  const [hasCameraAvailable, setHasCameraAvailable] = useState<boolean | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar disponibilidade de câmera ao montar
  useEffect(() => {
    if (!enableCamera) {
      setHasCameraAvailable(false);
      return;
    }

    let mounted = true;

    hasVideoInput().then((hasCamera) => {
      if (mounted) {
        setHasCameraAvailable(hasCamera);
      }
    });

    return () => {
      mounted = false;
    };
  }, [enableCamera]);

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleCameraConfirm = (blob: Blob) => {
    if (onCapture) {
      onCapture(blob);
    } else if (onUpload) {
      // Converter blob para file se apenas onUpload estiver disponível
      const file = blobToFile(blob, `captured-${Date.now()}.jpg`);
      onUpload(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  // Se já tem preview, mostrar
  if (preview) {
    return (
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          {label}
        </label>
        
        <div className="border-2 border-green-500 rounded-xl overflow-hidden bg-white">
          {preview.endsWith(".pdf") ? (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <div className="text-center">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">PDF carregado</p>
              </div>
            </div>
          ) : (
            <img src={preview} alt="Preview" className="w-full h-auto" />
          )}
        </div>
        
        <div className="absolute top-8 right-2 flex gap-2">
          <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
          {onRemove && !disabled && (
            <button
              onClick={onRemove}
              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              aria-label="Remover arquivo"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Modo cameraOnly sem câmera disponível
  if (cameraOnly && hasCameraAvailable === false) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          {label}
        </label>
        
        <div className="border-2 border-orange-500 bg-orange-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Câmera não disponível
              </p>
              <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
                Seu dispositivo não possui câmera disponível ou a permissão foi negada. 
                Para continuar, utilize um dispositivo com câmera.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors text-sm"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo normal: captura ou upload
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
            {description}
          </p>
        )}
      </div>

      {/* Loading state enquanto verifica câmera */}
      {hasCameraAvailable === null && enableCamera ? (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0A4B9E] border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Verificando câmera...</p>
          </div>
        </div>
      ) : (
        <div className={`grid ${hasCameraAvailable && !cameraOnly ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* Botão de Câmera */}
          {hasCameraAvailable && enableCamera && (
            <button
              onClick={handleOpenCamera}
              disabled={disabled}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#0A4B9E] hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-12 w-12 text-[#0A4B9E]" />
              <div className="text-center">
                <p className="font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Usar Câmera
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
                  Tirar foto agora
                </p>
              </div>
            </button>
          )}

          {/* Botão de Upload */}
          {!cameraOnly && onUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#0A4B9E] hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-12 w-12 text-[#0A4B9E]" />
              <div className="text-center">
                <p className="font-semibold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Fazer Upload
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
                  Escolher arquivo
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
              />
            </button>
          )}
        </div>
      )}

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onConfirm={handleCameraConfirm}
        title={cameraTitle}
        instructions={cameraInstructions}
        facingMode={facingMode}
      />
    </div>
  );
}
