/**
 * CAPTURE OR UPLOAD
 * Componente para capturar via câmera ou fazer upload de arquivo
 */

import { useState, useRef } from "react";
import { Camera, Upload, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CaptureOrUploadProps {
  label: string;
  description?: string;
  accept?: string;
  onCapture?: (blob: Blob) => void;
  onUpload?: (file: File) => void;
  preview?: string | null;
  onRemove?: () => void;
  disabled?: boolean;
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
}: CaptureOrUploadProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      setStream(mediaStream);
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error("Não foi possível acessar a câmera");
      console.error("Camera access error:", error);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !stream) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob && onCapture) {
        onCapture(blob);
        handleStopCapture();
      }
    }, "image/jpeg", 0.95);
  };

  const handleStopCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  if (preview) {
    return (
      <div className="relative">
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
        <div className="absolute top-2 right-2 flex gap-2">
          <div className="bg-green-500 text-white rounded-full p-2">
            <CheckCircle className="h-5 w-5" />
          </div>
          {onRemove && !disabled && (
            <button
              onClick={onRemove}
              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isCapturing) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStopCapture}
            className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCapture}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Capturar Foto
          </button>
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {onCapture && (
          <button
            onClick={handleStartCapture}
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

        {onUpload && (
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
    </div>
  );
}

