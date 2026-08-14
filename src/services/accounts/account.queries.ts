import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { getRepositories } from '@/services/container';
import { Account, NewAccount } from '@/services/accounts/account.types';

/** Clave de caché de la lista de cuentas. */
const ACCOUNTS_KEY = ['accounts'] as const;

/**
 * Query con la lista de cuentas. Obtiene la implementación activa del
 * repositorio desde el contenedor (no sabe si es SQLite o API).
 */
export function useAccounts(): UseQueryResult<Account[], Error> {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: () => getRepositories().accounts.list(),
  });
}

/** Mutación para crear una cuenta; refresca la lista al terminar. */
export function useAddAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAccount) => getRepositories().accounts.add(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}
