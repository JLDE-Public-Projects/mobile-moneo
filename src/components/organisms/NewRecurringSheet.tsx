import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { SelectionSheet, SelectOption } from '@/components/organisms/SelectionSheet';
import { SegmentedControl, SegmentOption } from '@/components/molecules/SegmentedControl';
import { useCategories } from '@/services/categories/category.queries';
import { CategoryType } from '@/services/categories/category.types';
import { useAccounts } from '@/services/accounts/account.queries';
import { NewRecurring } from '@/services/recurrings/recurring.types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { colors, radius, spacing, typography } from '@/theme';

interface NewRecurringSheetProps {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Crea el recurrente; lanza para mostrar un error. */
  onCreate: (input: NewRecurring) => Promise<void>;
}

/** Solo dígitos, para los campos numéricos. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * Hoja inferior para crear un pago recurrente (organismo).
 *
 * Captura nombre, monto, día del mes y categoría (egreso). La cuenta se toma por
 * defecto de la primera cuenta. Delega la creación en `onCreate`.
 */
export function NewRecurringSheet({ visible, onClose, onCreate }: NewRecurringSheetProps) {
  const { t } = useTranslation();
  const RECURRING_TYPE_OPTIONS: SegmentOption<CategoryType>[] = [
    { value: 'expense', label: t('common.expense') },
    { value: 'income', label: t('common.income') },
  ];
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [type, setType] = useState<CategoryType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setType('expense');
      setName('');
      setAmount('');
      setDay('');
      setCategoryName('');
      setAccountName('');
      setErrorMessage('');
    }
  }, [visible]);

  // Las categorías se acotan al tipo elegido: un salario no encaja en "Mercado".
  const typeCategories = categories.filter((c) => c.type === type);
  const selectedCategory =
    typeCategories.find((c) => c.name === categoryName) ?? typeCategories[0];
  const selectedAccount =
    accounts.find((a) => a.name === accountName) ?? accounts[0];

  const handleChangeType = (next: CategoryType) => {
    setType(next);
    // La categoría vuelve a la primera del nuevo tipo.
    setCategoryName('');
  };

  const canSave = name.trim().length > 0 && Number(amount) > 0 && Number(day) > 0;

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!canSave || !selectedCategory || !selectedAccount) {
      setErrorMessage(t('recurrings.newSheet.errorIncomplete'));
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreate({
        name: name.trim(),
        // El importe se guarda con signo, igual que en los movimientos.
        amount: type === 'expense' ? -Number(amount) : Number(amount),
        day: Math.min(31, Math.max(1, Number(day))),
        category: selectedCategory.name,
        categoryColor: selectedCategory.color,
        account: selectedAccount.name,
        accountId: selectedAccount.id,
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('recurrings.newSheet.errorGeneric');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: SelectOption<string>[] = typeCategories.map((c) => ({
    value: c.name,
    label: c.name,
    color: c.color,
  }));
  const accountOptions: SelectOption<string>[] = accounts.map((a) => ({
    value: a.name,
    label: a.name,
    color: a.color,
  }));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{t('recurrings.newSheet.title')}</Text>

      {/* Egreso o ingreso: un salario también se repite cada mes. */}
      <View style={styles.segment}>
        <SegmentedControl
          options={RECURRING_TYPE_OPTIONS}
          value={type}
          onChange={handleChangeType}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View
            style={[
              styles.swatch,
              { backgroundColor: selectedCategory?.color ?? colors.disabledFill },
            ]}
          />
          <TextInput
            style={styles.input}
            placeholder={t('recurrings.newSheet.namePlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('recurrings.newSheet.amount')}</Text>
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder={t('accounts.sheet.amountPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            // Se muestra agrupado por miles (como en el resto de la app) para
            // que un valor grande se pueda leer mientras se escribe; el
            // estado sigue siendo solo dígitos.
            value={amount ? formatNumber(Number(amount), currency) : ''}
            onChangeText={(v) => setAmount(onlyDigits(v))}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('recurrings.newSheet.everyDayLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('recurrings.newSheet.dayPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            value={day}
            onChangeText={(v) => setDay(onlyDigits(v).slice(0, 2))}
          />
        </View>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.label}>{t('common.category')}</Text>
          <Text style={styles.value}>{selectedCategory?.name ?? t('common.placeholderDash')}</Text>
          <ChevronIcon />
        </Pressable>

        <Pressable
          onPress={() => setAccountPickerOpen(true)}
          style={({ pressed }) => [styles.row, styles.rowLast, pressed && styles.pressed]}
        >
          <Text style={styles.label}>{t('common.account')}</Text>
          <Text style={styles.value}>{selectedAccount?.name ?? t('common.placeholderDash')}</Text>
          <ChevronIcon />
        </Pressable>
      </View>

      <FormMessage message={errorMessage} />

      <Button
        label={t('recurrings.newSheet.submit')}
        onPress={handleSave}
        disabled={!canSave}
        loading={isSubmitting}
      />

      <SelectionSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={t('common.category')}
        options={categoryOptions}
        selected={selectedCategory?.name ?? ''}
        onSelect={setCategoryName}
      />

      <SelectionSheet
        visible={accountPickerOpen}
        onClose={() => setAccountPickerOpen(false)}
        title={t('common.account')}
        options={accountOptions}
        selected={selectedAccount?.name ?? ''}
        onSelect={setAccountName}
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
    paddingBottom: spacing.md,
  },
  segment: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  pressed: {
    backgroundColor: colors.disabledFill,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    marginRight: 12,
  },
  label: {
    width: 84,
    ...typography.body,
    color: colors.textPrimary,
  },
  value: {
    flex: 1,
    ...typography.body,
    color: colors.textSecondary,
    marginRight: 8,
  },
  currencySign: {
    ...typography.body,
    color: colors.textTertiary,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  amountInput: {
    marginLeft: 4,
    fontVariant: ['tabular-nums'],
  },
});
