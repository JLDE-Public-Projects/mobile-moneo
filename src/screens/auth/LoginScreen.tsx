import React from 'react';
import {
   KeyboardAvoidingView,
   Platform,
   Pressable,
   ScrollView,
   StyleSheet,
   Text,
   View,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useTranslation} from 'react-i18next';
import {Screen} from '@/components/layout/Screen';
import {AppFooter} from '@/components/atoms/AppFooter';
import {BrandMark} from '@/components/atoms/BrandMark';
import {Button} from '@/components/atoms/Button';
import {FadeInUp} from '@/components/atoms/FadeInUp';
import {FormMessage} from '@/components/atoms/FormMessage';
import {Card} from '@/components/molecules/Card';
import {InputRow} from '@/components/molecules/InputRow';
import {useLoginForm, LoginCredentials} from '@/hooks/useLoginForm';
import {passwordPlaceholder} from '@/utils/validation';
import {useMonthNames} from '@/hooks/useMonthNames';
import {colors, layout, spacing, typography} from '@/theme';

/** Callbacks de navegación/acción que la pantalla delega en su contenedor. */
interface LoginScreenProps {
   /** Autentica las credenciales dadas; lanza para mostrar un error. */
   onLogin: (credentials: LoginCredentials) => Promise<void>;
   /** Navega al flujo de registro. */
   onRegister?: () => void;
}

// Retraso base entre elementos para la entrada escalonada (en ms).
const STAGGER = 70;

/**
 * Pantalla de inicio de sesión — presentación pura conectada a
 * {@link useLoginForm}.
 *
 * Sigue el diseño: cabecera de marca centrada, tarjeta de credenciales, ranura
 * de error, acción principal y enlace a registro. Los bloques aparecen de
 * forma escalonada con {@link FadeInUp} para dar sensación de vida al abrir
 * la app.
 */
export function LoginScreen({onLogin, onRegister}: LoginScreenProps) {
   const {t} = useTranslation();
   const months = useMonthNames();
   const currentMonthName = months.long[new Date().getMonth()].toLowerCase();

   const form = useLoginForm({onSubmit: onLogin});

   return (
      <Screen>
         <StatusBar style="dark"/>
         <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

               {/* Cabecera de marca */}
               <FadeInUp delay={0} style={styles.header}>
                  <BrandMark/>
                  <Text style={styles.title}>{t('auth.brand')}</Text>
                  <Text style={styles.subtitle}>{t('auth.login.subtitle', {month: currentMonthName})}</Text>
               </FadeInUp>

               {/* Credenciales */}
               <FadeInUp delay={STAGGER} style={styles.form}>
                  <Card>
                     <InputRow
                        label={t('auth.login.username')}
                        placeholder={t('auth.login.usernamePlaceholder')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="username"
                        maxLength={20}
                        value={form.username}
                        onChangeText={form.setUsername}
                        showSeparator
                     />
                     <InputRow
                        label={t('auth.login.password')}
                        placeholder={passwordPlaceholder(t)}
                        secureTextEntry
                        textContentType="password"
                        value={form.password}
                        onChangeText={form.setPassword}
                        returnKeyType="go"
                        onSubmitEditing={form.submit}
                     />
                  </Card>
               </FadeInUp>

               {/* Error de validación / autenticación */}
               <FormMessage message={form.errorMessage}/>

               {/* Acción principal */}
               <FadeInUp delay={STAGGER * 2}>
                  <Button
                     label={t('auth.login.submit')}
                     onPress={form.submit}
                     disabled={!form.canSubmit}
                     loading={form.isSubmitting}
                  />
               </FadeInUp>

               {/* Enlace a registro */}
               <FadeInUp delay={STAGGER * 3} style={styles.registerRow}>
                  <Text style={styles.mutedText}>{t('auth.login.firstTime')}</Text>
                  <Pressable onPress={onRegister} hitSlop={8}>
                     <Text style={styles.link}>{t('auth.login.createAccount')}</Text>
                  </Pressable>
               </FadeInUp>

               <View style={styles.flex}/>

               <Text style={styles.legal}>
                  {t('auth.legalLogin')}
               </Text>

               <AppFooter/>
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
   header: {
      alignItems: 'center',
      // El margen seguro superior lo aporta <Screen>; aquí solo el respiro visual.
      paddingTop: 48,
   },
   title: {
      ...typography.largeTitle,
      color: colors.textPrimary,
      marginTop: 18,
   },
   subtitle: {
      ...typography.subtitle,
      color: colors.textSecondary,
      marginTop: spacing.xs,
   },
   form: {
      marginTop: spacing.xxxl,
   },
   registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      paddingTop: spacing.xxl,
   },
   mutedText: {
      ...typography.subtitle,
      color: colors.textSecondary,
   },
   link: {
      ...typography.subtitle,
      color: colors.accent,
   },
   legal: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      paddingTop: spacing.xl,
   },
});
