import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import {
  ACCOUNT_KIND_OPTIONS,
  balanceLabel,
  DEFAULT_ACCOUNT_KIND,
} from '@/services/accounts/account.constants';
import { AccountKind, NewAccount } from '@/services/accounts/account.types';
import { colors, radius, spacing, typography } from '@/theme';

interface NewAccountSheetProps {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Color asignado a la cuenta nueva (siguiente de la paleta). */
  color: string;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Crea la cuenta; lanza para mostrar un error. */
  onCreate: (input: NewAccount) => Promise<void>;
}

/** Solo dígitos, para los campos numéricos. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * Hoja inferior para crear una cuenta (organismo).
 *
 * Reúne el tipo (Banco/Efectivo/Crédito), el nombre, el saldo (o la deuda, para
 * crédito) y, en crédito, la fecha de corte. Mantiene su estado local y delega
 * la creación en `onCreate`; al tener éxito se cierra.
 */
export function NewAccountSheet({
  visible,
  color,
  onClose,
  onCreate,
}: NewAccountSheetProps) {
  const [kind, setKind] = useState<AccountKind>(DEFAULT_ACCOUNT_KIND);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [cutDay, setCutDay] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al abrir, reiniciamos el formulario.
  useEffect(() => {
    if (visible) {
      setKind(DEFAULT_ACCOUNT_KIND);
      setName('');
      setBalance('');
      setCutDay('');
      setErrorMessage('');
    }
  }, [visible]);

  const isCredit = kind === 'credit';
  const canSubmit = name.trim().length > 0;

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!canSubmit) {
      setErrorMessage('Escribe un nombre para la cuenta.');
      return;
    }

    // El saldo se guarda como número; en crédito representa deuda (negativo).
    const amount = balance ? parseInt(balance, 10) : 0;
    const signedBalance = isCredit ? -amount : amount;
    const day = isCredit && cutDay ? Math.min(31, Math.max(1, parseInt(cutDay, 10))) : null;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreate({
        name: name.trim(),
        kind,
        balance: signedBalance,
        color,
        cutDay: day,
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No pudimos crear la cuenta. Inténtalo de nuevo.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Agregar cuenta</Text>

      {/* Tipo de cuenta */}
      <View style={styles.segment}>
        <SegmentedControl
          options={ACCOUNT_KIND_OPTIONS}
          value={kind}
          onChange={setKind}
        />
      </View>

      <View style={styles.card}>
        {/* Nombre con vista previa del color */}
        <View style={styles.row}>
          <View style={[styles.swatch, { backgroundColor: color }]} />
          <TextInput
            style={styles.input}
            placeholder="Nombre de la cuenta"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Saldo / deuda */}
        <View style={[styles.row, !isCredit && styles.rowLast]}>
          <Text style={styles.label}>{balanceLabel(kind)}</Text>
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            value={balance}
            onChangeText={(v) => setBalance(onlyDigits(v))}
          />
        </View>

        {/* Fecha de corte (solo crédito) */}
        {isCredit && (
          <View style={[styles.row, styles.rowLast]}>
            <Text style={[styles.label, styles.labelGrow]}>Fecha de corte</Text>
            <TextInput
              style={[styles.input, styles.cutInput]}
              placeholder="Día (1-31)"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              value={cutDay}
              onChangeText={(v) => setCutDay(onlyDigits(v).slice(0, 2))}
            />
          </View>
        )}
      </View>

      <FormMessage message={errorMessage} />

      <Button
        label="Guardar cuenta"
        onPress={handleSave}
        disabled={!canSubmit}
        loading={isSubmitting}
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
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    marginRight: 12,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  labelGrow: {
    flex: 1,
  },
  currencySign: {
    ...typography.body,
    color: colors.textTertiary,
    marginLeft: 12,
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
  cutInput: {
    flex: 0,
    width: 120,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
