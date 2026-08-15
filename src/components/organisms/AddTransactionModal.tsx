import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { FormMessage } from '@/components/atoms/FormMessage';
import { NumericKeypad } from '@/components/molecules/NumericKeypad';
import { SegmentedControl, SegmentOption } from '@/components/molecules/SegmentedControl';
import { SelectionSheet, SelectOption } from '@/components/organisms/SelectionSheet';
import { useCategories } from '@/services/categories/category.queries';
import { useAccounts } from '@/services/accounts/account.queries';
import { accountSubtitle } from '@/services/accounts/account.constants';
import {
  useAddTransaction,
  useRemoveTransaction,
  useUpdateTransaction,
} from '@/services/transactions/transaction.queries';
import { Transaction } from '@/services/transactions/transaction.types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatNumber, getCurrency } from '@/config/currencies';
import { formatDayMonth, monthRange } from '@/utils/date';
import { useMonthNames } from '@/hooks/useMonthNames';
import { colors, radius, spacing, typography } from '@/theme';

interface AddTransactionModalProps {
  /** Si el modal está visible. */
  visible: boolean;
  /** Movimiento a editar; si falta, el modal registra uno nuevo. */
  transaction?: Transaction | null;
  /** Cierra el modal. */
  onClose: () => void;
  /** Lleva a la pantalla de cuentas (para crear la primera). */
  onOpenAccounts: () => void;
}

/** Tipo de movimiento en el formulario. */
type MovementType = 'expense' | 'income';

/**
 * Modal de "Nuevo movimiento" (organismo).
 *
 * Captura el monto con un teclado numérico propio y permite elegir tipo,
 * categoría (según el tipo), cuenta y nota. Al guardar, crea el movimiento vía
 * TanStack Query; el resumen, los movimientos y los gastos se refrescan solos.
 * Los pickers de categoría y cuenta reutilizan {@link SelectionSheet}.
 */
export function AddTransactionModal({
  visible,
  transaction,
  onClose,
  onOpenAccounts,
}: AddTransactionModalProps) {
  const { t } = useTranslation();
  const months = useMonthNames();
  const TYPE_OPTIONS: SegmentOption<MovementType>[] = [
    { value: 'expense', label: t('common.expense') },
    { value: 'income', label: t('common.income') },
  ];
  const isEditing = Boolean(transaction);
  const { data: categories = [] } = useCategories();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const removeTransaction = useRemoveTransaction();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [type, setType] = useState<MovementType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [accPickerOpen, setAccPickerOpen] = useState(false);
  const [date, setDate] = useState(Date.now());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Moneo trabaja mes a mes: el movimiento solo puede fecharse dentro del mes
  // en curso, el mismo periodo que ya filtra el resto de la app.
  const currentMonth = useMemo(() => monthRange(), []);
  const minDate = new Date(currentMonth.from);
  const maxDate = new Date(currentMonth.to - 1);

  // Al abrir, precargamos el movimiento que se edita o dejamos el formulario
  // limpio. El importe se edita sin signo: lo pone el tipo al guardar.
  useEffect(() => {
    if (!visible) return;

    setErrorMessage('');
    if (transaction) {
      setType(transaction.amount < 0 ? 'expense' : 'income');
      setAmount(String(Math.abs(transaction.amount)));
      setNote(transaction.note);
      setCategoryName(transaction.category);
      setAccountName(transaction.account);
      setDate(transaction.date);
    } else {
      setType('expense');
      setAmount('');
      setNote('');
      setCategoryName('');
      setAccountName('');
      setDate(Date.now());
    }
  }, [visible, transaction]);

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
  // Sin cuentas no hay dónde registrar el movimiento. Es el caso de una cuenta
  // recién creada, así que en vez de dejar "Guardar" apagado sin motivo, se
  // explica y se ofrece el camino para crear la primera.
  const needsAccount = !accountsLoading && accounts.length === 0;
  const isSaving =
    addTransaction.isPending ||
    updateTransaction.isPending ||
    removeTransaction.isPending;
  const canSave =
    numericAmount > 0 &&
    Boolean(selectedCategory) &&
    Boolean(selectedAccount) &&
    !isSaving;

  const appendAmount = (digits: string) =>
    setAmount((prev) => (prev + digits).replace(/^0+/, '').slice(0, 10));
  const deleteAmount = () => setAmount((prev) => prev.slice(0, -1));

  // En Android el propio picker es un diálogo nativo que se cierra solo tras
  // elegir o cancelar; en iOS es un calendario embebido en la hoja inferior,
  // que el usuario cierra con "Listo".
  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerOpen(false);
    }
    if (event.type === 'dismissed' || !selected) return;
    setDate(selected.getTime());
  };

  const handleChangeType = (next: MovementType) => {
    setType(next);
    // La categoría vuelve a la primera del nuevo tipo.
    setCategoryName('');
  };

  const handleSave = async () => {
    if (!canSave || !selectedCategory || !selectedAccount) return;

    const signed = numericAmount * (type === 'expense' ? -1 : 1);
    const input = {
      amount: signed,
      category: selectedCategory.name,
      categoryColor: selectedCategory.color,
      note: note.trim() || selectedCategory.name,
      account: selectedAccount.name,
      accountId: selectedAccount.id,
      date,
      // Al editar se conserva el enlace al recurrente que lo originó: se está
      // corrigiendo el movimiento, no registrando otro.
      recurringId: transaction?.recurringId ?? null,
    };

    setErrorMessage('');
    try {
      if (transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, input });
      } else {
        await addTransaction.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      // El guardado viaja por red y puede fallar: el modal se queda abierto con
      // los datos escritos para poder reintentar sin volver a teclearlos.
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('movements.modal.errorSave');
      setErrorMessage(message);
    }
  };

  // Eliminar no se puede deshacer, así que se confirma. El saldo de la cuenta
  // vuelve a su valor anterior solo: lo revierte el servidor.
  const handleRemove = () => {
    if (!transaction) return;

    Alert.alert(
      t('movements.modal.deleteConfirmTitle'),
      t('movements.modal.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setErrorMessage('');
            try {
              await removeTransaction.mutateAsync(transaction.id);
              onClose();
            } catch (error) {
              const message =
                error instanceof Error && error.message
                  ? error.message
                  : t('movements.modal.errorDelete');
              setErrorMessage(message);
            }
          },
        },
      ],
    );
  };

  const categoryOptions: SelectOption<string>[] = typeCategories.map((c) => ({
    value: c.name,
    label: c.name,
    color: c.color,
  }));
  const accountOptions: SelectOption<string>[] = accounts.map((a) => ({
    value: a.name,
    label: a.name,
    sub: accountSubtitle(a, t),
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
              <Text style={styles.cancel}>{t('common.cancel')}</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {isEditing ? t('movements.modal.titleEdit') : t('movements.modal.titleNew')}
            </Text>
            <Pressable onPress={handleSave} hitSlop={8} disabled={!canSave}>
              <Text style={[styles.save, !canSave && styles.saveDisabled]}>
                {isSaving ? t('movements.modal.saving') : t('common.save')}
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
          <Pressable style={styles.amountCard} onPress={Keyboard.dismiss}>
            <Text style={styles.amountLabel}>{t('movements.modal.amount')}</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountSymbol}>{currency.symbol}</Text>
              <Text
                style={[styles.amountValue, !amount && styles.amountPlaceholder]}
              >
                {amount ? formatNumber(numericAmount, currency) : '0'}
              </Text>
              <View style={styles.cursor} />
            </View>
          </Pressable>

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
              <Text style={styles.fieldLabel}>{t('common.category')}</Text>
              <Text style={styles.fieldValue}>{selectedCategory?.name ?? t('common.placeholderDash')}</Text>
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
              <Text style={styles.fieldLabel}>{t('common.account')}</Text>
              <Text style={styles.fieldValue}>{selectedAccount?.name ?? t('common.placeholderDash')}</Text>
              <ChevronIcon />
            </Pressable>

            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setDatePickerOpen(true);
              }}
              style={({ pressed }) => [
                styles.field,
                styles.fieldBorder,
                pressed && styles.fieldPressed,
              ]}
            >
              <Text style={styles.fieldLabel}>{t('movements.modal.date')}</Text>
              <Text style={styles.fieldValue}>{formatDayMonth(date, months)}</Text>
              <ChevronIcon />
            </Pressable>

            <View style={styles.field}>
              <TextInput
                style={styles.noteInput}
                placeholder={t('movements.modal.notePlaceholder')}
                placeholderTextColor={colors.textTertiary}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          {needsAccount && (
            <Pressable onPress={onOpenAccounts} style={styles.notice}>
              <Text style={styles.noticeText}>
                {t('movements.modal.needsAccountNotice')}
              </Text>
              <Text style={styles.noticeAction}>{t('movements.modal.createAccount')}</Text>
            </Pressable>
          )}

          {isEditing && (
            <Pressable
              onPress={handleRemove}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.removeRow,
                pressed && styles.fieldPressed,
              ]}
            >
              <Text style={styles.removeText}>{t('movements.modal.deleteAction')}</Text>
            </Pressable>
          )}

          <FormMessage message={errorMessage} />

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
        title={t('common.category')}
        options={categoryOptions}
        selected={selectedCategory?.name ?? ''}
        onSelect={setCategoryName}
      />
      <SelectionSheet
        visible={accPickerOpen}
        onClose={() => setAccPickerOpen(false)}
        title={t('common.account')}
        options={accountOptions}
        selected={selectedAccount?.name ?? ''}
        onSelect={setAccountName}
      />

      {/* En Android el picker es un diálogo nativo: no necesita hoja propia. */}
      {Platform.OS === 'android' && datePickerOpen && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display="default"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <BottomSheet visible={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
          <Text style={styles.dateSheetTitle}>{t('movements.modal.date')}</Text>
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display="inline"
            minimumDate={minDate}
            maximumDate={maxDate}
            onChange={handleDateChange}
          />
          <Pressable onPress={() => setDatePickerOpen(false)} style={styles.dateDoneButton}>
            <Text style={styles.dateDoneText}>{t('common.done')}</Text>
          </Pressable>
        </BottomSheet>
      )}
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
  removeRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginTop: spacing.lg,
    paddingVertical: 14,
  },
  removeText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.negative,
  },
  notice: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: 6,
  },
  noticeText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  noticeAction: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accent,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
  keypad: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  dateSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.md,
  },
  dateDoneButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    marginTop: spacing.lg,
    paddingVertical: 14,
  },
  dateDoneText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});
