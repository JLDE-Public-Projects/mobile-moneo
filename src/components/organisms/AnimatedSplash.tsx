import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '@/theme';

interface AnimatedSplashProps {
  /** Se ejecuta cuando la animación de entrada (incluido el fundido) termina. */
  onFinish: () => void;
}

/** Fuentes Sora usadas en el splash. */
const FONT_EXTRA = 'Sora_800ExtraBold';
const FONT_SEMI = 'Sora_600SemiBold';

// Geometría del anillo de progreso.
const RING_SIZE = 156;
const RING_STROKE = 7;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const DOT_SIZE = 10;

// Círculo animable (react-native-svg + Animated).
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Splash animado premium mostrado mientras la app arranca.
 *
 * Sobre un fondo con gradiente de marca, un anillo de progreso circular se llena
 * de 0 a 100% mientras un contador de porcentaje sube en sincronía y un punto
 * orbita el anillo, dando sensación de carga real. El logotipo y el wordmark
 * (tipografía Sora) entran con un resorte y, al llegar al 100%, todo se funde
 * hacia la app. Usa react-native-svg para el gradiente y el anillo; el resto es
 * la API `Animated`.
 */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const { width, height } = useWindowDimensions();

  // progress (0→1): anillo + porcentaje. No usa driver nativo (anima props SVG).
  const progress = useRef(new Animated.Value(0)).current;
  // Entrada (escala + opacidad) y salida: sí usan driver nativo.
  const enter = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  // Rotación continua del punto orbital.
  const orbit = useRef(new Animated.Value(0)).current;

  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // El contador de porcentaje sigue al valor de progreso.
    const listenerId = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
    });

    // Entrada del contenido con un resorte suave.
    Animated.spring(enter, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Punto orbitando el anillo, en bucle.
    const orbitLoop = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    orbitLoop.start();

    // Progreso de carga: sube a 100% y luego funde hacia la app.
    const run = Animated.timing(progress, {
      toValue: 1,
      duration: 2400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    });
    run.start(({ finished }) => {
      if (!finished) return;
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 420,
        delay: 320,
        useNativeDriver: true,
      }).start(({ finished: done }) => {
        if (done) onFinish();
      });
    });

    return () => {
      progress.removeListener(listenerId);
      orbitLoop.stop();
      run.stop();
    };
  }, [progress, enter, orbit, containerOpacity, onFinish]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  const enterScale = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const orbitRotate = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar style="light" />

      {/* Fondo con gradiente de marca */}
      <Svg width={width} height={height} style={styles.background}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} />
            <Stop offset="1" stopColor={colors.accentDark} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#bg)" />
      </Svg>

      <Animated.View
        style={{ opacity: enter, transform: [{ scale: enterScale }] }}
      >
        {/* Anillo de progreso + logo + punto orbital */}
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Pista */}
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            {/* Progreso (arranca arriba: rotamos -90°) */}
            <AnimatedCircle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke={colors.white}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              origin={`${RING_CENTER}, ${RING_CENTER}`}
            />
          </Svg>

          {/* Logo "M" centrado en el anillo */}
          <View style={styles.logo} pointerEvents="none">
            <Text style={styles.logoText}>M</Text>
          </View>

          {/* Punto que orbita el anillo */}
          <Animated.View
            style={[styles.orbit, { transform: [{ rotate: orbitRotate }] }]}
            pointerEvents="none"
          >
            <View style={styles.dot} />
          </Animated.View>
        </View>

        {/* Wordmark */}
        <Text style={styles.wordmark}>Moneo</Text>

        {/* Porcentaje de carga */}
        <Text style={styles.percent}>{percent}%</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    zIndex: 100,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FONT_EXTRA,
    fontSize: 46,
    color: colors.white,
    letterSpacing: -1,
    // Ajuste óptico para centrar la "M".
    marginTop: -2,
  },
  orbit: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.white,
    marginTop: (RING_STROKE - DOT_SIZE) / 2,
    // Brillo del punto.
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  wordmark: {
    fontFamily: FONT_EXTRA,
    fontSize: 36,
    color: colors.white,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 30,
  },
  percent: {
    fontFamily: FONT_SEMI,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
});
