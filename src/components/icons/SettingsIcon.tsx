import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '@/components/icons/types';
import { colors } from '@/theme';

/**
 * Ícono de "Ajustes" (engranaje). Es un ícono relleno (fill), viewBox 0 0 24 24,
 * tomado del diseño.
 */
export function SettingsIcon({ size = 19, color = colors.iconMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M19.9 12.66a7.9 7.9 0 0 0 .07-1c0-.34-.03-.67-.07-1l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.6 7.6 0 0 0-1.73-1l-.38-2.65a.49.49 0 0 0-.5-.42h-4a.49.49 0 0 0-.5.42l-.38 2.65a7.6 7.6 0 0 0-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.33-.07.67-.07 1s.03.67.07 1l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.23.4.32.6.22l2.49-1c.53.42 1.11.76 1.73 1l.38 2.65c.05.24.26.42.5.42h4c.24 0 .45-.18.5-.42l.38-2.65c.62-.24 1.2-.58 1.73-1l2.49 1c.23.1.47 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65Zm-7.9 2.69a3.35 3.35 0 1 1 0-6.7 3.35 3.35 0 0 1 0 6.7Z" />
    </Svg>
  );
}
