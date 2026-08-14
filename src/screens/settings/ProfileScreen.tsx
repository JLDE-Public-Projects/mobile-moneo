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
import { Screen } from '@/components/layout/Screen';
import { BackLink } from '@/components/atoms/BackLink';
import { Button } from '@/components/atoms/Button';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Card } from '@/components/molecules/Card';
import { InputRow } from '@/components/molecules/InputRow';
import { useUpdateProfile } from '@/services/auth/auth.queries';
import { useAuthStore } from '@/store/authStore';
import {
  isValidName,
  isValidPassword,
  isValidUsername,
  normalizeUsername,
} from '@/utils/validation';
import { colors, layout, radius, spacing, typography } from '@/theme';

/** Código de invitación de la cuenta (compartible). */
const INVITE_CODE = 'MONEO-2026';

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
  const user = useAuthStore((state) => state.session?.user);
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [copyLabel, setCopyLabel] = useState('Copiar');

  const initial = (name || user?.name || '?').charAt(0).toUpperCase();

  const handleSave = async () => {
    if (updateProfile.isPending) return;

    // Validación de formato.
    if (!isValidName(name) || !isValidUsername(username)) {
      setFeedback({ text: 'Revisa tu nombre y usuario.', ok: false });
      return;
    }
    if (newPassword && !isValidPassword(newPassword)) {
      setFeedback({ text: 'La nueva clave necesita mínimo 4 caracteres.', ok: false });
      return;
    }
    if (newPassword && !currentPassword) {
      setFeedback({ text: 'Escribe tu clave actual para cambiarla.', ok: false });
      return;
    }
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        id: user.id,
        name,
        username,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      setCurrentPassword('');
      setNewPassword('');
      setFeedback({ text: 'Cambios guardados.', ok: true });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No pudimos guardar los cambios.';
      setFeedback({ text: message, ok: false });
    }
  };

  const handleCopy = () => {
    // TODO(clipboard): copiar al portapapeles con expo-clipboard.
    setCopyLabel('¡Copiado!');
    setTimeout(() => setCopyLabel('Copiar'), 1500);
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
            <BackLink label="Ajustes" onPress={onBack} />
          </View>
          <Text style={styles.title}>Mi perfil</Text>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>

          {/* Datos personales */}
          <SectionLabel>Datos personales</SectionLabel>
          <Card>
            <InputRow
              label="Nombre"
              placeholder="Tu nombre"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              showSeparator
            />
            <InputRow
              label="Usuario"
              placeholder="Tu usuario"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              value={username}
              onChangeText={(v) => setUsername(normalizeUsername(v))}
            />
          </Card>

          {/* Cambiar clave */}
          <SectionLabel style={styles.sectionSpacing}>Cambiar clave</SectionLabel>
          <Card>
            <InputRow
              label="Actual"
              placeholder="Clave actual"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              showSeparator
            />
            <InputRow
              label="Nueva"
              placeholder="Mínimo 4 caracteres"
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
            label="Guardar cambios"
            onPress={handleSave}
            loading={updateProfile.isPending}
            style={styles.saveButton}
          />
          <Text style={styles.note}>
            Deja "Nueva" en blanco si solo quieres actualizar tu nombre o usuario.
          </Text>

          {/* Invitar a alguien */}
          <SectionLabel style={styles.sectionSpacing}>
            Invitar a alguien
          </SectionLabel>
          <View style={styles.inviteCard}>
            <Text style={styles.inviteLabel}>Tu código de invitación</Text>
            <View style={styles.inviteRow}>
              <Text style={styles.inviteCode}>{INVITE_CODE}</Text>
              <Pressable onPress={handleCopy} style={styles.copyButton}>
                <Text style={styles.copyText}>{copyLabel}</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.note}>
            Compártelo con quien quieras invitar a Moneo. Lo pedirá en su pantalla
            de registro.
          </Text>
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
