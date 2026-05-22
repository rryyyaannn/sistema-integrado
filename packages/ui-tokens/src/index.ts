/**
 * @si/ui-tokens — design tokens compartilhados entre web e mobile.
 *
 * Consumido pelo Tailwind (web) e pelo NativeWind (mobile) via seus arquivos
 * de configuracao, garantindo que as duas plataformas usem exatamente as
 * mesmas cores, espacamentos e raios.
 */

export {
  brand,
  colors,
  neutral,
  semantic,
  severity,
  type SeverityLevel,
} from './colors';
export {
  radius,
  spacing,
  touchTarget,
  type Radius,
  type Spacing,
} from './spacing';
