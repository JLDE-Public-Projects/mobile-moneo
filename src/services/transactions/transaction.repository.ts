import {
  NewTransaction,
  NewTransfer,
  Transaction,
} from '@/services/transactions/transaction.types';
import { DateRange } from '@/utils/date';

/**
 * Contrato del repositorio de movimientos (patrón Repository).
 *
 * Define las operaciones sin atarse a una tecnología concreta, de modo que la
 * implementación (Supabase hoy) se intercambia desde `services/container.ts`
 * sin tocar la UI.
 */
export interface TransactionRepository {
  /**
   * Devuelve los movimientos de un intervalo, de más reciente a más antiguo.
   *
   * El intervalo es explícito porque la app trabaja mes a mes: pedir siempre
   * "todo" traería el historial completo para mostrar un solo mes, y dejaría la
   * definición de "el mes" repartida por las pantallas.
   */
  list(range: DateRange): Promise<Transaction[]>;
  /** Crea un movimiento y devuelve el creado. */
  add(input: NewTransaction): Promise<Transaction>;
  /** Edita un movimiento existente y devuelve el actualizado. */
  update(id: string, input: NewTransaction): Promise<Transaction>;
  /** Elimina un movimiento por id. */
  remove(id: string): Promise<void>;
  /**
   * Transfiere dinero entre dos cuentas propias creando las dos mitades del
   * movimiento (egreso en origen, ingreso en destino) de forma atómica.
   */
  transfer(input: NewTransfer): Promise<void>;
  /** Elimina las dos mitades de una transferencia a la vez. */
  removeTransferGroup(groupId: string): Promise<void>;
}
