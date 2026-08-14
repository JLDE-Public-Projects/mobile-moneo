/**
 * Color palette for Moneo.
 *
 * Values are derived from the original design (authored in the oklch color
 * space) and converted to sRGB hex so they render identically on React Native,
 * which does not support oklch. Keeping every color in a single module makes
 * theming and future dark-mode support a one-file change.
 */
export const colors = {
  /** Brand accent — used for primary actions, links and highlights. */
  accent: '#27762F',
  /** Darker accent for pressed / hover states. */
  accentDark: '#045E17',

  /** Semantic colors for signed amounts. */
  positive: '#27762F',
  negative: '#C53637',

  /** Neutral surfaces. */
  background: '#F2F2F7',
  surface: '#FFFFFF',

  /** Text colors following the iOS label hierarchy. */
  textPrimary: '#000000',
  textSecondary: 'rgba(60,60,67,0.6)',
  textTertiary: 'rgba(60,60,67,0.3)',

  /** Color de íconos atenuados (p. ej. el engranaje de Ajustes). */
  iconMuted: 'rgba(60,60,67,0.75)',

  /** Hairline separators between rows. */
  separator: 'rgba(60,60,67,0.1)',

  /** Color de un tab inactivo en la barra de navegación. */
  tabInactive: 'rgba(60,60,67,0.55)',
  /** Fondo translúcido del pill de navegación flotante. */
  tabBarBackground: 'rgba(255,255,255,0.88)',
  /** Borde fino del pill de navegación. */
  tabBarBorder: 'rgba(0,0,0,0.04)',

  /** Fill used by disabled controls. */
  disabledFill: 'rgba(118,118,128,0.12)',

  /** Pista de un interruptor apagado. */
  toggleTrackOff: 'rgba(120,120,128,0.16)',

  /** Pure white, e.g. text on top of the accent. */
  white: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;
