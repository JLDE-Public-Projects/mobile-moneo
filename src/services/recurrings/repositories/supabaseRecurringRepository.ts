import { RecurringRepository } from '@/services/recurrings/recurring.repository';
import { Recurring } from '@/services/recurrings/recurring.types';
import { supabase } from '@/services/supabase/client';

/** Fila de la tabla `recurrings` tal como la devuelve Supabase. */
interface RecurringRow {
   id: string;
   name: string;
   amount: number;
   day: number;
   category: string;
   category_color: string;
   account: string;
   account_id: string | null;
   active: boolean;
   created_at: string;
}

/** Columnas que pedimos siempre (evita traer `user_id`, que no usa la UI). */
const COLUMNS =
   'id, name, amount, day, category, category_color, account, account_id, active, created_at';

/** Convierte una fila al modelo del dominio. */
function toRecurring(row: RecurringRow): Recurring {
   return {
      id: row.id,
      name: row.name,
      amount: row.amount,
      day: row.day,
      category: row.category,
      categoryColor: row.category_color,
      account: row.account,
      accountId: row.account_id,
      active: row.active,
      createdAt: new Date(row.created_at).getTime(),
   };
}

/** Campos que viajan al servidor al crear o editar. */
function toRow(input: Parameters<RecurringRepository['add']>[0]) {
   return {
      name: input.name.trim(),
      amount: input.amount,
      day: input.day,
      category: input.category,
      category_color: input.categoryColor,
      account: input.account,
      account_id: input.accountId,
   };
}

/**
 * Implementación de {@link RecurringRepository} sobre Supabase.
 *
 * Cumple el mismo contrato que cualquier otra implementación, por lo que se
 * intercambia desde `services/container.ts` sin tocar la UI. El aislamiento
 * entre usuarios lo garantizan las políticas RLS, no el cliente.
 */
export const supabaseRecurringRepository: RecurringRepository = {
   async list() {
      // No hace falta filtrar por usuario: las políticas RLS solo dejan ver los
      // propios, así que la consulta ya viene acotada por el servidor.
      const { data, error } = await supabase
         .from('recurrings')
         .select(COLUMNS)
         .order('day', { ascending: true });

      if (error) {
         throw new Error('No pudimos cargar tus recurrentes.');
      }
      return (data as RecurringRow[]).map(toRecurring);
   },

   async add(input) {
      const { data, error } = await supabase
         .from('recurrings')
         .insert(toRow(input))
         .select(COLUMNS)
         .single();

      if (error || !data) {
         throw new Error('No pudimos crear el recurrente.');
      }
      return toRecurring(data as RecurringRow);
   },

   async update(id, input) {
      const { data, error } = await supabase
         .from('recurrings')
         .update(toRow(input))
         .eq('id', id)
         .select(COLUMNS)
         .single();

      if (error || !data) {
         throw new Error('No pudimos guardar los cambios.');
      }
      return toRecurring(data as RecurringRow);
   },

   async updateAmount(id, amount) {
      const { error } = await supabase
         .from('recurrings')
         .update({ amount })
         .eq('id', id);

      if (error) {
         throw new Error('No pudimos actualizar el importe.');
      }
   },

   async setActive(id, active) {
      const { error } = await supabase
         .from('recurrings')
         .update({ active })
         .eq('id', id);

      if (error) {
         throw new Error('No pudimos cambiar el estado del recurrente.');
      }
   },

   async remove(id) {
      const { error } = await supabase.from('recurrings').delete().eq('id', id);
      if (error) {
         throw new Error('No pudimos eliminar el recurrente.');
      }
   },
};
