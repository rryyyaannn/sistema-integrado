import { describe, expect, it } from 'vitest';
import { type LatLng, haversineDistanceMeters, isWithinGeofence } from './geo';

// Dois pontos conhecidos em Sao Paulo, ~1.5 km de distancia.
const SE: LatLng = { latitude: -23.5505, longitude: -46.6333 };
const REPUBLICA: LatLng = { latitude: -23.5436, longitude: -46.6426 };

describe('haversineDistanceMeters', () => {
  it('retorna 0 para o mesmo ponto', () => {
    expect(haversineDistanceMeters(SE, SE)).toBe(0);
  });

  it('calcula uma distancia plausivel entre dois pontos reais', () => {
    const d = haversineDistanceMeters(SE, REPUBLICA);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(1600);
  });
});

describe('isWithinGeofence', () => {
  it('aceita uma posicao dentro do raio', () => {
    expect(isWithinGeofence(SE, SE, 200)).toBe(true);
  });

  it('rejeita uma posicao fora do raio', () => {
    expect(isWithinGeofence(REPUBLICA, SE, 200)).toBe(false);
  });
});
