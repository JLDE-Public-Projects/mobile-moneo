import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface FormMessageProps {
  /** Texto a mostrar. Cadena vacía = sin mensaje (se oculta). */
  message: string;
  /** Estilo de texto opcional para sobreescribir el color por defecto. */
  textStyle?: TextStyle;
}

/**
 * Ranura de mensaje para formularios (errores de validación / autenticación).
 *
 * Reserva siempre una altura fija para que el layout no "salte" al aparecer el
 * texto, y añade dos micro-efectos al recibir un mensaje nuevo: un fundido de
 * entrada y una vibración horizontal breve que llama la atención sin resultar
 * agresiva. Al vaciarse el mensaje, se desvanece.
 */
export function FormMessage({ message, textStyle }: FormMessageProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message.length === 0) {
      // Sin mensaje: nos desvanecemos suavemente.
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
      return;
    }

    // Mensaje nuevo: aparecemos y ejecutamos la vibración.
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Vibración: pequeño vaivén que vuelve al centro.
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -1,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0.5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [message, opacity, shake]);

  // Convertimos el valor -1..1 en un desplazamiento de ±5 px.
  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  });

  return (
    <Animated.View style={[styles.slot, { opacity, transform: [{ translateX }] }]}>
      <Animated.Text style={[styles.text, textStyle]} numberOfLines={2}>
        {message}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: {
    minHeight: 22,
    paddingHorizontal: spacing.xl,
    paddingTop: 9,
  },
  text: {
    ...typography.caption,
    color: colors.negative,
    lineHeight: 18,
  },
});
