/**
 * SELFIE CAPTURE
 * Componente específico para captura de selfie com validação de qualidade
 */

import { useState } from "react";
import { Camera, CheckCircle, X, AlertCircle } from "lucide-react";
import CaptureOrUpload from "./CaptureOrUpload";
import { toast } from "sonner";

interface SelfieCaptureProps {
  onSuccess: (blob: Blob, qualityScore: number) => void;
  onRetry?: () => void;
  applicationId: string;
  isLoading?: boolean;
}

interface QualityResponse {
  accepted: boolean;
  qualityScore: number;
  rejectionReason?: string;
  storagePath?: string;
}

export default function SelfieCapture({
  onSuccess,
  onRetry,
  applicationId,
  isLoading = false,
}: SelfieCaptureProps) {
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<QualityResponse | null>(null);

  const handleCapture = async (blob: Blob) => {
    setCapturedBlob(blob);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);

    // Validar qualidade automaticamente
    await validateSelfie(blob);
  };

  const validateSelfie = async (blob: Blob) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Preparar FormData
      const formData = new FormData();
      formData.append("file", blob, "selfie.jpg");
      formData.append("application_id", applicationId);

      // Obter token do usuário (assumindo que está no Supabase)
      // TODO: Substituir por implementação real de auth
      const token = ""; // await supabase.auth.getSession().then(s => s.data.session?.access_token)

      const response = await fetch("/api/selfie-quality", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result: QualityResponse = await response.json();
      setValidationResult(result);

      if (result.accepted) {
        toast.success("Selfie aprovada!");
        onSuccess(blob, result.qualityScore);
      } else {
        toast.error(result.rejectionReason || "Selfie reprovada. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao validar selfie:", error);
      toast.error("Erro ao validar selfie. Tente novamente.");
      setValidationResult({
        accepted: false,
        qualityScore: 0,
        rejectionReason: "Erro na conexão com o servidor",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRetry = () => {
    // Limpar estado
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedBlob(null);
    setPreviewUrl(null);
    setValidationResult(null);
    
    if (onRetry) {
      onRetry();
    }
  };

  // Se já capturou e está validando ou validou
  if (previewUrl && (isValidating || validationResult)) {
    return (
      <div className="space-y-4">
        {/* Preview */}
        <div className="relative">
          <div className="rounded-xl overflow-hidden bg-black">
            <img src={previewUrl} alt="Selfie" className="w-full h-auto" />
          </div>

          {/* Status Overlay */}
          {isValidating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm font-medium">Analisando qualidade...</p>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {validationResult && !isValidating && (
          <div
            className={`rounded-xl p-4 ${
              validationResult.accepted
                ? "bg-green-50 border-2 border-green-500"
                : "bg-red-50 border-2 border-red-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 ${
                  validationResult.accepted ? "text-green-600" : "text-red-600"
                }`}
              >
                {validationResult.accepted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold mb-1 ${
                    validationResult.accepted ? "text-green-900" : "text-red-900"
                  }`}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {validationResult.accepted
                    ? "Selfie aprovada!"
                    : "Selfie reprovada"}
                </p>
                <p
                  className={`text-sm ${
                    validationResult.accepted ? "text-green-800" : "text-red-800"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {validationResult.accepted ? (
                    <>
                      Qualidade: {(validationResult.qualityScore * 100).toFixed(0)}%
                    </>
                  ) : (
                    validationResult.rejectionReason ||
                    "A qualidade da foto não atende aos requisitos mínimos."
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions se reprovado */}
        {validationResult && !validationResult.accepted && !isLoading && (
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#0A4B9E] to-[#0058CC] text-white font-semibold hover:opacity-90 transition-all duration-200 shadow-lg"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <Camera className="h-5 w-5 inline mr-2" />
              Tirar Nova Selfie
            </button>
          </div>
        )}
      </div>
    );
  }

  // Modo de captura inicial
  return (
    <CaptureOrUpload
      label="Tire uma selfie"
      description="Posicione seu rosto no centro da tela. A foto será analisada automaticamente."
      onCapture={handleCapture}
      enableCamera={true}
      cameraOnly={true}
      cameraTitle="Capturar Selfie"
      cameraInstructions="Posicione seu rosto no centro da moldura. Certifique-se de que está bem iluminado e que todo o seu rosto está visível."
      facingMode="user"
      disabled={isLoading || isValidating}
    />
  );
}

