/**
 * Spacing and radius scale.
 *
 * A constrained scale keeps layouts consistent and avoids magic numbers spread
 * across components. Values map to the paddings/margins seen in the design.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 34,
} as const;

/** Corner radii used across cards, rows and buttons. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  card: 26,
  pill: 999,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
