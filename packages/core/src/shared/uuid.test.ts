import { describe, expect, it } from 'vitest';
import { generateUuidV7, isUuidV7, uuidV7Timestamp } from './uuid';

describe('generateUuidV7', () => {
  it('gera um UUID no formato canonico v7', () => {
    expect(isUuidV7(generateUuidV7())).toBe(true);
  });

  it('gera valores unicos em volume', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateUuidV7()));
    expect(ids.size).toBe(1000);
  });

  it('e ordenavel por tempo: IDs gerados em instantes distintos crescem', async () => {
    const first = generateUuidV7();
    await new Promise((resolve) => setTimeout(resolve, 3));
    const second = generateUuidV7();
    // O prefixo de 48 bits e o timestamp; com >=1ms de diferenca, second > first.
    expect(first < second).toBe(true);
  });

  it('embute o timestamp de criacao nos primeiros 48 bits', () => {
    const before = Date.now();
    const id = generateUuidV7();
    const after = Date.now();
    const ts = uuidV7Timestamp(id);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('isUuidV7', () => {
  it('aceita um UUID v7 gerado', () => {
    expect(isUuidV7(generateUuidV7())).toBe(true);
  });

  it('rejeita UUID v4, strings vazias e lixo', () => {
    expect(isUuidV7('00000000-0000-4000-8000-000000000000')).toBe(false);
    expect(isUuidV7('')).toBe(false);
    expect(isUuidV7('nao-e-um-uuid')).toBe(false);
  });
});
