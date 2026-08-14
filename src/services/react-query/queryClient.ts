import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente único de TanStack Query para toda la app.
 *
 * TanStack Query gestiona el estado del SERVIDOR (peticiones, caché, reintentos)
 * y se mantiene separado del estado global de UI/sesión, que vive en Zustand.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Un reintento ante fallos de red transitorios; evita bucles agresivos.
      retry: 1,
      // Datos frescos durante 30 s antes de considerarlos obsoletos.
      staleTime: 30_000,
    },
    mutations: {
      // Las mutaciones (login/registro) no se reintentan solas.
      retry: 0,
    },
  },
});
