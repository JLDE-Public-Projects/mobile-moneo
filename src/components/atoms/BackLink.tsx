import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/theme';

interface BackLinkProps {
  /** Texto mostrado junto al chevron (p. ej. "Entrar"). */
  label: string;
  /** Acción al pulsar (normalmente, volver a la pantalla anterior). */
  onPress: () => void;
}

/**
 * Enlace de retroceso al estilo iOS: un chevron "‹" seguido de una etiqueta,
 * ambos en color de acento.
 *
 * El chevron se dibuja con bordes de una View rotada en lugar de un SVG, para
 * no añadir dependencias y mantener la coherencia con el resto de iconografía
 * ligera de la app.
 */
export function BackLink({ label, onPress }: BackLinkProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={t('accessibility.backTo', { label })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.chevron} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.5,
  },
  chevron: {
    width: 10,
    height: 10,
    borderTopWidth: 2.2,
    borderLeftWidth: 2.2,
    borderColor: colors.accent,
    // Rotamos la esquina superior-izquierda para formar un chevron "‹".
    transform: [{ rotate: '-45deg' }],
    marginRight: 1,
  },
  label: {
    ...typography.body,
    color: colors.accent,
  },
});
