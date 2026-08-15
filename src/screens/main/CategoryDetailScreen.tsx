import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { BackLink } from '@/components/atoms/BackLink';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Card } from '@/components/molecules/Card';
import { TransactionRow } from '@/components/molecules/TransactionRow';
import { useCategories } from '@/services/categories/category.queries';
import { useTransactions } from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { formatDayMonth } from '@/utils/date';
import { useMonthNames } from '@/hooks/useMonthNames';
import { colors, layout, spacing, typography } from '@/theme';

/** Callbacks/entrada de la pantalla. */
interface CategoryDetailScreenProps {
  /** Categoría a mostrar. */
  categoryName: string;
  /** Vuelve a Gastos. */
  onBack: () => void;
}

/**
 * Detalle de una categoría (se abre desde "Gastos").
 *
 * Muestra lo gastado frente al presupuesto de la categoría, con una barra y un
 * mensaje de cuánto queda o cuánto se pasó, seguido de la lista de sus
 * movimientos. Todo se calcula desde los movimientos y el presupuesto de la
 * categoría.
 */
export function CategoryDetailScreen({
  categoryName,
  onBack,
}: CategoryDetailScreenProps) {
  const { t } = useTranslation();
  const months = useMonthNames();
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const category = categories.find((c) => c.name === categoryName);
  const budget = category?.budget ?? 0;

  // Movimientos de la categoría y total gastado.
  const { rows, spent } = useMemo(() => {
    const list = transactions.filter((t) => t.category === categoryName);
    const total = list
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { rows: list, spent: total };
  }, [transactions, categoryName]);

  const over = budget > 0 && spent > budget;
  const barWidth = budget > 0 ? (spent / budget) * 100 : 0;

  const note = !budget
    ? t('categoryDetail.noLimit')
    : over
      ? t('categoryDetail.over', { amount: `${currency.symbol}${formatNumber(spent - budget, currency)}` })
      : t('categoryDetail.remainingThisMonth', { amount: `${currency.symbol}${formatNumber(budget - spent, currency)}` });

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <BackLink label={t('categoryDetail.back')} onPress={onBack} />
        </View>
        <Text style={styles.title}>{categoryName}</Text>

        {/* Gastado vs presupuesto */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.total}>
              {currency.symbol}
              {formatNumber(spent, currency)}
            </Text>
            <Text style={styles.budget}>
              {t('categoryDetail.ofBudget', { amount: `${currency.symbol}${formatNumber(budget, currency)}` })}
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.min(100, barWidth)}%`,
                  backgroundColor: over ? colors.negative : colors.accent,
                },
              ]}
            />
          </View>
          <Text style={[styles.note, over && styles.noteOver]}>{note}</Text>
        </View>

        {/* Movimientos de la categoría */}
        <SectionLabel style={styles.sectionSpacing}>
          {t('categoryDetail.movementsCount', { count: rows.length })}
        </SectionLabel>
        <Card>
          {rows.map((tx, index) => (
            <TransactionRow
              key={tx.id}
              category={tx.note}
              subtitle={`${formatDayMonth(tx.date, months)} · ${tx.account}`}
              amount={`${tx.amount > 0 ? '+' : '−'}${formatNumber(Math.abs(tx.amount), currency)}`}
              income={tx.amount > 0}
              showSeparator={index < rows.length - 1}
            />
          ))}
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  total: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -1,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  budget: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(60,60,67,0.08)',
    marginTop: 14,
  },
  fill: {
    height: 8,
    borderRadius: 99,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 10,
  },
  noteOver: {
    color: colors.negative,
  },
  sectionSpacing: {
    paddingTop: spacing.xl,
  },
});
