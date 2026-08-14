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
  const currency = getCurrency(useSettingsStore((state) => state.currency));

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
              {categories.map((c, index) => (
                <CategoryStatRow
                  key={c.name}
                  name={c.name}
                  color={c.color}
                  amount={`${currency.symbol}${formatNumber(c.total, currency)}`}
                  pct={`${Math.round((c.total / total) * 100)}%`}
                  barWidth={(c.total / max) * 100}
                  showSeparator={index < categories.length - 1}
                  onPress={() => onOpenCategory(c.name)}
                />
              ))}
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
