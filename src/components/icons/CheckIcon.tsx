import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

interface CheckIconProps {
  /** Color del trazo. Por defecto el color de acento. */
  color?: string;
  /** Alto en px; el ancho se escala (relación 14:11). */
  height?: number;
}

/**
 * Marca de verificación "✓", usada para señalar la opción seleccionada en las
 * listas de selección. viewBox 0 0 14 11, tomada del diseño.
 */
export function CheckIcon({ color = colors.accent, height = 11 }: CheckIconProps) {
  const width = (height * 14) / 11;
  return (
    <Svg width={width} height={height} viewBox="0 0 14 11" fill="none">
      <Path
        d="M1 5.5L5 9.5L13 1.5"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
