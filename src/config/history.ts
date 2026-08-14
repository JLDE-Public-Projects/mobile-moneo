/**
 * Resumen mensual histórico (meses ya cerrados), tomado del diseño.
 *
 * El mes en curso (agosto) NO va aquí: se calcula en vivo desde los
 * movimientos. Estos son los meses anteriores ya "guardados".
 */
export interface MonthSummary {
  /** Nombre largo, p. ej. "Marzo 2026". */
  name: string;
  /** Abreviatura para el eje del gráfico, p. ej. "mar". */
  short: string;
  income: number;
  expense: number;
}

/** Meses cerrados (marzo–julio 2026). */
export const PAST_MONTHS: MonthSummary[] = [
  { name: 'Marzo 2026', short: 'mar', income: 6750000, expense: 4510000 },
  { name: 'Abril 2026', short: 'abr', income: 5200000, expense: 3880000 },
  { name: 'Mayo 2026', short: 'may', income: 7100000, expense: 4360000 },
  { name: 'Junio 2026', short: 'jun', income: 5200000, expense: 4120000 },
  { name: 'Julio 2026', short: 'jul', income: 6400000, expense: 3990000 },
];
