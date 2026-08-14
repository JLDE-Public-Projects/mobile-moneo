import * as Crypto from 'expo-crypto';
import { TransactionRepository } from '@/services/transactions/transaction.repository';
import { Transaction } from '@/services/transactions/transaction.types';
import { NewTransaction } from '@/services/transactions/transaction.types';
import { DEFAULT_TRANSACTIONS } from '@/services/transactions/transaction.constants';
import { getDatabase } from '@/services/db/database';

/** Fila de la tabla `transactions` tal como se almacena en SQLite. */
interface TransactionRow {
  id: string;
  amount: number;
  category: string;
  category_color: string;
  note: string;
  account: string;
  date: number;
  recurring_id: string | null;
  created_at: number;
}

/** Convierte una fila cruda al modelo del dominio. */
function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category,
    categoryColor: row.category_color,
    note: row.note,
    account: row.account,
    date: row.date,
    recurringId: row.recurring_id ?? null,
    createdAt: row.created_at,
  };
}

/** Siembra los movimientos por defecto la primera vez (tabla vacía). */
async function ensureSeeded(
  db: Awaited<ReturnType<typeof getDatabase>>,
): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM transactions',
  );
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const base = Date.now();
  for (let i = 0; i < DEFAULT_TRANSACTIONS.length; i += 1) {
    const seed = DEFAULT_TRANSACTIONS[i];
    await db.runAsync(
      `INSERT INTO transactions (id, amount, category, category_color, note, account, date, recurring_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Crypto.randomUUID(),
      seed.amount,
      seed.category,
      seed.categoryColor,
      seed.note,
      seed.account,
      seed.date,
      seed.recurringId ?? null,
      base + i,
    );
  }
}

/**
 * Implementación de {@link TransactionRepository} sobre SQLite local.
 *
 * Cumple el mismo contrato que cualquier otra implementación, por lo que puede
 * intercambiarse por una basada en API desde `services/container.ts` sin tocar
 * la UI ni las queries que la consumen.
 */
export const sqliteTransactionRepository: TransactionRepository = {
  async list() {
    const db = await getDatabase();
    await ensureSeeded(db);
    const rows = await db.getAllAsync<TransactionRow>(
      'SELECT * FROM transactions ORDER BY date DESC, created_at DESC',
    );
    return rows.map(toTransaction);
  },

  async add(input: NewTransaction) {
    const db = await getDatabase();
    const transaction: Transaction = {
      id: Crypto.randomUUID(),
      amount: input.amount,
      category: input.category,
      categoryColor: input.categoryColor,
      note: input.note,
      account: input.account,
      date: input.date,
      recurringId: input.recurringId ?? null,
      createdAt: Date.now(),
    };
    await db.runAsync(
      `INSERT INTO transactions (id, amount, category, category_color, note, account, date, recurring_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      transaction.id,
      transaction.amount,
      transaction.category,
      transaction.categoryColor,
      transaction.note,
      transaction.account,
      transaction.date,
      transaction.recurringId,
      transaction.createdAt,
    );
    return transaction;
  },
};
