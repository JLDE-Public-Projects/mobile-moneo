import { create } from 'zustand';
import { AuthSession, AuthUser } from '@/services/auth/auth.types';

/** Forma del estado global de autenticación. */
interface AuthState {
  /** Sesión activa, o null si no hay usuario autenticado. */
  session: AuthSession | null;
  /** Guarda la sesión tras un login/registro correcto. */
  setSession: (session: AuthSession) => void;
  /** Actualiza los datos del usuario manteniendo el token de la sesión. */
  setUser: (user: AuthUser) => void;
  /** Cierra la sesión (logout). */
  clearSession: () => void;
}

/**
 * Store global de autenticación (Zustand).
 *
 * Zustand se usa para el estado GLOBAL de la app (sesión, y más adelante
 * preferencias del usuario), mientras que TanStack Query gestiona el estado del
 * servidor (peticiones, caché). Aquí solo vive lo que debe ser accesible desde
 * cualquier pantalla sin prop-drilling.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  setUser: (user) =>
    set((state) => (state.session ? { session: { ...state.session, user } } : state)),
  clearSession: () => set({ session: null }),
}));

/**
 * Selector: indica si hay una sesión activa.
 *
 * Se expone como función para usarlo con `useAuthStore(selectIsAuthenticated)`
 * y así re-renderizar solo cuando cambie este valor derivado.
 */
export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.session !== null;
