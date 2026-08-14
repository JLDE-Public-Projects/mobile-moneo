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
