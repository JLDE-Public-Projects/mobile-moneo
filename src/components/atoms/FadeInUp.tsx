import React, {useEffect, useRef} from 'react';
import {Animated, Easing, ViewStyle} from 'react-native';

interface FadeInUpProps {
   /** Contenido que aparecerá con la animación de entrada. */
   children: React.ReactNode;
   /** Retraso antes de iniciar, en ms. Permite escalonar varios elementos. */
   delay?: number;
   /** Duración de la animación, en ms. */
   duration?: number;
   /** Distancia vertical (en px) desde la que sube el contenido. */
   distance?: number;
   /** Estilos extra aplicados al contenedor animado. */
   style?: ViewStyle;
}

/**
 * Envoltorio que hace aparecer su contenido con un sutil "fade + subida".
 *
 * Es el ladrillo de las entradas escalonadas: al pasar distintos `delay` a
 * varios FadeInUp, los elementos de una pantalla entran en secuencia y le dan
 * vida sin recargar la interfaz. Usa el driver nativo, así que no bloquea el
 * hilo de JavaScript.
 */
export function FadeInUp({
                            children,
                            delay = 0,
                            duration = 420,
                            distance = 12,
                            style,
                         }: FadeInUpProps) {
   // Un único valor 0→1 controla opacidad y desplazamiento a la vez.
   const progress = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const animation = Animated.timing(progress, {
         toValue: 1,
         duration,
         delay,
         easing: Easing.out(Easing.cubic),
         useNativeDriver: true,
      });
      animation.start();

      // Si el componente se desmonta a mitad, detenemos la animación.
      return () => animation.stop();
   }, [delay, duration, progress]);

   // El desplazamiento se interpola desde `distance` hasta 0.
   const translateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [distance, 0],
   });

   return <Animated.View style={[style, {opacity: progress, transform: [{translateY}]}]}>
      {children}
   </Animated.View>
}
