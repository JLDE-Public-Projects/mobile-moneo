import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { AppFooter } from '@/components/atoms/AppFooter';
import { IconButton } from '@/components/atoms/IconButton';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { colors, layout, spacing, typography } from '@/theme';

interface PlaceholderScreenProps {
  /** Título grande de la pantalla. */
  title: string;
  /** Texto del estado vacío mientras la pantalla está en construcción. */
  note?: string;
  /** Si se define, muestra el botón de engranaje que abre Ajustes. */
  onOpenSettings?: () => void;
}

/** Espacio inferior para que el contenido no quede bajo la barra flotante. */
export const TAB_BAR_SPACE = 110;

/**
 * Pantalla base "en construcción" reutilizada por las sub-páginas todavía
 * vacías. Muestra el título grande (como en el diseño), el acceso a Ajustes
 * (engranaje) y un estado vacío centrado. Cada sub-página irá reemplazando este
 * contenido paso a paso.
 *
 * No aplica el margen seguro inferior porque de eso se encarga la barra de
 * navegación flotante que se superpone.
 */
export function PlaceholderScreen({
  title,
  note,
  onOpenSettings,
}: PlaceholderScreenProps) {
  const { t } = useTranslation();
  return (
    <Screen bottomInset={false}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {onOpenSettings && (
            <IconButton accessibilityLabel={t('common.settings')} onPress={onOpenSettings}>
              <SettingsIcon />
            </IconButton>
          )}
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.note}>{note ?? t('placeholder.underConstruction')}</Text>
        </View>

        <AppFooter />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_SPACE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    ...typography.subtitle,
    color: colors.textTertiary,
  },
});
