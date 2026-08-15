import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { IconButton } from '@/components/atoms/IconButton';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SettingsIcon } from '@/components/icons/SettingsIcon';
import { Card } from '@/components/molecules/Card';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { TransactionRow } from '@/components/molecules/TransactionRow';
import { QueryState } from '@/components/molecules/QueryState';
import { EmptyTransactions } from '@/components/organisms/EmptyTransactions';
import { TAB_BAR_SPACE } from '@/screens/main/PlaceholderScreen';
import { useTransactions } from '@/services/transactions/transaction.queries';
import { TRANSACTION_FILTERS } from '@/services/transactions/transaction.constants';
import { TransactionFilter } from '@/services/transactions/transaction.types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { formatDayMonth, monthLong } from '@/utils/date';
import { colors, layout, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface MovementsScreenProps {
  /** Abre la pantalla de Ajustes. */
  onOpenSettings: () => void;
}

/**
 * Pantalla "Movimientos".
 *
 * Lista los movimientos (desde el repositorio vía TanStack Query) con búsqueda
 * por texto y filtro por tipo (Todos / Egresos / Ingresos). Los importes se
 * formatean con la moneda seleccionada; el egreso va en rojo y el ingreso en
 * verde. Sigue el diseño de la pestaña "Movimientos".
 */
export function MovementsScreen({ onOpenSettings }: MovementsScreenProps) {
  const { data: transactions = [], isLoading, isError, refetch } = useTransactions();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  // Mes en curso, que es el periodo que la consulta ya trae del servidor.
  const month = monthLong(Date.now());

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TransactionFilter>('all');

  // Filtramos por tipo y, si hay búsqueda, por nota o categoría.
  const filtered = useMemo(() => {
    const byType = transactions.filter((t) => {
      if (filter === 'income') return t.amount > 0;
      if (filter === 'expense') return t.amount < 0;
      return true;
    });
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter(
      (t) =>
        t.note.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [transactions, filter, query]);

  // Se distingue "no hay nada registrado" de "la búsqueda no encontró nada":
  // el primero es un estado de bienvenida, el segundo un resultado vacío.
  const hasFilters = query.trim().length > 0 || filter !== 'all';
  const isFresh = transactions.length === 0;
  const isEmpty = filtered.length === 0;

  return (
    <Screen bottomInset={false}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con acceso a Ajustes */}
        <View style={styles.header}>
          <Text style={styles.title}>Movimientos</Text>
          <IconButton accessibilityLabel="Ajustes" onPress={onOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </View>

        {/* Buscar y filtrar solo tienen sentido si hay algo que filtrar. */}
        {!isFresh && (
          <>
            <View style={styles.search}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre"
              />
            </View>

            <View style={styles.filter}>
              <SegmentedControl
                options={TRANSACTION_FILTERS}
                value={filter}
                onChange={setFilter}
              />
            </View>
          </>
        )}

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          errorText="No pudimos cargar tus movimientos."
        >
          {isFresh ? (
            <EmptyTransactions month={month} />
          ) : (
            <>
              <SectionLabel>
                {`${filtered.length} ${filtered.length === 1 ? 'movimiento' : 'movimientos'} · ${month}`}
              </SectionLabel>

              {isEmpty ? (
                <Text style={styles.empty}>
                  {hasFilters
                    ? 'Ningún movimiento coincide con lo que buscas.'
                    : `Aún no tienes movimientos en ${month}.`}
                </Text>
              ) : (
                <Card>
                  {filtered.map((t, index) => (
                    <TransactionRow
                      key={t.id}
                      category={t.category}
                      color={t.categoryColor}
                      subtitle={`${formatDayMonth(t.date)} · ${t.note || t.account}`}
                      amount={`${t.amount > 0 ? '+' : '−'}${formatNumber(Math.abs(t.amount), currency)}`}
                      income={t.amount > 0}
                      showSeparator={index < filtered.length - 1}
                    />
                  ))}
                </Card>
              )}
            </>
          )}
        </QueryState>
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
  search: {
    marginBottom: 14,
  },
  filter: {
    marginBottom: spacing.lg,
  },
  empty: {
    ...typography.subtitle,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
});
