/** Abreviaturas de mes en español (índice 0 = enero). */
const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

/** Nombres de mes en español (índice 0 = enero). */
const MONTHS_LONG = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Formatea una fecha (timestamp) como "día mes" abreviado, p. ej. "12 ago".
 */
export function formatDayMonth(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** Formatea una fecha como "Mes año", p. ej. "Agosto 2026". */
export function formatMonthYear(timestamp: number): string {
  const date = new Date(timestamp);
  return `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** Abreviatura del mes de una fecha, p. ej. "ago". */
export function monthShort(timestamp: number): string {
  return MONTHS_SHORT[new Date(timestamp).getMonth()];
}

/** Nombre del mes de una fecha en minúscula, p. ej. "agosto". */
export function monthLong(timestamp: number): string {
  return MONTHS_LONG[new Date(timestamp).getMonth()].toLowerCase();
}

/** Intervalo de fechas [from, to) en milisegundos. */
export interface DateRange {
  /** Inicio incluido. */
  from: number;
  /** Fin excluido. */
  to: number;
}

/**
 * Devuelve el intervalo que cubre el mes de la fecha dada.
 *
 * Moneo funciona mes a mes: casi todas las pantallas (resumen, gastos,
 * presupuesto, movimientos) hablan del mes en curso. Este intervalo es la única
 * definición de "el mes", para que todas coincidan.
 *
 * El fin es exclusivo y se calcula con el día 1 del mes siguiente, lo que deja
 * que `Date` resuelva solo los meses de distinta duración y los cambios de año.
 */
export function monthRange(timestamp: number = Date.now()): DateRange {
  const date = new Date(timestamp);
  const from = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  return { from, to };
}
