import { Category, NewCategory } from '@/services/categories/category.types';

/**
 * Contrato del repositorio de categorías (patrón Repository).
 *
 * Define las operaciones de gestión de categorías sin atarse a una tecnología
 * concreta. Hoy la implementación es SQLite local; mañana podría ser una API,
 * intercambiable desde `services/container.ts` sin tocar la UI.
 */
export interface CategoryRepository {
  /** Devuelve todas las categorías (egresos e ingresos). */
  list(): Promise<Category[]>;
  /** Crea una categoría y devuelve la creada. */
  add(input: NewCategory): Promise<Category>;
  /** Elimina una categoría por id. */
  remove(id: string): Promise<void>;
  /** Ajusta el presupuesto mensual de una categoría (mínimo 0). */
  updateBudget(id: string, budget: number): Promise<void>;
  /** Nombres de categorías con al menos un movimiento registrado. */
  usedNames(): Promise<Set<string>>;
}
