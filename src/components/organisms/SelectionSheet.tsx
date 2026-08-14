import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { colors, radius, spacing, typography } from '@/theme';

/** Una opción seleccionable. */
export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Texto secundario opcional bajo la etiqueta. */
  sub?: string;
  /** Color opcional; si se define, muestra un cuadro a la izquierda. */
  color?: string;
}

interface SelectionSheetProps<T extends string> {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Título de la hoja. */
  title: string;
  /** Opciones a mostrar. */
  options: SelectOption<T>[];
  /** Valor seleccionado actualmente. */
  selected: T;
  /** Se ejecuta al elegir una opción (la hoja se cierra sola). */
  onSelect: (value: T) => void;
}

/**
 * Hoja inferior de selección única (organismo).
 *
 * Muestra una lista de opciones dentro de un {@link BottomSheet}; la opción
 * activa lleva una marca de verificación. Al elegir una, se notifica y se
 * cierra. Es genérica en el tipo del valor, por lo que se reutiliza para la
 * moneda, el primer día del mes y demás selecciones del diseño.
 */
export function SelectionSheet<T extends string>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
}: SelectionSheetProps<T>) {
  const handleSelect = (value: T) => {
    onSelect(value);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        {options.map((option, index) => {
          const isSelected = option.value === selected;
          const isLast = index === options.length - 1;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleSelect(option.value)}
              style={({ pressed }) => [
                styles.row,
                !isLast && styles.separator,
                pressed && styles.pressed,
              ]}
            >
              {option.color !== undefined && (
                <View style={[styles.swatch, { backgroundColor: option.color }]} />
              )}
              <View style={styles.info}>
                <Text style={styles.label}>{option.label}</Text>
                {option.sub !== undefined && (
                  <Text style={styles.sub}>{option.sub}</Text>
                )}
              </View>
              {isSelected && <CheckIcon />}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  pressed: {
    backgroundColor: colors.disabledFill,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
