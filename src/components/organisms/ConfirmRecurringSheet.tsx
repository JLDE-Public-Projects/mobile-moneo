import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { Recurring } from '@/services/recurrings/recurring.types';
import { useSettingsStore } from '@/store/settingsStore';
import { getCurrency } from '@/config/currencies';
import { colors, radius, spacing, typography } from '@/theme';

interface ConfirmRecurringSheetProps {
  /** Recurrente que se va a registrar; null cierra la hoja. */
  recurring: Recurring | null;
  /** Cierra la hoja sin registrar. */
  onClose: () => void;
  /**
   * Registra el movimiento con el importe confirmado, en positivo. El signo lo
   * conserva quien llama, a partir del recurrente.
   */
  onConfirm: (amount: number) => Promise<void>;
}

/** Solo dígitos, para el campo de importe. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * Hoja de confirmación al registrar un recurrente (organismo).
 *
 * El importe previsto es una previsión, no una certeza: la factura de luz varía
 * cada mes y el salario puede traer una prima. Por eso se muestra precargado y
 * editable en vez de registrarlo a ciegas, y si se confirma otro valor el
 * recurrente lo aprende para la próxima vez.
 */
export function ConfirmRecurringSheet({
  recurring,
  onClose,
  onConfirm,
}: ConfirmRecurringSheetProps) {
  const { t } = useTranslation();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [amount, setAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El importe se edita sin signo: lo pone el recurrente al confirmar.
  useEffect(() => {
    if (!recurring) return;
    setAmount(String(Math.abs(recurring.amount)));
    setErrorMessage('');
  }, [recurring]);

  const isIncome = (recurring?.amount ?? 0) > 0;
  const numericAmount = amount ? Number(amount) : 0;
  const previous = Math.abs(recurring?.amount ?? 0);
  const hasChanged = numericAmount > 0 && numericAmount !== previous;
  const canSubmit = numericAmount > 0 && !isSubmitting;

  const handleConfirm = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConfirm(numericAmount);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('recurrings.confirmSheet.errorGeneric');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={Boolean(recurring)} onClose={onClose}>
      <Text style={styles.title}>
        {t('recurrings.confirmSheet.title', { name: recurring?.name ?? '' })}
      </Text>
      <Text style={styles.subtitle}>
        {isIncome
          ? t('recurrings.confirmSheet.subtitleIncome')
          : t('recurrings.confirmSheet.subtitleExpense')}
        {recurring
          ? t('recurrings.confirmSheet.subtitleAccountSuffix', { account: recurring.account })
          : ''}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('recurrings.confirmSheet.amount')}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySign}>{currency.symbol}</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="number-pad"
            value={amount}
            onChangeText={(v) => setAmount(onlyDigits(v))}
            selectTextOnFocus
            autoFocus
          />
        </View>
      </View>

      {hasChanged && (
        <Text style={styles.note}>
          {t('recurrings.confirmSheet.changedNote')}
        </Text>
      )}

      <FormMessage message={errorMessage} />

      <Button
        label={t('recurrings.confirmSheet.submit')}
        onPress={handleConfirm}
        disabled={!canSubmit}
        loading={isSubmitting}
        style={styles.confirmButton}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
    paddingTop: 4,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  currencySign: {
    fontSize: 22,
    color: colors.textTertiary,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '600',
    letterSpacing: -1.2,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    minWidth: 140,
    textAlign: 'center',
    paddingVertical: 2,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  confirmButton: {
    marginTop: spacing.md,
  },
});
