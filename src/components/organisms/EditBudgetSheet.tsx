import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { Category } from '@/services/categories/category.types';
import { useUpdateCategoryBudget } from '@/services/categories/category.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { colors, radius, spacing, typography } from '@/theme';

interface EditBudgetSheetProps {
  /** Categoría cuyo límite se edita; null cierra la hoja. */
  category: Category | null;
  /** Cierra la hoja sin guardar. */
  onClose: () => void;
}

/** Solo dígitos, para el campo de importe. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * Hoja para escribir directamente el límite mensual de una categoría
 * (organismo).
 *
 * Complementa los botones +/− de `BudgetRow`: esos sirven para ajustes finos,
 * pero llegar a un valor grande a fuerza de toques es lento, así que esta
 * hoja permite teclearlo de una.
 */
export function EditBudgetSheet({ category, onClose }: EditBudgetSheetProps) {
  const { t } = useTranslation();
  const currency = getCurrency(useSettingsStore((state) => state.currency));
  const updateBudget = useUpdateCategoryBudget();

  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!category) return;
    setAmount(category.budget > 0 ? String(category.budget) : '');
  }, [category]);

  const handleSave = () => {
    if (!category) return;
    updateBudget.mutate({ id: category.id, budget: amount ? Number(amount) : 0 });
    onClose();
  };

  return (
    <BottomSheet visible={Boolean(category)} onClose={onClose}>
      <Text style={styles.title}>
        {t('budget.editSheet.title', { name: category?.name ?? '' })}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('budget.editSheet.amountLabel')}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySign}>{currency.symbol}</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="number-pad"
            value={amount ? formatNumber(Number(amount), currency) : ''}
            onChangeText={(v) => setAmount(onlyDigits(v))}
            selectTextOnFocus
            autoFocus
          />
        </View>
      </View>

      <Button label={t('budget.editSheet.submit')} onPress={handleSave} style={styles.submitButton} />
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
  submitButton: {
    marginTop: spacing.md,
  },
});
