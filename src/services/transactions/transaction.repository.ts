import { NewTransaction, Transaction } from '@/services/transactions/transaction.types';

/**
 * Contrato del repositorio de movimientos (patrón Repository).
 *
 * Define las operaciones sin atarse a una tecnología concreta. Hoy la
 * implementación es SQLite local; mañana podría ser una API, intercambiable
 * desde `services/container.ts` sin tocar la UI. (El alta llegará con el modal
 * "Nuevo movimiento".)
 */
export interface TransactionRepository {
  /** Devuelve todos los movimientos, de más reciente a más antiguo. */
  list(): Promise<Transaction[]>;
  /** Crea un movimiento y devuelve el creado. */
  add(input: NewTransaction): Promise<Transaction>;
}
