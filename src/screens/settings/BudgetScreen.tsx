import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { BackLink } from '@/components/atoms/BackLink';
import { Card } from '@/components/molecules/Card';
import { BudgetRow } from '@/components/molecules/BudgetRow';
import { QueryState } from '@/components/molecules/QueryState';
import { useCategories } from '@/services/categories/category.queries';
import { useBudgetAdjuster } from '@/hooks/useBudgetAdjuster';
import { useTransactions } from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { colors, layout, spacing, typography } from '@/theme';

/** Cada toque mueve el límite este monto. */
const BUDGET_STEP = 50000;

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface BudgetScreenProps {
  /** Vuelve a la pantalla anterior. */
  onBack: () => void;
}

/**
 * Pantalla de "Presupuesto".
 *
 * Lista las categorías de egreso con su límite mensual y lo gastado, permite
 * ajustar cada límite en pasos de $50.000 y muestra una barra que se pone en
 * rojo al superarlo. El gasto se calcula desde los movimientos; el límite se
 * persiste en la categoría.
 */
export function BudgetScreen({ onBack }: BudgetScreenProps) {
  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const { adjust } = useBudgetAdjuster();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  // Gasto por categoría (solo egresos).
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.amount >= 0) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount));
    }
    return map;
  }, [transactions]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const budgetTotal = expenseCategories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
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
        <Text style={styles.title}>Presupuesto</Text>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          errorText="No pudimos cargar tu presupuesto."
        >
        {/* Total asignado vs gastado */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Asignado / gastado</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>
              {currency.symbol}
              {formatNumber(budgetTotal, currency)}
            </Text>
            <Text style={styles.summarySpent}>
              {currency.symbol}
              {formatNumber(totalSpent, currency)} usado
            </Text>
          </View>
        </View>

        {/* Presupuesto por categoría */}
        <Card style={styles.listCard}>
          {expenseCategories.map((c, index) => {
            const spent = spentByCategory.get(c.name) ?? 0;
            const over = c.budget > 0 && spent > c.budget;
            const barWidth = c.budget > 0 ? (spent / c.budget) * 100 : 0;
            return (
              <BudgetRow
                key={c.id}
                name={c.name}
                label={`${formatNumber(spent, currency)} de ${formatNumber(c.budget, currency)}`}
                over={over}
                barWidth={barWidth}
                onIncrease={() => adjust(c.id, BUDGET_STEP)}
                onDecrease={() => adjust(c.id, -BUDGET_STEP)}
                showSeparator={index < expenseCategories.length - 1}
              />
            );
          })}
        </Card>

        <Text style={styles.note}>
          Cada toque mueve el límite {currency.symbol}
          {formatNumber(BUDGET_STEP, currency)}. Solo se avisa cuando pasas del
          100%.
        </Text>
        </QueryState>
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
    padding: spacing.lg,
    paddingTop: 18,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  summaryTotal: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.9,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  summarySpent: {
    ...typography.body,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  listCard: {
    marginTop: 18,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
