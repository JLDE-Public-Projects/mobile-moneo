import { Account, NewAccount } from '@/services/accounts/account.types';

/**
 * Contrato del repositorio de cuentas (patrón Repository).
 *
 * Define las operaciones de gestión de cuentas sin atarse a una tecnología
 * concreta. Hoy la implementación es SQLite local; mañana podría ser una API,
 * intercambiable desde `services/container.ts` sin tocar la UI.
 */
export interface AccountRepository {
  /** Devuelve todas las cuentas. */
  list(): Promise<Account[]>;
  /** Crea una cuenta y devuelve la creada. */
  add(input: NewAccount): Promise<Account>;
  /** Edita una cuenta existente y devuelve la actualizada. */
  update(id: string, input: NewAccount): Promise<Account>;
  /** Elimina una cuenta por id. */
  remove(id: string): Promise<void>;
}
