import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Ícono de "Gastos" (barras). viewBox 0 0 25 25.
 */
export function ExpensesIcon({ size = 25, color = colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Path
        d="M4 20V11M10.5 20V6M17 20v-7.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Path d="M4 20h16" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}
