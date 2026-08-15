import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { AppFooter } from '@/components/atoms/AppFooter';
import { IconButton } from '@/components/atoms/IconButton';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { Card } from '@/components/molecules/Card';
import { ListRow } from '@/components/molecules/ListRow';
import { TransactionRow } from '@/components/molecules/TransactionRow';
import { TAB_BAR_SPACE } from '@/screens/main/PlaceholderScreen';
import { useTransactions } from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { formatDayMonth } from '@/utils/date';
import { useMonthNames } from '@/hooks/useMonthNames';
import { colors, layout, spacing, typography } from '@/theme';

/** Cantidad de movimientos recientes mostrados en el resumen. */
const RECENT_COUNT = 5;
/** Meses que muestra el histórico (coincide con {@link HistoryScreen}). */
const HISTORY_MONTHS = 6;

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface HomeScreenProps {
  /** Abre la pantalla de Ajustes. */
  onOpenSettings: () => void;
  /** Va a la pestaña de Movimientos ("Ver todos"). */
  onSeeAllMovements: () => void;
  /** Abre los pagos recurrentes. */
  onOpenRecurrings: () => void;
  /** Abre el historial. */
  onOpenHistory: () => void;
}

/**
 * Pantalla "Resumen" (Inicio).
 *
 * Muestra el balance del mes (ingresos − egresos) calculado desde los
 * movimientos, los últimos movimientos y accesos a pagos recurrentes e
 * historial. Sigue el diseño de la pestaña de inicio (título del mes + engranaje).
 */
export function HomeScreen({
  onOpenSettings,
  onSeeAllMovements,
  onOpenRecurrings,
  onOpenHistory,
}: HomeScreenProps) {
  const { t } = useTranslation();
  const months = useMonthNames();
  const { data: transactions = [] } = useTransactions();
  const currency = getCurrency(useSettingsStore((state) => state.currency));
  const currentMonthName = months.long[new Date().getMonth()];

  // Totales del mes a partir de los movimientos.
  const { income, expense, balance } = useMemo(() => {
    const inc = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [transactions]);

  const recent = transactions.slice(0, RECENT_COUNT);

  return (
    <Screen bottomInset={false}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera: mes + acceso a Ajustes */}
        <View style={styles.header}>
          <Text style={styles.title}>{currentMonthName}</Text>
          <IconButton accessibilityLabel={t('common.settings')} onPress={onOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </View>

        {/* Balance del mes */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('home.balanceOfMonth')}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceSymbol}>
              {balance < 0 ? '−' : ''}
              {currency.symbol}
            </Text>
            <Text style={styles.balanceValue}>
              {formatNumber(Math.abs(balance), currency)}
            </Text>
          </View>

          <View style={styles.split}>
            <View style={styles.splitCol}>
              <Text style={styles.splitLabel}>{t('home.income')}</Text>
              <Text style={styles.splitValue}>
                {currency.symbol}
                {formatNumber(income, currency)}
              </Text>
            </View>
            <View style={styles.splitDivider} />
            <View style={[styles.splitCol, styles.splitColRight]}>
              <Text style={styles.splitLabel}>{t('home.expenses')}</Text>
              <Text style={styles.splitValue}>
                {currency.symbol}
                {formatNumber(expense, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Últimos movimientos */}
        <SectionLabel style={styles.sectionSpacing}>
          {t('home.lastMovements')}
        </SectionLabel>
        <Card>
          {recent.map((tx) => (
            <TransactionRow
              key={tx.id}
              category={tx.category}
              color={tx.categoryColor}
              subtitle={`${formatDayMonth(tx.date, months)} · ${tx.note || tx.account}`}
              amount={`${tx.amount > 0 ? '+' : '−'}${formatNumber(Math.abs(tx.amount), currency)}`}
              income={tx.amount > 0}
              showSeparator
            />
          ))}
          <Pressable
            onPress={onSeeAllMovements}
            accessibilityRole="button"
            style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
          >
            <Text style={styles.seeAllText}>{t('home.viewAll')}</Text>
          </Pressable>
        </Card>

        {/* Accesos */}
        <Card style={styles.linksCard}>
          <ListRow label={t('home.recurrings')} onPress={onOpenRecurrings} showSeparator/>
          <ListRow
            label={t('home.history')}
            detail={t('home.historyDetail', { count: HISTORY_MONTHS })}
            onPress={onOpenHistory}
          />
        </Card>

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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.xl,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  balanceSymbol: {
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: colors.accent,
  },
  balanceValue: {
    fontSize: 44,
    fontWeight: '600',
    letterSpacing: -1.6,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  split: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  splitCol: {
    flex: 1,
  },
  splitColRight: {
    paddingLeft: 16,
  },
  splitDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  splitLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  splitValue: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: colors.textPrimary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  sectionSpacing: {
    paddingTop: spacing.xl,
  },
  seeAll: {
    alignItems: 'center',
    paddingVertical: 13,
  },
  seeAllText: {
    ...typography.subtitle,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },
  linksCard: {
    marginTop: spacing.xl,
  },
});
