import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { colors, typography } from '@/theme';

interface SearchBarProps {
  /** Texto de búsqueda. */
  value: string;
  /** Se ejecuta al cambiar el texto. */
  onChangeText: (value: string) => void;
  /** Placeholder del campo. */
  placeholder: string;
}

/**
 * Campo de búsqueda al estilo iOS: una lupa, el input y un botón para limpiar
 * cuando hay texto. Reutilizable en cualquier lista filtrable.
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <Circle cx={7} cy={7} r={5.3} stroke={colors.textSecondary} strokeWidth={1.6} />
        <Path
          d="M11 11l3.5 3.5"
          stroke={colors.textSecondary}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.clearSearch')}
          style={styles.clear}
        >
          <Svg width={9} height={9} viewBox="0 0 9 9">
            <Path
              d="M1 1l7 7M8 1 1 8"
              stroke={colors.white}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.disabledFill,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    ...typography.body,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.textPrimary,
    padding: 0,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
