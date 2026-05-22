/**
 * Calculos de geolocalizacao para validar presenca no check-in.
 *
 * O sistema NAO faz rastreamento continuo de GPS — questao de LGPD e de
 * escopo (ver docs/adr e documento 04). A posicao e capturada apenas no
 * instante do check-in e comparada com o raio configurado do posto.
 */

export type LatLng = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Distancia em metros entre dois pontos, pela formula de Haversine. */
export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Verifica se uma posicao esta dentro do geofence de um posto.
 * Alimenta o campo `checkins.geo_within_post` do banco.
 */
export function isWithinGeofence(position: LatLng, post: LatLng, radiusMeters: number): boolean {
  return haversineDistanceMeters(position, post) <= radiusMeters;
}
