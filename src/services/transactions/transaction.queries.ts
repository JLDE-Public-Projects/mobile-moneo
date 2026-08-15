import { useMemo } from 'react';
import {
  QueryClient,
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
import { monthRange } from '@/utils/date';

/** Clave de caché de los movimientos de un mes. */
function transactionsKey(from: number) {
  return ['transactions', from] as const;
}

/**
 * Query con los movimientos del mes en curso.
 *
 * Moneo trabaja mes a mes, así que este hook es el único punto que decide qué
 * mes se pide; todas las pantallas que lo usan (resumen, movimientos, gastos,
 * presupuesto, detalle de categoría, recurrentes) hablan del mismo periodo sin
 * tener que filtrar por su cuenta.
 */
export function useTransactions(): UseQueryResult<Transaction[], Error> {
  // El rango se calcula una vez por render y solo cambia al cambiar de mes.
  const range = useMemo(() => monthRange(), []);

  return useQuery({
    queryKey: transactionsKey(range.from),
    queryFn: () => getRepositories().transactions.list(range),
  });
}

/**
 * Refresca lo que depende de los movimientos tras crear, editar o eliminar uno.
 *
 * Se invalida por prefijo para alcanzar cualquier mes en caché, ya que un
 * movimiento puede tener fecha de otro mes. Las cuentas también se releen: su
 * saldo lo ajusta el servidor con cada cambio, y si no se refrescan seguirían
 * mostrando el importe anterior.
 */
function refreshAfterChange(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['accounts'] });
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
    onSuccess: () => refreshAfterChange(queryClient),
  });
}

/** Mutación para editar un movimiento. */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewTransaction }) =>
      getRepositories().transactions.update(id, input),
    onSuccess: () => refreshAfterChange(queryClient),
  });
}

/** Mutación para eliminar un movimiento. */
export function useRemoveTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getRepositories().transactions.remove(id),
    onSuccess: () => refreshAfterChange(queryClient),
  });
}
