import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';

interface NumericKeypadProps {
  /** Se ejecuta al pulsar un dígito o "000" (recibe los dígitos a añadir). */
  onInput: (digits: string) => void;
  /** Se ejecuta al pulsar borrar. */
  onDelete: () => void;
}

/** Filas del teclado; 'del' es la tecla de borrar. */
const ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['000', '0', 'del'],
];

/**
 * Teclado numérico personalizado para capturar montos (organismo de UI).
 *
 * Emite los dígitos pulsados vía `onInput` y el borrado vía `onDelete`; la
 * lógica del importe vive en quien lo consume. Las teclas "000" y borrar se
 * muestran atenuadas, como en el diseño.
 */
export function NumericKeypad({ onInput, onDelete }: NumericKeypadProps) {
  const { t } = useTranslation();
  const handlePress = (key: string) => {
    if (key === 'del') {
      onDelete();
    } else {
      onInput(key);
    }
  };

  return (
    <View style={styles.pad}>
      {ROWS.map((row) => (
        <View key={row.join()} style={styles.row}>
          {row.map((key) => {
            const isSpecial = key === '000' || key === 'del';
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === 'del' ? t('accessibility.deleteKey') : key}
                onPress={() => handlePress(key)}
                style={({ pressed }) => [
                  styles.key,
                  isSpecial ? styles.keySpecial : styles.keyNormal,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    isSpecial ? styles.labelSpecial : styles.labelNormal,
                  ]}
                >
                  {key === 'del' ? '⌫' : key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyNormal: {
    backgroundColor: colors.surface,
  },
  keySpecial: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    letterSpacing: -0.4,
  },
  labelNormal: {
    fontSize: 26,
    color: colors.textPrimary,
  },
  labelSpecial: {
    fontSize: 20,
    color: colors.textSecondary,
  },
});
