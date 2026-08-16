import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface TransactionRowProps {
  /** Título de la fila (categoría, o la nota en el detalle de categoría). */
  category: string;
  /** Color del cuadro a la izquierda; si se omite, no se muestra el cuadro. */
  color?: string;
  /** Subtítulo (fecha · nota o cuenta). */
  subtitle: string;
  /**
   * Color de la parte del subtítulo posterior al " · " (categoría o ruta de
   * la transferencia). Si se omite, el subtítulo completo usa el color por
   * defecto.
   */
  metaColor?: string;
  /** Importe ya formateado con signo (p. ej. "−248.400"). */
  amount: string;
  /** Si el importe es un ingreso (positivo), para colorearlo en verde. */
  income?: boolean;
  /**
   * Muestra el importe en gris en vez de verde/rojo: para transferencias, que
   * no son ni ganancia ni pérdida, solo dinero cambiando de cuenta.
   */
  neutral?: boolean;
  /** Acción al pulsar (abre el detalle). */
  onPress?: () => void;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de un movimiento: cuadro de color de la categoría, categoría con su
 * subtítulo y el importe a la derecha (verde si es ingreso, rojo si es egreso).
 */
export function TransactionRow({
  category,
  color,
  subtitle,
  metaColor,
  amount,
  income = false,
  neutral = false,
  onPress,
  showSeparator = false,
}: TransactionRowProps) {
  // El subtítulo tiene forma "día · meta"; si hay color de categoría, se
  // separa para pintar solo la parte de la meta (día siempre neutro).
  const separatorIndex = metaColor ? subtitle.indexOf(' · ') : -1;
  const day = separatorIndex >= 0 ? subtitle.slice(0, separatorIndex) : subtitle;
  const meta = separatorIndex >= 0 ? subtitle.slice(separatorIndex + 3) : null;

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
      {color !== undefined && (
        <View style={[styles.swatch, { backgroundColor: color }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {meta !== null ? (
            <>
              {day} · <Text style={{ color: metaColor }}>{meta}</Text>
            </>
          ) : (
            subtitle
          )}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          neutral ? styles.neutral : income ? styles.income : styles.expense,
        ]}
      >
        {amount}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  pressed: {
    backgroundColor: colors.disabledFill,
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
  category: {
    ...typography.body,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amount: {
    ...typography.body,
    fontVariant: ['tabular-nums'],
  },
  income: {
    color: colors.positive,
  },
  expense: {
    color: colors.negative,
  },
  neutral: {
    color: colors.textSecondary,
  },
});
