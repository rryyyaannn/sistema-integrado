/**
 * Tokens de cor — fonte unica de verdade para web (Tailwind) e mobile
 * (NativeWind). A paleta foi escolhida para uso operacional: tons calmos,
 * alto contraste e boa legibilidade em tela exposta ao sol.
 */

/** Azul-aco da marca — transmite confianca e seguranca. */
export const brand = {
  50: '#eef4fb',
  100: '#d6e4f5',
  200: '#aecbe9',
  300: '#7da8d8',
  400: '#4d83c2',
  500: '#2e63a3',
  600: '#244e84',
  700: '#1d3e69',
  800: '#172f50',
  900: '#0f1f36',
} as const;

/** Escala neutra para texto, fundos e bordas. */
export const neutral = {
  0: '#ffffff',
  50: '#f7f8fa',
  100: '#eceef2',
  200: '#d9dde3',
  300: '#b9c0cb',
  400: '#8d97a6',
  500: '#697283',
  600: '#4c5564',
  700: '#373e4a',
  800: '#232932',
  900: '#13171d',
} as const;

/**
 * Cores de severidade — espelham, na ordem, o enum `incident_severity`
 * do banco de dados (low, medium, high, critical).
 */
export const severity = {
  low: '#5b8a3c',
  medium: '#c98a1a',
  high: '#d9651f',
  critical: '#c0392b',
} as const;

/** Cores de feedback / estado. */
export const semantic = {
  success: '#2e7d4f',
  warning: '#c98a1a',
  danger: '#c0392b',
  info: '#2e63a3',
} as const;

export const colors = { brand, neutral, severity, semantic } as const;

export type SeverityLevel = keyof typeof severity;
