import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ChevronIcon} from '@/components/icons/ChevronIcon';
import {colors, spacing, typography} from '@/theme';

interface ListRowProps {
   /** Texto principal a la izquierda. */
   label: string;
   /** Texto secundario a la derecha (p. ej. un valor). */
   detail?: string;
   /** Acción al pulsar la fila. Si se define, aparece un chevron por defecto. */
   onPress?: () => void;
   /** Accesorio a la derecha (p. ej. un {@link Toggle}); reemplaza al chevron. */
   right?: React.ReactNode;
   /** Forzar u ocultar el chevron. Por defecto: visible si hay `onPress`. */
   showChevron?: boolean;
   /** Dibuja una línea separadora inferior. */
   showSeparator?: boolean;
   /** Color del texto principal (p. ej. acento o negativo para acciones). */
   tintColor?: string;
   /** Alineación del contenido: 'left' (por defecto) o 'center' para acciones. */
   align?: 'left' | 'center';
}

/**
 * Fila de lista agrupada al estilo iOS, reutilizable en toda la app (ajustes,
 * accesos del inicio, cuentas, etc.).
 *
 * Combina un texto principal con, opcionalmente, un valor a la derecha, un
 * accesorio (como un interruptor) o un chevron de navegación. Centralizarla
 * garantiza altura, tipografía y separadores consistentes.
 */
export function ListRow({
                           label,
                           detail,
                           onPress,
                           right,
                           showChevron,
                           showSeparator = false,
                           tintColor,
                           align = 'left',
                        }: ListRowProps) {

   // El chevron aparece por defecto cuando la fila es pulsable y no hay accesorio.
   const chevronVisible = showChevron ?? (Boolean(onPress) && !right);
   const isCentered = align === 'center';

   const content = (
      <View style={[styles.row, showSeparator && styles.separator]}>
         <Text
            numberOfLines={1}
            style={[styles.label, isCentered && styles.labelCentered, tintColor ? {color: tintColor} : null]}
         >
            {label}
         </Text>
         {detail !== undefined && <Text style={styles.detail}>{detail}</Text>}
         {right}
         {chevronVisible && (
            <View style={styles.chevron}>
               <ChevronIcon/>
            </View>
         )}
      </View>
   );

   if (!onPress) {
      return content;
   }

   return <Pressable onPress={onPress} accessibilityRole="button" style={({pressed}) => (pressed ? styles.pressed : undefined)}>
      {content}
   </Pressable>;
}

const styles = StyleSheet.create({
   row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      paddingHorizontal: spacing.lg,
   },
   separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
   },
   label: {
      flex: 1,
      minWidth: 0,
      ...typography.body,
      color: colors.textPrimary,
   },
   labelCentered: {
      textAlign: 'center',
   },
   detail: {
      ...typography.body,
      color: colors.textSecondary,
   },
   chevron: {
      marginLeft: spacing.sm,
   },
   pressed: {
      backgroundColor: colors.disabledFill,
   },
});
