/**
 * FEDERAL EXPRESS BRASIL
 * Página: Selfie
 * 
 * Captura selfie do usuário e GATILHO para geração automática do DS-160
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "@/components/flow/StepLayout";
import SelfieCapture from "@/components/flow/SelfieCapture";
import { useApplication } from "@/hooks/useApplication";
import { getSelfie } from "@/services/selfieService";
import axios from "axios";
import { toast } from "sonner";
import { Download, CheckCircle, FileSpreadsheet } from "lucide-react";

export default function SelfiePage() {
  const navigate = useNavigate();
  const { application, goToNextStep, goToPreviousStep } = useApplication();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selfieApproved, setSelfieApproved] = useState(false);
  const [ds160Url, setDs160Url] = useState<string | null>(null);
  const [generatingDs160, setGeneratingDs160] = useState(false);

  useEffect(() => {
    if (!application) return;
    checkExistingSelfie();
  }, [application]);

  const checkExistingSelfie = async () => {
    if (!application) return;
    try {
      const selfie = await getSelfie(application.id);
      if (selfie?.accepted) {
        setSelfieApproved(true);
        // Verificar se DS-160 já foi gerado
        // TODO: implementar check de DS-160 existente
      }
    } catch (error) {
      console.error("Erro ao verificar selfie:", error);
    }
  };

  const handleSelfieSuccess = async (blob: Blob, qualityScore: number) => {
    setSelfieApproved(true);
    toast.success(`Selfie aprovada! Qualidade: ${(qualityScore * 100).toFixed(0)}%`);

    // 🎯 GATILHO: Gerar DS-160 automaticamente após selfie aprovada
    await generateDs160();
  };

  const generateDs160 = async () => {
    if (!application) return;

    setGeneratingDs160(true);
    toast.info("Gerando formulário DS-160...");

    try {
      const response = await axios.post("/api/ds160/generate", {
        applicationId: application.id,
      });

      setDs160Url(response.data.fileUrl);
      toast.success("DS-160 gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar DS-160:", error);
      toast.error("Erro ao gerar DS-160. Você poderá baixá-lo no dashboard.");
    } finally {
      setGeneratingDs160(false);
    }
  };

  const handleNext = async () => {
    if (!selfieApproved) {
      toast.error("Complete a selfie antes de continuar");
      return;
    }

    setIsLoading(true);
    try {
      const success = await goToNextStep("selfie");
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
    await goToPreviousStep("selfie");
    navigate("/flow");
  };

  return (
    <StepLayout
      title="Selfie"
      description="Tire uma selfie para validação de identidade"
      currentStep="selfie"
      onBack={handleBack}
      onNext={handleNext}
      isNextDisabled={!selfieApproved || generatingDs160}
      isNextLoading={isLoading}
    >
      <div className="space-y-6">
        {!selfieApproved ? (
          <>
            {/* Instruções */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📸 Instruções para uma boa selfie:</h3>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li>Remova óculos, bonés ou qualquer acessório no rosto</li>
                <li>Posicione-se em um local bem iluminado</li>
                <li>Olhe diretamente para a câmera</li>
                <li>Mantenha uma expressão neutra</li>
                <li>Enquadre seu rosto centralizado</li>
              </ul>
            </div>

            <SelfieCapture
              onSuccess={handleSelfieSuccess}
              applicationId={application?.id || ""}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="space-y-4">
            {/* Selfie aprovada */}
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">
                    Selfie aprovada!
                  </h3>
                  <p className="text-sm text-green-800">
                    Sua selfie foi validada com sucesso. Você está quase terminando!
                  </p>
                </div>
              </div>
            </div>

            {/* Gerando DS-160 */}
            {generatingDs160 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-600 border-t-transparent"></div>
                  <div>
                    <p className="text-blue-900 font-semibold">
                      Gerando formulário DS-160...
                    </p>
                    <p className="text-sm text-blue-700">
                      Estamos consolidando todos os seus dados. Isso pode levar alguns segundos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DS-160 gerado */}
            {ds160Url && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-2 text-lg">
                      🎉 DS-160 Gerado com Sucesso!
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                      Seu formulário DS-160 foi gerado automaticamente com todos os seus dados (passaporte, 
                      documentos, redes sociais, endereço e selfie). Baixe o arquivo Excel e revise antes 
                      de preencher no site oficial do Departamento de Estado.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href={ds160Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <Download className="h-5 w-5" />
                        Baixar DS-160 (Excel)
                      </a>
                      <button
                        onClick={() => window.open(ds160Url, '_blank')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Visualizar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Próximos passos */}
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                📋 Próximos Passos:
              </h3>
              <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1.5">
                <li>Clique em "Próximo" para responder ao questionário final</li>
                <li>Revise todos os dados no questionário</li>
                <li>Submeta sua aplicação</li>
                <li>Aguarde a revisão da nossa equipe</li>
                <li>Receba instruções para agendamento da entrevista</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}

