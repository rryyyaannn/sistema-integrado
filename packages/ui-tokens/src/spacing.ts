/**
 * Tokens de layout — espacamento, raio de borda e alvos de toque.
 * Escala base-4, compartilhada entre web e mobile.
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/**
 * Alvos de toque minimos (em px/dp). O app mobile e usado por colaboradores
 * de campo, muitas vezes em movimento e com pouca familiaridade com tecnologia
 * — botoes generosos reduzem erro de toque.
 */
export const touchTarget = {
  min: 44,
  comfortable: 56,
  primary: 72,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
