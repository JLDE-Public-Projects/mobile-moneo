import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { IconButton } from '@/components/atoms/IconButton';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { Card } from '@/components/molecules/Card';
import { ListRow } from '@/components/molecules/ListRow';
import { CategoryStatRow } from '@/components/molecules/CategoryStatRow';
import { TAB_BAR_SPACE } from '@/screens/main/PlaceholderScreen';
import { useTransactions } from '@/services/transactions/transaction.queries';
import { useCategories } from '@/services/categories/category.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { colors, layout, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface ExpensesScreenProps {
  /** Abre la pantalla de Ajustes. */
  onOpenSettings: () => void;
  /** Abre la pantalla de Presupuesto. */
  onOpenBudget: () => void;
  /** Abre el detalle de una categoría. */
  onOpenCategory: (name: string) => void;
}

/** Agregado de egresos por categoría. */
interface CategoryTotal {
  name: string;
  color: string;
  total: number;
}

/**
 * Pantalla "Gastos".
 *
 * Resume los egresos del mes: total, una barra apilada por categoría y el
 * desglose ordenado de mayor a menor con su porcentaje. Todo se calcula desde
 * los movimientos. El cambio de periodo (Agosto/Julio) del diseño se añadirá
 * cuando haya histórico de varios meses.
 */
export function ExpensesScreen({
  onOpenSettings,
  onOpenBudget,
  onOpenCategory,
}: ExpensesScreenProps) {
  const { data: transactions = [] } = useTransactions();
  const { data: budgetCategories = [] } = useCategories();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  // Límite mensual por categoría, para señalar las que se pasaron. Un límite en
  // cero significa "sin tope", así que esas nunca se marcan.
  const budgetByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of budgetCategories) {
      if (c.budget > 0) map.set(c.name, c.budget);
    }
    return map;
  }, [budgetCategories]);

  // Agrupamos los egresos por categoría y ordenamos de mayor a menor.
  const { categories, total, max } = useMemo(() => {
    const byCategory = new Map<string, CategoryTotal>();
    for (const t of transactions) {
      if (t.amount >= 0) continue;
      const amount = Math.abs(t.amount);
      const current = byCategory.get(t.category);
      if (current) {
        current.total += amount;
      } else {
        byCategory.set(t.category, {
          name: t.category,
          color: t.categoryColor,
          total: amount,
        });
      }
    }
    const list = [...byCategory.values()].sort((a, b) => b.total - a.total);
    const sum = list.reduce((acc, c) => acc + c.total, 0);
    return { categories: list, total: sum, max: list[0]?.total ?? 1 };
  }, [transactions]);

  const isEmpty = categories.length === 0;

  const money = (value: number) =>
    `${currency.symbol}${formatNumber(value, currency)}`;

  /**
   * Las dos lecturas de una categoría, que responden preguntas distintas.
   *
   * `share` es su peso dentro del total de egresos: en qué se va el dinero.
   * `hint` y `barWidth` hablan del límite: cuánto queda o cuánto se pasó, que
   * es lo que dice si hay que frenar.
   *
   * Sin límite no hay contra qué medir, así que la barra vuelve a comparar la
   * categoría con la que más gasta, que es la única referencia disponible.
   */
  const categoryStats = (c: CategoryTotal) => {
    const share = `${Math.round((c.total / total) * 100)}% del total`;
    const budget = budgetByCategory.get(c.name);

    if (!budget) {
      return { share, hint: undefined, barWidth: (c.total / max) * 100, over: false };
    }

    const over = c.total > budget;
    return {
      share,
      hint: over
        ? `Te pasaste ${money(c.total - budget)} del límite`
        : `Quedan ${money(budget - c.total)} de ${money(budget)}`,
      barWidth: (c.total / budget) * 100,
      over,
    };
  };

  return (
    <Screen bottomInset={false}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con acceso a Ajustes */}
        <View style={styles.header}>
          <Text style={styles.title}>Gastos</Text>
          <IconButton accessibilityLabel="Ajustes" onPress={onOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </View>

        {isEmpty ? (
          <Text style={styles.empty}>Aún no tienes egresos este mes.</Text>
        ) : (
          <>
            {/* Total + barra apilada */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total egresos</Text>
              <Text style={styles.totalValue}>
                {currency.symbol}
                {formatNumber(total, currency)}
              </Text>
              <View style={styles.stack}>
                {categories.map((c) => (
                  <View
                    key={c.name}
                    style={{
                      width: `${(c.total / total) * 100}%`,
                      backgroundColor: c.color,
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Desglose por categoría */}
            <Card style={styles.listCard}>
              {categories.map((c, index) => {
                const stats = categoryStats(c);
                return (
                  <CategoryStatRow
                    key={c.name}
                    name={c.name}
                    color={c.color}
                    amount={money(c.total)}
                    share={stats.share}
                    hint={stats.hint}
                    barWidth={stats.barWidth}
                    over={stats.over}
                    showSeparator={index < categories.length - 1}
                    onPress={() => onOpenCategory(c.name)}
                  />
                );
              })}
            </Card>

            {/* Acceso al presupuesto */}
            <Card style={styles.budgetCard}>
              <ListRow
                label="Ajustar presupuesto"
                tintColor={colors.accent}
                onPress={onOpenBudget}
              />
            </Card>
          </>
        )}
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
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.lg,
    paddingTop: 18,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -1,
    color: colors.textPrimary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  stack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 99,
    overflow: 'hidden',
    gap: 1.5,
    marginTop: 16,
  },
  listCard: {
    marginTop: 18,
  },
  budgetCard: {
    marginTop: 18,
  },
  empty: {
    ...typography.subtitle,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: spacing.xxxl,
  },
});
