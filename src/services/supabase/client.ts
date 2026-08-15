// El polyfill de URL debe cargarse ANTES de crear el cliente: supabase-js usa la
// API `URL`, que React Native no trae completa de fábrica.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from '@/config/supabase';

/**
 * Cliente único de Supabase para toda la app.
 *
 * - `storage: AsyncStorage` persiste la sesión en el dispositivo (sobrevive a
 *   cierres de la app).
 * - `autoRefreshToken` renueva el token de acceso antes de que expire.
 * - `detectSessionInUrl: false` porque en móvil no hay redirección por URL como
 *   en web.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
