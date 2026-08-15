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
 */
export function AppFooter() {
  const { t } = useTranslation();

  return (
    <Text style={styles.text}>
      {t('common.footerMadeWith')}
      <Text style={styles.link} onPress={() => Linking.openURL(AUTHOR_URL)}>
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
