import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';

interface IconButtonProps {
  /** Ícono a mostrar dentro del botón. */
  children: React.ReactNode;
  /** Acción al pulsar. */
  onPress: () => void;
  /** Etiqueta de accesibilidad. */
  accessibilityLabel: string;
  /** Diámetro del botón en px. */
  size?: number;
  /** Color de fondo del botón. */
  background?: string;
}

/**
 * Botón circular con un ícono centrado, al estilo iOS (p. ej. el acceso a
 * Ajustes en la cabecera del inicio). Reutilizable para cualquier acción de
 * ícono sobre un fondo tenue.
 */
export function IconButton({
  children,
  onPress,
  accessibilityLabel,
  size = 36,
  background = colors.disabledFill,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, backgroundColor: background },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
