import type { Enums, InsertDto, Json } from '@si/types';
import { generateUuidV7 } from '../shared/uuid';

export type CheckinInput = {
  tenantId: string;
  postId: string;
  userId: string;
  purpose: Enums<'checkin_purpose'>;
  /** Snapshot do template usado. Nullable: o check-in registra mesmo sem template resolvido (ex: offline). */
  checklistTemplateId: string | null;
  checklistResponses: Json;
  /** Escala do dia que este check-in cumpre, quando existe uma. */
  scheduleId?: string | null;
  /** true quando o posto nao esta na escala do colaborador para hoje. */
  unscheduled?: boolean;
  /**
   * Como o posto foi validado: 'qr' quando o QR do posto foi lido (evidencia
   * forte do local), 'button' quando o porteiro assumiu so pelo botao ("SEM
   * QR"). Default 'button' (mais fraco), espelhando o default do banco.
   */
  validationMethod?: Enums<'checkin_validation_method'>;
  /** Token lido do QR quando validationMethod='qr'. Permite auditar QR trocado. */
  qrTokenUsed?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geoAccuracyM?: number | null;
  geoWithinPost?: boolean | null;
  selfieStoragePath?: string | null;
  deviceId?: string | null;
  appVersion?: string | null;
  clientCreatedAt?: string;
};

/**
 * Monta o payload de INSERT em `checkins` com defaults sensatos.
 * - id e gerado como UUID v7 no cliente (ADR-0002) garante idempotencia em retry.
 * - client_created_at default = agora (ISO).
 * - shift_session_id NAO e enviado: a trigger sync_shift_session o preenche no
 *   banco a partir do purpose (ver migration 10 / ADR-0009).
 */
export function buildCheckinPayload(input: CheckinInput): InsertDto<'checkins'> {
  return {
    id: generateUuidV7(),
    tenant_id: input.tenantId,
    post_id: input.postId,
    user_id: input.userId,
    purpose: input.purpose,
    schedule_id: input.scheduleId ?? null,
    unscheduled: input.unscheduled ?? false,
    checklist_template_id: input.checklistTemplateId,
    checklist_responses: input.checklistResponses,
    validation_method: input.validationMethod ?? 'button',
    qr_token_used: input.qrTokenUsed ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    geo_accuracy_m: input.geoAccuracyM ?? null,
    geo_within_post: input.geoWithinPost ?? null,
    selfie_storage_path: input.selfieStoragePath ?? null,
    device_id: input.deviceId ?? null,
    app_version: input.appVersion ?? null,
    client_created_at: input.clientCreatedAt ?? new Date().toISOString(),
  };
}
