import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/theme';

/** Una opción del control segmentado. */
export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  /** Opciones a mostrar, en orden. */
  options: SegmentOption<T>[];
  /** Valor seleccionado. */
  value: T;
  /** Se ejecuta al elegir una opción. */
  onChange: (value: T) => void;
}

/**
 * Control segmentado al estilo iOS: una pista gris con la opción activa
 * resaltada en una "píldora" blanca.
 *
 * Es genérico en el tipo del valor para poder reutilizarlo en filtros
 * (Todos/Egresos/Ingresos), tipos (Egreso/Ingreso) y demás, sin perder el
 * tipado.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text
              style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.disabledFill,
    borderRadius: 9,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 7,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    // Sombra sutil de la píldora activa, como en iOS.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.textPrimary,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
