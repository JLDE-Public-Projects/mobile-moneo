import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

interface CardProps {
  /** Rows / content grouped inside the rounded white surface. */
  children: React.ReactNode;
  /** Extra container styles (margins, padding) for the call site. */
  style?: ViewStyle;
}

/**
 * Rounded white surface used to group related rows, mirroring the iOS inset
 * grouped-list card. `overflow: hidden` clips child separators to the radius.
 */
export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
});
