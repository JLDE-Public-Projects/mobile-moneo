/**
 * Public theme entry point.
 *
 * Import design tokens from here (`@/theme`) rather than from the individual
 * files so consumers depend on a single, stable surface.
 */
export { colors } from './colors';
export type { ColorToken } from './colors';

export { spacing, radius } from './spacing';
export type { SpacingToken, RadiusToken } from './spacing';

export { typography } from './typography';
export type { TypographyToken } from './typography';

export { layout } from './layout';
export type { LayoutToken } from './layout';
