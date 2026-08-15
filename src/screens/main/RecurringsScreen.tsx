import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { BackLink } from '@/components/atoms/BackLink';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Card } from '@/components/molecules/Card';
import { AddRow } from '@/components/molecules/AddRow';
import { NewRecurringSheet } from '@/components/organisms/NewRecurringSheet';
import {
  useAddRecurring,
  useRecurrings,
  useSetRecurringActive,
} from '@/services/recurrings/recurring.queries';
import { Recurring } from '@/services/recurrings/recurring.types';
import { useAccounts } from '@/services/accounts/account.queries';
import {
  useAddTransaction,
  useTransactions,
} from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { colors, layout, radius, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface RecurringsScreenProps {
  /** Vuelve al inicio. */
  onBack: () => void;
}

/**
 * Pantalla de "Pagos Recurrentes".
 *
 * Separa los recurrentes activos en "Por pagar" (aún sin registrar este mes) y
 * "Pagadas este mes" (ya convertidas en movimiento), más los pausados. Un pago
 * se considera hecho si existe un movimiento de este mes enlazado al recurrente.
 * "Registrar" crea ese movimiento; "Pausar/Reanudar" activa o desactiva.
 */
export function RecurringsScreen({ onBack }: RecurringsScreenProps) {
  const { data: recurrings = [] } = useRecurrings();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const setActive = useSetRecurringActive();
  const addRecurring = useAddRecurring();
  const addTransaction = useAddTransaction();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [sheetVisible, setSheetVisible] = useState(false);

  // Ids de recurrentes ya pagados en el mes en curso.
  const paidThisMonth = useMemo(() => {
    const now = new Date();
    const ids = new Set<string>();
    for (const t of transactions) {
      if (!t.recurringId) continue;
      const d = new Date(t.date);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        ids.add(t.recurringId);
      }
    }
    return ids;
  }, [transactions]);

  const active = recurrings.filter((r) => r.active);
  const paused = recurrings.filter((r) => !r.active);
  const pending = active
    .filter((r) => !paidThisMonth.has(r.id))
    .sort((a, b) => a.day - b.day);
  const done = active
    .filter((r) => paidThisMonth.has(r.id))
    .sort((a, b) => a.day - b.day);

  const monthly = active.reduce((sum, r) => sum + r.amount, 0);
  const today = new Date().getDate();

  const money = (value: number) => `${currency.symbol}${formatNumber(value, currency)}`;

  // "Registrar" convierte el recurrente en un movimiento del mes en curso.
  //
  // El recurrente guarda el nombre de la cuenta (todavía es local), así que se
  // busca la cuenta real para enlazarla: es lo que permite al servidor ajustar
  // el saldo. Si ese nombre ya no existe, se registra sin enlazar y el saldo no
  // se toca, en vez de aplicárselo a una cuenta equivocada.
  const register = (r: Recurring) => {
    const account = accounts.find((a) => a.name === r.account);
    if (!account) return;

    addTransaction.mutate({
      amount: -r.amount,
      category: r.category,
      categoryColor: r.categoryColor,
      note: r.name,
      account: account.name,
      accountId: account.id,
      date: Date.now(),
      recurringId: r.id,
    });
  };

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
        <Text style={styles.title}>Pagos Recurrentes</Text>

        {/* Totales */}
        <View style={styles.totalsCard}>
          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>Al mes</Text>
            <Text style={styles.totalValue}>{money(monthly)}</Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={[styles.totalCol, styles.totalColRight]}>
            <Text style={styles.totalLabel}>Al año</Text>
            <Text style={styles.totalValue}>{money(monthly * 12)}</Text>
          </View>
        </View>

        {/* Por pagar */}
        <SectionLabel style={styles.sectionSpacing}>
          {pending.length ? `Por pagar (${pending.length})` : 'Por pagar'}
        </SectionLabel>
        <Card>
          {pending.map((r) => {
            const overdue = r.day < today;
            return (
              <View key={r.id} style={[styles.row, styles.rowBorder]}>
                <View style={[styles.swatch, { backgroundColor: r.categoryColor }]} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <View style={styles.subRow}>
                    <Text style={[styles.sub, overdue && styles.subOverdue]}>
                      {overdue ? 'Venció' : 'Vence'} el día {r.day} ·{' '}
                    </Text>
                    <Pressable
                      onPress={() => setActive.mutate({ id: r.id, active: false })}
                      hitSlop={6}
                    >
                      <Text style={styles.link}>Pausar</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.amount}>{money(r.amount)}</Text>
                <Pressable
                  onPress={() => register(r)}
                  style={({ pressed }) => [styles.action, pressed && styles.pressed]}
                >
                  <Text style={styles.actionText}>Registrar</Text>
                </Pressable>
              </View>
            );
          })}
          <AddRow label="Nueva recurrente" onPress={() => setSheetVisible(true)} />
        </Card>

        {/* Pagadas este mes */}
        {done.length > 0 && (
          <>
            <SectionLabel style={styles.sectionSpacing}>
              Pagadas este mes
            </SectionLabel>
            <Card>
              {done.map((r, index) => (
                <View
                  key={r.id}
                  style={[styles.row, index < done.length - 1 && styles.rowBorder]}
                >
                  <View
                    style={[styles.swatch, { backgroundColor: r.categoryColor }]}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <Text style={styles.sub}>Pagado el día {r.day}</Text>
                  </View>
                  <Text style={styles.amountMuted}>{money(r.amount)}</Text>
                  <Text style={styles.check}>✓</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Pausadas */}
        {paused.length > 0 && (
          <>
            <SectionLabel style={styles.sectionSpacing}>Pausadas</SectionLabel>
            <Card>
              {paused.map((r, index) => (
                <View
                  key={r.id}
                  style={[styles.row, index < paused.length - 1 && styles.rowBorder]}
                >
                  <View style={[styles.swatch, styles.swatchMuted]} />
                  <View style={styles.info}>
                    <Text style={styles.nameMuted} numberOfLines={1}>
                      {r.name}
                    </Text>
                    <Text style={styles.subMuted}>Cada día {r.day}</Text>
                  </View>
                  <Text style={styles.amountMuted}>{money(r.amount)}</Text>
                  <Pressable
                    onPress={() => setActive.mutate({ id: r.id, active: true })}
                    style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
                  >
                    <Text style={styles.resumeText}>Reanudar</Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          </>
        )}

        <Text style={styles.note}>
          Una recurrente es un pago que se repite cada mes. Moneo no la cobra
          sola: te la recuerda y, con "Registrar", la convierte en un movimiento.
          Al pausarla deja de contarse.
        </Text>
      </ScrollView>

      <NewRecurringSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onCreate={(input) => addRecurring.mutateAsync(input).then(() => undefined)}
      />
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
  totalsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.lg,
    paddingTop: 18,
  },
  totalCol: {
    flex: 1,
  },
  totalColRight: {
    paddingLeft: 16,
  },
  totalsDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.8,
    color: colors.textPrimary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  sectionSpacing: {
    paddingTop: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
  },
  swatchMuted: {
    backgroundColor: 'rgba(60,60,67,0.15)',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
  },
  nameMuted: {
    ...typography.body,
    color: colors.textTertiary,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subOverdue: {
    color: colors.negative,
  },
  subMuted: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  link: {
    ...typography.caption,
    color: colors.accent,
  },
  amount: {
    ...typography.body,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amountMuted: {
    ...typography.body,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  check: {
    fontSize: 19,
    color: colors.accent,
  },
  action: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
  resume: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.disabledFill,
  },
  resumeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
