import { TextStyle } from 'react-native';

/**
 * Typography presets.
 *
 * Each entry is a ready-to-spread {@link TextStyle} so screens never hardcode
 * font sizes or weights. Sizes and letter-spacing mirror the iOS type ramp used
 * in the design.
 */
export const typography = {
  /** Wordmark / brand title (e.g. "Moneo" en el login). */
  largeTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  /** Título grande de pantalla (e.g. "Crear tu cuenta", "Agosto"). */
  screenTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  /** Standard body / control text. */
  body: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.4,
  },
  /** Emphasized body, used by buttons. */
  bodyStrong: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  /** Secondary subtitle text under titles. */
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  /** Small caption / helper text. */
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
