import React from 'react';
import { Switch } from 'react-native';
import { colors } from '@/theme';

interface ToggleProps {
  /** Estado del interruptor. */
  value: boolean;
  /** Se ejecuta al cambiar el estado. */
  onValueChange: (value: boolean) => void;
}

/**
 * Interruptor de estilo iOS.
 *
 * Envuelve el {@link Switch} nativo con los colores de la marca (pista en verde
 * acento cuando está activo), para que todos los interruptores de la app se
 * vean iguales sin repetir la configuración de color.
 */
export function Toggle({ value, onValueChange }: ToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: colors.accent, false: colors.toggleTrackOff }}
      ios_backgroundColor={colors.toggleTrackOff}
      thumbColor={colors.white}
    />
  );
}
