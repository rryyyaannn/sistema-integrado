import { describe, expect, it } from 'vitest';
import { isUuidV7 } from '../shared/uuid';
import { buildCheckinPayload } from './buildCheckinPayload';

describe('buildCheckinPayload', () => {
  const baseInput = {
    tenantId: '11111111-1111-7111-8111-111111111111',
    postId: 'b1111111-0000-7000-8000-000000000001',
    userId: 'a1111111-0000-7000-8000-000000000003',
    purpose: 'entry' as const,
    checklistTemplateId: '61111111-0000-7000-8000-000000000001',
    checklistResponses: { ok: true },
  };

  it('generates a UUID v7 as id', () => {
    const p = buildCheckinPayload(baseInput);
    expect(p.id).toBeDefined();
    expect(isUuidV7(p.id as string)).toBe(true);
  });

  it('defaults geo and selfie fields to null', () => {
    const p = buildCheckinPayload(baseInput);
    expect(p.latitude).toBeNull();
    expect(p.longitude).toBeNull();
    expect(p.geo_within_post).toBeNull();
    expect(p.selfie_storage_path).toBeNull();
  });

  it('uses provided client_created_at when given', () => {
    const when = '2026-05-25T18:00:00.000Z';
    const p = buildCheckinPayload({ ...baseInput, clientCreatedAt: when });
    expect(p.client_created_at).toBe(when);
  });

  it('falls back to now() when client_created_at is omitted', () => {
    const before = new Date().toISOString();
    const p = buildCheckinPayload(baseInput);
    const after = new Date().toISOString();
    expect(typeof p.client_created_at).toBe('string');
    const ts = p.client_created_at as string;
    expect(ts >= before && ts <= after).toBe(true);
  });
});
