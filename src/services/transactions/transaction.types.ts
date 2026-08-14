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
  /** Nombre de la cuenta. */
  account: string;
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
  date: number;
  /** Recurrente que lo origina, si aplica. */
  recurringId?: string | null;
}
