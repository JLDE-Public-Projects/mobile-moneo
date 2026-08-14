import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { SelectionSheet, SelectOption } from '@/components/organisms/SelectionSheet';
import { useCategories } from '@/services/categories/category.queries';
import { useAccounts } from '@/services/accounts/account.queries';
import { NewRecurring } from '@/services/recurrings/recurring.types';
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
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName('');
      setAmount('');
      setDay('');
      setCategoryName('');
      setErrorMessage('');
    }
  }, [visible]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const selectedCategory =
    expenseCategories.find((c) => c.name === categoryName) ?? expenseCategories[0];
  const defaultAccount = accounts[0];

  const canSave = name.trim().length > 0 && Number(amount) > 0 && Number(day) > 0;

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!canSave || !selectedCategory || !defaultAccount) {
      setErrorMessage('Completa nombre, monto y día.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreate({
        name: name.trim(),
        amount: Number(amount),
        day: Math.min(31, Math.max(1, Number(day))),
        category: selectedCategory.name,
        categoryColor: selectedCategory.color,
        account: defaultAccount.name,
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No pudimos crear el recurrente.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: SelectOption<string>[] = expenseCategories.map((c) => ({
    value: c.name,
    label: c.name,
    color: c.color,
  }));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Nueva recurrente</Text>

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
            placeholder="Nombre (Netflix, Internet, Andrés…)"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Monto</Text>
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            value={amount}
            onChangeText={(v) => setAmount(onlyDigits(v))}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cada día</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            value={day}
            onChangeText={(v) => setDay(onlyDigits(v).slice(0, 2))}
          />
        </View>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.row, styles.rowLast, pressed && styles.pressed]}
        >
          <Text style={styles.label}>Categoría</Text>
          <Text style={styles.value}>{selectedCategory?.name ?? '—'}</Text>
          <ChevronIcon />
        </Pressable>
      </View>

      <FormMessage message={errorMessage} />

      <Button
        label="Guardar recurrente"
        onPress={handleSave}
        disabled={!canSave}
        loading={isSubmitting}
      />

      <SelectionSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Categoría"
        options={categoryOptions}
        selected={selectedCategory?.name ?? ''}
        onSelect={setCategoryName}
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
