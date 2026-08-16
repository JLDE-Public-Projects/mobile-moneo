import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {useTranslation} from 'react-i18next';
import {Screen} from '@/components/layout/Screen';
import {AppFooter} from '@/components/atoms/AppFooter';
import {BackLink} from '@/components/atoms/BackLink';
import {SectionLabel} from '@/components/atoms/SectionLabel';
import {ChevronIcon} from '@/components/icons/ChevronIcon';
import {Card} from '@/components/molecules/Card';
import {ListRow} from '@/components/molecules/ListRow';
import {TAB_BAR_SPACE} from '@/screens/main/PlaceholderScreen';
import {SelectionSheet, SelectOption} from '@/components/organisms/SelectionSheet';
import {useAuthStore} from '@/store/authStore';
import {signOut} from '@/services/auth/authSession';
import {LanguagePreference, useSettingsStore} from '@/store/settingsStore';
import {
   CURRENCIES,
   CurrencyCode,
   currencyShortLabel,
   formatNumber,
   getCurrency,
} from '@/config/currencies';
import {colors, layout, radius, spacing, typography} from '@/theme';
import {Button} from "@/components/atoms/Button";
import {DeleteAccountSheet} from '@/components/organisms/DeleteAccountSheet';

/** Importe de ejemplo mostrado bajo cada moneda en el selector. */
const CURRENCY_EXAMPLE = 1800000;

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface SettingsScreenProps {
   /** Vuelve al inicio (Resumen). */
   onBack: () => void;
   /** Abre el detalle del perfil (pendiente de crear). */
   onOpenProfile?: () => void;
   /** Abre la administración de categorías (pendiente). */
   onOpenCategories?: () => void;
   /** Abre el presupuesto (pendiente). */
   onOpenBudget?: () => void;
}

/**
 * Pantalla de "Ajustes" (configuraciones).
 *
 * Sigue el diseño: tarjeta de perfil, sección "General" (moneda, categorías,
 * presupuesto, idioma) y el cierre de sesión.
 *
 * La sección "Privacidad" (Face ID, ocultar montos, exportar CSV) se retiró:
 * ninguna de las tres estaba implementada todavía. Se puede reintroducir más
 * adelante cuando haya una implementación real detrás.
 */
export function SettingsScreen({onBack, onOpenProfile, onOpenCategories, onOpenBudget}: SettingsScreenProps) {
   const {t} = useTranslation();
   const session = useAuthStore((state) => state.session);
   // El logout se hace en Supabase; el listener de sesión limpia el store solo.
   const handleLogout = () => {
      void signOut();
   };

   // Moneda (preferencia global) + hoja de selección.
   const currency = useSettingsStore((state) => state.currency);
   const setCurrency = useSettingsStore((state) => state.setCurrency);
   const [currencySheetOpen, setCurrencySheetOpen] = useState(false);

   // Idioma (preferencia global) + hoja de selección.
   const languagePreference = useSettingsStore((state) => state.languagePreference);
   const setLanguagePreference = useSettingsStore((state) => state.setLanguagePreference);
   const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
   const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

   const user = session?.user;
   const initial = (user?.name ?? '?').charAt(0).toUpperCase();

   // Opciones del selector de moneda: nombre + "CÓDIGO SÍMBOLO · ejemplo".
   const currencyOptions: SelectOption<CurrencyCode>[] = CURRENCIES.map((c) => ({
      value: c.code,
      label: t(c.nameKey),
      sub: `${c.code} ${c.symbol} · ${formatNumber(CURRENCY_EXAMPLE, c)}`,
   }));

   // Opciones del selector de idioma: "Predeterminado del sistema" + los soportados.
   const languageOptions: SelectOption<LanguagePreference>[] = [
      {value: 'system', label: t('settings.languageSystem')},
      {value: 'es', label: t('languages.es')},
      {value: 'en', label: t('languages.en')},
   ];
   const languageLabel = languageOptions.find((o) => o.value === languagePreference)?.label ?? '';

   return (
      <Screen bottomInset={false}>
         <StatusBar style="dark"/>
         <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Cabecera */}
            <View style={styles.backRow}>
               <BackLink label={t('settings.backToHome')} onPress={onBack}/>
            </View>

            <Text style={styles.title}>{t('settings.title')}</Text>

            {/* Tarjeta de perfil */}
            <Pressable onPress={onOpenProfile} style={({pressed}) => [styles.profileCard, pressed && styles.profilePressed]}>
               <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
               </View>
               <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>
                     {user?.name ?? t('settings.defaultUserName')}
                  </Text>
                  <Text style={styles.profileMeta} numberOfLines={1}>
                     {user?.username ?? ''}
                  </Text>
               </View>
               <ChevronIcon/>
            </Pressable>

            {/* General */}
            <SectionLabel>{t('settings.general')}</SectionLabel>
            <Card>
               <ListRow
                  label={t('settings.currency')}
                  detail={currencyShortLabel(getCurrency(currency))}
                  onPress={() => setCurrencySheetOpen(true)}
                  showChevron={false}
                  showSeparator
               />
               <ListRow label={t('settings.categories')} onPress={onOpenCategories} showSeparator/>
               <ListRow label={t('settings.budget')} onPress={onOpenBudget} showSeparator/>
               <ListRow
                  label={t('settings.language')}
                  detail={languageLabel}
                  onPress={() => setLanguageSheetOpen(true)}
                  showChevron={false}
               />
            </Card>

            {/* Cerrar sesión */}
            <Card style={styles.logoutCard}>
               <Button label={t('settings.logout')} variant="secondary" destructive onPress={handleLogout}/>
            </Card>

            <Text style={styles.note}>
               {t('settings.footerNote')}
            </Text>

            {/* Zona de peligro: separada del resto para no tocarla sin querer. */}
            <SectionLabel style={styles.dangerSection}>
               {t('settings.dangerZone')}
            </SectionLabel>
            <Card>
               <ListRow
                  label={t('settings.deleteAccount.action')}
                  tintColor={colors.negative}
                  onPress={() => setDeleteSheetOpen(true)}
                  showChevron={false}
               />
            </Card>
            <Text style={styles.note}>
               {t('settings.deleteAccount.note')}
            </Text>

            <AppFooter/>

         </ScrollView>

         {/* Selector de moneda */}
         <SelectionSheet
            visible={currencySheetOpen}
            onClose={() => setCurrencySheetOpen(false)}
            title={t('settings.currencySheetTitle')}
            options={currencyOptions}
            selected={currency}
            onSelect={setCurrency}
         />

         {/* Selector de idioma */}
         <SelectionSheet
            visible={languageSheetOpen}
            onClose={() => setLanguageSheetOpen(false)}
            title={t('settings.languageSheetTitle')}
            options={languageOptions}
            selected={languagePreference}
            onSelect={setLanguagePreference}
         />

         {/* Confirmación de eliminación de cuenta (pide la clave) */}
         <DeleteAccountSheet
            visible={deleteSheetOpen}
            onClose={() => setDeleteSheetOpen(false)}
         />
      </Screen>
   );
}

const styles = StyleSheet.create({
   scroll: {
      flexGrow: 1,
      // Margen horizontal global de la app; las tarjetas y encabezados se alinean
      // dentro de él (igual que en login/registro).
      paddingHorizontal: layout.screenPadding,
      paddingBottom: TAB_BAR_SPACE,
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
   profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      marginBottom: spacing.xxl,
      padding: spacing.lg,
   },
   profilePressed: {
      opacity: 0.7,
   },
   avatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
   },
   avatarText: {
      ...typography.bodyStrong,
      fontSize: 19,
      color: colors.white,
   },
   profileInfo: {
      flex: 1,
      minWidth: 0,
   },
   profileName: {
      ...typography.body,
      fontWeight: '500',
      color: colors.textPrimary,
   },
   profileMeta: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 1,
   },
   dangerSection: {
      paddingTop: spacing.xxl,
   },
   logoutCard: {
      marginTop: spacing.xxl,
   },
   note: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 19,
      // Se alinea con el texto de las filas (inset interior de la tarjeta).
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
   },
});
