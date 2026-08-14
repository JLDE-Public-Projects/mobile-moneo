import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Ícono de "Cuentas" (una tarjeta). viewBox 0 0 25 25.
 */
export function AccountsIcon({ size = 25, color = colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Rect
        x={3.5}
        y={6.5}
        width={18}
        height={13}
        rx={2.3}
        stroke={color}
        strokeWidth={1.9}
      />
      <Path d="M3.5 10.5h18" stroke={color} strokeWidth={1.9} />
      <Path d="M7 15h4" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}
