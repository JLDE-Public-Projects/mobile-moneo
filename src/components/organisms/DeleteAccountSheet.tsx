import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { useDeleteAccount } from '@/services/auth/auth.queries';
import { colors, radius, spacing, typography } from '@/theme';

interface DeleteAccountSheetProps {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Cierra la hoja sin borrar nada. */
  onClose: () => void;
}

/**
 * Confirmación para eliminar la cuenta (organismo).
 *
 * Borrar la cuenta no se puede deshacer y se lleva por delante todo el
 * historial, así que no basta un "¿seguro?": se pide la clave. Tener la sesión
 * abierta —un teléfono desbloqueado, prestado un momento— no debería alcanzar
 * para destruir los datos de alguien.
 *
 * El botón solo se habilita al escribir algo, y la clave se verifica contra el
 * servidor (reautenticando) antes de borrar nada.
 */
export function DeleteAccountSheet({ visible, onClose }: DeleteAccountSheetProps) {
  const { t } = useTranslation();
  const deleteAccount = useDeleteAccount();

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Al abrir se parte siempre en limpio: la clave no debe quedar escrita de un
  // intento anterior.
  useEffect(() => {
    if (!visible) return;
    setPassword('');
    setErrorMessage('');
  }, [visible]);

  const canSubmit = password.length > 0 && !deleteAccount.isPending;

  const handleDelete = async () => {
    if (!canSubmit) return;

    setErrorMessage('');
    try {
      await deleteAccount.mutateAsync(password);
      // No hace falta cerrar la hoja: al borrarse la sesión, la app entera
      // vuelve al flujo de autenticación y esta pantalla se desmonta.
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('settings.deleteAccount.errorGeneric');
      setErrorMessage(message);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{t('settings.deleteAccount.title')}</Text>
      <Text style={styles.warning}>{t('settings.deleteAccount.warning')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('settings.deleteAccount.passwordLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('settings.deleteAccount.passwordPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
          autoFocus
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <FormMessage message={errorMessage} />

      <Button
        label={t('settings.deleteAccount.confirm')}
        variant="secondary"
        destructive
        onPress={handleDelete}
        disabled={!canSubmit}
        loading={deleteAccount.isPending}
        style={styles.confirmButton}
      />
      <Button
        label={t('common.cancel')}
        variant="secondary"
        onPress={onClose}
        style={styles.cancelButton}
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
  warning: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 21,
    paddingHorizontal: spacing.xs,
    paddingTop: 6,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  confirmButton: {
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});
