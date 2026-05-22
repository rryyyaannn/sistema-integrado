/**
 * Contratos de payload trocados com as Edge Functions do Supabase.
 *
 * Sao mantidos a mao (nao gerados): definem a fronteira entre os apps e as
 * funcoes serverless. Web, mobile e as proprias funcoes importam daqui.
 */

/** process-audio — transcreve um audio ja enviado ao Storage. */
export type ProcessAudioRequest = {
  mediaFileId: string;
  checkinId: string;
};

export type ProcessAudioResponse = {
  transcriptionId: string;
  transcript: string;
  status: 'completed' | 'failed';
};

/** validate-checklist-ai — valida o checklist a partir da transcricao. */
export type ValidateChecklistRequest = {
  checkinId: string;
  transcriptId: string;
};

export type ChecklistMissingItem = {
  itemId: string;
  label: string;
};

export type ValidateChecklistResponse = {
  validationId: string;
  missingItems: ChecklistMissingItem[];
  extractedResponses: Record<string, unknown>;
  status: 'completed' | 'failed';
};

/** send-push-notifications — envia push via Expo Push. */
export type SendPushRequest = {
  recipientUserIds: string[];
  title: string;
  body: string;
  payload?: Record<string, unknown>;
};

/** Envelope padrao de erro retornado pelas Edge Functions. */
export type EdgeFunctionError = {
  error: string;
  detail?: string;
};
