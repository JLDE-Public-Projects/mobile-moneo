import { DEFAULT_CATEGORIES } from '@/services/categories/category.constants';
import { SegmentOption } from '@/components/molecules/SegmentedControl';
import { TransactionFilter } from '@/services/transactions/transaction.types';

/** Opciones del filtro de movimientos (control segmentado). */
export const TRANSACTION_FILTERS: SegmentOption<TransactionFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'expense', label: 'Egresos' },
  { value: 'income', label: 'Ingresos' },
];

/** Color de respaldo cuando una categoría no se encuentra. */
const FALLBACK_COLOR = '#B4BFCA';

/** Mapa nombre de categoría → color, para denormalizar en la semilla. */
const CATEGORY_COLOR_BY_NAME: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.name, c.color]),
);

/** Devuelve el color de una categoría por nombre (o el de respaldo). */
export function categoryColorByName(name: string): string {
  return CATEGORY_COLOR_BY_NAME[name] ?? FALLBACK_COLOR;
}

// Nota: aquí vivía la semilla de movimientos de demostración (agosto de 2026).
// Se retiró al migrar a Supabase: cada cuenta empieza sin movimientos y la
// pantalla muestra su estado vacío, que es la lectura correcta para un usuario
// que todavía no ha registrado nada.
