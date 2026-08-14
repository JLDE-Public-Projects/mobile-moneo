import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface AccountRowProps {
  /** Nombre de la cuenta. */
  name: string;
  /** Subtítulo (tipo/descripción de la cuenta). */
  subtitle: string;
  /** Color de la etiqueta (cuadro a la izquierda). */
  color: string;
  /** Saldo ya formateado (p. ej. "−$862.400"). */
  balance: string;
  /** Si el saldo es negativo (deuda), para colorearlo en rojo. */
  negative?: boolean;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de una cuenta: un cuadro de color, el nombre con su subtítulo y el saldo
 * a la derecha (rojo si es negativo). Reutilizable en la lista de cuentas y,
 * más adelante, en los selectores de cuenta.
 */
export function AccountRow({
  name,
  subtitle,
  color,
  balance,
  negative = false,
  showSeparator = false,
}: AccountRowProps) {
  return (
    <View style={[styles.row, showSeparator && styles.separator]}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.balance, negative && styles.balanceNegative]}>
        {balance}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  balance: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  balanceNegative: {
    color: colors.negative,
  },
});
