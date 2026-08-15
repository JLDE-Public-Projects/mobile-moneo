import { AuthRepository } from '@/services/auth/auth.repository';
import { supabaseAuthRepository } from '@/services/auth/repositories/supabaseAuthRepository';
import { CategoryRepository } from '@/services/categories/category.repository';
import { supabaseCategoryRepository } from '@/services/categories/repositories/supabaseCategoryRepository';
import { AccountRepository } from '@/services/accounts/account.repository';
import { supabaseAccountRepository } from '@/services/accounts/repositories/supabaseAccountRepository';
import { TransactionRepository } from '@/services/transactions/transaction.repository';
import { supabaseTransactionRepository } from '@/services/transactions/repositories/supabaseTransactionRepository';
import { RecurringRepository } from '@/services/recurrings/recurring.repository';
import { sqliteRecurringRepository } from '@/services/recurrings/repositories/sqliteRecurringRepository';

/**
 * Conjunto de repositorios que usa la app (raíz de composición / contenedor de
 * dependencias).
 *
 * A medida que crezca la app, se añaden aquí más repositorios (transacciones,
 * cuentas, ...), todos detrás de su propia interfaz.
 */
interface AppRepositories {
  auth: AuthRepository;
  categories: CategoryRepository;
  accounts: AccountRepository;
  transactions: TransactionRepository;
  recurrings: RecurringRepository;
}

/**
 * Implementaciones activas. Este es el ÚNICO lugar que decide, para toda la
 * app, qué implementación concreta se usa para cada contrato.
 *
 * Hoy el almacenamiento es local (SQLite). Para migrar a una API externa basta
 * con cambiar la implementación aquí —o llamar a {@link configureRepositories}
 * en el arranque— sin tocar pantallas ni hooks:
 *
 *   configureRepositories({ auth: apiAuthRepository });
 */
let repositories: AppRepositories = {
  // Todo en Supabase salvo los recurrentes, que siguen en SQLite local hasta
  // migrar también esa parte.
  auth: supabaseAuthRepository,
  categories: supabaseCategoryRepository,
  accounts: supabaseAccountRepository,
  transactions: supabaseTransactionRepository,
  recurrings: sqliteRecurringRepository,
};

/** Devuelve los repositorios activos para que los consumidores los usen. */
export function getRepositories(): AppRepositories {
  return repositories;
}

/**
 * Sustituye una o varias implementaciones. Pensado para el arranque de la app
 * (elegir SQLite vs API) y para inyectar dobles en pruebas.
 */
export function configureRepositories(overrides: Partial<AppRepositories>): void {
  repositories = { ...repositories, ...overrides };
}
