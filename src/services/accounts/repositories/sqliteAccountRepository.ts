import * as Crypto from 'expo-crypto';
import { AccountRepository } from '@/services/accounts/account.repository';
import { Account, AccountKind } from '@/services/accounts/account.types';
import { DEFAULT_ACCOUNTS } from '@/services/accounts/account.constants';
import { getDatabase } from '@/services/db/database';

/** Fila de la tabla `accounts` tal como se almacena en SQLite. */
interface AccountRow {
  id: string;
  name: string;
  kind: string;
  balance: number;
  color: string;
  cut_day: number | null;
  description: string | null;
  created_at: number;
}

/** Normaliza el tipo crudo al del dominio. */
function toKind(raw: string): AccountKind {
  if (raw === 'cash' || raw === 'credit') {
    return raw;
  }
  return 'savings';
}

/** Convierte una fila cruda al modelo del dominio. */
function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    kind: toKind(row.kind),
    balance: row.balance,
    color: row.color,
    cutDay: row.cut_day,
    description: row.description,
    createdAt: row.created_at,
  };
}

/** Siembra las cuentas por defecto la primera vez (tabla vacía). */
async function ensureSeeded(
  db: Awaited<ReturnType<typeof getDatabase>>,
): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM accounts',
  );
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const base = Date.now();
  for (let i = 0; i < DEFAULT_ACCOUNTS.length; i += 1) {
    const seed = DEFAULT_ACCOUNTS[i];
    await db.runAsync(
      `INSERT INTO accounts (id, name, kind, balance, color, cut_day, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      Crypto.randomUUID(),
      seed.name,
      seed.kind,
      seed.balance,
      seed.color,
      seed.cutDay,
      seed.description,
      base + i,
    );
  }
}

/**
 * Implementación de {@link AccountRepository} sobre SQLite local.
 *
 * Cumple el mismo contrato que cualquier otra implementación, por lo que puede
 * intercambiarse por una basada en API desde `services/container.ts` sin tocar
 * la UI ni las queries que la consumen.
 */
export const sqliteAccountRepository: AccountRepository = {
  async list() {
    const db = await getDatabase();
    await ensureSeeded(db);
    const rows = await db.getAllAsync<AccountRow>(
      'SELECT * FROM accounts ORDER BY created_at ASC',
    );
    return rows.map(toAccount);
  },

  async add({ name, kind, balance, color, cutDay }) {
    const db = await getDatabase();
    const account: Account = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      kind,
      balance,
      color,
      cutDay,
      // El subtítulo se deriva del tipo para cuentas nuevas.
      description: null,
      createdAt: Date.now(),
    };
    await db.runAsync(
      `INSERT INTO accounts (id, name, kind, balance, color, cut_day, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      account.id,
      account.name,
      account.kind,
      account.balance,
      account.color,
      account.cutDay,
      account.description,
      account.createdAt,
    );
    return account;
  },
};
