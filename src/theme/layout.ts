/**
 * Tokens de layout global.
 *
 * Centralizan medidas que afectan a toda la app para poder ajustarlas en un
 * solo lugar (evita repetir números mágicos por pantalla).
 */
export const layout = {
  /** Margen horizontal global de las pantallas (a ambos lados). */
  screenPadding: 12,
} as const;

export type LayoutToken = keyof typeof layout;
