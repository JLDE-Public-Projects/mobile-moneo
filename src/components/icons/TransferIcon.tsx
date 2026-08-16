import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Ícono de "Transferencia" (dos flechas horizontales en sentidos opuestos,
 * como un intercambio). viewBox 0 0 22 22.
 */
export function TransferIcon({ size = 22, color = colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M4 8h13.5M14.5 4.5 18 8l-3.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 14H4.5M7.5 10.5 4 14l3.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
