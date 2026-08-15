import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import {
  accountKindOptions,
  balanceLabel,
  DEFAULT_ACCOUNT_KIND,
} from '@/services/accounts/account.constants';
import { Account, AccountKind, NewAccount } from '@/services/accounts/account.types';
import { colors, radius, spacing, typography } from '@/theme';

interface AccountSheetProps {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Cuenta a editar; si falta, la hoja crea una nueva. */
  account?: Account | null;
  /** Color de la cuenta nueva (siguiente de la paleta). Ignorado al editar. */
  color: string;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Guarda la cuenta (alta o edición); lanza para mostrar un error. */
  onSave: (input: NewAccount) => Promise<void>;
  /** Elimina la cuenta que se está editando; lanza para mostrar un error. */
  onRemove?: () => Promise<void>;
}

/** Solo dígitos, para los campos numéricos. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * Hoja inferior para crear o editar una cuenta (organismo).
 *
 * Reúne el tipo (Banco/Efectivo/Crédito), el nombre, el saldo (o la deuda, para
 * crédito) y, en crédito, la fecha de corte. Es la misma hoja en ambos casos:
 * el formulario es idéntico y duplicarlo solo llevaría a que se separaran con
 * el tiempo. Al editar se precarga la cuenta y aparece la opción de eliminarla.
 */
export function AccountSheet({
  visible,
  account,
  color,
  onClose,
  onSave,
  onRemove,
}: AccountSheetProps) {
  const { t } = useTranslation();
  const isEditing = Boolean(account);

  const [kind, setKind] = useState<AccountKind>(DEFAULT_ACCOUNT_KIND);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [cutDay, setCutDay] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al abrir, precargamos la cuenta que se edita o dejamos el formulario limpio.
  useEffect(() => {
    if (!visible) return;

    setErrorMessage('');
    if (account) {
      setKind(account.kind);
      setName(account.name);
      // El saldo se guarda con signo (negativo = deuda) pero se edita en
      // positivo: el signo lo pone el tipo de cuenta al guardar.
      setBalance(account.balance === 0 ? '' : String(Math.abs(account.balance)));
      setCutDay(account.cutDay ? String(account.cutDay) : '');
    } else {
      setKind(DEFAULT_ACCOUNT_KIND);
      setName('');
      setBalance('');
      setCutDay('');
    }
  }, [visible, account]);

  const isCredit = kind === 'credit';
  const canSubmit = name.trim().length > 0;
  const swatchColor = account?.color ?? color;

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!canSubmit) {
      setErrorMessage(t('accounts.sheet.errorEmptyName'));
      return;
    }

    // El saldo se guarda como número; en crédito representa deuda (negativo).
    const amount = balance ? parseInt(balance, 10) : 0;
    const signedBalance = isCredit ? -amount : amount;
    const day = isCredit && cutDay ? Math.min(31, Math.max(1, parseInt(cutDay, 10))) : null;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onSave({
        name: name.trim(),
        kind,
        balance: signedBalance,
        color: swatchColor,
        cutDay: day,
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('accounts.sheet.errorSave');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar no se puede deshacer, así que se confirma antes. Se aclara que los
  // movimientos ya registrados se conservan: guardan el nombre de la cuenta,
  // no una referencia, y por eso el historial no se rompe.
  const handleRemove = () => {
    if (!account || !onRemove) return;

    Alert.alert(
      t('accounts.sheet.deleteConfirmTitle', { name: account.name }),
      t('accounts.sheet.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            setErrorMessage('');
            try {
              await onRemove();
              onClose();
            } catch (error) {
              const message =
                error instanceof Error && error.message
                  ? error.message
                  : t('accounts.sheet.errorDelete');
              setErrorMessage(message);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>
        {isEditing ? t('accounts.sheet.titleEdit') : t('accounts.sheet.titleNew')}
      </Text>

      {/* Tipo de cuenta */}
      <View style={styles.segment}>
        <SegmentedControl
          options={accountKindOptions(t)}
          value={kind}
          onChange={setKind}
        />
      </View>

      <View style={styles.card}>
        {/* Nombre con vista previa del color */}
        <View style={styles.row}>
          <View style={[styles.swatch, { backgroundColor: swatchColor }]} />
          <TextInput
            style={styles.input}
            placeholder={t('accounts.sheet.namePlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Saldo / deuda */}
        <View style={[styles.row, !isCredit && styles.rowLast]}>
          <Text style={styles.label}>{balanceLabel(kind, t)}</Text>
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder={t('accounts.sheet.amountPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            value={balance}
            onChangeText={(v) => setBalance(onlyDigits(v))}
          />
        </View>

        {/* Fecha de corte (solo crédito) */}
        {isCredit && (
          <View style={[styles.row, styles.rowLast]}>
            <Text style={[styles.label, styles.labelGrow]}>{t('accounts.sheet.cutDay')}</Text>
            <TextInput
              style={[styles.input, styles.cutInput]}
              placeholder={t('accounts.sheet.cutDayPlaceholder')}
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
        label={isEditing ? t('common.saveChanges') : t('accounts.sheet.saveNew')}
        onPress={handleSave}
        disabled={!canSubmit}
        loading={isSubmitting}
      />

      {isEditing && onRemove && (
        <Button
          label={t('accounts.sheet.deleteAction')}
          variant="secondary"
          destructive
          onPress={handleRemove}
          style={styles.removeButton}
        />
      )}
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
  removeButton: {
    marginTop: spacing.sm,
  },
});
