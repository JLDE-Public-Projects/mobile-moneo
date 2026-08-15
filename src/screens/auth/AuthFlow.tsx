import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, StyleSheet} from 'react-native';
import {LoginScreen} from '@/screens/auth/LoginScreen';
import {RegisterScreen} from '@/screens/auth/RegisterScreen';
import {LoginCredentials} from '@/hooks/useLoginForm';
import {RegisterData} from '@/hooks/useRegisterForm';

/** Pantallas que gestiona el flujo de autenticación. */
type AuthScreen = 'login' | 'register';

/** Callbacks que el flujo delega en su contenedor (App). */
interface AuthFlowProps {
   /** Autentica las credenciales; lanza para mostrar un error. */
   onLogin: (credentials: LoginCredentials) => Promise<void>;
   /** Crea la cuenta; lanza para mostrar un error. */
   onRegister: (data: RegisterData) => Promise<void>;
}

/**
 * Coordina las pantallas de login y registro y anima la transición entre ellas.
 *
 * Mantiene ambas pantallas montadas y superpuestas durante el cambio para
 * lograr un "cross-fade" con un leve deslizamiento horizontal: moderno, sutil y
 * sin dependencias de navegación. Al terminar la animación, la pantalla que
 * queda debajo se desmonta para no retener estado ni capturar toques.
 */
export function AuthFlow({onLogin, onRegister}: AuthFlowProps) {

   const [screen, setScreen] = useState<AuthScreen>('login');

   // Progreso 0 = login visible, 1 = registro visible.
   const progress = useRef(new Animated.Value(0)).current;

   // Controla qué pantallas se montan (ambas solo durante la transición).
         const [showLogin, setShowLogin] = useState(true);
         const [showRegister, setShowRegister] = useState(false);

         useEffect(() => {
         const goingToRegister = screen === 'register';

         // Aseguramos que la pantalla destino esté montada antes de animar.
         if (goingToRegister) setShowRegister(true);
         else setShowLogin(true);

         const animation = Animated.timing(progress, {
            toValue: goingToRegister ? 1 : 0,
         duration: 340,
         easing: Easing.inOut(Easing.cubic),
         useNativeDriver: true,
      });

      animation.start(({finished}) => {
         if (!finished) return;
         // Desmontamos la pantalla que ya no se ve.
         if (goingToRegister) setShowLogin(false);
         else setShowRegister(false);
      });

      return () => animation.stop();
   }, [screen, progress]);

   // El login se desvanece y se desliza ligeramente a la izquierda al salir.
   const loginStyle = {
      opacity: progress.interpolate({
         inputRange: [0, 1],
         outputRange: [1, 0],
      }),
      transform: [
         {
            translateX: progress.interpolate({
               inputRange: [0, 1],
               outputRange: [0, -24],
            }),
         },
      ],
   };

   // El registro entra desde la derecha mientras aparece.
   const registerStyle = {
      opacity: progress,
      transform: [
         {
            translateX: progress.interpolate({
               inputRange: [0, 1],
               outputRange: [24, 0],
            }),
         },
      ],
   };

   return (
      <>
         {showLogin && (
            <Animated.View
               style={[styles.layer, loginStyle]}
               // Mientras se va, no debe capturar toques.
               pointerEvents={screen === 'login' ? 'auto' : 'none'}
            >
               <LoginScreen
                  onLogin={onLogin}
                  onRegister={() => setScreen('register')}
               />
            </Animated.View>
         )}

         {showRegister && (
            <Animated.View
               style={[styles.layer, registerStyle]}
               pointerEvents={screen === 'register' ? 'auto' : 'none'}
            >
               <RegisterScreen
                  onRegister={onRegister}
                  onBackToLogin={() => setScreen('login')}
               />
            </Animated.View>
         )}
      </>
   );
}

const styles = StyleSheet.create({
   layer: {
      // Ambas pantallas ocupan todo el espacio y se superponen al transicionar.
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
});
