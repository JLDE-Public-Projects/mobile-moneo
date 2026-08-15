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
  /** Peso de la categoría sobre el total de egresos (p. ej. "18% del total"). */
  share: string;
  /** Ancho de la barra, 0–100. */
  barWidth: number;
  /**
   * Estado del presupuesto (p. ej. "Quedan $80.000 de $800.000"). Si falta, la
   * categoría no tiene límite y solo se muestra su peso en el total.
   */
  hint?: string;
  /** Si el gasto superó el presupuesto de la categoría. */
  over?: boolean;
  /** Acción al pulsar (abre el detalle de la categoría). */
  onPress?: () => void;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de estadística por categoría (usada en "Gastos").
 *
 * Muestra las dos lecturas que interesan sin mezclarlas: a la izquierda, cuánto
 * se lleva consumido del límite (la barra y el texto de apoyo), que es lo que
 * dice si hay que frenar; a la derecha, el monto y su peso dentro del total de
 * egresos, que dice en qué se va el dinero.
 *
 * Cuando la categoría no tiene límite, la barra pasa a medir su tamaño
 * relativo, que es la única comparación posible.
 */
export function CategoryStatRow({
  name,
  color,
  amount,
  share,
  barWidth,
  hint,
  over = false,
  onPress,
  showSeparator = false,
}: CategoryStatRowProps) {
  // Al pasarse del límite, la barra y el texto de apoyo se tiñen de rojo: es la
  // misma señal que usa la pantalla de presupuesto.
  const barColor = over ? colors.negative : color;

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
              { width: `${Math.min(100, barWidth)}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        {hint !== undefined && (
          <Text style={[styles.hint, over && styles.hintOver]} numberOfLines={1}>
            {hint}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, over && styles.amountOver]}>{amount}</Text>
        <Text style={styles.share} numberOfLines={1}>
          {share}
        </Text>
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
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },
  hintOver: {
    color: colors.negative,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amountOver: {
    color: colors.negative,
  },
  share: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
