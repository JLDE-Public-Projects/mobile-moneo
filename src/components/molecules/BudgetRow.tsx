import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/theme';

interface BudgetRowProps {
  /** Nombre de la categoría. */
  name: string;
  /** Texto "gastado de asignado" (p. ej. "248.400 de 800.000"). */
  label: string;
  /** Si el gasto superó el presupuesto (colorea en rojo). */
  over?: boolean;
  /** Ancho de la barra de progreso, 0–100. */
  barWidth: number;
  /** Aumenta el presupuesto. */
  onIncrease: () => void;
  /** Reduce el presupuesto. */
  onDecrease: () => void;
  /** Abre la edición directa del importe (escribirlo en vez de tocar +/−). */
  onEdit: () => void;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de presupuesto por categoría: nombre + "gastado de asignado", botones
 * para ajustar el límite (± $50.000) y una barra de progreso que se pone en
 * rojo al pasar del 100%.
 */
export function BudgetRow({
  name,
  label,
  over = false,
  barWidth,
  onIncrease,
  onDecrease,
  onEdit,
  showSeparator = false,
}: BudgetRowProps) {
  const { t } = useTranslation();
  const barColor = over ? colors.negative : colors.accent;

  return (
    <View style={[styles.row, showSeparator && styles.separator]}>
      <View style={styles.top}>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.editBudget', { name })}
          style={({ pressed }) => [styles.info, pressed && styles.infoPressed]}
        >
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.label, over && styles.labelOver]}>{label}</Text>
        </Pressable>

        <Pressable
          onPress={onDecrease}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.decreaseBudget', { name })}
          style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}
        >
          <Text style={styles.stepperSign}>−</Text>
        </Pressable>
        <Pressable
          onPress={onIncrease}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.increaseBudget', { name })}
          style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}
        >
          <Text style={styles.stepperSign}>+</Text>
        </Pressable>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, barWidth)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  infoPressed: {
    opacity: 0.6,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  labelOver: {
    color: colors.negative,
  },
  stepper: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: colors.disabledFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSign: {
    fontSize: 19,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.6,
  },
  track: {
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(60,60,67,0.08)',
    marginTop: 10,
  },
  fill: {
    height: 6,
    borderRadius: 99,
  },
});
