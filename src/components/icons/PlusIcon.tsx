import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Ícono "+" usado en el botón flotante para crear un movimiento nuevo.
 */
export function PlusIcon({ size = 22, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 3v16M3 11h16"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
