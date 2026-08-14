import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { IconButton } from '@/components/atoms/IconButton';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { Card } from '@/components/molecules/Card';
import { AccountRow } from '@/components/molecules/AccountRow';
import { AddRow } from '@/components/molecules/AddRow';
import { NewAccountSheet } from '@/components/organisms/NewAccountSheet';
import { TAB_BAR_SPACE } from '@/screens/main/PlaceholderScreen';
import { useAccounts, useAddAccount } from '@/services/accounts/account.queries';
import { accountSubtitle } from '@/services/accounts/account.constants';
import { useSettingsStore } from '@/store/settingsStore';
import { getCurrency, formatMoney } from '@/config/currencies';
import { COLOR_PALETTE } from '@/config/palette';
import { colors, layout, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface AccountsScreenProps {
  /** Abre la pantalla de Ajustes. */
  onOpenSettings: () => void;
}

/**
 * Pantalla de administración de cuentas.
 *
 * Muestra el patrimonio neto (suma de saldos), la lista de cuentas (desde el
 * repositorio vía TanStack Query) y permite crear nuevas con la hoja inferior.
 * Los importes se formatean con la moneda seleccionada. Sigue el diseño de la
 * pestaña "Cuentas".
 */
export function AccountsScreen({ onOpenSettings }: AccountsScreenProps) {
  const { data: accounts = [] } = useAccounts();
  const addAccount = useAddAccount();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [sheetVisible, setSheetVisible] = useState(false);

  const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
  // A la cuenta nueva le toca el siguiente color de la paleta.
  const nextColor = COLOR_PALETTE[accounts.length % COLOR_PALETTE.length];

  return (
    <Screen bottomInset={false}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con acceso a Ajustes */}
        <View style={styles.header}>
          <Text style={styles.title}>Cuentas</Text>
          <IconButton accessibilityLabel="Ajustes" onPress={onOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </View>

        {/* Patrimonio neto */}
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Patrimonio neto</Text>
          <Text style={styles.netWorthValue}>{formatMoney(netWorth, currency)}</Text>
        </View>

        {/* Lista de cuentas */}
        <SectionLabel style={styles.sectionSpacing}>Mis cuentas</SectionLabel>
        <Card>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              name={account.name}
              subtitle={accountSubtitle(account)}
              color={account.color}
              balance={formatMoney(account.balance, currency)}
              negative={account.balance < 0}
              showSeparator
            />
          ))}
          <AddRow label="Agregar cuenta" onPress={() => setSheetVisible(true)} />
        </Card>

        <Text style={styles.note}>
          Los saldos se ajustan solos con cada movimiento que registras.
        </Text>
      </ScrollView>

      <NewAccountSheet
        visible={sheetVisible}
        color={nextColor}
        onClose={() => setSheetVisible(false)}
        onCreate={(input) => addAccount.mutateAsync(input).then(() => undefined)}
      />
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
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  netWorthCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.xl,
  },
  netWorthLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  netWorthValue: {
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: -1.2,
    color: colors.textPrimary,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  sectionSpacing: {
    paddingTop: spacing.xl,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
