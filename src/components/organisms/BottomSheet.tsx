import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardEvent,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';

interface BottomSheetProps {
  /** Si la hoja está visible. */
  visible: boolean;
  /** Se ejecuta al cerrar (tocar el fondo o deslizar). */
  onClose: () => void;
  /** Contenido de la hoja. */
  children: React.ReactNode;
}

/** Desplazamiento inicial (fuera de pantalla) antes de medir la altura real. */
const INITIAL_OFFSET = 800;

/**
 * Hoja inferior modal reutilizable (organismo).
 *
 * Muestra su contenido en una tarjeta que sube desde abajo con un fondo oscuro
 * que se desvanece; tocar el fondo la cierra. Anima tanto la entrada como la
 * salida (por eso se mantiene montada hasta terminar de cerrarse) y respeta el
 * área segura inferior. Se usará para "Nueva categoría", "Nueva cuenta",
 * "Nuevo movimiento", etc.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  // Se mantiene montado mientras la animación de salida ocurre.
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(INITIAL_OFFSET)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  // Desplazamiento vertical para levantar la hoja por encima del teclado.
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  // Altura medida de la hoja, para animar la salida exactamente esa distancia.
  const sheetHeight = useRef(INITIAL_OFFSET);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Entramos: subimos la hoja y oscurecemos el fondo.
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.bezier(0.32, 0.72, 0, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    // Salimos: bajamos la hoja y aclaramos el fondo, luego desmontamos.
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight.current,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, translateY, backdrop]);

  // Levantamos la hoja cuando aparece el teclado, para que el campo enfocado
  // quede siempre visible por encima de él.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      const height = event.endCoordinates?.height ?? 0;
      Animated.timing(keyboardOffset, {
        // El área segura inferior ya la cubre el teclado; no la contamos doble.
        toValue: Math.max(0, height - insets.bottom),
        duration: event.duration || 250,
        useNativeDriver: true,
      }).start();
    };
    const onHide = (event: KeyboardEvent) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: event.duration || 200,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset, insets.bottom]);

  // Al conocer la altura real, la usamos como distancia de salida.
  const handleLayout = (e: LayoutChangeEvent) => {
    sheetHeight.current = e.nativeEvent.layout.height;
  };

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={styles.backdropPress} onPress={onClose} />
        </Animated.View>

        <Animated.View
          onLayout={handleLayout}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) },
            {
              // La entrada/salida y el desplazamiento por teclado se combinan.
              transform: [
                { translateY },
                { translateY: Animated.multiply(keyboardOffset, -1) },
              ],
            },
          ]}
        >
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    // Sombra superior de la hoja.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 16,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(60,60,67,0.25)',
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: spacing.md,
  },
});
