/**
 * Modelos del dominio de categorías.
 *
 * Una categoría clasifica los movimientos como egreso o ingreso. Se persisten
 * localmente y, más adelante, podrán sincronizarse con una API sin cambiar la
 * interfaz del repositorio.
 */

/** Tipo de categoría según afecte el balance. */
export type CategoryType = 'expense' | 'income';

/** Categoría almacenada. */
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  /** Color de la etiqueta, en hex. */
  color: string;
  /** Límite de presupuesto mensual; 0 = sin límite. */
  budget: number;
  createdAt: number;
}

/** Datos para crear una categoría nueva. */
export interface NewCategory {
  name: string;
  type: CategoryType;
  color: string;
}
