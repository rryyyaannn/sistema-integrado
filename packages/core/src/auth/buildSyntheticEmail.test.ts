import { describe, expect, it } from 'vitest';
import { buildSyntheticEmail, parseMatricula } from './buildSyntheticEmail';

describe('buildSyntheticEmail', () => {
  it('builds the canonical synthetic email', () => {
    expect(buildSyntheticEmail({ matricula: 'P001', tenantSlug: 'portaria-modelo' })).toBe(
      'colaborador-p001@portaria-modelo.local',
    );
  });

  it('lowercases matricula and tenant', () => {
    expect(buildSyntheticEmail({ matricula: 'AB99', tenantSlug: 'Foo-Bar' })).toBe(
      'colaborador-ab99@foo-bar.local',
    );
  });

  it('trims surrounding whitespace', () => {
    expect(buildSyntheticEmail({ matricula: '  P001  ', tenantSlug: ' tenant ' })).toBe(
      'colaborador-p001@tenant.local',
    );
  });
});

describe('parseMatricula', () => {
  it('uppercases and removes spaces', () => {
    expect(parseMatricula('p 001')).toBe('P001');
    expect(parseMatricula('  ab99 ')).toBe('AB99');
  });
});
