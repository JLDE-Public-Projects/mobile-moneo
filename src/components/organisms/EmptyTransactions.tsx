import React, {useEffect, useRef} from 'react';
import {AccessibilityInfo, Animated, Easing, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {useTranslation} from 'react-i18next';
import {colors, spacing, typography} from '@/theme';

/** Duración de la entrada de cada pieza. */
const ENTER_DURATION = 420;
/** Separación entre la entrada de una pieza y la siguiente. */
const STAGGER = 90;

/** Pieza que entra con fundido y una leve subida, escalonada por `delay`. */
function Piece({
                  delay,
                  reduceMotion,
                  children,
                  style,
               }: {
   delay: number;
   reduceMotion: boolean;
   children: React.ReactNode;
   style?: object;
}) {
   const progress = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      const animation = Animated.timing(progress, {
         toValue: 1,
         duration: ENTER_DURATION,
         delay,
         // Entrada: `ease-out` arranca rápido, que es lo que hace que se sienta
         // que responde en vez de arrastrarse.
         easing: Easing.out(Easing.cubic),
         useNativeDriver: true,
      });
      animation.start();
      return () => animation.stop();
   }, [delay, progress]);

   // Con "reducir movimiento" solo se mantiene el fundido: la opacidad ayuda a
   // entender que algo apareció, el desplazamiento es lo que marea.
   const translateY = reduceMotion
      ? 0
      : progress.interpolate({inputRange: [0, 1], outputRange: [10, 0]});

   return <Animated.View style={[style, {opacity: progress, transform: [{translateY}]}]}>
      {children}
   </Animated.View>
}

/**
 * Estado vacío de la lista de movimientos.
 *
 * Es una pantalla que se ve pocas veces —al estrenar la app y al empezar un mes
 * nuevo—, así que aquí la animación sí aporta: convierte un vacío que parecería
 * un error en una invitación a registrar el primer movimiento.
 *
 * La alcancía respira despacio y en bucle; el resto entra escalonado. Solo se
 * animan opacidad y transformaciones (con driver nativo), y si el sistema pide
 * reducir movimiento se queda únicamente el fundido.
 */
export function EmptyTransactions({month}: { month: string }) {
   const {t} = useTranslation();
   const [reduceMotion, setReduceMotion] = React.useState(false);

   // Respeta el ajuste de accesibilidad del sistema.
   useEffect(() => {
      let active = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
         if (active) setReduceMotion(enabled);
      });
      const subscription = AccessibilityInfo.addEventListener(
         'reduceMotionChanged',
         setReduceMotion,
      );
      return () => {
         active = false;
         subscription.remove();
      };
   }, []);

   // Respiración de la alcancía: un vaivén lento y continuo que da la sensación
   // de que la pantalla está viva, esperando.
   const breath = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      if (reduceMotion) return;

      const loop = Animated.loop(
         Animated.sequence([
            Animated.timing(breath, {
               toValue: 1,
               duration: 1800,
               easing: Easing.inOut(Easing.sin),
               useNativeDriver: true,
            }),
            Animated.timing(breath, {
               toValue: 0,
               duration: 1800,
               easing: Easing.inOut(Easing.sin),
               useNativeDriver: true,
            }),
         ]),
      );
      loop.start();
      return () => loop.stop();
   }, [breath, reduceMotion]);

   // Nunca se parte de una escala 0: nada aparece de la nada. El rango es
   // mínimo a propósito, para que se note sin distraer.
   const scale = breath.interpolate({inputRange: [0, 1], outputRange: [1, 1.04]});
   const coinDrop = breath.interpolate({inputRange: [0, 1], outputRange: [0, -6]});

   return <View style={styles.container}>
      <Piece delay={0} reduceMotion={reduceMotion}>
         <Animated.View style={{transform: [{scale}]}}>
            <Svg width={132} height={132} viewBox="0 0 132 132">
               {/* Halo suave detrás de la alcancía */}
               <Circle cx={66} cy={70} r={46} fill={colors.accent} opacity={0.08}/>

               {/* Cuerpo */}
               <Rect x={26} y={52} width={80} height={52} rx={22} fill={colors.accent}/>
               {/* Hocico */}
               <Rect x={98} y={70} width={14} height={16} rx={7} fill={colors.accent}/>
               {/* Oreja */}
               <Path d="M42 54 L52 38 L62 54 Z" fill={colors.accent}/>
               {/* Ranura */}
               <Rect x={56} y={62} width={26} height={5} rx={2.5} fill={colors.white} opacity={0.85}/>
               {/* Ojo */}
               <Circle cx={90} cy={72} r={3.4} fill={colors.white}/>
               {/* Patas */}
               <Rect x={40} y={100} width={12} height={10} rx={4} fill={colors.accent}/>
               <Rect x={78} y={100} width={12} height={10} rx={4} fill={colors.accent}/>
            </Svg>
         </Animated.View>
      </Piece>

      {/* La moneda flota sobre la ranura, a punto de caer */}
      <Animated.View
         style={[styles.coin, {transform: [{translateY: coinDrop}]}]}
         pointerEvents="none"
      >
         <Svg width={26} height={26} viewBox="0 0 26 26">
            <Circle cx={13} cy={13} r={12} fill={colors.positive}/>
            <Circle cx={13} cy={13} r={8.5} fill={colors.positive} opacity={0.55}/>
         </Svg>
      </Animated.View>

      <Piece delay={STAGGER} reduceMotion={reduceMotion} style={styles.textBlock}>
         <Text style={styles.title}>{t('movements.emptyState.title', {month})}</Text>
      </Piece>

      <Piece delay={STAGGER * 2} reduceMotion={reduceMotion} style={styles.textBlock}>
         <Text style={styles.subtitle}>
            {t('movements.emptyState.subtitle')}
         </Text>
      </Piece>
   </View>
}

const styles = StyleSheet.create({
   container: {
      alignItems: 'center',
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xxxl,
      paddingHorizontal: spacing.xl,
   },
   coin: {
      position: 'absolute',
      top: spacing.xxl + 18,
   },
   textBlock: {
      alignItems: 'center',
   },
   title: {
      ...typography.bodyStrong,
      fontSize: 19,
      color: colors.textPrimary,
      textAlign: 'center',
      paddingTop: spacing.lg,
   },
   subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      paddingTop: 6,
   },
});
