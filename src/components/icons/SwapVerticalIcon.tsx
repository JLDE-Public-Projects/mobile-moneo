import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Dos flechas verticales opuestas: marca la dirección del dinero entre las
 * cuentas de una transferencia y, a la vez, que se pueden intercambiar
 * tocando. viewBox 0 0 20 20.
 */
export function SwapVerticalIcon({ size = 18, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Baja por la izquierda */}
      <Path
        d="M6.5 3.5v13M6.5 16.5 3.5 13.5M6.5 16.5l3-3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sube por la derecha */}
      <Path
        d="M13.5 16.5v-13M13.5 3.5l-3 3M13.5 3.5l3 3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
