import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Screen} from '@/components/layout/Screen';
import {BackLink} from '@/components/atoms/BackLink';
import {SectionLabel} from '@/components/atoms/SectionLabel';
import {Toggle} from '@/components/atoms/Toggle';
import {ChevronIcon} from '@/components/icons/ChevronIcon';
import {Card} from '@/components/molecules/Card';
import {ListRow} from '@/components/molecules/ListRow';
import {TAB_BAR_SPACE} from '@/screens/main/PlaceholderScreen';
import {SelectionSheet, SelectOption} from '@/components/organisms/SelectionSheet';
import {useAuthStore} from '@/store/authStore';
import {useSettingsStore} from '@/store/settingsStore';
import {
   CURRENCIES,
   CurrencyCode,
   currencyShortLabel,
   formatNumber,
   getCurrency,
} from '@/config/currencies';
import {colors, layout, radius, spacing, typography} from '@/theme';
import {Button} from "@/components/atoms/Button";

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
 * presupuesto, primer día del mes), sección "Privacidad" (interruptores y
 * exportación) y el cierre de sesión. Los interruptores tienen estado local por
 * ahora; se persistirán cuando exista el almacenamiento de preferencias.
 */
export function SettingsScreen({onBack, onOpenProfile, onOpenCategories, onOpenBudget}: SettingsScreenProps) {
   const session = useAuthStore((state) => state.session);
   const clearSession = useAuthStore((state) => state.clearSession);

   // Moneda (preferencia global) + hoja de selección.
   const currency = useSettingsStore((state) => state.currency);
   const setCurrency = useSettingsStore((state) => state.setCurrency);
   const [currencySheetOpen, setCurrencySheetOpen] = useState(false);

   // Estado local de los interruptores (TODO: persistir en preferencias).
   const [faceId, setFaceId] = useState(false);
   const [hideAmounts, setHideAmounts] = useState(false);

   const user = session?.user;
   const initial = (user?.name ?? '?').charAt(0).toUpperCase();

   // Opciones del selector de moneda: nombre + "CÓDIGO SÍMBOLO · ejemplo".
   const currencyOptions: SelectOption<CurrencyCode>[] = CURRENCIES.map((c) => ({
      value: c.code,
      label: c.name,
      sub: `${c.code} ${c.symbol} · ${formatNumber(CURRENCY_EXAMPLE, c)}`,
   }));

   return (
      <Screen bottomInset={false}>
         <StatusBar style="dark"/>
         <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Cabecera */}
            <View style={styles.backRow}>
               <BackLink label="Resumen" onPress={onBack}/>
            </View>

            <Text style={styles.title}>Ajustes</Text>

            {/* Tarjeta de perfil */}
            <Pressable onPress={onOpenProfile} style={({pressed}) => [styles.profileCard, pressed && styles.profilePressed]}>
               <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
               </View>
               <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>
                     {user?.name ?? 'Tu cuenta'}
                  </Text>
                  <Text style={styles.profileMeta} numberOfLines={1}>
                     {user?.username ?? ''}
                  </Text>
               </View>
               <ChevronIcon/>
            </Pressable>

            {/* General */}
            <SectionLabel>General</SectionLabel>
            <Card>
               <ListRow
                  label="Moneda"
                  detail={currencyShortLabel(getCurrency(currency))}
                  onPress={() => setCurrencySheetOpen(true)}
                  showChevron={false}
                  showSeparator
               />
               <ListRow label="Categorías" onPress={onOpenCategories} showSeparator/>
               <ListRow label="Presupuesto" onPress={onOpenBudget}/>
            </Card>

            {/* Privacidad */}
            <SectionLabel style={styles.sectionSpacing}>Privacidad</SectionLabel>
            <Card>
               <ListRow label="Face ID al abrir" showSeparator right={<Toggle value={faceId} onValueChange={setFaceId}/>}/>
               <ListRow label="Ocultar montos en el resumen" showSeparator right={<Toggle value={hideAmounts} onValueChange={setHideAmounts}/>}/>
               {/* TODO(export): exportar los movimientos a CSV. */}
               <ListRow label="Exportar a CSV" onPress={() => {
               }}/>
            </Card>

            {/* Cerrar sesión */}
            <Card style={styles.logoutCard}>
               <Button label="Cerrar sesión" variant="secondary" destructive onPress={clearSession}/>
               {/*<ListRow label="Cerrar sesión" align="center" detail="" tintColor={colors.negative} onPress={clearSession}/>*/}
            </Card>

            <Text style={styles.note}>
               Sincronizado con tu cuenta de Moneo. Sin conexión bancaria: todo lo
               registras tú.
            </Text>

         </ScrollView>

         {/* Selector de moneda */}
         <SelectionSheet
            visible={currencySheetOpen}
            onClose={() => setCurrencySheetOpen(false)}
            title="Moneda"
            options={currencyOptions}
            selected={currency}
            onSelect={setCurrency}
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
   sectionSpacing: {
      paddingTop: spacing.xl,
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
