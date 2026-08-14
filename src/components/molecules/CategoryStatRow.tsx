import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { colors, spacing, typography } from '@/theme';

interface CategoryStatRowProps {
  /** Nombre de la categoría. */
  name: string;
  /** Color de la categoría (punto y barra). */
  color: string;
  /** Monto ya formateado (p. ej. "$1.800.000"). */
  amount: string;
  /** Porcentaje sobre el total (p. ej. "42%"). */
  pct: string;
  /** Ancho de la barra de progreso, 0–100 (relativo a la categoría mayor). */
  barWidth: number;
  /** Acción al pulsar (abre el detalle de la categoría). */
  onPress?: () => void;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de estadística por categoría (usada en "Gastos"): un punto de color, el
 * nombre con una barra de progreso proporcional, y a la derecha el monto con su
 * porcentaje del total.
 */
export function CategoryStatRow({
  name,
  color,
  amount,
  pct,
  barWidth,
  onPress,
  showSeparator = false,
}: CategoryStatRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        showSeparator && styles.separator,
        pressed && onPress ? styles.pressed : undefined,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.min(100, barWidth)}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={styles.pct}>{pct}</Text>
      </View>

      <ChevronIcon />
    </Pressable>
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
  pressed: {
    backgroundColor: colors.disabledFill,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
  },
  track: {
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(60,60,67,0.08)',
    marginTop: 6,
  },
  fill: {
    height: 4,
    borderRadius: 99,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  pct: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
