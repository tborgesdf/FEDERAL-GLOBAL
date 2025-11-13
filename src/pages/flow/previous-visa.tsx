import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "@/components/flow/StepLayout";
import CaptureOrUpload from "@/components/flow/CaptureOrUpload";
import OcrReviewCard from "@/components/flow/OcrReviewCard";
import { useApplication } from "@/hooks/useApplication";
import { uploadDocument, updateDocumentOcr } from "@/services/documentService";
import { toast } from "sonner";

export default function PreviousVisaPage() {
  const navigate = useNavigate();
  const { application, goToNextStep, goToPreviousStep, needsPreviousVisa } = useApplication();
  
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se não precisa de visto anterior, pular este step
  useEffect(() => {
    if (!needsPreviousVisa) {
      console.log('⏭️ Visto anterior não necessário - pulando step');
      navigate('/flow');
    }
  }, [needsPreviousVisa, navigate]);

  const handleUpload = async (file: File | Blob) => {
    if (!application) return;

    setIsLoading(true);
    try {
      const result = await uploadDocument(file, application.id, "previous_visa");
      
      setOcrData(result.document.ocr_json);
      setDocumentId(result.document.id);
      setPreview(URL.createObjectURL(file));
      
      toast.success("Visto anterior enviado! Revise os dados extraídos.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOcrSave = async (updatedData: any) => {
    if (!documentId) return;

    setIsLoading(true);
    try {
      await updateDocumentOcr(documentId, updatedData);
      toast.success("Dados confirmados!");

      const success = await goToNextStep("previous-visa");
      if (success) {
        navigate("/flow");
      }
    } catch (error) {
      toast.error("Erro ao salvar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setPreview(null);
    setOcrData(null);
    setDocumentId(null);
  };

  const handleBack = async () => {
    await goToPreviousStep("previous-visa");
    navigate("/flow");
  };

  // Se não precisa de visto anterior, não renderizar nada
  if (!needsPreviousVisa) {
    return null;
  }

  return (
    <StepLayout
      title="Visto Anterior"
      description="Envie uma foto clara do seu visto americano anterior"
      currentStep="previous-visa"
      onBack={handleBack}
      onNext={async () => {
        if (ocrData && documentId) {
          await handleOcrSave(ocrData);
        }
      }}
      isNextDisabled={!ocrData}
      isNextLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Nota informativa */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Renovação de Visto:</strong> Como você está renovando seu visto, precisamos de uma
            foto do visto anterior para extrair o número e datas de validade.
          </p>
        </div>

        {!ocrData ? (
          <CaptureOrUpload
            label="Visto Anterior"
            description="Tire uma foto ou faça upload do seu visto americano anterior (página do passaporte com o visto colado)"
            onUpload={handleUpload}
            onCapture={handleUpload}
            preview={preview}
            disabled={isLoading}
            facingMode="environment"
          />
        ) : (
          <OcrReviewCard
            title="Revise os dados do Visto Anterior"
            subtitle="Verifique se todas as informações estão corretas"
            ocrData={ocrData}
            docType="previous_visa"
            onSave={handleOcrSave}
            onCancel={handleRetry}
            isLoading={isLoading}
          />
        )}
      </div>
    </StepLayout>
  );
}

