import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Screen } from '@/components/layout/Screen';
import { BackLink } from '@/components/atoms/BackLink';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Card } from '@/components/molecules/Card';
import { CategoryRow } from '@/components/molecules/CategoryRow';
import { AddRow } from '@/components/molecules/AddRow';
import { NewCategorySheet } from '@/components/organisms/NewCategorySheet';
import { QueryState } from '@/components/molecules/QueryState';
import {
  useAddCategory,
  useCategories,
  useRemoveCategory,
} from '@/services/categories/category.queries';
import { Category, CategoryType } from '@/services/categories/category.types';
import { colors, layout, spacing, typography } from '@/theme';

/** Callbacks de navegación que la pantalla delega en su contenedor. */
interface CategoriesScreenProps {
  /** Vuelve a Ajustes. */
  onBack: () => void;
}

/**
 * Pantalla de gestión de categorías.
 *
 * Lista las categorías de egresos e ingresos (desde el repositorio vía TanStack
 * Query), permite crear nuevas con la hoja inferior y eliminar las que no estén
 * en uso. Sigue el diseño: dos secciones con sus filas y una acción "Nueva
 * categoría de …" al final de cada una.
 */
export function CategoriesScreen({ onBack }: CategoriesScreenProps) {
  const { data: categories = [], isLoading, isError, refetch } = useCategories();
  const addCategory = useAddCategory();
  const removeCategory = useRemoveCategory();

  // Estado de la hoja de "Nueva categoría" (visible + tipo preseleccionado).
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState<CategoryType>('expense');

  const openSheet = (type: CategoryType) => {
    setSheetType(type);
    setSheetVisible(true);
  };

  const expenses = categories.filter((c) => c.type === 'expense');
  const incomes = categories.filter((c) => c.type === 'income');

  /** Renderiza una sección (egresos o ingresos) con su tarjeta y acción. */
  const renderSection = (
    title: string,
    list: Category[],
    type: CategoryType,
    addLabel: string,
    spaced: boolean,
  ) => (
    <View style={spaced ? styles.sectionSpaced : undefined}>
      <SectionLabel>{title}</SectionLabel>
      <Card>
        {list.map((category) => (
          <CategoryRow
            key={category.id}
            name={category.name}
            color={category.color}
            sub="Sin movimientos"
            onRemove={() => removeCategory.mutate(category.id)}
            showSeparator
          />
        ))}
        <AddRow label={addLabel} onPress={() => openSheet(type)} />
      </Card>
    </View>
  );

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backRow}>
          <BackLink label="Ajustes" onPress={onBack} />
        </View>
        <Text style={styles.title}>Categorías</Text>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          errorText="No pudimos cargar tus categorías."
        >
          {renderSection('Egresos', expenses, 'expense', 'Nueva categoría de egreso', false)}
          {renderSection('Ingresos', incomes, 'income', 'Nueva categoría de ingreso', true)}

          <Text style={styles.note}>
            Las categorías con movimientos registrados no se pueden borrar. Cada
            categoría nueva empieza sin límite de presupuesto.
          </Text>
        </QueryState>
      </ScrollView>

      <NewCategorySheet
        visible={sheetVisible}
        initialType={sheetType}
        onClose={() => setSheetVisible(false)}
        onCreate={(input) => addCategory.mutateAsync(input).then(() => undefined)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  sectionSpaced: {
    marginTop: spacing.xl,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
