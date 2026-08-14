/**
 * Modelos del dominio de pagos recurrentes.
 *
 * Un recurrente es un egreso que se repite cada mes (suscripción, servicio,
 * arriendo, aporte...). Moneo no lo cobra: lo recuerda y, al "registrarlo", crea
 * un movimiento del mes. Se guardan denormalizados el color de la categoría y el
 * nombre de la cuenta para mostrarlos sin joins.
 */

/** Recurrente almacenado. */
export interface Recurring {
  id: string;
  name: string;
  /** Importe mensual (positivo; se registra como egreso). */
  amount: number;
  /** Día del mes en que vence. */
  day: number;
  category: string;
  categoryColor: string;
  account: string;
  /** Si está activo (los pausados no cuentan en los totales). */
  active: boolean;
  createdAt: number;
}

/** Datos para crear un recurrente nuevo. */
export interface NewRecurring {
  name: string;
  amount: number;
  day: number;
  category: string;
  categoryColor: string;
  account: string;
}

/**
 * Ids estables de los recurrentes por defecto. Viven aquí (módulo sin imports)
 * para que tanto la semilla de recurrentes como la de movimientos los usen sin
 * crear dependencias circulares.
 */
export const RECURRING_IDS = {
  chatgpt: 'rec-100',
  netflix: 'rec-102',
  icloud: 'rec-103',
  fondo: 'rec-105',
  etf: 'rec-106',
  spotify: 'rec-104',
  arriendo: 'rec-101',
  gimnasio: 'rec-107',
  carro: 'rec-108',
} as const;
