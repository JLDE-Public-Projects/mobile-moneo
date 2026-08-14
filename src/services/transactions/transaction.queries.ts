import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { getRepositories } from '@/services/container';
import {
  NewTransaction,
  Transaction,
} from '@/services/transactions/transaction.types';

/** Clave de caché de la lista de movimientos. */
const TRANSACTIONS_KEY = ['transactions'] as const;

/**
 * Query con la lista de movimientos. Obtiene la implementación activa del
 * repositorio desde el contenedor (no sabe si es SQLite o API).
 */
export function useTransactions(): UseQueryResult<Transaction[], Error> {
  return useQuery({
    queryKey: TRANSACTIONS_KEY,
    queryFn: () => getRepositories().transactions.list(),
  });
}

/**
 * Mutación para crear un movimiento; refresca la lista al terminar (con lo que
 * se actualizan solos el resumen y los gastos).
 */
export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTransaction) =>
      getRepositories().transactions.add(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
}
