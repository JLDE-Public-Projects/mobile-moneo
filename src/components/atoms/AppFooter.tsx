import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@/theme';

/** Sitio del autor al que enlaza el pie de página. */
const AUTHOR_URL = 'https://jaderdiaz.com/';

/**
 * Pie de página de crédito, presente al final de cada pantalla de la app.
 *
 * El nombre del autor es un enlace a su sitio; el resto del texto es estático.
 *
 * `Linking.openURL` en iOS rechaza la promesa (en vez de abrir Safari) si el
 * simulador/dispositivo no tiene un navegador que declare poder manejar
 * `https`, y sin `.catch()` ese rechazo quedaba silencioso: el enlace parecía
 * no hacer nada. `canOpenURL` primero da una señal explícita para no fallar
 * en silencio.
 */
export function AppFooter() {
  const { t } = useTranslation();

  const openAuthorSite = async () => {
    try {
      const supported = await Linking.canOpenURL(AUTHOR_URL);
      if (supported) {
        await Linking.openURL(AUTHOR_URL);
      }
    } catch {
      // Sin conexión o enlace no soportado: no hay nada más que hacer aquí.
    }
  };

  return (
    <Text style={styles.text}>
      {t('common.footerMadeWith')}
      <Text style={styles.link} onPress={openAuthorSite}>
        {t('common.footerAuthor')}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
});
