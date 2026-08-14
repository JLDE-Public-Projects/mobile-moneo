import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface CategoryRowProps {
  /** Nombre de la categoría. */
  name: string;
  /** Color de la etiqueta (cuadro a la izquierda). */
  color: string;
  /** Texto secundario (p. ej. "Sin movimientos"). */
  sub?: string;
  /** Si la categoría puede eliminarse (false cuando está en uso). */
  removable?: boolean;
  /** Acción de eliminar. */
  onRemove?: () => void;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de una categoría en la vista de gestión: un cuadro de color, el nombre
 * con un subtítulo, y una acción a la derecha para borrarla ("Borrar" en rojo,
 * o "En uso" atenuado cuando tiene movimientos y no puede eliminarse).
 */
export function CategoryRow({
  name,
  color,
  sub,
  removable = true,
  onRemove,
  showSeparator = false,
}: CategoryRowProps) {
  return (
    <View style={[styles.row, showSeparator && styles.separator]}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {sub !== undefined && <Text style={styles.sub}>{sub}</Text>}
      </View>
      {removable ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Borrar ${name}`}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}
        >
          <Text style={styles.remove}>Borrar</Text>
        </Pressable>
      ) : (
        <Text style={styles.inUse}>En uso</Text>
      )}
    </View>
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
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  remove: {
    ...typography.subtitle,
    color: colors.negative,
  },
  inUse: {
    ...typography.subtitle,
    color: colors.textTertiary,
  },
  pressed: {
    opacity: 0.5,
  },
});
