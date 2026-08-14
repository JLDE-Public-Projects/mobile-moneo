import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';

/** Props controlling the size of the brand mark. */
interface BrandMarkProps {
  /** Outer square size in points. Inner ring scales proportionally. */
  size?: number;
}

/**
 * Moneo brand mark: a rounded accent square containing a circled "M".
 *
 * Kept as a self-contained atom so the same logo can be reused on the login,
 * register and splash screens without duplicating markup.
 */
export function BrandMark({ size = 72 }: BrandMarkProps) {
  // The inner ring keeps a fixed ratio relative to the outer square.
  const ring = Math.round(size * 0.58);

  return (
    <View
      style={[
        styles.square,
        { width: size, height: size, borderRadius: radius.lg },
      ]}
    >
      <View
        style={[
          styles.ring,
          { width: ring, height: ring, borderRadius: radius.pill },
        ]}
      >
        <Text style={[styles.letter, { fontSize: Math.round(size * 0.29) }]}>
          M
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft green-tinted shadow, matching the design's elevation.
    shadowColor: '#003C14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  ring: {
    borderWidth: 2.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: colors.white,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
});
