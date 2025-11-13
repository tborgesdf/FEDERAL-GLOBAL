import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "@/components/flow/StepLayout";
import CaptureOrUpload from "@/components/flow/CaptureOrUpload";
import OcrReviewCard from "@/components/flow/OcrReviewCard";
import { useApplication } from "@/hooks/useApplication";
import { uploadDocument, updateDocumentOcr } from "@/services/documentService";
import { toast } from "sonner";

export default function MarriageCertPage() {
  const navigate = useNavigate();
  const { application, goToNextStep, goToPreviousStep, needsMarriageCertificate } = useApplication();
  
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se não precisa de certidão, pular este step
  useEffect(() => {
    if (!needsMarriageCertificate) {
      console.log('⏭️ Certidão de casamento não necessária - pulando step');
      navigate('/flow');
    }
  }, [needsMarriageCertificate, navigate]);

  const handleUpload = async (file: File | Blob) => {
    if (!application) return;

    setIsLoading(true);
    try {
      const result = await uploadDocument(file, application.id, "marriage_cert");
      
      setOcrData(result.document.ocr_json);
      setDocumentId(result.document.id);
      setPreview(URL.createObjectURL(file));
      
      toast.success("Certidão enviada! Revise os dados extraídos.");
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

      const success = await goToNextStep("marriage-cert");
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
    await goToPreviousStep("marriage-cert");
    navigate("/flow");
  };

  // Se não precisa de certidão, não renderizar nada
  if (!needsMarriageCertificate) {
    return null;
  }

  return (
    <StepLayout
      title="Certidão de Casamento"
      description="Envie sua certidão de casamento ou declaração de união estável"
      currentStep="marriage-cert"
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
          <p className="text-sm text-blue-800 mb-2">
            <strong>ℹ️ Documento necessário:</strong>
          </p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>
              {application?.civil_status === 'married' 
                ? 'Certidão de casamento emitida por cartório brasileiro'
                : 'Declaração de união estável registrada em cartório'}
            </li>
            <li>Documento deve estar legível e sem cortes</li>
            <li>Aceita-se foto ou PDF</li>
          </ul>
        </div>

        {!ocrData ? (
          <CaptureOrUpload
            label={application?.civil_status === 'married' ? 'Certidão de Casamento' : 'Declaração de União Estável'}
            description="Tire uma foto ou faça upload do documento completo"
            onUpload={handleUpload}
            onCapture={handleUpload}
            preview={preview}
            disabled={isLoading}
            facingMode="environment"
          />
        ) : (
          <OcrReviewCard
            title={`Revise os dados ${application?.civil_status === 'married' ? 'da Certidão' : 'da Declaração'}`}
            subtitle="Verifique se todas as informações estão corretas"
            ocrData={ocrData}
            docType="marriage_cert"
            onSave={handleOcrSave}
            onCancel={handleRetry}
            isLoading={isLoading}
          />
        )}

        {/* Informações adicionais */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Atenção:</strong> Este documento será utilizado para preencher informações sobre seu cônjuge
            no formulário DS-160. Certifique-se de que o documento está atualizado e todos os dados estão legíveis.
          </p>
        </div>
      </div>
    </StepLayout>
  );
}

