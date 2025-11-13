import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "@/components/flow/StepLayout";
import CaptureOrUpload from "@/components/flow/CaptureOrUpload";
import OcrReviewCard from "@/components/flow/OcrReviewCard";
import { useApplication } from "@/hooks/useApplication";
import { uploadDocument, updateDocumentOcr } from "@/services/documentService";
import { toast } from "sonner";

type BRDocType = 'rg' | 'cnh' | 'cnh_digital';

export default function BRIdPage() {
  const navigate = useNavigate();
  const { application, goToNextStep, goToPreviousStep } = useApplication();
  
  const [docType, setDocType] = useState<BRDocType>('rg');
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [ocrDataFront, setOcrDataFront] = useState<any>(null);
  const [ocrDataBack, setOcrDataBack] = useState<any>(null);
  const [documentIdFront, setDocumentIdFront] = useState<string | null>(null);
  const [documentIdBack, setDocumentIdBack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const needsBack = docType === 'rg' || docType === 'cnh';

  const handleUploadFront = async (file: File | Blob) => {
    if (!application) return;

    setIsLoading(true);
    try {
      const result = await uploadDocument(file, application.id, docType, "front");
      
      setOcrDataFront(result.document.ocr_json);
      setDocumentIdFront(result.document.id);
      setFrontPreview(URL.createObjectURL(file));
      
      toast.success("Frente enviada! Revise os dados extraídos.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar frente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadBack = async (file: File | Blob) => {
    if (!application) return;

    setIsLoading(true);
    try {
      const result = await uploadDocument(file, application.id, docType, "back");
      
      setOcrDataBack(result.document.ocr_json);
      setDocumentIdBack(result.document.id);
      setBackPreview(URL.createObjectURL(file));
      
      toast.success("Verso enviado! Revise os dados extraídos.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar verso");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOcrSaveFront = async (updatedData: any) => {
    if (!documentIdFront) return;

    setIsLoading(true);
    try {
      await updateDocumentOcr(documentIdFront, updatedData);
      setOcrDataFront(updatedData);
      toast.success("Dados da frente confirmados!");
    } catch (error) {
      toast.error("Erro ao salvar dados da frente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOcrSaveBack = async (updatedData: any) => {
    if (!documentIdBack) return;

    setIsLoading(true);
    try {
      await updateDocumentOcr(documentIdBack, updatedData);
      setOcrDataBack(updatedData);
      toast.success("Dados do verso confirmados!");
    } catch (error) {
      toast.error("Erro ao salvar dados do verso");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Validar que ambos os lados foram confirmados (se necessário)
    if (needsBack) {
      if (!ocrDataFront || !ocrDataBack) {
        toast.error("Envie e confirme a frente e o verso do documento");
        return;
      }
    } else {
      if (!ocrDataFront) {
        toast.error("Envie e confirme o documento");
        return;
      }
    }

    setIsLoading(true);
    try {
      const success = await goToNextStep("br-id");
      if (success) {
        navigate("/flow");
      }
    } catch (error) {
      toast.error("Erro ao avançar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    await goToPreviousStep("br-id");
    navigate("/flow");
  };

  const handleRetryFront = () => {
    setFrontPreview(null);
    setOcrDataFront(null);
    setDocumentIdFront(null);
  };

  const handleRetryBack = () => {
    setBackPreview(null);
    setOcrDataBack(null);
    setDocumentIdBack(null);
  };

  const handleDocTypeChange = (newType: BRDocType) => {
    // Limpar tudo ao trocar tipo
    setDocType(newType);
    setFrontPreview(null);
    setBackPreview(null);
    setOcrDataFront(null);
    setOcrDataBack(null);
    setDocumentIdFront(null);
    setDocumentIdBack(null);
  };

  const isComplete = needsBack
    ? (ocrDataFront !== null && ocrDataBack !== null)
    : (ocrDataFront !== null);

  return (
    <StepLayout
      title="Documento Brasileiro"
      description="Envie seu RG ou CNH para identificação"
      currentStep="br-id"
      onBack={handleBack}
      onNext={handleNext}
      isNextDisabled={!isComplete}
      isNextLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Seletor de tipo de documento */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Qual documento você deseja enviar?
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDocTypeChange('rg')}
              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                docType === 'rg'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              RG
            </button>
            <button
              onClick={() => handleDocTypeChange('cnh')}
              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                docType === 'cnh'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              CNH
            </button>
            <button
              onClick={() => handleDocTypeChange('cnh_digital')}
              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                docType === 'cnh_digital'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              CNH Digital
            </button>
          </div>
        </div>

        {/* Nota sobre CNH Digital */}
        {docType === 'cnh_digital' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ CNH Digital:</strong> Tire uma screenshot da tela completa do app Carteira Digital de Trânsito
              mostrando todos os dados (frente e verso em uma única imagem).
            </p>
          </div>
        )}

        {/* Upload da frente */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {needsBack ? 'Frente do Documento' : 'Documento'}
          </h3>
          {!ocrDataFront ? (
            <CaptureOrUpload
              label={`${docType.toUpperCase()} - Frente`}
              description={
                needsBack
                  ? "Tire uma foto ou faça upload da frente do seu documento"
                  : "Tire uma foto ou faça upload do seu documento completo"
              }
              onUpload={handleUploadFront}
              onCapture={handleUploadFront}
              preview={frontPreview}
              disabled={isLoading}
              facingMode="environment"
            />
          ) : (
            <OcrReviewCard
              title={`Revise os dados da ${needsBack ? 'frente' : 'documento'}`}
              subtitle="Verifique se todas as informações estão corretas"
              ocrData={ocrDataFront}
              docType={docType}
              onSave={handleOcrSaveFront}
              onCancel={handleRetryFront}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Upload do verso (se necessário) */}
        {needsBack && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Verso do Documento
            </h3>
            {!ocrDataFront ? (
              <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                <p>Envie a frente primeiro para poder enviar o verso</p>
              </div>
            ) : !ocrDataBack ? (
              <CaptureOrUpload
                label={`${docType.toUpperCase()} - Verso`}
                description="Tire uma foto ou faça upload do verso do seu documento"
                onUpload={handleUploadBack}
                onCapture={handleUploadBack}
                preview={backPreview}
                disabled={isLoading}
                facingMode="environment"
              />
            ) : (
              <OcrReviewCard
                title="Revise os dados do verso"
                subtitle="Verifique se todas as informações estão corretas"
                ocrData={ocrDataBack}
                docType={`${docType}_back`}
                onSave={handleOcrSaveBack}
                onCancel={handleRetryBack}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </div>
    </StepLayout>
  );
}

