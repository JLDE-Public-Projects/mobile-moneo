import { DEFAULT_CATEGORIES } from '@/services/categories/category.constants';
import { SegmentOption } from '@/components/molecules/SegmentedControl';
import { NewTransaction, TransactionFilter } from '@/services/transactions/transaction.types';
import { RECURRING_IDS } from '@/services/recurrings/recurring.types';

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

/** Timestamp de un día de agosto de 2026 (mes de referencia del diseño). */
const augustDay = (day: number) => new Date(2026, 7, day).getTime();

/** Semilla de movimiento (día del mes + datos), sin id/color/fecha resueltos. */
interface TransactionSeed {
  day: number;
  category: string;
  note: string;
  account: string;
  amount: number;
  /** Recurrente que lo originó (marca el pago como hecho este mes). */
  recurringId?: string;
}

const SEED: TransactionSeed[] = [
  { day: 12, category: 'Arriendo', note: 'Arriendo agosto', account: 'Débito Bancolombia', amount: -1800000, recurringId: RECURRING_IDS.arriendo },
  { day: 11, category: 'Mercado', note: 'Éxito', account: 'Débito Bancolombia', amount: -248400 },
  { day: 11, category: 'Suscripciones', note: 'Spotify', account: 'Tarjeta Visa', amount: -26900, recurringId: RECURRING_IDS.spotify },
  { day: 10, category: 'Freelance', note: 'Proyecto Vuelto', account: 'Débito Bancolombia', amount: 1650000 },
  { day: 9, category: 'Transporte', note: 'Uber', account: 'Tarjeta Visa', amount: -18600 },
  { day: 8, category: 'Salud', note: 'EPS Sura', account: 'Débito Bancolombia', amount: -240000 },
  { day: 7, category: 'Mercado', note: 'D1', account: 'Efectivo', amount: -132000 },
  { day: 5, category: 'Ahorros', note: 'Fondo de emergencia', account: 'Ahorros Nu', amount: -800000, recurringId: RECURRING_IDS.fondo },
  { day: 5, category: 'Inversiones', note: 'ETF mensual', account: 'Débito Bancolombia', amount: -254000, recurringId: RECURRING_IDS.etf },
  { day: 4, category: 'Suscripciones', note: 'iCloud 2 TB', account: 'Tarjeta Visa', amount: -19900, recurringId: RECURRING_IDS.icloud },
  { day: 3, category: 'Transporte', note: 'Gasolina', account: 'Tarjeta Visa', amount: -291400 },
  { day: 3, category: 'Suscripciones', note: 'Netflix', account: 'Tarjeta Visa', amount: -64900, recurringId: RECURRING_IDS.netflix },
  { day: 2, category: 'Mercado', note: 'Carulla', account: 'Débito Bancolombia', amount: -339600 },
  { day: 2, category: 'Suscripciones', note: 'ChatGPT Plus', account: 'Tarjeta Visa', amount: -74300, recurringId: RECURRING_IDS.chatgpt },
  { day: 1, category: 'Salario', note: 'Nómina', account: 'Débito Bancolombia', amount: 5200000 },
];

/**
 * Movimientos con los que arranca la app la primera vez, tomados del diseño
 * (agosto). El color de cada movimiento se resuelve desde su categoría; los que
 * corresponden a un recurrente llevan su `recurringId` (ya pagados este mes).
 */
export const DEFAULT_TRANSACTIONS: NewTransaction[] = SEED.map((t) => ({
  amount: t.amount,
  category: t.category,
  categoryColor: categoryColorByName(t.category),
  note: t.note,
  account: t.account,
  date: augustDay(t.day),
  recurringId: t.recurringId ?? null,
}));
