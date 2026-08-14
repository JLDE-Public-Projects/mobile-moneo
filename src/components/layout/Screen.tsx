import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

interface ScreenProps {
  /** Contenido de la pantalla. */
  children: React.ReactNode;
  /** Estilos extra para el contenedor. */
  style?: ViewStyle;
  /** Si se aplica el margen seguro superior (barra de estado). Por defecto sí. */
  topInset?: boolean;
  /** Si se aplica el margen seguro inferior (indicador de inicio). Por defecto sí. */
  bottomInset?: boolean;
}

/**
 * Contenedor base de pantalla que respeta las áreas seguras del dispositivo.
 *
 * Evita que el contenido quede por debajo de la barra de estado (hora, señal,
 * batería) o del indicador de inicio, añadiendo el relleno que corresponde a
 * cada dispositivo mediante {@link useSafeAreaInsets}. Centralizarlo aquí evita
 * repetir el cálculo en cada pantalla.
 */
export function Screen({
  children,
  style,
  topInset = true,
  bottomInset = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: topInset ? insets.top : 0,
          paddingBottom: bottomInset ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
