import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { getRepositories } from '@/services/container';
import { NewRecurring, Recurring } from '@/services/recurrings/recurring.types';

/** Clave de caché de la lista de recurrentes. */
const RECURRINGS_KEY = ['recurrings'] as const;

/** Query con la lista de recurrentes. */
export function useRecurrings(): UseQueryResult<Recurring[], Error> {
  return useQuery({
    queryKey: RECURRINGS_KEY,
    queryFn: () => getRepositories().recurrings.list(),
  });
}

/** Mutación para crear un recurrente. */
export function useAddRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewRecurring) =>
      getRepositories().recurrings.add(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRINGS_KEY }),
  });
}

/** Mutación para editar un recurrente. */
export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NewRecurring }) =>
      getRepositories().recurrings.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRINGS_KEY }),
  });
}

/**
 * Mutación para ajustar el importe previsto.
 *
 * Se usa al registrar con un valor distinto al previsto: el recurrente aprende
 * el importe nuevo para que la próxima vez venga ya con ese valor.
 */
export function useUpdateRecurringAmount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      getRepositories().recurrings.updateAmount(id, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRINGS_KEY }),
  });
}

/** Mutación para activar o pausar un recurrente. */
export function useSetRecurringActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      getRepositories().recurrings.setActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRINGS_KEY }),
  });
}
