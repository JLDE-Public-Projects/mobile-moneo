import { useMemo } from 'react';
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
 * Mutación para crear un movimiento; refresca la lista al terminar (con lo que
 * se actualizan solos el resumen y los gastos).
 */
export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTransaction) =>
      getRepositories().transactions.add(input),
    onSuccess: () => {
      // Se invalida por prefijo para refrescar cualquier mes en caché: un
      // movimiento con fecha de otro mes también debe verse reflejado.
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // El servidor ajusta el saldo de la cuenta al registrar el movimiento,
      // así que hay que releerlas o seguirían mostrando el saldo anterior.
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
