import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface SectionLabelProps {
  /** Texto del encabezado (se muestra en mayúsculas). */
  children: string;
  /** Estilos extra para ajustes puntuales de espaciado. */
  style?: TextStyle;
}

/**
 * Encabezado de sección en mayúsculas y gris, como los grupos de ajustes de
 * iOS ("INVITACIÓN", "ÚLTIMOS MOVIMIENTOS", ...).
 *
 * Se extrae como átomo porque este patrón se repite en casi todas las
 * pantallas del diseño; centralizarlo evita duplicar estilos.
 */
export function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    // Se coloca dentro del margen global de pantalla; añadimos solo el inset
    // interior de la tarjeta para alinear el texto con las filas.
    paddingHorizontal: spacing.lg,
    paddingBottom: 6,
  },
});
