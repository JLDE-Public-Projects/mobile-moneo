import { NewRecurring, Recurring } from '@/services/recurrings/recurring.types';

/**
 * Contrato del repositorio de recurrentes (patrón Repository).
 *
 * Define las operaciones sin atarse a una tecnología concreta, de modo que la
 * implementación se intercambia desde `services/container.ts` sin tocar la UI.
 */
export interface RecurringRepository {
  /** Devuelve todos los recurrentes, ordenados por día de vencimiento. */
  list(): Promise<Recurring[]>;
  /** Crea un recurrente y devuelve el creado. */
  add(input: NewRecurring): Promise<Recurring>;
  /** Edita un recurrente y devuelve el actualizado. */
  update(id: string, input: NewRecurring): Promise<Recurring>;
  /**
   * Ajusta el importe previsto. Se usa al registrar con un valor distinto, para
   * que el recurrente aprenda el nuevo importe sin tocar el resto de sus datos.
   */
  updateAmount(id: string, amount: number): Promise<void>;
  /** Activa o pausa un recurrente. */
  setActive(id: string, active: boolean): Promise<void>;
  /** Elimina un recurrente por id. */
  remove(id: string): Promise<void>;
}
