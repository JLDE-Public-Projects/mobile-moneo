/**
 * Modelos del dominio de movimientos (transacciones).
 *
 * Un movimiento es un egreso (importe negativo) o ingreso (positivo) asociado a
 * una categoría y una cuenta. Se guardan denormalizados el nombre/color de la
 * categoría y el nombre de la cuenta para mostrarlos sin joins. Se persisten
 * localmente y podrán migrarse a una API sin cambiar la interfaz del repositorio.
 */

/** Filtro de la lista de movimientos. */
export type TransactionFilter = 'all' | 'expense' | 'income';

/** Ingresos y egresos de un mes, para el histórico. */
export interface MonthSummary {
  /** Comienzo del mes (timestamp), que lo identifica. */
  start: number;
  /** Nombre largo, p. ej. "Marzo 2026". */
  name: string;
  /** Abreviatura para el eje del gráfico, p. ej. "mar". */
  short: string;
  /** Suma de ingresos del mes. */
  income: number;
  /** Suma de egresos del mes, en positivo. */
  expense: number;
}

/** Movimiento almacenado. */
export interface Transaction {
  id: string;
  /** Importe con signo: negativo = egreso, positivo = ingreso. */
  amount: number;
  /** Nombre de la categoría. */
  category: string;
  /** Color de la categoría (denormalizado). */
  categoryColor: string;
  /** Nota / descripción del movimiento. */
  note: string;
  /** Nombre de la cuenta (desnormalizado, para mostrarlo sin consultas). */
  account: string;
  /**
   * Cuenta a la que afecta, o null si esa cuenta se eliminó. Es la referencia
   * con la que el servidor mantiene el saldo, y por eso no puede ser el nombre:
   * las cuentas se pueden renombrar.
   */
  accountId: string | null;
  /** Fecha del movimiento (timestamp). */
  date: number;
  /** Id del recurrente que lo originó (o null si es un movimiento suelto). */
  recurringId: string | null;
  createdAt: number;
}

/** Datos para crear un movimiento nuevo (usado por el modal "Nuevo"). */
export interface NewTransaction {
  amount: number;
  category: string;
  categoryColor: string;
  note: string;
  account: string;
  /** Cuenta a la que afecta; el servidor la usa para ajustar el saldo. */
  accountId: string;
  date: number;
  /** Recurrente que lo origina, si aplica. */
  recurringId?: string | null;
}
