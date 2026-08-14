import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon } from '@/components/icons/PlusIcon';
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
  /** Se ejecuta al pulsar el botón flotante "+". */
  onAdd: () => void;
}

/**
 * Barra de navegación flotante (organismo).
 *
 * Reproduce el diseño: una barra inferior translúcida con efecto "frosted"
 * ({@link BlurView}) que muestra 4 tabs (ícono + etiqueta), y un botón de acción
 * flotante "+" a la derecha para crear un movimiento. Se superpone al contenido
 * (las pantallas dejan espacio inferior para no quedar ocultas) y respeta el
 * área segura inferior del dispositivo.
 */
export function FloatingTabBar({
  tabs,
  activeId,
  onSelect,
  onAdd,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  // Escala animada para la micro-interacción del botón "+".
  const fabScale = useRef(new Animated.Value(1)).current;

  const animateFab = (toValue: number) => {
    Animated.spring(fabScale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
      pointerEvents="box-none"
    >
      {/* Botón flotante "+" */}
      <Animated.View
        style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nuevo movimiento"
          onPress={onAdd}
          onPressIn={() => animateFab(0.92)}
          onPressOut={() => animateFab(1)}
          style={styles.fab}
        >
          <PlusIcon />
        </Pressable>
      </Animated.View>

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
  fabWrapper: {
    position: 'absolute',
    right: 32,
    top: -72,
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
});
