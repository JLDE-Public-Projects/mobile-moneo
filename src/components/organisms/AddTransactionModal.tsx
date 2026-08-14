import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { NumericKeypad } from '@/components/molecules/NumericKeypad';
import { SegmentedControl, SegmentOption } from '@/components/molecules/SegmentedControl';
import { SelectionSheet, SelectOption } from '@/components/organisms/SelectionSheet';
import { useCategories } from '@/services/categories/category.queries';
import { useAccounts } from '@/services/accounts/account.queries';
import { accountSubtitle } from '@/services/accounts/account.constants';
import { useAddTransaction } from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { formatDayMonth } from '@/utils/date';
import { colors, radius, spacing, typography } from '@/theme';

interface AddTransactionModalProps {
  /** Si el modal está visible. */
  visible: boolean;
  /** Cierra el modal. */
  onClose: () => void;
}

/** Tipo de movimiento en el formulario. */
type MovementType = 'expense' | 'income';

/** Opciones del control segmentado de tipo. */
const TYPE_OPTIONS: SegmentOption<MovementType>[] = [
  { value: 'expense', label: 'Egreso' },
  { value: 'income', label: 'Ingreso' },
];

/**
 * Modal de "Nuevo movimiento" (organismo).
 *
 * Captura el monto con un teclado numérico propio y permite elegir tipo,
 * categoría (según el tipo), cuenta y nota. Al guardar, crea el movimiento vía
 * TanStack Query; el resumen, los movimientos y los gastos se refrescan solos.
 * Los pickers de categoría y cuenta reutilizan {@link SelectionSheet}.
 */
export function AddTransactionModal({ visible, onClose }: AddTransactionModalProps) {
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const addTransaction = useAddTransaction();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [type, setType] = useState<MovementType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [accPickerOpen, setAccPickerOpen] = useState(false);

  // Al abrir, reiniciamos el formulario (las selecciones vuelven a su defecto).
  useEffect(() => {
    if (visible) {
      setType('expense');
      setAmount('');
      setNote('');
      setCategoryName('');
      setAccountName('');
    }
  }, [visible]);

  // Categorías del tipo actual y selección efectiva (la elegida o la primera).
  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );
  const selectedCategory =
    typeCategories.find((c) => c.name === categoryName) ?? typeCategories[0];
  const selectedAccount =
    accounts.find((a) => a.name === accountName) ?? accounts[0];

  const numericAmount = amount ? Number(amount) : 0;
  const canSave =
    numericAmount > 0 && Boolean(selectedCategory) && Boolean(selectedAccount);

  const appendAmount = (digits: string) =>
    setAmount((prev) => (prev + digits).replace(/^0+/, '').slice(0, 10));
  const deleteAmount = () => setAmount((prev) => prev.slice(0, -1));

  const handleChangeType = (next: MovementType) => {
    setType(next);
    // La categoría vuelve a la primera del nuevo tipo.
    setCategoryName('');
  };

  const handleSave = async () => {
    if (!canSave || !selectedCategory || !selectedAccount) return;
    const signed = numericAmount * (type === 'expense' ? -1 : 1);
    await addTransaction.mutateAsync({
      amount: signed,
      category: selectedCategory.name,
      categoryColor: selectedCategory.color,
      note: note.trim() || selectedCategory.name,
      account: selectedAccount.name,
      date: Date.now(),
    });
    onClose();
  };

  const categoryOptions: SelectOption<string>[] = typeCategories.map((c) => ({
    value: c.name,
    label: c.name,
    color: c.color,
  }));
  const accountOptions: SelectOption<string>[] = accounts.map((a) => ({
    value: a.name,
    label: a.name,
    sub: accountSubtitle(a),
    color: a.color,
  }));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen>
        <StatusBar style="dark" />
        <View style={styles.container}>
          {/* Cabecera */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={styles.cancel}>Cancelar</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Nuevo</Text>
            <Pressable onPress={handleSave} hitSlop={8} disabled={!canSave}>
              <Text style={[styles.save, !canSave && styles.saveDisabled]}>
                Guardar
              </Text>
            </Pressable>
          </View>

          {/* Tipo */}
          <View style={styles.section}>
            <SegmentedControl
              options={TYPE_OPTIONS}
              value={type}
              onChange={handleChangeType}
            />
          </View>

          {/* Monto */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Monto</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountSymbol}>{currency.symbol}</Text>
              <Text
                style={[styles.amountValue, !amount && styles.amountPlaceholder]}
              >
                {amount ? formatNumber(numericAmount, currency) : '0'}
              </Text>
              <View style={styles.cursor} />
            </View>
          </View>

          {/* Categoría / cuenta / fecha / nota */}
          <View style={styles.fieldsCard}>
            <Pressable
              onPress={() => setCatPickerOpen(true)}
              style={({ pressed }) => [
                styles.field,
                styles.fieldBorder,
                pressed && styles.fieldPressed,
              ]}
            >
              <View
                style={[
                  styles.fieldSwatch,
                  { backgroundColor: selectedCategory?.color ?? colors.disabledFill },
                ]}
              />
              <Text style={styles.fieldLabel}>Categoría</Text>
              <Text style={styles.fieldValue}>{selectedCategory?.name ?? '—'}</Text>
              <ChevronIcon />
            </Pressable>

            <Pressable
              onPress={() => setAccPickerOpen(true)}
              style={({ pressed }) => [
                styles.field,
                styles.fieldBorder,
                pressed && styles.fieldPressed,
              ]}
            >
              <Text style={styles.fieldLabel}>Cuenta</Text>
              <Text style={styles.fieldValue}>{selectedAccount?.name ?? '—'}</Text>
              <ChevronIcon />
            </Pressable>

            <View style={[styles.field, styles.fieldBorder]}>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <Text style={styles.fieldValue}>Hoy, {formatDayMonth(Date.now())}</Text>
            </View>

            <View style={styles.field}>
              <TextInput
                style={styles.noteInput}
                placeholder="Nota (opcional)"
                placeholderTextColor={colors.textTertiary}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <View style={styles.spacer} />

          {/* Teclado numérico */}
          <View style={styles.keypad}>
            <NumericKeypad onInput={appendAmount} onDelete={deleteAmount} />
          </View>
        </View>
      </Screen>

      {/* Pickers */}
      <SelectionSheet
        visible={catPickerOpen}
        onClose={() => setCatPickerOpen(false)}
        title="Categoría"
        options={categoryOptions}
        selected={selectedCategory?.name ?? ''}
        onSelect={setCategoryName}
      />
      <SelectionSheet
        visible={accPickerOpen}
        onClose={() => setAccPickerOpen(false)}
        title="Cuenta"
        options={accountOptions}
        selected={selectedAccount?.name ?? ''}
        onSelect={setAccountName}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingBottom: 14,
  },
  cancel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  save: {
    ...typography.bodyStrong,
    color: colors.accent,
  },
  saveDisabled: {
    color: colors.textTertiary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingVertical: 26,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  amountSymbol: {
    fontSize: 26,
    color: colors.textTertiary,
  },
  amountValue: {
    fontSize: 52,
    fontWeight: '600',
    letterSpacing: -2,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amountPlaceholder: {
    color: 'rgba(60,60,67,0.25)',
  },
  cursor: {
    width: 2,
    height: 46,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  fieldsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  fieldPressed: {
    backgroundColor: colors.disabledFill,
  },
  fieldSwatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    marginRight: 12,
  },
  fieldLabel: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  fieldValue: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: 8,
  },
  noteInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
  keypad: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
