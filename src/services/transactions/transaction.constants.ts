import { TFunction } from 'i18next';
import { DEFAULT_CATEGORIES } from '@/services/categories/category.constants';
import { SegmentOption } from '@/components/molecules/SegmentedControl';
import { Transaction, TransactionFilter } from '@/services/transactions/transaction.types';

/**
 * Opciones del filtro de movimientos (control segmentado).
 *
 * Es una función y no una constante de módulo porque sus etiquetas dependen
 * del idioma activo.
 */
export function transactionFilterOptions(t: TFunction): SegmentOption<TransactionFilter>[] {
  return [
    { value: 'all', label: t('transactionFilters.all') },
    { value: 'expense', label: t('transactionFilters.expense') },
    { value: 'income', label: t('transactionFilters.income') },
  ];
}

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

/**
 * Deja una sola fila por transferencia en las listas globales.
 *
 * Una transferencia son dos movimientos —el egreso de la cuenta de origen y
 * el ingreso en la de destino— porque cada cuenta necesita el suyo para que
 * su saldo cuadre. Pero en una lista que mezcla todas las cuentas, ver las
 * dos mitades se lee como un duplicado, así que se conserva solo la de
 * salida: `transferDisplay` la muestra ya con origen y destino.
 */
export function collapseTransfers(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => !t.isTransfer || t.amount < 0);
}

/**
 * Título y subtítulo con los que se muestra una transferencia en las listas.
 *
 * Se aplica sobre la mitad de salida (la que sobrevive a
 * {@link collapseTransfers}): ahí `account` es la cuenta de origen y `note`
 * la de destino —lo deja así `create_transfer` al insertar—, de modo que una
 * sola fila cuenta el viaje completo del dinero.
 */
export function transferDisplay(
  tx: Pick<Transaction, 'amount' | 'account' | 'note'>,
  t: TFunction,
): { title: string; subtitle: string } {
  return {
    title: t('movements.transfer.label'),
    subtitle:
      tx.amount < 0
        ? t('movements.transfer.route', { from: tx.account, to: tx.note })
        : t('movements.transfer.from', { account: tx.note }),
  };
}

// Nota: aquí vivía la semilla de movimientos de demostración (agosto de 2026).
// Se retiró al migrar a Supabase: cada cuenta empieza sin movimientos y la
// pantalla muestra su estado vacío, que es la lectura correcta para un usuario
// que todavía no ha registrado nada.
