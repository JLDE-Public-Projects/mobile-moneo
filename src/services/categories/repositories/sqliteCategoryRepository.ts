import * as Crypto from 'expo-crypto';
import { CategoryRepository } from '@/services/categories/category.repository';
import { Category } from '@/services/categories/category.types';
import { DEFAULT_CATEGORIES } from '@/services/categories/category.constants';
import { getDatabase } from '@/services/db/database';

/** Fila de la tabla `categories` tal como se almacena en SQLite. */
interface CategoryRow {
  id: string;
  name: string;
  type: string;
  color: string;
  budget: number | null;
  created_at: number;
}

/** Convierte una fila cruda al modelo del dominio. */
function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type === 'income' ? 'income' : 'expense',
    color: row.color,
    budget: row.budget ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * Siembra las categorías por defecto la primera vez (tabla vacía). Preserva el
 * orden del diseño usando `created_at` incremental.
 */
async function ensureSeeded(
  db: Awaited<ReturnType<typeof getDatabase>>,
): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM categories',
  );
  if ((row?.count ?? 0) > 0) {
    return;
  }

  const base = Date.now();
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i += 1) {
    const seed = DEFAULT_CATEGORIES[i];
    await db.runAsync(
      `INSERT INTO categories (id, name, type, color, budget, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      Crypto.randomUUID(),
      seed.name,
      seed.type,
      seed.color,
      seed.budget,
      base + i,
    );
  }
}

/**
 * Implementación de {@link CategoryRepository} sobre SQLite local.
 *
 * Cumple el mismo contrato que cualquier otra implementación, por lo que puede
 * intercambiarse por una basada en API desde `services/container.ts` sin tocar
 * la UI ni las queries que la consumen.
 */
export const sqliteCategoryRepository: CategoryRepository = {
  async list() {
    const db = await getDatabase();
    await ensureSeeded(db);
    const rows = await db.getAllAsync<CategoryRow>(
      'SELECT * FROM categories ORDER BY created_at ASC',
    );
    return rows.map(toCategory);
  },

  async add({ name, type, color }) {
    const db = await getDatabase();
    const category: Category = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      type,
      color,
      // Las categorías nuevas empiezan sin límite de presupuesto.
      budget: 0,
      createdAt: Date.now(),
    };
    await db.runAsync(
      `INSERT INTO categories (id, name, type, color, budget, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      category.id,
      category.name,
      category.type,
      category.color,
      category.budget,
      category.createdAt,
    );
    return category;
  },

  async remove(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM categories WHERE id = ?', id);
  },

  async updateBudget(id, budget) {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE categories SET budget = ? WHERE id = ?',
      Math.max(0, Math.round(budget)),
      id,
    );
  },
};
