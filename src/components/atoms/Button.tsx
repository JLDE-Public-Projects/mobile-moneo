import React, {useRef} from 'react';
import {
   ActivityIndicator,
   Animated,
   Pressable,
   StyleSheet,
   Text,
   View,
   ViewStyle,
} from 'react-native';
import {colors, radius, typography} from '@/theme';

/** Variantes visuales soportadas por {@link Button}. */
export type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
   /** Texto mostrado dentro del botón. */
   label: string;
   /** Se ejecuta al pulsar (se ignora si está deshabilitado o cargando). */
   onPress: () => void;
   /** Estilo visual. Por defecto, el botón primario relleno. */
   variant?: ButtonVariant;
   /** Cuando es true el botón se atenúa y no responde. */
   disabled?: boolean;
   /** Cuando es true un spinner reemplaza la etiqueta y se ignoran los toques. */
   loading?: boolean;
   /** Elemento opcional a la izquierda (p. ej. un icono) antes de la etiqueta. */
   leading?: React.ReactNode;
   /** Acción destructiva: tiñe la etiqueta de rojo (p. ej. "Cerrar sesión"). */
   destructive?: boolean;
   /** Estilos extra del contenedor para ajustes puntuales de layout. */
   style?: ViewStyle;
}

/**
 * Botón de acción con forma de píldora y variantes primaria/secundaria.
 *
 * Centralizar el estilo aquí garantiza que toda llamada a la acción comparta la
 * misma altura, radio y estados. Añade una micro-interacción: al mantener
 * pulsado, el botón se encoge levemente (efecto "táctil") mediante un resorte
 * con driver nativo, lo que transmite respuesta inmediata al usuario.
 */
export function Button({
                          label,
                          onPress,
                          variant = 'primary',
                          disabled = false,
                          loading = false,
                          leading,
                          destructive = false,
                          style,
                       }: ButtonProps) {

   const isInteractive = !disabled && !loading;
   const isPrimary = variant === 'primary';
   // Color del contenido secundario: rojo si es destructivo, si no, acento.
   const secondaryColor = destructive ? colors.negative : colors.accent;

   // Escala animada para el efecto de "presión". Solo transform → driver nativo.
   const scale = useRef(new Animated.Value(1)).current;

   const animateTo = (toValue: number) => {
      Animated.spring(scale, {
         toValue,
         useNativeDriver: true,
         speed: 40,
         bounciness: 6,
      }).start();
   };

   return (
      <Animated.View style={[{transform: [{scale}]}, style]}>
         <Pressable
            accessibilityRole="button"
            accessibilityState={{disabled: !isInteractive}}
            onPress={isInteractive ? onPress : undefined}
            onPressIn={() => isInteractive && animateTo(0.97)}
            onPressOut={() => animateTo(1)}
            style={({pressed}) => [
               styles.base,
               isPrimary ? styles.primary : styles.secondary,
               disabled && styles.disabled,
               pressed && isInteractive && styles.pressed,
            ]}
         >
            {loading ? (
               <ActivityIndicator color={isPrimary ? colors.white : secondaryColor}/>
            ) : (
               <View style={styles.content}>
                  {leading}
                  <Text
                     style={[
                        styles.label,
                        isPrimary ? styles.labelPrimary : styles.labelSecondary,
                        !isPrimary && {color: secondaryColor},
                     ]}
                  >
                     {label}
                  </Text>
               </View>
            )}
         </Pressable>
      </Animated.View>
   );
}

const styles = StyleSheet.create({
   base: {
      height: 52,
      borderRadius: radius.card,
      alignItems: 'center',
      justifyContent: 'center',
   },
   content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
   },
   primary: {
      backgroundColor: colors.accent,
   },
   secondary: {
      backgroundColor: colors.surface,
   },
   disabled: {
      backgroundColor: colors.disabledFill,
   },
   pressed: {
      opacity: 0.9,
   },
   label: {
      ...typography.bodyStrong,
   },
   labelPrimary: {
      color: colors.white,
   },
   labelSecondary: {
      color: colors.accent,
      fontWeight: '500',
   },
});
