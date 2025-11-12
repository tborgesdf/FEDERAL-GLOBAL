/**
 * TIPOS DO SISTEMA DE APLICAÇÃO DE VISTO
 */

// Estado civil do aplicante
export type CivilStatus = 'single' | 'married' | 'stable_union' | 'divorced' | 'widowed';

// Tipo de visto
export type VisaType = 'first' | 'renewal';

// Status da aplicação
export type ApplicationStatus = 'in_progress' | 'submitted' | 'review' | 'rejected' | 'approved';

// Steps do fluxo
export type StepId =
  | 'civil_status'
  | 'socials'
  | 'passport'
  | 'previous_visa'
  | 'br_id'
  | 'marriage_cert'
  | 'selfie'
  | 'questionnaire';

// Tipo de documento
export type DocumentType = 'passport' | 'previous_visa' | 'br_id' | 'marriage_cert';

// Lado do documento
export type DocumentSide = 'front' | 'back' | 'single';

// Interface principal da aplicação
export interface Application {
  id: string;
  user_id: string;
  payment_id?: string;
  visa_type: VisaType;
  civil_status?: CivilStatus;
  step: StepId;
  status: ApplicationStatus;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// Interface de rede social
export interface SocialAccount {
  id: string;
  application_id: string;
  platform: string; // 'facebook' | 'instagram' | 'x' | 'youtube' | 'linkedin' | 'tiktok'
  handle: string;
  created_at: string;
}

// Interface de documento
export interface Document {
  id: string;
  application_id: string;
  doc_type: DocumentType;
  side: DocumentSide;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  ocr_json?: any;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// Interface de selfie
export interface Selfie {
  id: string;
  application_id: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  quality_score?: number;
  accepted: boolean;
  rejection_reason?: string;
  created_at: string;
}

// Configuração de cada step
export interface StepConfig {
  id: StepId;
  title: string;
  description: string;
  order: number;
  isConditional?: boolean;
  condition?: (app: Application) => boolean;
}

// Constantes de steps
export const STEP_ORDER: StepConfig[] = [
  {
    id: 'civil_status',
    title: 'Estado Civil',
    description: 'Informe seu estado civil',
    order: 1,
  },
  {
    id: 'socials',
    title: 'Redes Sociais',
    description: 'Suas redes sociais (opcional)',
    order: 2,
  },
  {
    id: 'passport',
    title: 'Passaporte',
    description: 'Envie seu passaporte',
    order: 3,
  },
  {
    id: 'previous_visa',
    title: 'Visto Anterior',
    description: 'Envie seu visto anterior',
    order: 4,
    isConditional: true,
    condition: (app) => app.visa_type === 'renewal',
  },
  {
    id: 'br_id',
    title: 'Documento Brasileiro',
    description: 'RG ou CNH',
    order: 5,
  },
  {
    id: 'marriage_cert',
    title: 'Certidão de Casamento',
    description: 'Certidão de casamento ou união estável',
    order: 6,
    isConditional: true,
    condition: (app) => app.civil_status === 'married' || app.civil_status === 'stable_union',
  },
  {
    id: 'selfie',
    title: 'Selfie',
    description: 'Tire uma selfie',
    order: 7,
  },
  {
    id: 'questionnaire',
    title: 'Questionário',
    description: 'Informações complementares',
    order: 8,
  },
];

/**
 * Retorna os steps aplicáveis para uma aplicação específica
 */
export function getApplicableSteps(app: Application): StepConfig[] {
  return STEP_ORDER.filter((step) => {
    if (!step.isConditional) return true;
    return step.condition ? step.condition(app) : true;
  });
}

/**
 * Retorna o próximo step no fluxo
 */
export function getNextStep(currentStep: StepId, app: Application): StepId | null {
  const applicableSteps = getApplicableSteps(app);
  const currentIndex = applicableSteps.findIndex((s) => s.id === currentStep);
  
  if (currentIndex === -1 || currentIndex === applicableSteps.length - 1) {
    return null;
  }
  
  return applicableSteps[currentIndex + 1].id;
}

/**
 * Retorna o step anterior no fluxo
 */
export function getPreviousStep(currentStep: StepId, app: Application): StepId | null {
  const applicableSteps = getApplicableSteps(app);
  const currentIndex = applicableSteps.findIndex((s) => s.id === currentStep);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return applicableSteps[currentIndex - 1].id;
}

/**
 * Verifica se precisa de certidão de casamento/união
 */
export function requiresMarriageCertificate(civilStatus?: CivilStatus): boolean {
  return civilStatus === 'married' || civilStatus === 'stable_union';
}

/**
 * Retorna o número total de steps para uma aplicação
 */
export function getTotalSteps(app: Application): number {
  return getApplicableSteps(app).length;
}

/**
 * Retorna o número do step atual (1-based)
 */
export function getCurrentStepNumber(currentStep: StepId, app: Application): number {
  const applicableSteps = getApplicableSteps(app);
  const index = applicableSteps.findIndex((s) => s.id === currentStep);
  return index === -1 ? 1 : index + 1;
}

