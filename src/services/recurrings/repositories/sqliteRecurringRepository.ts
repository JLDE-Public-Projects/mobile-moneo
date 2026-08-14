import * as Crypto from 'expo-crypto';
import { RecurringRepository } from '@/services/recurrings/recurring.repository';
import { Recurring } from '@/services/recurrings/recurring.types';
import { DEFAULT_RECURRINGS } from '@/services/recurrings/recurring.constants';
import { getDatabase } from '@/services/db/database';

/** Fila de la tabla `recurrings` tal como se almacena en SQLite. */
interface RecurringRow {
  id: string;
  name: string;
  amount: number;
  day: number;
  category: string;
  category_color: string;
  account: string;
  active: number;
  created_at: number;
}

/** Convierte una fila cruda al modelo del dominio. */
function toRecurring(row: RecurringRow): Recurring {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    day: row.day,
    category: row.category,
    categoryColor: row.category_color,
    account: row.account,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

/** Siembra los recurrentes por defecto la primera vez (tabla vacía). */
async function ensureSeeded(
  db: Awaited<ReturnType<typeof getDatabase>>,
): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM recurrings',
  );
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const base = Date.now();
  for (let i = 0; i < DEFAULT_RECURRINGS.length; i += 1) {
    const seed = DEFAULT_RECURRINGS[i];
    await db.runAsync(
      `INSERT INTO recurrings (id, name, amount, day, category, category_color, account, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      // Id estable de la semilla (permite enlazar los movimientos ya pagados).
      seed.id,
      seed.name,
      seed.amount,
      seed.day,
      seed.category,
      seed.categoryColor,
      seed.account,
      base + i,
    );
  }
}

/**
 * Implementación de {@link RecurringRepository} sobre SQLite local.
 */
export const sqliteRecurringRepository: RecurringRepository = {
  async list() {
    const db = await getDatabase();
    await ensureSeeded(db);
    const rows = await db.getAllAsync<RecurringRow>(
      'SELECT * FROM recurrings ORDER BY day ASC, created_at ASC',
    );
    return rows.map(toRecurring);
  },

  async add(input) {
    const db = await getDatabase();
    const recurring: Recurring = {
      id: Crypto.randomUUID(),
      name: input.name.trim(),
      amount: input.amount,
      day: input.day,
      category: input.category,
      categoryColor: input.categoryColor,
      account: input.account,
      active: true,
      createdAt: Date.now(),
    };
    await db.runAsync(
      `INSERT INTO recurrings (id, name, amount, day, category, category_color, account, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      recurring.id,
      recurring.name,
      recurring.amount,
      recurring.day,
      recurring.category,
      recurring.categoryColor,
      recurring.account,
      recurring.createdAt,
    );
    return recurring;
  },

  async setActive(id, active) {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE recurrings SET active = ? WHERE id = ?',
      active ? 1 : 0,
      id,
    );
  },
};
