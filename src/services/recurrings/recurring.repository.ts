import { NewRecurring, Recurring } from '@/services/recurrings/recurring.types';

/**
 * Contrato del repositorio de pagos recurrentes (patrón Repository).
 *
 * Define las operaciones sin atarse a una tecnología concreta; hoy es SQLite
 * local, mañana podría ser una API, intercambiable desde `services/container.ts`.
 */
export interface RecurringRepository {
  /** Devuelve todos los recurrentes, ordenados por día de vencimiento. */
  list(): Promise<Recurring[]>;
  /** Crea un recurrente y devuelve el creado. */
  add(input: NewRecurring): Promise<Recurring>;
  /** Activa o pausa un recurrente. */
  setActive(id: string, active: boolean): Promise<void>;
}
