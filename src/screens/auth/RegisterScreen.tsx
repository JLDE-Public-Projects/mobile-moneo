import React from 'react';
import {
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Screen} from '@/components/layout/Screen';
import {BackLink} from '@/components/atoms/BackLink';
import {BrandMark} from '@/components/atoms/BrandMark';
import {Button} from '@/components/atoms/Button';
import {FadeInUp} from '@/components/atoms/FadeInUp';
import {FormMessage} from '@/components/atoms/FormMessage';
import {SectionLabel} from '@/components/atoms/SectionLabel';
import {Card} from '@/components/molecules/Card';
import {InputRow} from '@/components/molecules/InputRow';
import {useRegisterForm, RegisterData} from '@/hooks/useRegisterForm';
import {PASSWORD_PLACEHOLDER} from '@/utils/validation';
import {colors, layout, spacing, typography} from '@/theme';

/** Callbacks de navegación/acción que la pantalla delega en su contenedor. */
interface RegisterScreenProps {
   /** Crea la cuenta con los datos dados; lanza para mostrar un error. */
   onRegister: (data: RegisterData) => Promise<void>;
   /** Vuelve a la pantalla de inicio de sesión. */
   onBackToLogin: () => void;
}

// Retraso base entre elementos para la entrada escalonada (en ms).
const STAGGER = 70;

/**
 * Pantalla de creación de cuenta — presentación pura conectada a
 * {@link useRegisterForm}.
 *
 * Sigue el diseño: enlace de retroceso, cabecera de marca, una tarjeta con los
 * tres datos personales, la tarjeta del código de invitación, la ranura de
 * error y la acción principal. Los bloques entran de forma escalonada con
 * {@link FadeInUp} para dar sensación de fluidez al abrir la vista.
 */
export function RegisterScreen({onRegister, onBackToLogin}: RegisterScreenProps) {

   const form = useRegisterForm({onSubmit: onRegister});

   return <Screen>
      <StatusBar style="dark"/>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
         <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Enlace de retroceso */}
            <FadeInUp delay={0}>
               <BackLink label="Entrar" onPress={onBackToLogin}/>
            </FadeInUp>

            {/* Cabecera de marca */}
            <FadeInUp delay={STAGGER} style={styles.header}>
               <BrandMark size={56}/>
               <Text style={styles.title}>Crear tu cuenta</Text>
               <Text style={styles.subtitle}>
                  Tres datos y el código que te compartieron.
               </Text>
            </FadeInUp>

            {/* Datos personales */}
            <FadeInUp delay={STAGGER * 2} style={styles.personalCard}>
               <Card>
                  <InputRow
                     label="Usuario"
                     placeholder="Elige tu usuario"
                     autoCapitalize="none"
                     autoCorrect={false}
                     textContentType="username"
                     maxLength={20}
                     value={form.username}
                     onChangeText={form.setUsername}
                     showSeparator
                  />
                  <InputRow
                     label="Nombre"
                     placeholder="Cómo te llamas"
                     autoCapitalize="words"
                     textContentType="name"
                     value={form.name}
                     onChangeText={form.setName}
                     showSeparator
                  />
                  <InputRow
                     label="Clave"
                     placeholder={PASSWORD_PLACEHOLDER}
                     secureTextEntry
                     textContentType="newPassword"
                     value={form.password}
                     onChangeText={form.setPassword}
                  />
               </Card>
            </FadeInUp>

            {/* Código de invitación */}
            <FadeInUp delay={STAGGER * 3} style={styles.inviteSection}>
               <SectionLabel>Invitación</SectionLabel>
               <Card>
                  <InputRow
                     label="Código"
                     placeholder="MONEO-000000"
                     autoCapitalize="characters"
                     autoCorrect={false}
                     value={form.inviteCode}
                     onChangeText={form.setInviteCode}
                     returnKeyType="go"
                     onSubmitEditing={form.submit}
                     inputStyle={styles.codeInput}
                  />
               </Card>
            </FadeInUp>

            {/* Error de validación / registro */}
            <FormMessage message={form.errorMessage}/>

            {/* Acción principal */}
            <FadeInUp delay={STAGGER * 4}>
               <Button
                  label="Crear cuenta"
                  onPress={form.submit}
                  disabled={!form.canSubmit}
                  loading={form.isSubmitting}
               />
            </FadeInUp>

            <View style={styles.flex}/>

            <Text style={styles.legal}>
               Moneo es por invitación. Tus datos se sincronizan{'\n'}
               cifrados en el servidor privado de Moneo.
            </Text>
         </ScrollView>
      </KeyboardAvoidingView>
   </Screen>
}

const styles = StyleSheet.create({
   flex: {
      flex: 1,
   },
   scroll: {
      flexGrow: 1,
      paddingHorizontal: layout.screenPadding,
      // El margen seguro superior lo aporta <Screen>; aquí solo un pequeño respiro.
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxxl,
   },
   header: {
      paddingTop: spacing.xl,
   },
   title: {
      ...typography.screenTitle,
      color: colors.textPrimary,
      marginTop: spacing.lg,
   },
   subtitle: {
      ...typography.subtitle,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      lineHeight: 21,
   },
   personalCard: {
      marginTop: spacing.xxl,
   },
   inviteSection: {
      marginTop: spacing.xxl,
   },
   codeInput: {
      // El código se muestra monoespaciado y en mayúsculas, como en el diseño.
      fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
      letterSpacing: 1,
      textTransform: 'uppercase',
   },
   legal: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      paddingTop: spacing.xl,
   },
});
