import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface RecurringRowProps {
  /** Color de la categoría; se ignora (queda gris) si `muted`. */
  color: string;
  /** Nombre del recurrente. */
  name: string;
  /** Importe ya formateado (sin signo: lo decide `amountVariant`). */
  amount: string;
  /** 'income' lo pinta verde; 'muted' gris; por defecto, el color de texto normal. */
  amountVariant?: 'default' | 'income' | 'muted';
  /** Texto bajo el nombre (vencimiento, "cada día X", fecha de pago...). */
  subtitle: string;
  /** Vencido: pinta el subtítulo en rojo. */
  subtitleOverdue?: boolean;
  /** Atenúa nombre y cuadro de color: para recurrentes pausados. */
  muted?: boolean;
  /** Etiqueta y acción de "Pausar" bajo el subtítulo (solo filas pendientes). */
  pauseLabel?: string;
  onPause?: () => void;
  /** Accesorio bajo el importe: botón "Registrar"/"Reanudar", o un check. */
  trailing: React.ReactNode;
  /** Dibuja una línea separadora inferior. */
  showSeparator?: boolean;
}

/**
 * Fila de un recurrente en Recurrentes (molécula).
 *
 * Diseño en dos columnas apiladas verticalmente en vez de una sola línea:
 * a la izquierda nombre + subtítulo + "Pausar" (cada uno en su propia línea,
 * con todo el ancho disponible), a la derecha el importe y el accesorio
 * (botón/check) alineados y apilados. Antes nombre e importe compartían
 * línea y subtítulo y "Pausar" también, lo que con textos largos o pantallas
 * angostas los recortaba con "…" y los desalineaba. Al no competir por
 * ancho horizontal, ningún texto necesita truncarse.
 */
export function RecurringRow({
  color,
  name,
  amount,
  amountVariant = 'default',
  subtitle,
  subtitleOverdue = false,
  muted = false,
  pauseLabel,
  onPause,
  trailing,
  showSeparator = false,
}: RecurringRowProps) {
  return (
    <View style={[styles.row, showSeparator && styles.rowBorder]}>
      <View style={[styles.swatch, { backgroundColor: muted ? colors.disabledFill : color }]} />
      <View style={styles.left}>
        <Text style={[styles.name, muted && styles.nameMuted]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.subRow}>
          <Text
            style={[
              styles.sub,
              styles.subGrow,
              muted && styles.subMuted,
              subtitleOverdue && styles.subOverdue,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
          {onPause && (
            <Pressable
              onPress={onPause}
              hitSlop={6}
              style={({ pressed }) => [styles.pauseChip, pressed && styles.pressed]}
            >
              <Text style={styles.pauseChipText}>{pauseLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            amountVariant === 'income' && styles.amountIncome,
            amountVariant === 'muted' && styles.amountMuted,
          ]}
          numberOfLines={1}
        >
          {amount}
        </Text>
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    marginTop: 2,
  },
  left: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
  },
  nameMuted: {
    color: colors.textTertiary,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subGrow: {
    flexShrink: 1,
    minWidth: 0,
  },
  subOverdue: {
    color: colors.negative,
  },
  subMuted: {
    color: colors.textTertiary,
  },
  pauseChip: {
    flexShrink: 0,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.disabledFill,
  },
  pauseChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amountIncome: {
    color: colors.positive,
  },
  amountMuted: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
