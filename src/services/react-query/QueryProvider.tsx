import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/react-query/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provee el cliente de TanStack Query a todo el árbol de la app.
 *
 * Debe envolver cualquier componente que use hooks de queries/mutaciones.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
