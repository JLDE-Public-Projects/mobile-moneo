import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { getRepositories } from '@/services/container';
import { Category, NewCategory } from '@/services/categories/category.types';

/** Clave de caché de la lista de categorías. */
export const CATEGORIES_KEY = ['categories'] as const;

/**
 * Query con la lista de categorías. Obtiene la implementación activa del
 * repositorio desde el contenedor (no sabe si es SQLite o API).
 */
export function useCategories(): UseQueryResult<Category[], Error> {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => getRepositories().categories.list(),
  });
}

/** Mutación para crear una categoría; refresca la lista al terminar. */
export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewCategory) => getRepositories().categories.add(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

/** Nombres de categorías con al menos un movimiento registrado. */
export function useUsedCategoryNames(): UseQueryResult<Set<string>, Error> {
  return useQuery({
    queryKey: ['categories', 'usedNames'],
    queryFn: () => getRepositories().categories.usedNames(),
  });
}

/** Mutación para eliminar una categoría; refresca la lista al terminar. */
export function useRemoveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getRepositories().categories.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

/**
 * Mutación para ajustar el presupuesto de una categoría.
 *
 * Se actualiza la caché antes de que responda el servidor: el límite se edita a
 * toques y esperar el viaje de red en cada uno haría sentir la pantalla trabada.
 * Si la escritura falla se restaura el valor anterior y se relee del servidor.
 */
export function useUpdateCategoryBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, budget }: { id: string; budget: number }) =>
      getRepositories().categories.updateBudget(id, budget),

    onMutate: async ({ id, budget }) => {
      // Evita que una lectura en vuelo pise el valor recién ajustado.
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });

      const previous = queryClient.getQueryData<Category[]>(CATEGORIES_KEY);
      queryClient.setQueryData<Category[]>(CATEGORIES_KEY, (current) =>
        current?.map((c) => (c.id === id ? { ...c, budget } : c)),
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_KEY, context.previous);
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
