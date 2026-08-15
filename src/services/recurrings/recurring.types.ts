/**
 * Modelos del dominio de recurrentes.
 *
 * Un recurrente es un movimiento que se repite cada mes: una suscripción, el
 * arriendo, un aporte... o el salario, porque los ingresos también son
 * recurrentes. Moneo no los cobra ni los registra solo: los recuerda y, al
 * confirmarlos, crea el movimiento del mes.
 *
 * Se guardan denormalizados el color de la categoría y el nombre de la cuenta
 * para mostrarlos sin consultas adicionales.
 */

/** Recurrente almacenado. */
export interface Recurring {
  id: string;
  name: string;
  /**
   * Importe con signo, igual que en los movimientos: negativo es egreso y
   * positivo, ingreso. Es el valor previsto, que puede ajustarse al registrar.
   */
  amount: number;
  /** Día del mes en que vence. */
  day: number;
  category: string;
  categoryColor: string;
  /** Nombre de la cuenta (desnormalizado, para mostrarlo sin consultas). */
  account: string;
  /** Cuenta a la que afecta, o null si esa cuenta se eliminó. */
  accountId: string | null;
  /** Si está activo (los pausados no cuentan en los totales). */
  active: boolean;
  createdAt: number;
}

/** Datos para crear o editar un recurrente. */
export interface NewRecurring {
  name: string;
  /** Importe con signo: negativo es egreso, positivo es ingreso. */
  amount: number;
  day: number;
  category: string;
  categoryColor: string;
  account: string;
  accountId: string;
}
