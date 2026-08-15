import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CATEGORIES_KEY,
  useUpdateCategoryBudget,
} from '@/services/categories/category.queries';
import { Category } from '@/services/categories/category.types';

/** Milisegundos de calma antes de escribir en el servidor. */
const WRITE_DELAY = 600;

/** Lo que la pantalla de presupuesto necesita para ajustar los límites. */
interface BudgetAdjuster {
  /** Ajusta el límite de una categoría sumando `delta` (nunca baja de 0). */
  adjust: (id: string, delta: number) => void;
}

/**
 * Ajusta presupuestos a toques sin castigar la red ni perder incrementos.
 *
 * El límite se edita pulsando repetidamente, así que enviar cada pulsación por
 * separado tendría dos problemas: una petición por toque, y respuestas que
 * pueden llegar desordenadas dejando guardado un valor que ya no corresponde.
 *
 * La solución separa lo que se ve de lo que se guarda: cada toque escribe el
 * valor nuevo en la caché al instante —de ahí lee la pantalla, así que responde
 * de inmediato— y la escritura al servidor se pospone hasta que los toques se
 * detienen, enviando una sola vez el valor final.
 */
export function useBudgetAdjuster(): BudgetAdjuster {
  const queryClient = useQueryClient();
  const updateBudget = useUpdateCategoryBudget();

  // Un temporizador por categoría: cada una se guarda por su cuenta.
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Al desmontar cancelamos lo que quede en el aire para no escribir sobre una
  // pantalla que ya no existe.
  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const adjust = useCallback(
    (id: string, delta: number) => {
      // El valor base sale de la caché, que ya incluye los toques anteriores:
      // así dos pulsaciones seguidas suman dos pasos y no se pisan entre sí.
      const categories = queryClient.getQueryData<Category[]>(CATEGORIES_KEY);
      const category = categories?.find((c) => c.id === id);
      if (!category) return;

      const next = Math.max(0, category.budget + delta);

      queryClient.setQueryData<Category[]>(CATEGORIES_KEY, (current) =>
        current?.map((c) => (c.id === id ? { ...c, budget: next } : c)),
      );

      const timer = timers.current.get(id);
      if (timer) {
        clearTimeout(timer);
      }

      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          updateBudget.mutate({ id, budget: next });
        }, WRITE_DELAY),
      );
    },
    [queryClient, updateBudget],
  );

  return { adjust };
}
