import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { colors, radius, spacing, typography } from '@/theme';

interface AddRowProps {
  /** Texto de la acción (p. ej. "Nueva categoría de egreso"). */
  label: string;
  /** Acción al pulsar. */
  onPress: () => void;
  /** Dibuja una línea separadora superior. */
  showSeparator?: boolean;
}

/**
 * Fila de acción "＋ Agregar …" al estilo iOS: un cuadro tenue con un "+" de
 * acento y una etiqueta en color de acento. Reutilizable para agregar
 * categorías, cuentas, etc.
 */
export function AddRow({ label, onPress, showSeparator = false }: AddRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        showSeparator && styles.separator,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconBox}>
        <PlusIcon size={14} color={colors.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.disabledFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    ...typography.body,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },
});
