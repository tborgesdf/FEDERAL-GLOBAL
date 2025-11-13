/**
 * FEDERAL EXPRESS BRASIL
 * Página: Questionário Final
 * 
 * Revisão final de todos os dados e submissão da aplicação
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "@/components/flow/StepLayout";
import { useApplication } from "@/hooks/useApplication";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, FileText, User, MapPin, FileCheck } from "lucide-react";

interface DataSummary {
  profile: any;
  documents: any[];
  socialAccounts: any[];
  selfie: any;
}

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { application, goToPreviousStep } = useApplication();
  
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [missingData, setMissingData] = useState<string[]>([]);

  useEffect(() => {
    if (!application) return;
    loadDataSummary();
  }, [application]);

  const loadDataSummary = async () => {
    if (!application) return;

    setIsLoading(true);
    try {
      // Carregar perfil
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Carregar documentos
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', application.id);

      // Carregar redes sociais
      const { data: socialAccounts } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('application_id', application.id);

      // Carregar selfie
      const { data: selfie } = await supabase
        .from('selfies')
        .select('*')
        .eq('application_id', application.id)
        .eq('accepted', true)
        .single();

      setDataSummary({
        profile,
        documents: documents || [],
        socialAccounts: socialAccounts || [],
        selfie,
      });

      // Verificar dados faltantes
      const missing: string[] = [];
      if (!profile?.full_name) missing.push('Nome completo');
      if (!profile?.cpf) missing.push('CPF');
      if (!profile?.address_cep) missing.push('Endereço');
      if (!documents?.some(d => d.doc_type === 'passport')) missing.push('Passaporte');
      if (!documents?.some(d => d.doc_type === 'br_id' || d.doc_type === 'rg' || d.doc_type === 'cnh')) {
        missing.push('Documento brasileiro (RG/CNH)');
      }
      if (!selfie) missing.push('Selfie');

      // Verificar condicionais
      if (application.visa_type === 'renewal' && !documents?.some(d => d.doc_type === 'previous_visa')) {
        missing.push('Visto anterior (renovação)');
      }
      if ((application.civil_status === 'married' || application.civil_status === 'stable_union') && 
          !documents?.some(d => d.doc_type === 'marriage_cert')) {
        missing.push('Certidão de casamento/união estável');
      }

      setMissingData(missing);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!application) return;

    if (missingData.length > 0) {
      toast.error('Complete todos os dados obrigatórios antes de submeter');
      return;
    }

    setSubmitting(true);
    try {
      // Atualizar status da aplicação para 'submitted'
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          step: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) throw error;

      // Log de auditoria
      await supabase.from('audit_logs').insert({
        user_id: application.user_id,
        application_id: application.id,
        action: 'application.submitted',
        details: {
          visa_type: application.visa_type,
          civil_status: application.civil_status,
          documents_count: dataSummary?.documents.length || 0,
          has_socials: (dataSummary?.socialAccounts.length || 0) > 0,
        },
      });

      toast.success('Aplicação submetida com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao submeter:', error);
      toast.error(error.message || 'Erro ao submeter aplicação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = async () => {
    await goToPreviousStep("questionnaire");
    navigate("/flow");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  const isComplete = missingData.length === 0;

  return (
    <StepLayout
      title="Revisão Final"
      description="Revise todos os seus dados antes de submeter a aplicação"
      currentStep="questionnaire"
      onBack={handleBack}
      onNext={handleSubmit}
      isNextDisabled={!isComplete || submitting}
      isNextLoading={submitting}
      nextLabel="Submeter Aplicação"
    >
      <div className="space-y-6">
        {/* Status geral */}
        {isComplete ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">
                  ✅ Todos os dados estão completos!
                </h3>
                <p className="text-sm text-green-800">
                  Você pode submeter sua aplicação. Nossa equipe irá revisar e entrar em contato em até 48 horas.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">
                  ⚠️ Dados incompletos
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Complete os seguintes itens antes de submeter:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  {missingData.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Resumo dos dados */}
        <div className="grid gap-4">
          {/* Perfil */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Dados Pessoais</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nome:</span>
                <p className="font-semibold text-gray-900">{dataSummary?.profile?.full_name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-600">CPF:</span>
                <p className="font-semibold text-gray-900">{dataSummary?.profile?.cpf || '—'}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-semibold text-gray-900">{dataSummary?.profile?.email || '—'}</p>
              </div>
              <div>
                <span className="text-gray-600">Celular:</span>
                <p className="font-semibold text-gray-900">{dataSummary?.profile?.phone_mobile || '—'}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Endereço</h3>
            </div>
            <div className="text-sm">
              <p className="text-gray-900">
                {dataSummary?.profile?.address_street && dataSummary?.profile?.address_number
                  ? `${dataSummary.profile.address_street}, ${dataSummary.profile.address_number}`
                  : '—'}
              </p>
              {dataSummary?.profile?.address_complement && (
                <p className="text-gray-600">{dataSummary.profile.address_complement}</p>
              )}
              <p className="text-gray-900">
                {dataSummary?.profile?.address_district && dataSummary?.profile?.address_city
                  ? `${dataSummary.profile.address_district}, ${dataSummary.profile.address_city} - ${dataSummary.profile.address_state}`
                  : '—'}
              </p>
              <p className="text-gray-600">CEP: {dataSummary?.profile?.address_cep || '—'}</p>
            </div>
          </div>

          {/* Documentos */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Documentos Enviados</h3>
            </div>
            <div className="space-y-2 text-sm">
              {dataSummary?.documents && dataSummary.documents.length > 0 ? (
                dataSummary.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-900 capitalize">
                      {doc.doc_type.replace('_', ' ')}
                      {doc.side && doc.side !== 'single' && ` (${doc.side})`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhum documento enviado</p>
              )}
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Redes Sociais</h3>
            </div>
            <div className="space-y-2 text-sm">
              {dataSummary?.socialAccounts && dataSummary.socialAccounts.length > 0 ? (
                dataSummary.socialAccounts.map((social, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-gray-900 capitalize">{social.platform}:</span>
                    <span className="text-gray-600">{social.handle}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma rede social cadastrada</p>
              )}
            </div>
          </div>

          {/* Selfie */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              {dataSummary?.selfie ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Selfie Aprovada</h3>
                    <p className="text-sm text-gray-600">
                      Qualidade: {dataSummary.selfie.quality_score 
                        ? `${(dataSummary.selfie.quality_score * 100).toFixed(0)}%` 
                        : 'OK'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Selfie Pendente</h3>
                    <p className="text-sm text-gray-600">Volte e complete a selfie</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informações finais */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            📋 O que acontece após a submissão?
          </h3>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1.5">
            <li>Nossa equipe revisará todos os seus documentos</li>
            <li>Verificaremos a consistência dos dados extraídos (OCR)</li>
            <li>Prepararemos seu dossiê completo para o consulado</li>
            <li>Entraremos em contato em até 48 horas com as próximas etapas</li>
            <li>Você receberá instruções para agendamento da entrevista</li>
          </ol>
        </div>
      </div>
    </StepLayout>
  );
}

