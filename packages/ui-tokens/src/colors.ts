/**
 * Tokens de cor — fonte unica de verdade para web (Tailwind) e mobile
 * (NativeWind). Paleta inspirada na identidade visual de empresas de
 * portaria e zeladoria patrimonial (azul-grafite + aco/prata).
 *
 * Tons escolhidos para uso operacional: alto contraste, leitura em sol
 * direto, sensacao de seriedade e autoridade (nao "startup-tech").
 */

/**
 * Azul-grafite da marca — base institucional. Tons frios, escuros,
 * autoridade. Use 800/900 para headers e superficies de comando;
 * 50/100 para fundos claros; 500/600 para CTAs.
 */
export const brand = {
  50: '#f1f4f8',
  100: '#dfe4ec',
  200: '#bfc7d5',
  300: '#94a1b7',
  400: '#677893',
  500: '#455a78',
  600: '#344662',
  700: '#28374c',
  800: '#1a2a3d',
  900: '#0e1825',
} as const;

/**
 * Aco/prata — secundario neutro frio. Use para divisores, badges
 * de status secundario, fundos de cards em superficies escuras.
 */
export const steel = {
  50: '#f6f7f9',
  100: '#e8eaed',
  200: '#cdd2d8',
  300: '#a8b0ba',
  400: '#7e8893',
  500: '#5b6571',
  600: '#475058',
  700: '#353c44',
  800: '#252a30',
  900: '#14181c',
} as const;

/** Escala neutra para texto, fundos e bordas (cinzas quentes/terrosos). */
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
 * do banco de dados (low, medium, high, critical). Mantidas distintas
 * da paleta institucional para nao competir com a marca.
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
  info: '#455a78',
} as const;

export const colors = { brand, steel, neutral, severity, semantic } as const;

export type SeverityLevel = keyof typeof severity;
