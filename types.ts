export interface ProcessConfig {
  previousUses: number;
  pushPullStops: number; // Positive for Push, Negative for Pull
  isStock: boolean; // Assuming Stock based on prompt, but keeping extensible
}

export enum ProcessStepType {
  PRE_WASH = 'Pre-Wash',
  DEVELOPER = 'Revelador (D-76)',
  STOP_BATH = 'Baño de Paro',
  FIXER = 'Fijador',
  WASH = 'Lavado Final',
  RINSE = 'Photo Flo / Enjuague'
}

export interface Step {
  id: string;
  type: ProcessStepType;
  durationSeconds: number;
  description: string;
  agitationGuide: string;
}

export interface AssistantMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}