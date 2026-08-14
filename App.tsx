import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthFlow} from '@/screens/auth/AuthFlow';
import {MainNavigator} from '@/navigation/MainNavigator';
import {AnimatedSplash} from '@/components/organisms/AnimatedSplash';
import {QueryProvider} from '@/services/react-query/QueryProvider';
import {useLoginMutation, useRegisterMutation} from '@/services/auth/auth.queries';
import {selectIsAuthenticated, useAuthStore} from '@/store/authStore';
import {LoginCredentials} from '@/hooks/useLoginForm';
import {RegisterData} from '@/hooks/useRegisterForm';
import {
   useFonts,
   Sora_600SemiBold,
   Sora_700Bold,
   Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import {colors} from '@/theme';

// Mantenemos visible el splash nativo (estático) hasta que estemos listos para
// entregar el control a nuestro splash animado, evitando un parpadeo en blanco.
SplashScreen.preventAutoHideAsync();

/**
 * Contenido de la app.
 *
 * Vive por debajo de {@link QueryProvider}, por lo que puede usar las
 * mutaciones de TanStack Query. Decide qué mostrar según la sesión global
 * (Zustand): el flujo de autenticación o la pantalla autenticada.
 */
function AppContent() {
   const [isSplashVisible, setSplashVisible] = useState(true);
   const isAuthenticated = useAuthStore(selectIsAuthenticated);
   const loginMutation = useLoginMutation();
   const registerMutation = useRegisterMutation();

   // Ocultamos el splash nativo en cuanto monta el JS para que nuestro splash
   // animado, que comparte el mismo fondo, tome el relevo sin costura visible.
   useEffect(() => {
      SplashScreen.hideAsync();
   }, []);

   // Delegamos en las mutaciones y dejamos que el error se propague (el
   // formulario lo mostrará). Al tener éxito, la sesión se guarda en Zustand y la
   // UI cambia sola a la pantalla autenticada.
   const handleLogin = useCallback(async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
   }, [loginMutation]);

   const handleRegister = useCallback(async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
   }, [registerMutation]);

   return (
      <View style={styles.root}>
         {isAuthenticated ? (
            <MainNavigator/>
         ) : (
            <AuthFlow
               onLogin={handleLogin}
               onRegister={handleRegister}
               onBiometricLogin={() => console.log('inicio de sesión biométrico')}
            />
         )}

         {isSplashVisible && (
            <AnimatedSplash onFinish={() => setSplashVisible(false)}/>
         )}
      </View>
   );
}

/**
 * Raíz de la app.
 *
 * Secuencia de arranque: splash nativo → splash animado → flujo de
 * autenticación. Aquí solo se montan los proveedores globales (áreas seguras y
 * estado del servidor con TanStack Query); el estado global de sesión vive en
 * Zustand.
 */
export default function App() {
   // Cargamos la tipografía Sora antes de renderizar. Mientras tanto, el splash
   // nativo permanece visible (preventAutoHideAsync), de modo que nuestro splash
   // animado ya dispone de la fuente cuando aparece.
   const [fontsLoaded] = useFonts({
      Sora_600SemiBold,
      Sora_700Bold,
      Sora_800ExtraBold,
   });

   if (!fontsLoaded) {
      return null;
   }

   return (
      <SafeAreaProvider>
         <QueryProvider>
            <AppContent/>
         </QueryProvider>
      </SafeAreaProvider>
   );
}

const styles = StyleSheet.create({
   root: {
      flex: 1,
      backgroundColor: colors.background,
   },
});
