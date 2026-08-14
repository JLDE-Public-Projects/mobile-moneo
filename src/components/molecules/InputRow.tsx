import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

// Derivamos los tipos de los handlers de las propias props del TextInput, para
// no acoplarnos a los tipos de evento concretos (que cambian entre versiones).
type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;

interface InputRowProps extends Omit<TextInputProps, 'style'> {
  /** Etiqueta a la izquierda del campo (p. ej. "Usuario"). */
  label: string;
  /** Si se dibuja una línea separadora bajo la fila. */
  showSeparator?: boolean;
  /** Estilo de fuente opcional para el input (p. ej. monoespaciado). */
  inputStyle?: TextInputProps['style'];
}

/**
 * Campo etiquetado dentro de una {@link Card}, siguiendo la fila de formulario
 * de iOS: etiqueta de ancho fijo a la izquierda e input sin borde que ocupa el
 * resto.
 *
 * Micro-efecto: al enfocar el campo, la etiqueta transiciona suavemente al
 * color de acento y vuelve al enfocar fuera. Es una señal discreta de "campo
 * activo" que moderniza el formulario sin distraer.
 *
 * Reenvía todas las props nativas de {@link TextInput}, por lo que quien lo usa
 * controla `value`, `onChangeText`, `secureTextEntry`, tipo de teclado, etc.
 */
export function InputRow({
  label,
  showSeparator = false,
  inputStyle,
  onFocus,
  onBlur,
  ...inputProps
}: InputRowProps) {
  // Progreso de enfoque 0→1. Anima color (no soportado por el driver nativo).
  const focus = useRef(new Animated.Value(0)).current;

  const animateFocus = (toValue: number) => {
    Animated.timing(focus, {
      toValue,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  // Componemos nuestros handlers con los que pueda pasar quien nos consume.
  const handleFocus: FocusHandler = (e) => {
    animateFocus(1);
    onFocus?.(e);
  };
  const handleBlur: BlurHandler = (e) => {
    animateFocus(0);
    onBlur?.(e);
  };

  // Interpolamos el color de la etiqueta entre el primario y el acento.
  const labelColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textPrimary, colors.accent],
  });

  return (
    <View style={[styles.row, showSeparator && styles.separator]}>
      <Animated.Text style={[styles.label, { color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  label: {
    width: 76,
    ...typography.body,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...typography.body,
    color: colors.textPrimary,
    // Garantiza un área de toque cómoda en vertical.
    paddingVertical: spacing.md,
  },
});
