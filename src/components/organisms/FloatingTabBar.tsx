import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { TransferIcon } from '@/components/icons/TransferIcon';
import { IconProps } from '@/components/icons/types';
import { colors, radius, spacing, typography } from '@/theme';

/** Configuración de un tab de la barra de navegación. */
export interface TabItemConfig {
  /** Identificador único del tab (coincide con la pantalla que muestra). */
  id: string;
  /** Etiqueta bajo el ícono. */
  label: string;
  /** Componente de ícono a renderizar. */
  Icon: React.ComponentType<IconProps>;
}

interface FloatingTabBarProps {
  /** Tabs a mostrar, en orden. */
  tabs: TabItemConfig[];
  /** Id del tab activo. */
  activeId: string;
  /** Se ejecuta al seleccionar un tab. */
  onSelect: (id: string) => void;
  /** Se ejecuta al elegir "Movimiento" en el menú del botón "+". */
  onNewTransaction: () => void;
  /** Se ejecuta al elegir "Transferencia" en el menú del botón "+". */
  onNewTransfer: () => void;
}

/**
 * Barra de navegación flotante (organismo).
 *
 * Reproduce el diseño: una barra inferior translúcida con efecto "frosted"
 * ({@link BlurView}) que muestra 4 tabs (ícono + etiqueta), y un botón de
 * acción flotante "+" a la derecha. Al pulsarlo, en vez de abrir un modal,
 * el propio "+" gira y se convierte en una "×" mientras dos mini-botones
 * circulares (con su leyenda flotando a la izquierda) aparecen encima suyo —
 * todo dentro de esta misma vista, sin `Modal` ni hoja inferior de por medio.
 */
export function FloatingTabBar({
  tabs,
  activeId,
  onSelect,
  onNewTransaction,
  onNewTransfer,
}: FloatingTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Escala animada para la micro-interacción del botón "+".
  const fabScale = useRef(new Animated.Value(1)).current;
  // 0 = cerrado (ícono "+"), 1 = abierto (ícono "×" y opciones visibles).
  const menuProgress = useRef(new Animated.Value(0)).current;
  const [menuOpen, setMenuOpen] = useState(false);

  const animateFab = (toValue: number) => {
    Animated.spring(fabScale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    Animated.timing(menuProgress, {
      toValue: next ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    Animated.timing(menuProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const fabRotate = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
      pointerEvents="box-none"
    >
      {/* Botón flotante "+" y sus dos opciones, ancladas al mismo grupo. */}
      <View style={styles.fabGroup} pointerEvents="box-none">
        {/* Opción: nuevo movimiento */}
        <Animated.View
          pointerEvents={menuOpen ? 'auto' : 'none'}
          style={[
            styles.option,
            styles.optionFirst,
            {
              opacity: menuProgress,
              transform: [
                {
                  translateY: menuProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
                {
                  scale: menuProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.optionLabel}>
            <Text style={styles.optionLabelText} numberOfLines={1}>
              {t('movements.addMenu.newTransactionShort')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.newTransaction')}
            onPress={() => {
              closeMenu();
              onNewTransaction();
            }}
            style={({ pressed }) => [
              styles.optionCircle,
              pressed && styles.optionCirclePressed,
            ]}
          >
            <PlusIcon size={20} color={colors.white} />
          </Pressable>
        </Animated.View>

        {/* Opción: transferencia entre cuentas */}
        <Animated.View
          pointerEvents={menuOpen ? 'auto' : 'none'}
          style={[
            styles.option,
            styles.optionSecond,
            {
              opacity: menuProgress.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0, 0, 1],
              }),
              transform: [
                {
                  translateY: menuProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
                {
                  scale: menuProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.optionLabel}>
            <Text style={styles.optionLabelText} numberOfLines={1}>
              {t('movements.addMenu.transferLabel')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('movements.transferModal.title')}
            onPress={() => {
              closeMenu();
              onNewTransfer();
            }}
            style={({ pressed }) => [
              styles.optionCircle,
              pressed && styles.optionCirclePressed,
            ]}
          >
            <TransferIcon size={19} color={colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('accessibility.addMenu')}
            onPress={toggleMenu}
            onPressIn={() => animateFab(0.92)}
            onPressOut={() => animateFab(1)}
            style={styles.fab}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
              <PlusIcon />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Pill flotante: la sombra va en el contenedor y el blur, recortado, dentro */}
      <View style={styles.pillShadow}>
        <BlurView intensity={50} tint="light" style={styles.pill}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            const color = isActive ? colors.accent : colors.tabInactive;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
                onPress={() => onSelect(tab.id)}
                style={styles.tab}
              >
                <tab.Icon size={26} color={color} />
                <Text
                  style={[
                    styles.label,
                    { color, fontWeight: isActive ? '600' : '500' },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const PILL_RADIUS = 32;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    // El pill se separa de los bordes; el margen inferior respeta el área segura.
    paddingHorizontal: spacing.lg,
  },
  pillShadow: {
    borderRadius: PILL_RADIUS,
    // Respaldo translúcido (también permite que la sombra se dibuje).
    backgroundColor: colors.tabBarBackground,
    // Sombra suave del pill flotante, como en el diseño.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  pill: {
    flexDirection: 'row',
    borderRadius: PILL_RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tabBarBorder,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  label: {
    ...typography.caption,
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  fabGroup: {
    position: 'absolute',
    right: 32,
    top: -72,
    // Ancho fijo (igual al del "+"): sin esto, las opciones —más anchas que
    // el botón, por su leyenda— inflan el ancho intrínseco de este
    // contenedor, y todo el grupo (incluido el "+") se corre hacia la derecha.
    width: 60,
  },
  fabWrapper: {
    // Dentro de fabGroup, en el origen (0,0): las opciones se anclan a este
    // mismo punto para crecer hacia arriba desde el botón.
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra verde más marcada, como en el diseño.
    shadowColor: '#003C14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  // Cada opción es una fila: leyenda a la izquierda, círculo con ícono a la
  // derecha. El círculo mide 44 y el "+" 60, así que se centra respecto a él
  // desplazándolo 8 a la derecha: (60 - 44) / 2.
  option: {
    position: 'absolute',
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // La fila crece hacia la izquierda desde su borde derecho, sin arrastrar
    // el ancho del contenedor (que está fijo al del "+").
    justifyContent: 'flex-end',
    // El contenedor mide 60 (lo del "+"), pero la leyenda es más ancha: sin
    // este ancho propio, el texto se comprime y se corta con puntos suspensivos.
    width: 240,
  },
  optionFirst: {
    bottom: 72,
  },
  optionSecond: {
    bottom: 132,
  },
  optionLabel: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  optionLabelText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  optionCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003C14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  optionCirclePressed: {
    backgroundColor: colors.accentDark,
  },
});
