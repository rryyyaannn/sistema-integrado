/**
 * UUID v7 — identificador unico ordenavel por tempo (RFC 9562).
 *
 * Por que v7 e nao v4: os primeiros 48 bits sao o timestamp Unix em ms, entao
 * os IDs crescem monotonicamente. Isso da indices de banco mais densos e
 * ordenacao cronologica "de graca" — importante para as tabelas append-only
 * de eventos (checkins, incidents), sempre consultadas por tempo.
 *
 * Gerado no cliente para servir de chave de idempotencia: o app cria o ID
 * antes de enviar e o servidor faz INSERT ... ON CONFLICT DO NOTHING. Um
 * reenvio apos falha de rede nao duplica o registro. (Ver docs/adr/0002.)
 *
 * Runtime: depende de globalThis.crypto.getRandomValues (Web Crypto API).
 * - Web e Deno (edge functions): nativo.
 * - React Native: requer o polyfill `react-native-get-random-values`
 *   importado no topo do entrypoint do app mobile.
 */

const HEX_DIGITS = '0123456789abcdef';

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    out += HEX_DIGITS[(byte >> 4) & 0x0f];
    out += HEX_DIGITS[byte & 0x0f];
  }
  return out;
}

/** Gera um novo UUID v7 no formato canonico (8-4-4-4-12, minusculo). */
export function generateUuidV7(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);

  const timestamp = Date.now();
  // 48 bits de timestamp, big-endian, nos bytes 0..5
  bytes[0] = Math.floor(timestamp / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(timestamp / 0x100000000) & 0xff;
  bytes[2] = Math.floor(timestamp / 0x1000000) & 0xff;
  bytes[3] = Math.floor(timestamp / 0x10000) & 0xff;
  bytes[4] = Math.floor(timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;
  // versao 7 (0b0111) no nibble alto do byte 6
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  // variante RFC 4122 (0b10) nos dois bits altos do byte 8
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Verifica se uma string e um UUID v7 valido. */
export function isUuidV7(value: string): boolean {
  return UUID_V7_PATTERN.test(value);
}

/** Extrai o timestamp (ms desde a epoca Unix) embutido num UUID v7. */
export function uuidV7Timestamp(uuid: string): number {
  const hex = uuid.replace(/-/g, '').slice(0, 12);
  return Number.parseInt(hex, 16);
}
