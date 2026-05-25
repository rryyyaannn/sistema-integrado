import type { Enums, InsertDto, Json } from '@si/types';
import { generateUuidV7 } from '../shared/uuid';

export type CheckinInput = {
  tenantId: string;
  postId: string;
  userId: string;
  purpose: Enums<'checkin_purpose'>;
  checklistTemplateId: string;
  checklistResponses: Json;
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
 */
export function buildCheckinPayload(input: CheckinInput): InsertDto<'checkins'> {
  return {
    id: generateUuidV7(),
    tenant_id: input.tenantId,
    post_id: input.postId,
    user_id: input.userId,
    purpose: input.purpose,
    checklist_template_id: input.checklistTemplateId,
    checklist_responses: input.checklistResponses,
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
