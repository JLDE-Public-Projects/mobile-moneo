import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface ChevronIconProps {
  /** Color del trazo. Por defecto el gris terciario del diseño. */
  color?: string;
  /** Alto en px; el ancho se escala proporcionalmente (relación 8:14). */
  height?: number;
}

/**
 * Chevron "›" de navegación, como el de las filas de lista de iOS.
 * viewBox 0 0 8 14, tomado del diseño.
 */
export function ChevronIcon({
  color = colors.textTertiary,
  height = 14,
}: ChevronIconProps) {
  const width = (height * 8) / 14;
  return (
    <Svg width={width} height={height} viewBox="0 0 8 14" fill="none">
      <Path
        d="M1 1l6 6-6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
