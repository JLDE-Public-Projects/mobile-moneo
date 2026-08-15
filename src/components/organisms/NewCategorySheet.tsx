import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { Button } from '@/components/atoms/Button';
import { FormMessage } from '@/components/atoms/FormMessage';
import { SegmentedControl, SegmentOption } from '@/components/molecules/SegmentedControl';
import {
  CATEGORY_PALETTE,
  DEFAULT_CATEGORY_COLOR,
} from '@/services/categories/category.constants';
import { CategoryType, NewCategory } from '@/services/categories/category.types';
import { colors, radius, spacing, typography } from '@/theme';

interface NewCategorySheetProps {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Tipo preseleccionado al abrir (egreso o ingreso). */
  initialType: CategoryType;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Crea la categoría; lanza para mostrar un error. */
  onCreate: (input: NewCategory) => Promise<void>;
}

/**
 * Hoja inferior para crear una categoría (organismo).
 *
 * Reúne el tipo (Egreso/Ingreso), el nombre y el color en un formulario dentro
 * de un {@link BottomSheet}. Mantiene su estado local y delega la creación en
 * `onCreate`; al tener éxito se cierra.
 */
export function NewCategorySheet({
  visible,
  initialType,
  onClose,
  onCreate,
}: NewCategorySheetProps) {
  const { t } = useTranslation();
  const TYPE_OPTIONS: SegmentOption<CategoryType>[] = [
    { value: 'expense', label: t('common.expense') },
    { value: 'income', label: t('common.income') },
  ];
  const [type, setType] = useState<CategoryType>(initialType);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_COLOR);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al abrir, reiniciamos el formulario con el tipo indicado.
  useEffect(() => {
    if (visible) {
      setType(initialType);
      setName('');
      setColor(DEFAULT_CATEGORY_COLOR);
      setErrorMessage('');
    }
  }, [visible, initialType]);

  const canSubmit = name.trim().length > 0;

  const handleAdd = async () => {
    if (isSubmitting) return;
    if (!canSubmit) {
      setErrorMessage(t('categories.sheet.errorEmptyName'));
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreate({ name: name.trim(), type, color });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('categories.sheet.errorGeneric');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{t('categories.sheet.title')}</Text>

      <View style={styles.card}>
        {/* Tipo */}
        <View style={styles.segmentRow}>
          <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
        </View>

        {/* Nombre con vista previa del color */}
        <View style={styles.nameRow}>
          <View style={[styles.swatch, { backgroundColor: color }]} />
          <TextInput
            style={styles.input}
            placeholder={t('categories.sheet.namePlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
        </View>

        {/* Color */}
        <View style={styles.colorSection}>
          <Text style={styles.colorLabel}>{t('categories.sheet.colorLabel')}</Text>
          <View style={styles.swatches}>
            {CATEGORY_PALETTE.map((paletteColor) => {
              const selected = paletteColor === color;
              return (
                <Pressable
                  key={paletteColor}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.color', { name: paletteColor })}
                  accessibilityState={{ selected }}
                  onPress={() => setColor(paletteColor)}
                  style={[styles.ring, selected && styles.ringActive]}
                >
                  <View
                    style={[styles.colorSwatch, { backgroundColor: paletteColor }]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <FormMessage message={errorMessage} />

      <Button
        label={t('categories.sheet.submit')}
        onPress={handleAdd}
        disabled={!canSubmit}
        loading={isSubmitting}
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
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  segmentRow: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  colorSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: spacing.lg,
  },
  colorLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ring: {
    padding: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringActive: {
    borderColor: colors.accent,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 9,
  },
});
