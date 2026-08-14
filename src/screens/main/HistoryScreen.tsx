import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { BackLink } from '@/components/atoms/BackLink';
import { Card } from '@/components/molecules/Card';
import { useTransactions } from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatMoney, formatNumber, getCurrency } from '@/config/currencies';
import { PAST_MONTHS, MonthSummary } from '@/config/history';
import { formatMonthYear, monthShort } from '@/utils/date';
import { colors, layout, spacing, typography } from '@/theme';

/** Alto máximo (px) de las barras del gráfico. */
const BAR_MAX = 78;

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface HistoryScreenProps {
  /** Vuelve al inicio. */
  onBack: () => void;
}

/**
 * Pantalla de "Historial".
 *
 * Muestra el balance mensual de los últimos meses: los ya cerrados vienen de
 * datos guardados y el mes en curso se calcula en vivo desde los movimientos.
 * Un gráfico de barras y una lista con ingresos, egresos y balance por mes.
 */
export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { data: transactions = [] } = useTransactions();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  // Mes en curso (agosto) desde los movimientos + meses cerrados.
  const months: MonthSummary[] = useMemo(() => {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const now = Date.now();
    const current: MonthSummary = {
      name: formatMonthYear(now),
      short: monthShort(now),
      income,
      expense,
    };
    return [...PAST_MONTHS, current];
  }, [transactions]);

  const maxBalance = Math.max(
    1,
    ...months.map((m) => Math.abs(m.income - m.expense)),
  );

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <BackLink label="Atrás" onPress={onBack} />
        </View>
        <Text style={styles.title}>Historial</Text>

        {/* Gráfico de balance por mes */}
        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>
            Balance por mes · {months.length} meses
          </Text>
          <View style={styles.chart}>
            {months.map((m) => {
              const balance = m.income - m.expense;
              const height = Math.max(6, (Math.abs(balance) / maxBalance) * BAR_MAX);
              return (
                <View key={m.name} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor:
                          balance >= 0 ? colors.accent : colors.negative,
                      },
                    ]}
                  />
                  <Text style={styles.barShort}>{m.short}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Lista mensual */}
        <Card style={styles.listCard}>
          {months
            .slice()
            .reverse()
            .map((m, index, arr) => {
              const balance = m.income - m.expense;
              return (
                <View
                  key={m.name}
                  style={[styles.row, index < arr.length - 1 && styles.separator]}
                >
                  <View style={styles.info}>
                    <Text style={styles.month}>{m.name}</Text>
                    <Text style={styles.flows}>
                      +{formatNumber(m.income, currency)} · −
                      {formatNumber(m.expense, currency)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.balance,
                      { color: balance >= 0 ? colors.accent : colors.negative },
                    ]}
                  >
                    {formatMoney(balance, currency)}
                  </Text>
                </View>
              );
            })}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  backRow: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    paddingBottom: spacing.lg,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.xl,
  },
  chartLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 96,
    marginTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barShort: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  listCard: {
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  month: {
    ...typography.body,
    color: colors.textPrimary,
  },
  flows: {
    ...typography.caption,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  balance: {
    ...typography.body,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});
