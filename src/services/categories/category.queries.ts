import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { getRepositories } from '@/services/container';
import { Category, NewCategory } from '@/services/categories/category.types';

/** Clave de caché de la lista de categorías. */
const CATEGORIES_KEY = ['categories'] as const;

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

/** Mutación para eliminar una categoría; refresca la lista al terminar. */
export function useRemoveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getRepositories().categories.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

/** Mutación para ajustar el presupuesto de una categoría. */
export function useUpdateCategoryBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, budget }: { id: string; budget: number }) =>
      getRepositories().categories.updateBudget(id, budget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
