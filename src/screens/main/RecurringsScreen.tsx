import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { AppFooter } from '@/components/atoms/AppFooter';
import { BackLink } from '@/components/atoms/BackLink';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Card } from '@/components/molecules/Card';
import { AddRow } from '@/components/molecules/AddRow';
import { RecurringRow } from '@/components/molecules/RecurringRow';
import { NewRecurringSheet } from '@/components/organisms/NewRecurringSheet';
import { ConfirmRecurringSheet } from '@/components/organisms/ConfirmRecurringSheet';
import {
  useAddRecurring,
  useRecurrings,
  useSetRecurringActive,
  useUpdateRecurringAmount,
} from '@/services/recurrings/recurring.queries';
import { Recurring } from '@/services/recurrings/recurring.types';
import { useAccounts } from '@/services/accounts/account.queries';
import {
  useAddTransaction,
  useTransactions,
} from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatMoney, formatNumber, getCurrency } from '@/config/currencies';
import { colors, layout, radius, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface RecurringsScreenProps {
  /** Vuelve al inicio. */
  onBack: () => void;
}

/**
 * Pantalla de "Recurrentes".
 *
 * Reúne los movimientos que se repiten cada mes, sean gastos fijos o ingresos
 * como el salario. Separa los activos en "Por pagar" (aún sin registrar este
 * mes) y "Pagadas este mes", más los pausados; uno se considera hecho si existe
 * un movimiento de este mes enlazado a él.
 *
 * "Registrar" no crea el movimiento de inmediato: abre la confirmación del
 * importe, porque el previsto es una estimación que suele variar.
 */
export function RecurringsScreen({ onBack }: RecurringsScreenProps) {
  const { t } = useTranslation();
  const { data: recurrings = [] } = useRecurrings();
  const { data: transactions = [] } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const setActive = useSetRecurringActive();
  const addRecurring = useAddRecurring();
  const updateAmount = useUpdateRecurringAmount();
  const addTransaction = useAddTransaction();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [sheetVisible, setSheetVisible] = useState(false);
  // Recurrente cuyo importe se está confirmando antes de registrarlo.
  const [confirming, setConfirming] = useState<Recurring | null>(null);

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

  // Neto de los recurrentes activos: los ingresos suman y los egresos restan,
  // porque ahora conviven ambos. Negativo significa que salen más de los que
  // entran, que es lo normal.
  const monthly = active.reduce((sum, r) => sum + r.amount, 0);
  const today = new Date().getDate();

  const money = (value: number) => `${currency.symbol}${formatNumber(value, currency)}`;

  /**
   * Abre la confirmación, salvo que el recurrente haya perdido su cuenta.
   *
   * Si la cuenta se eliminó, registrarlo crearía un movimiento que no movería
   * ningún saldo, y en silencio. Es preferible decirlo y que el usuario decida.
   */
  const startRegister = (r: Recurring) => {
    if (!r.accountId) {
      Alert.alert(
        t('recurrings.missingAccountTitle'),
        t('recurrings.missingAccountMessage', { name: r.name }),
      );
      return;
    }
    setConfirming(r);
  };

  /**
   * Confirma el registro con el importe que decida el usuario.
   *
   * El importe del recurrente es una previsión: la factura de luz varía y el
   * salario puede traer una prima, así que se registra lo confirmado y, si
   * cambió, el recurrente lo aprende para la próxima vez.
   */
  const confirmRegister = async (r: Recurring, confirmed: number) => {
    if (!r.accountId) return;

    // El signo lo marca el recurrente: negativo si es egreso, positivo si es
    // ingreso. La hoja solo devuelve la magnitud.
    const signed = r.amount < 0 ? -confirmed : confirmed;

    await addTransaction.mutateAsync({
      amount: signed,
      category: r.category,
      categoryColor: r.categoryColor,
      note: r.name,
      account: r.account,
      accountId: r.accountId,
      date: Date.now(),
      recurringId: r.id,
    });

    if (signed !== r.amount) {
      await updateAmount.mutateAsync({ id: r.id, amount: signed });
    }
  };

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <BackLink label={t('common.back')} onPress={onBack} />
        </View>
        <Text style={styles.title}>{t('recurrings.title')}</Text>

        {/* Totales */}
        <View style={styles.totalsCard}>
          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>{t('recurrings.perMonth')}</Text>
            <Text
              style={[styles.totalValue, monthly < 0 && styles.totalNegative]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatMoney(monthly, currency)}
            </Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={[styles.totalCol, styles.totalColRight]}>
            <Text style={styles.totalLabel}>{t('recurrings.perYear')}</Text>
            <Text
              style={[styles.totalValue, monthly < 0 && styles.totalNegative]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatMoney(monthly * 12, currency)}
            </Text>
          </View>
        </View>

        {/* Por pagar */}
        <SectionLabel style={styles.sectionSpacing}>
          {pending.length ? t('recurrings.pendingCount', { count: pending.length }) : t('recurrings.pending')}
        </SectionLabel>
        <Card>
          {pending.map((r) => {
            const overdue = r.day < today;
            return (
              <RecurringRow
                key={r.id}
                color={r.categoryColor}
                name={r.name}
                amount={money(Math.abs(r.amount))}
                amountVariant={r.amount > 0 ? 'income' : 'default'}
                subtitle={
                  (overdue ? t('recurrings.overdue') : t('recurrings.due')) +
                  t('recurrings.dueOnDay', { day: r.day })
                }
                subtitleOverdue={overdue}
                pauseLabel={t('recurrings.pause')}
                onPause={() => setActive.mutate({ id: r.id, active: false })}
                showSeparator
                trailing={
                  <Pressable
                    onPress={() => startRegister(r)}
                    style={({ pressed }) => [styles.action, pressed && styles.pressed]}
                  >
                    <Text style={styles.actionText}>{t('recurrings.register')}</Text>
                  </Pressable>
                }
              />
            );
          })}
          <AddRow label={t('recurrings.newRecurring')} onPress={() => setSheetVisible(true)} />
        </Card>

        {/* Pagadas este mes */}
        {done.length > 0 && (
          <>
            <SectionLabel style={styles.sectionSpacing}>
              {t('recurrings.paidThisMonth')}
            </SectionLabel>
            <Card>
              {done.map((r, index) => (
                <RecurringRow
                  key={r.id}
                  color={r.categoryColor}
                  name={r.name}
                  amount={money(Math.abs(r.amount))}
                  amountVariant="muted"
                  subtitle={t('recurrings.paidOnDay', { day: r.day })}
                  showSeparator={index < done.length - 1}
                  trailing={<Text style={styles.check}>✓</Text>}
                />
              ))}
            </Card>
          </>
        )}

        {/* Pausadas */}
        {paused.length > 0 && (
          <>
            <SectionLabel style={styles.sectionSpacing}>{t('recurrings.paused')}</SectionLabel>
            <Card>
              {paused.map((r, index) => (
                <RecurringRow
                  key={r.id}
                  color={r.categoryColor}
                  name={r.name}
                  amount={money(Math.abs(r.amount))}
                  amountVariant="muted"
                  subtitle={t('recurrings.everyDay', { day: r.day })}
                  muted
                  showSeparator={index < paused.length - 1}
                  trailing={
                    <Pressable
                      onPress={() => setActive.mutate({ id: r.id, active: true })}
                      style={({ pressed }) => [styles.resume, pressed && styles.pressed]}
                    >
                      <Text style={styles.resumeText}>{t('recurrings.resume')}</Text>
                    </Pressable>
                  }
                />
              ))}
            </Card>
          </>
        )}

        <Text style={styles.note}>
          {t('recurrings.explanationNote')}
        </Text>

        <AppFooter />
      </ScrollView>

      <NewRecurringSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onCreate={(input) => addRecurring.mutateAsync(input).then(() => undefined)}
      />

      <ConfirmRecurringSheet
        recurring={confirming}
        onClose={() => setConfirming(null)}
        onConfirm={(amount) =>
          confirming ? confirmRegister(confirming, amount) : Promise.resolve()
        }
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
    minWidth: 0,
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
  totalNegative: {
    color: colors.negative,
  },
  sectionSpacing: {
    paddingTop: spacing.xl,
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
    // El botón conserva su tamaño; el que cede es el nombre.
    flexShrink: 0,
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
    flexShrink: 0,
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
