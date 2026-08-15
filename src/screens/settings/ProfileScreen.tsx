import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/layout/Screen';
import { AppFooter } from '@/components/atoms/AppFooter';
import { BackLink } from '@/components/atoms/BackLink';
import { Button } from '@/components/atoms/Button';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Card } from '@/components/molecules/Card';
import { InputRow } from '@/components/molecules/InputRow';
import { useInviteCodeQuery, useUpdateProfile } from '@/services/auth/auth.queries';
import { useAuthStore } from '@/store/authStore';
import {
  isValidName,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  passwordPlaceholder,
} from '@/utils/validation';
import { colors, layout, radius, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface ProfileScreenProps {
  /** Vuelve a Ajustes. */
  onBack: () => void;
}

/**
 * Pantalla "Mi perfil".
 *
 * Permite editar el nombre y el usuario, cambiar la clave (opcional) y compartir
 * el código de invitación. Los cambios se guardan en la cuenta (SQLite) y
 * refrescan la sesión global.
 */
export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.session?.user);
  const updateProfile = useUpdateProfile();
  const inviteCode = useInviteCodeQuery(user?.id);

  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [copyLabel, setCopyLabel] = useState<string>(t('common.copy'));

  const initial = (name || user?.name || '?').charAt(0).toUpperCase();

  const handleSave = async () => {
    if (updateProfile.isPending) return;

    // Validación de formato (el usuario es de solo lectura, no se valida aquí).
    if (!isValidName(name)) {
      setFeedback({ text: t('profile.errorEmptyName'), ok: false });
      return;
    }
    if (newPassword && !isValidPassword(newPassword)) {
      setFeedback({
        text: t('profile.errorShortPassword', { min: MIN_PASSWORD_LENGTH }),
        ok: false,
      });
      return;
    }
    if (newPassword && !currentPassword) {
      setFeedback({ text: t('profile.errorMissingCurrentPassword'), ok: false });
      return;
    }
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        id: user.id,
        name,
        // El usuario no se puede cambiar; se reenvía el actual sin modificar.
        username: user.username,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      setCurrentPassword('');
      setNewPassword('');
      setFeedback({ text: t('profile.savedSuccess'), ok: true });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('profile.errorSaveFailed');
      setFeedback({ text: message, ok: false });
    }
  };

  const handleCopy = () => {
    // TODO(clipboard): copiar al portapapeles con expo-clipboard.
    setCopyLabel(t('common.copied'));
    setTimeout(() => setCopyLabel(t('common.copy')), 1500);
  };

  return (
    <Screen>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backRow}>
            <BackLink label={t('common.settings')} onPress={onBack} />
          </View>
          <Text style={styles.title}>{t('profile.title')}</Text>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>

          {/* Datos personales */}
          <SectionLabel>{t('profile.personalData')}</SectionLabel>
          <Card>
            <InputRow
              label={t('profile.name')}
              placeholder={t('profile.namePlaceholder')}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              showSeparator
            />
            <InputRow
              label={t('profile.username')}
              autoCapitalize="none"
              autoCorrect={false}
              value={user?.username ?? ''}
              editable={false}
              inputStyle={styles.readonly}
            />
          </Card>
          <Text style={styles.note}>
            {t('profile.usernameNote')}
          </Text>

          {/* Cambiar clave */}
          <SectionLabel style={styles.sectionSpacing}>{t('profile.changePassword')}</SectionLabel>
          <Card>
            <InputRow
              label={t('profile.currentPassword')}
              placeholder={t('profile.currentPasswordPlaceholder')}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              showSeparator
            />
            <InputRow
              label={t('profile.newPassword')}
              placeholder={passwordPlaceholder(t)}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </Card>

          {feedback && (
            <Text
              style={[
                styles.feedback,
                { color: feedback.ok ? colors.positive : colors.negative },
              ]}
            >
              {feedback.text}
            </Text>
          )}

          <Button
            label={t('profile.saveChanges')}
            onPress={handleSave}
            loading={updateProfile.isPending}
            style={styles.saveButton}
          />
          <Text style={styles.note}>
            {t('profile.passwordHint')}
          </Text>

          {/* Invitar a alguien */}
          <SectionLabel style={styles.sectionSpacing}>
            {t('profile.inviteSection')}
          </SectionLabel>
          <View style={styles.inviteCard}>
            <Text style={styles.inviteLabel}>{t('profile.inviteCodeLabel')}</Text>
            <View style={styles.inviteRow}>
              <Text style={styles.inviteCode}>
                {inviteCode.data ?? (inviteCode.isLoading ? t('common.placeholderEllipsis') : t('common.placeholderDash'))}
              </Text>
              <Pressable onPress={handleCopy} style={styles.copyButton}>
                <Text style={styles.copyText}>{copyLabel}</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.note}>
            {t('profile.inviteNote')}
          </Text>

          <AppFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxxl,
  },
  backRow: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    paddingBottom: spacing.lg,
  },
  avatarWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.white,
  },
  sectionSpacing: {
    paddingTop: spacing.xl,
  },
  readonly: {
    color: colors.textSecondary,
  },
  feedback: {
    ...typography.caption,
    paddingHorizontal: spacing.lg,
    paddingTop: 9,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  inviteCard: {
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: spacing.xl,
  },
  inviteLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  inviteCode: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.textPrimary,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  copyButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  copyText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
});
