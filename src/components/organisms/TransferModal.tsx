import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { SwapVerticalIcon } from '@/components/icons/SwapVerticalIcon';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { FormMessage } from '@/components/atoms/FormMessage';
import { NumericKeypad } from '@/components/molecules/NumericKeypad';
import { SelectionSheet, SelectOption } from '@/components/organisms/SelectionSheet';
import { useAccounts } from '@/services/accounts/account.queries';
import { accountSubtitle } from '@/services/accounts/account.constants';
import { useCreateTransfer } from '@/services/transactions/transaction.queries';
import { useSettingsStore } from '@/store/settingsStore';
import { formatMoney, formatNumber, getCurrency } from '@/config/currencies';
import { colors, radius, spacing, typography } from '@/theme';

interface TransferModalProps {
  /** Si la pantalla está visible. */
  visible: boolean;
  /** Cierra la pantalla. */
  onClose: () => void;
  /** Lleva a la pantalla de cuentas (para crear la segunda). */
  onOpenAccounts: () => void;
}

/**
 * Pantalla de "Transferir" (organismo).
 *
 * Es un flujo aparte del de "Nuevo movimiento": una transferencia no es un
 * ingreso ni un egreso —el dinero no sale del usuario, solo cambia de
 * cuenta—, así que aquí no hay tipo ni categoría que elegir, solo origen,
 * destino e importe.
 *
 * Comparte el esqueleto del modal de movimientos (cabecera Cancelar/Guardar,
 * tarjeta de monto y teclado numérico propio) para que se sienta la misma
 * app; lo que cambia es el centro: una tarjeta con las dos cuentas y una
 * flecha entre ellas que hace evidente hacia dónde va el dinero.
 */
export function TransferModal({ visible, onClose, onOpenAccounts }: TransferModalProps) {
  const { t } = useTranslation();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const createTransfer = useCreateTransfer();
  const currency = getCurrency(useSettingsStore((state) => state.currency));

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Al abrir se parte de las dos primeras cuentas: lo más probable es que se
  // transfiera entre las de uso diario, y así el formulario ya viene armado.
  useEffect(() => {
    if (!visible) return;
    setErrorMessage('');
    setAmount('');
    setFromAccountId(accounts[0]?.id ?? '');
    setToAccountId(accounts[1]?.id ?? '');
    // Solo al abrir: cambiar de cuenta después no debe reiniciar lo escrito,
    // por eso `accounts` no entra en las dependencias.
  }, [visible]);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const numericAmount = amount ? Number(amount) : 0;
  // Con una sola cuenta no hay entre qué transferir.
  const needsTwoAccounts = !accountsLoading && accounts.length < 2;
  const sameAccount = fromAccountId !== '' && fromAccountId === toAccountId;

  const canSave =
    numericAmount > 0 &&
    Boolean(fromAccount) &&
    Boolean(toAccount) &&
    !sameAccount &&
    !createTransfer.isPending;

  /** Invierte origen y destino de un toque. */
  const swapAccounts = () => {
    setFromAccountId(toAccountId);
    setToAccountId(fromAccountId);
  };

  const appendAmount = (digits: string) =>
    setAmount((prev) => (prev + digits).replace(/^0+/, '').slice(0, 10));
  const deleteAmount = () => setAmount((prev) => prev.slice(0, -1));

  const accountOptions: SelectOption<string>[] = accounts.map((a) => ({
    value: a.id,
    label: a.name,
    sub: accountSubtitle(a, t),
    color: a.color,
  }));

  const handleSave = async () => {
    if (!canSave) return;

    setErrorMessage('');
    try {
      await createTransfer.mutateAsync({
        fromAccountId,
        toAccountId,
        amount: numericAmount,
        date: Date.now(),
      });
      onClose();
    } catch (error) {
      // El guardado viaja por red y puede fallar: la pantalla se queda abierta
      // con lo escrito para poder reintentar sin volver a teclearlo.
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('movements.transferModal.errorSave');
      setErrorMessage(message);
    }
  };

  /** Fila de cuenta (origen o destino) dentro de la tarjeta central. */
  const renderAccountRow = (
    label: string,
    account: typeof accounts[number] | undefined,
    onPress: () => void,
  ) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.accountRow, pressed && styles.accountRowPressed]}
    >
      <View
        style={[
          styles.accountSwatch,
          { backgroundColor: account?.color ?? colors.disabledFill },
        ]}
      />
      <View style={styles.accountInfo}>
        <Text style={styles.accountLabel}>{label}</Text>
        <Text style={styles.accountName} numberOfLines={1}>
          {account?.name ?? t('movements.transferModal.chooseAccount')}
        </Text>
      </View>
      {account && (
        <Text style={styles.accountBalance}>
          {formatMoney(account.balance, currency)}
        </Text>
      )}
      <ChevronIcon />
    </Pressable>
  );

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
            <Text style={styles.headerTitle}>{t('movements.transferModal.title')}</Text>
            <Pressable onPress={handleSave} hitSlop={8} disabled={!canSave}>
              <Text style={[styles.save, !canSave && styles.saveDisabled]}>
                {createTransfer.isPending
                  ? t('movements.transferModal.saving')
                  : t('movements.transferModal.save')}
              </Text>
            </Pressable>
          </View>

          {/* Monto */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>{t('movements.modal.amount')}</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountSymbol}>{currency.symbol}</Text>
              <Text style={[styles.amountValue, !amount && styles.amountPlaceholder]}>
                {amount ? formatNumber(numericAmount, currency) : '0'}
              </Text>
              <View style={styles.cursor} />
            </View>
          </View>

          {/* Origen → destino */}
          <View style={styles.accountsCard}>
            {renderAccountRow(
              t('movements.transferModal.from'),
              fromAccount,
              () => setFromPickerOpen(true),
            )}

            {/*
              La insignia se superpone a la línea divisoria: marca la
              dirección del dinero y, al tocarla, invierte origen y destino
              —el caso típico de "me equivoqué de lado" o de devolver lo que
              se acaba de mover, sin reabrir los dos selectores.
            */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('movements.transferModal.swap')}
                onPress={swapAccounts}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.arrowBadge,
                  pressed && styles.arrowBadgePressed,
                ]}
              >
                <SwapVerticalIcon size={17} color={colors.white} />
              </Pressable>
            </View>

            {renderAccountRow(
              t('movements.transferModal.to'),
              toAccount,
              () => setToPickerOpen(true),
            )}
          </View>

          {needsTwoAccounts && (
            <Pressable onPress={onOpenAccounts} style={styles.notice}>
              <Text style={styles.noticeText}>
                {t('movements.transferModal.needsTwoAccounts')}
              </Text>
              <Text style={styles.noticeAction}>
                {t('movements.transferModal.createAccount')}
              </Text>
            </Pressable>
          )}

          {sameAccount && (
            <Text style={styles.hint}>{t('movements.transferModal.sameAccountHint')}</Text>
          )}

          <FormMessage message={errorMessage} />

          <View style={styles.spacer} />

          {/* Teclado numérico */}
          <View style={styles.keypad}>
            <NumericKeypad onInput={appendAmount} onDelete={deleteAmount} />
          </View>
        </View>
      </Screen>

      {/* Pickers de cuenta */}
      <SelectionSheet
        visible={fromPickerOpen}
        onClose={() => setFromPickerOpen(false)}
        title={t('movements.transferModal.from')}
        options={accountOptions}
        selected={fromAccountId}
        onSelect={setFromAccountId}
      />
      <SelectionSheet
        visible={toPickerOpen}
        onClose={() => setToPickerOpen(false)}
        title={t('movements.transferModal.to')}
        options={accountOptions}
        selected={toAccountId}
        onSelect={setToAccountId}
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
  accountsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginTop: spacing.xl,
    // Sin recorte: la insignia de la flecha sobresale del borde izquierdo.
    paddingVertical: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
  },
  accountRowPressed: {
    backgroundColor: colors.disabledFill,
  },
  accountSwatch: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
    minWidth: 0,
  },
  accountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  accountName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 1,
  },
  accountBalance: {
    ...typography.caption,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
    marginRight: 8,
  },
  divider: {
    justifyContent: 'center',
    // La flecha vive sobre la línea; este alto es el que ocupa la insignia.
    height: 30,
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: spacing.lg + 46,
  },
  arrowBadge: {
    position: 'absolute',
    left: spacing.lg + 5,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBadgePressed: {
    backgroundColor: colors.accentDark,
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
  hint: {
    ...typography.caption,
    color: colors.negative,
    textAlign: 'center',
    paddingTop: spacing.md,
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
