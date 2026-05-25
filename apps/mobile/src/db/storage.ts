import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wrapper minimalista de AsyncStorage com serializacao JSON.
 *
 * Decisao do slice: usar AsyncStorage em vez de react-native-mmkv (ADR-0004)
 * para evitar rebuild nativo extra. Performance e suficiente para fila de
 * check-ins. Migracao para MMKV fica para Sprint 3+ se necessario.
 */
export const storage = {
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setJson(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async keys(prefix: string): Promise<string[]> {
    const all = await AsyncStorage.getAllKeys();
    return all.filter((k) => k.startsWith(prefix));
  },
};
