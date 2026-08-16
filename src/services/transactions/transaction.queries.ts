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
  MonthSummary,
  NewTransaction,
  NewTransfer,
  Transaction,
} from '@/services/transactions/transaction.types';
import {
  formatMonthYear,
  lastMonthsRange,
  lastMonthStarts,
  monthRange,
  monthShort,
} from '@/utils/date';
import { useMonthNames } from '@/hooks/useMonthNames';

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
 * Resumen de ingresos y egresos de los últimos meses.
 *
 * Se agrupa en el cliente, y no en el servidor, para que el corte de mes sea el
 * mismo que usa el resto de la app: aquí los meses se calculan en hora local,
 * mientras que agrupar en la base lo haría en UTC y un movimiento de la última
 * noche del mes caería en el siguiente, descuadrando el histórico respecto al
 * resumen.
 *
 * Los meses anteriores al primer movimiento se omiten: a una cuenta recién
 * creada no le aporta ver medio año en blanco.
 */
export function useMonthlyHistory(
  count: number,
): UseQueryResult<MonthSummary[], Error> {
  const months = useMonthNames();
  const range = useMemo(() => lastMonthsRange(count), [count]);
  const starts = useMemo(() => lastMonthStarts(count), [count]);

  return useQuery({
    // El idioma entra en la clave: si cambia, los nombres de mes en caché
    // (`name`/`short`) quedarían en el idioma anterior sin este recálculo.
    queryKey: ['transactions', 'history', range.from, count, months.long[0]],
    queryFn: async () => {
      const transactions = await getRepositories().transactions.list(range);

      // Todos los meses del eje arrancan en cero: los que no tengan movimientos
      // deben verse vacíos, no desaparecer del gráfico.
      const byMonth = new Map<number, MonthSummary>(
        starts.map((start) => [
          start,
          {
            start,
            name: formatMonthYear(start, months),
            short: monthShort(start, months),
            income: 0,
            expense: 0,
          },
        ]),
      );

      for (const t of transactions) {
        // Una transferencia no es ingreso ni egreso: el dinero solo cambia de
        // cuenta, así que sumarla inflaría ambos lados del histórico.
        if (t.isTransfer) continue;
        const month = byMonth.get(monthRange(t.date).from);
        if (!month) continue;
        if (t.amount > 0) {
          month.income += t.amount;
        } else {
          month.expense += Math.abs(t.amount);
        }
      }

      const summaries = [...byMonth.values()];
      const firstWithData = summaries.findIndex((m) => m.income > 0 || m.expense > 0);
      // Sin ningún movimiento se deja solo el mes en curso.
      return firstWithData === -1 ? summaries.slice(-1) : summaries.slice(firstWithData);
    },
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

/** Mutación para transferir dinero entre dos cuentas propias. */
export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTransfer) =>
      getRepositories().transactions.transfer(input),
    onSuccess: () => refreshAfterChange(queryClient),
  });
}

/** Mutación para eliminar las dos mitades de una transferencia. */
export function useRemoveTransferGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      getRepositories().transactions.removeTransferGroup(groupId),
    onSuccess: () => refreshAfterChange(queryClient),
  });
}
