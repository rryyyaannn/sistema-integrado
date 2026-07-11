import { type LatLng, isWithinGeofence } from '@si/core';
import * as Location from 'expo-location';

/**
 * Posicao capturada no instante do check-in. NAO ha rastreamento continuo —
 * so pedimos a posicao no momento do registro (LGPD, ver docs/adr e doc 04).
 */
export type CapturedGeo = {
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  /** null quando o posto nao tem coordenadas cadastradas para comparar. */
  withinPost: boolean | null;
};

export type GeoTarget = {
  latitude: number | null;
  longitude: number | null;
  geofenceRadiusM: number;
};

/**
 * Captura a posicao atual e, se o posto tem coordenadas, calcula se esta dentro
 * do geofence. Retorna null se a permissao foi negada ou o GPS falhou — o
 * check-in ainda acontece (geo_within_post fica null e o supervisor ve "sem geo").
 * GPS funciona offline, entao isto nao depende de rede.
 */
export async function captureGeo(target?: GeoTarget | null): Promise<CapturedGeo | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const here: LatLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };

    let withinPost: boolean | null = null;
    if (target && target.latitude != null && target.longitude != null) {
      withinPost = isWithinGeofence(
        here,
        { latitude: target.latitude, longitude: target.longitude },
        target.geofenceRadiusM,
      );
    }

    return {
      latitude: here.latitude,
      longitude: here.longitude,
      accuracyM: pos.coords.accuracy ?? null,
      withinPost,
    };
  } catch {
    return null;
  }
}
