import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { FadeInUp } from '@/components/atoms/FadeInUp';
import { colors, spacing, typography } from '@/theme';

/** Separación entre la entrada de una pieza y la siguiente. */
const STAGGER = 90;

/**
 * Estado vacío de la pantalla de Gastos.
 *
 * Se ve pocas veces —cuenta nueva o mes sin egresos—, así que aquí la
 * animación aporta: un anillo de gráfico (la dona de categorías) que "respira"
 * despacio con una insignia de porcentaje flotando encima, a la espera del
 * primer egreso. Sigue el mismo lenguaje visual y de accesibilidad que
 * {@link EmptyTransactions} (driver nativo, respeta "reducir movimiento").
 */
export function EmptyExpenses() {
  const { t } = useTranslation();
  const [reduceMotion, setReduceMotion] = useState(false);

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

  // Respiración del anillo: un vaivén lento y continuo, igual que la alcancía
  // de movimientos, para que ambos estados vacíos se sientan de la misma app.
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

  // Nunca se parte de una escala 0: nada aparece de la nada.
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const badgeFloat = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <View style={styles.container}>
      <FadeInUp delay={0}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Svg width={132} height={132} viewBox="0 0 132 132">
            {/* Halo suave detrás de la dona */}
            <Circle cx={66} cy={66} r={50} fill={colors.accent} opacity={0.08} />

            {/* Anillo de gráfico vacío: la "dona" de categorías sin egresos aún */}
            <Circle
              cx={66}
              cy={66}
              r={38}
              stroke={colors.accent}
              strokeWidth={16}
              strokeOpacity={0.18}
              fill="none"
            />
            {/* Un tramo del anillo ya coloreado, como invitación a llenarlo */}
            <Path
              d="M66 28 A38 38 0 0 1 100.9 50.6"
              stroke={colors.accent}
              strokeWidth={16}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </FadeInUp>

      {/* Insignia de porcentaje flotando sobre el anillo */}
      <Animated.View
        style={[styles.badge, { transform: [{ translateY: badgeFloat }] }]}
        pointerEvents="none"
      >
        <Svg width={30} height={30} viewBox="0 0 30 30">
          <Circle cx={15} cy={15} r={14} fill={colors.positive} />
        </Svg>
        <Text style={styles.badgeText}>%</Text>
      </Animated.View>

      <FadeInUp delay={STAGGER} style={styles.textBlock}>
        <Text style={styles.title}>{t('expenses.emptyState.title')}</Text>
      </FadeInUp>

      <FadeInUp delay={STAGGER * 2} style={styles.textBlock}>
        <Text style={styles.subtitle}>{t('expenses.emptyState.subtitle')}</Text>
      </FadeInUp>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  badge: {
    position: 'absolute',
    top: spacing.xxl + 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
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
