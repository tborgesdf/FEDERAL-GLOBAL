import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "@/components/flow/StepLayout";
import CaptureOrUpload from "@/components/flow/CaptureOrUpload";
import OcrReviewCard from "@/components/flow/OcrReviewCard";
import { useApplication } from "@/hooks/useApplication";
import { uploadDocument, updateDocumentOcr } from "@/services/documentService";
import { toast } from "sonner";

export default function PassportPage() {
  const navigate = useNavigate();
  const { application, goToNextStep, goToPreviousStep, getCurrentStepInfo } = useApplication();
  
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stepInfo = getCurrentStepInfo();

  const handleUpload = async (file: File | Blob) => {
    if (!application) return;

    setIsLoading(true);
    try {
      const result = await uploadDocument(file, application.id, "passport");
      
      setOcrData(result.document.ocr_json);
      setDocumentId(result.document.id);
      setPreview(URL.createObjectURL(file));
      
      toast.success("Documento enviado! Revise os dados extraídos.");
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

      const success = await goToNextStep("passport");
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
    await goToPreviousStep("passport");
    navigate("/flow");
  };

  return (
    <StepLayout
      title="Passaporte"
      description="Envie uma foto clara do seu passaporte"
      currentStep="passport"
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
        {!ocrData ? (
          <CaptureOrUpload
            label="Passaporte"
            description="Tire uma foto ou faça upload da página principal do seu passaporte"
            onUpload={handleUpload}
            onCapture={handleUpload}
            preview={preview}
            disabled={isLoading}
            facingMode="environment"
          />
        ) : (
          <OcrReviewCard
            title="Revise os dados do Passaporte"
            subtitle="Verifique se todas as informações estão corretas"
            ocrData={ocrData}
            docType="passport"
            onSave={handleOcrSave}
            onCancel={handleRetry}
            isLoading={isLoading}
          />
        )}
      </div>
    </StepLayout>
  );
}

