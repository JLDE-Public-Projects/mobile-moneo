import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {Card} from '@/components/molecules/Card';
import {colors, spacing, typography} from '@/theme';

interface QueryStateProps {
   /** True mientras la consulta trae los datos por primera vez. */
   isLoading: boolean;
   /** True si la consulta falló. */
   isError: boolean;
   /** Vuelve a intentar la consulta. */
   onRetry: () => void;
   /** Mensaje mostrado al fallar, en el lenguaje de la pantalla. */
   errorText: string;
   /** Contenido a mostrar cuando los datos ya están disponibles. */
   children: React.ReactNode;
}

/**
 * Muestra el estado de una consulta al servidor: cargando, error o contenido.
 *
 * Desde que los datos viven en Supabase, cada pantalla que los lee tiene que
 * contemplar la espera y el fallo. Centralizarlo aquí evita repetir el mismo
 * bloque en cada una y, sobre todo, que se traten de forma distinta según quién
 * lo escribió.
 */
export function QueryState({
                              isLoading,
                              isError,
                              onRetry,
                              errorText,
                              children,
                           }: QueryStateProps) {
   if (isLoading) {
      return <View style={styles.centered}>
         <ActivityIndicator color={colors.accent}/>
      </View>
   }

   if (isError) {
      return <Card>
         <View style={styles.centered}>
            <Text style={styles.errorText}>{errorText}</Text>
            <Text style={styles.retry} onPress={onRetry}>Reintentar</Text>
         </View>
      </Card>
   }

   return <>{children}</>
}

const styles = StyleSheet.create({
   centered: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
   },
   errorText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
   },
   retry: {
      ...typography.body,
      fontWeight: '600',
      color: colors.accent,
   },
});
