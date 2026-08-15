import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { AuthSession } from '@/services/auth/auth.types';
import { useAuthStore } from '@/store/authStore';

/** Convierte la sesión de Supabase en la sesión del dominio (o null). */
function toDomainSession(session: Session | null): AuthSession | null {
  if (!session) return null;
  const meta = session.user.user_metadata ?? {};
  return {
    token: session.access_token,
    user: {
      id: session.user.id,
      username: (meta.username as string) ?? '',
      name: (meta.name as string) ?? '',
    },
  };
}

/**
 * Conecta la sesión de Supabase con el store global (Zustand).
 *
 * Al arrancar restaura la sesión persistida en el dispositivo y se suscribe a
 * los cambios (login, logout, refresco de token), reflejándolos en el store. Se
 * llama una vez al montar la app; devuelve una función para cancelar la
 * suscripción.
 */
export function initAuthSession(): () => void {
  // Restauración inicial de la sesión guardada (sesión persistente).
  supabase.auth.getSession().then(({ data }) => {
    const session = toDomainSession(data.session);
    if (session) {
      useAuthStore.getState().setSession(session);
    }
  });

  // A partir de aquí, la fuente de verdad es Supabase: cualquier cambio de
  // sesión (incluido el logout) se propaga solo al store.
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const domainSession = toDomainSession(session);
    if (domainSession) {
      useAuthStore.getState().setSession(domainSession);
    } else {
      useAuthStore.getState().clearSession();
    }
  });

  return () => data.subscription.unsubscribe();
}

/** Cierra la sesión en Supabase; el listener limpiará el store. */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
