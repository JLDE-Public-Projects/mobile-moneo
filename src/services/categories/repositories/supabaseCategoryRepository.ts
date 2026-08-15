import i18n from '@/i18n';
import { CategoryRepository } from '@/services/categories/category.repository';
import { Category } from '@/services/categories/category.types';
import { supabase } from '@/services/supabase/client';

/** Fila de la tabla `categories` tal como la devuelve Supabase. */
interface CategoryRow {
  id: string;
  name: string;
  type: string;
  color: string;
  budget: number | null;
  created_at: string;
}

/** Columnas que pedimos siempre (evita traer `user_id`, que no usa la UI). */
const COLUMNS = 'id, name, type, color, budget, created_at';

/**
 * Convierte una fila al modelo del dominio.
 *
 * `created_at` llega como timestamp ISO y el dominio lo maneja en milisegundos,
 * igual que la implementación local.
 */
function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type === 'income' ? 'income' : 'expense',
    color: row.color,
    budget: row.budget ?? 0,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** Lee las categorías del usuario en el orden en que se crearon. */
async function fetchCategories(): Promise<Category[]> {
  // No hace falta filtrar por usuario: las políticas RLS solo dejan ver las
  // propias, así que la consulta ya viene acotada por el servidor.
  const { data, error } = await supabase
    .from('categories')
    .select(COLUMNS)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(i18n.t('categories.repository.loadFailed'));
  }
  return (data as CategoryRow[]).map(toCategory);
}

/**
 * Implementación de {@link CategoryRepository} sobre Supabase.
 *
 * Cumple el mismo contrato que la versión SQLite, de modo que se intercambia
 * desde `services/container.ts` sin tocar la UI ni las queries que la consumen.
 * El aislamiento entre usuarios lo garantizan las políticas RLS, no el cliente.
 */
export const supabaseCategoryRepository: CategoryRepository = {
  async list() {
    const categories = await fetchCategories();

    // Lista vacía = cuenta creada antes de existir esta tabla. El servidor
    // siembra las categorías del diseño (de forma idempotente) y releemos.
    if (categories.length === 0) {
      const { error } = await supabase.rpc('ensure_default_categories');
      if (error) {
        return categories;
      }
      return fetchCategories();
    }

    return categories;
  },

  async add({ name, type, color }) {
    // `user_id` lo asigna el servidor con `default auth.uid()`; el cliente nunca
    // decide el dueño de la fila.
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), type, color })
      .select(COLUMNS)
      .single();

    if (error || !data) {
      throw new Error(i18n.t('categories.repository.addFailed'));
    }
    return toCategory(data as CategoryRow);
  },

  async remove(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      throw new Error(i18n.t('categories.repository.removeFailed'));
    }
  },

  async updateBudget(id, budget) {
    const { error } = await supabase
      .from('categories')
      .update({ budget: Math.max(0, Math.round(budget)) })
      .eq('id', id);

    if (error) {
      throw new Error(i18n.t('categories.repository.updateBudgetFailed'));
    }
  },

  async usedNames() {
    // Los movimientos guardan la categoría desnormalizada (nombre), no un id:
    // así conservan su etiqueta original aunque la categoría se renombre o
    // borre después. Por eso "en uso" se resuelve por nombre, no por id.
    const { data, error } = await supabase.from('transactions').select('category');

    if (error) {
      throw new Error(i18n.t('categories.repository.loadFailed'));
    }
    return new Set((data as { category: string }[]).map((row) => row.category));
  },
};
