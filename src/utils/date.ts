/**
 * Nombres de mes en el idioma activo.
 *
 * Las funciones de este archivo son puras: no llaman a i18next directamente
 * para que también funcionen fuera de un componente (por ejemplo, dentro de un
 * hook de datos). Los nombres se piden aquí; el hook {@link useMonthNames} los
 * obtiene del idioma activo.
 */
export interface MonthNames {
  /** Nombres largos, índice 0 = enero (p. ej. "Enero"). */
  long: readonly string[];
  /** Abreviaturas, índice 0 = enero (p. ej. "ene"). */
  short: readonly string[];
}

/**
 * Formatea una fecha (timestamp) como "día mes" abreviado, p. ej. "12 ago".
 */
export function formatDayMonth(timestamp: number, months: MonthNames): string {
  const date = new Date(timestamp);
  return `${date.getDate()} ${months.short[date.getMonth()]}`;
}

/** Formatea una fecha como "Mes año", p. ej. "Agosto 2026". */
export function formatMonthYear(timestamp: number, months: MonthNames): string {
  const date = new Date(timestamp);
  return `${months.long[date.getMonth()]} ${date.getFullYear()}`;
}

/** Abreviatura del mes de una fecha, p. ej. "ago". */
export function monthShort(timestamp: number, months: MonthNames): string {
  return months.short[new Date(timestamp).getMonth()];
}

/** Nombre del mes de una fecha en minúscula, p. ej. "agosto". */
export function monthLong(timestamp: number, months: MonthNames): string {
  return months.long[new Date(timestamp).getMonth()].toLowerCase();
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

/**
 * Intervalo que cubre los últimos `count` meses, incluido el actual.
 *
 * Se apoya en que `Date` normaliza los meses fuera de rango: restar seis a
 * enero devuelve julio del año anterior sin tener que calcularlo aparte.
 */
export function lastMonthsRange(
  count: number,
  timestamp: number = Date.now(),
): DateRange {
  const date = new Date(timestamp);
  return {
    from: new Date(date.getFullYear(), date.getMonth() - (count - 1), 1).getTime(),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime(),
  };
}

/**
 * Comienzos de los últimos `count` meses, del más antiguo al actual.
 *
 * Sirven de eje del histórico: al recorrerlos se obtienen también los meses sin
 * movimientos, que deben aparecer en cero y no desaparecer del gráfico.
 */
export function lastMonthStarts(
  count: number,
  timestamp: number = Date.now(),
): number[] {
  const date = new Date(timestamp);
  const starts: number[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    starts.push(new Date(date.getFullYear(), date.getMonth() - i, 1).getTime());
  }
  return starts;
}
