import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Ícono de "Movimientos" (dos flechas en sentidos opuestos). viewBox 0 0 25 25.
 */
export function MovementsIcon({ size = 25, color = colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Path
        d="M4 8h13.5M17.5 8 14 4.5M17.5 8 14 11.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 17H7.5M7.5 17 11 13.5M7.5 17 11 20.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
