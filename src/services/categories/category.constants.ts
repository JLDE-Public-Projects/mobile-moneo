import { COLOR_PALETTE } from '@/config/palette';
import { CategoryType } from '@/services/categories/category.types';

/** Paleta de colores disponible al crear una categoría. */
export const CATEGORY_PALETTE = COLOR_PALETTE;

/** Color preseleccionado en el picker de nueva categoría. */
export const DEFAULT_CATEGORY_COLOR = COLOR_PALETTE[6];

/** Semilla de categoría por defecto (sin id ni fecha; se asignan al sembrar). */
interface CategorySeed {
  name: string;
  type: CategoryType;
  color: string;
  /** Presupuesto mensual por defecto; 0 = sin límite. */
  budget: number;
}

/**
 * Categorías con las que arranca la app la primera vez, tomadas del diseño
 * (con sus presupuestos por defecto para egresos; los ingresos van sin límite).
 */
export const DEFAULT_CATEGORIES: CategorySeed[] = [
  { name: 'Arriendo', type: 'expense', color: '#89A4DE', budget: 1800000 },
  { name: 'Mercado', type: 'expense', color: '#76C479', budget: 800000 },
  { name: 'Transporte', type: 'expense', color: '#D78951', budget: 400000 },
  { name: 'Suscripciones', type: 'expense', color: '#C480D4', budget: 150000 },
  { name: 'Salud', type: 'expense', color: '#CA8377', budget: 500000 },
  { name: 'Ahorros', type: 'expense', color: '#60AD64', budget: 800000 },
  { name: 'Inversiones', type: 'expense', color: '#48B7BD', budget: 250000 },
  { name: 'Salario', type: 'income', color: '#47944C', budget: 0 },
  { name: 'Freelance', type: 'income', color: '#4E9A52', budget: 0 },
];
