/**
 * HOOK: useApplication
 * Gerencia estado e lógica da aplicação de visto
 */

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  Application,
  CivilStatus,
  StepId,
  getNextStep,
  getPreviousStep,
  requiresMarriageCertificate,
  getApplicableSteps,
  getCurrentStepNumber,
  getTotalSteps,
} from "@/types/application";
import { toast } from "sonner";

export function useApplication(userId?: string) {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar aplicação em progresso do usuário
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetchApplication();
  }, [userId]);

  const fetchApplication = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw fetchError;
      }

      setApplication(data || null);
    } catch (err: any) {
      console.error("Erro ao buscar aplicação:", err);
      setError(err.message);
      toast.error("Erro ao carregar aplicação");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualizar estado civil e avançar para próximo step
   */
  const updateCivilStatus = async (civilStatus: CivilStatus): Promise<boolean> => {
    if (!application) return false;

    try {
      const nextStepId = getNextStep("civil_status", {
        ...application,
        civil_status: civilStatus,
      });

      const { error: updateError } = await supabase
        .from("applications")
        .update({
          civil_status: civilStatus,
          step: nextStepId || "socials",
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setApplication((prev) =>
        prev
          ? {
              ...prev,
              civil_status: civilStatus,
              step: (nextStepId || "socials") as StepId,
            }
          : null
      );

      toast.success("Estado civil salvo com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Erro ao atualizar estado civil:", err);
      toast.error("Erro ao salvar estado civil");
      return false;
    }
  };

  /**
   * Avançar para o próximo step
   */
  const goToNextStep = async (currentStep: StepId): Promise<boolean> => {
    if (!application) return false;

    const nextStepId = getNextStep(currentStep, application);
    if (!nextStepId) {
      toast.info("Você completou todas as etapas!");
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          step: nextStepId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      setApplication((prev) => (prev ? { ...prev, step: nextStepId } : null));
      return true;
    } catch (err: any) {
      console.error("Erro ao avançar step:", err);
      toast.error("Erro ao avançar para próxima etapa");
      return false;
    }
  };

  /**
   * Voltar para o step anterior
   */
  const goToPreviousStep = async (currentStep: StepId): Promise<boolean> => {
    if (!application) return false;

    const prevStepId = getPreviousStep(currentStep, application);
    if (!prevStepId) return false;

    try {
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          step: prevStepId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      setApplication((prev) => (prev ? { ...prev, step: prevStepId } : null));
      return true;
    } catch (err: any) {
      console.error("Erro ao voltar step:", err);
      toast.error("Erro ao voltar para etapa anterior");
      return false;
    }
  };

  /**
   * Verificar se precisa enviar certidão de casamento/união
   */
  const needsMarriageCertificate = (): boolean => {
    if (!application) return false;
    return requiresMarriageCertificate(application.civil_status);
  };

  /**
   * Verificar se precisa enviar visto anterior
   */
  const needsPreviousVisa = (): boolean => {
    if (!application) return false;
    return application.visa_type === "renewal";
  };

  /**
   * Obter steps aplicáveis para a aplicação atual
   */
  const getApplicableStepsForCurrentApp = () => {
    if (!application) return [];
    return getApplicableSteps(application);
  };

  /**
   * Obter informações do step atual
   */
  const getCurrentStepInfo = () => {
    if (!application) return null;
    return {
      currentStep: application.step,
      currentStepNumber: getCurrentStepNumber(application.step, application),
      totalSteps: getTotalSteps(application),
      applicableSteps: getApplicableStepsForCurrentApp(),
    };
  };

  /**
   * Submeter aplicação (finalizar)
   */
  const submitApplication = async (): Promise<boolean> => {
    if (!application) return false;

    try {
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (updateError) throw updateError;

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              status: "submitted",
              submitted_at: new Date().toISOString(),
            }
          : null
      );

      toast.success("Aplicação enviada com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Erro ao submeter aplicação:", err);
      toast.error("Erro ao enviar aplicação");
      return false;
    }
  };

  return {
    application,
    isLoading,
    error,
    refetch: fetchApplication,
    updateCivilStatus,
    goToNextStep,
    goToPreviousStep,
    needsMarriageCertificate,
    needsPreviousVisa,
    getApplicableStepsForCurrentApp,
    getCurrentStepInfo,
    submitApplication,
  };
}

