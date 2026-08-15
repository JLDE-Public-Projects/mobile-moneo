import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  /** Abre la edición de la cuenta. Sin este callback la fila no es tocable. */
  onPress?: () => void;
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
  onPress,
  showSeparator = false,
}: AccountRowProps) {
  const { t } = useTranslation();
  const content = (
    <>
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
    </>
  );

  // Sin `onPress` la fila sigue siendo de solo lectura, para poder reutilizarla
  // en listados donde no se edita (por ejemplo, un selector de cuenta).
  if (!onPress) {
    return (
      <View style={[styles.row, showSeparator && styles.separator]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('accessibility.editAccount', { name })}
      style={({ pressed }) => [
        styles.row,
        showSeparator && styles.separator,
        pressed && styles.pressed,
      ]}
    >
      {content}
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
    opacity: 0.6,
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
