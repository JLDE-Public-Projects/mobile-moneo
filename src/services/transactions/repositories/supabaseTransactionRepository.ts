import { TransactionRepository } from '@/services/transactions/transaction.repository';
import { Transaction } from '@/services/transactions/transaction.types';
import { supabase } from '@/services/supabase/client';

/** Fila de la tabla `transactions` tal como la devuelve Supabase. */
interface TransactionRow {
   id: string;
   amount: number;
   category: string;
   category_color: string;
   note: string;
   account: string;
   date: string;
   recurring_id: string | null;
   created_at: string;
}

/** Columnas que pedimos siempre (evita traer `user_id`, que no usa la UI). */
const COLUMNS =
   'id, amount, category, category_color, note, account, date, recurring_id, created_at';

/**
 * Convierte una fila al modelo del dominio.
 *
 * Las fechas llegan como texto ISO y el dominio las maneja en milisegundos.
 */
function toTransaction(row: TransactionRow): Transaction {
   return {
      id: row.id,
      amount: row.amount,
      category: row.category,
      categoryColor: row.category_color,
      note: row.note,
      account: row.account,
      date: new Date(row.date).getTime(),
      recurringId: row.recurring_id,
      createdAt: new Date(row.created_at).getTime(),
   };
}

/**
 * Implementación de {@link TransactionRepository} sobre Supabase.
 *
 * Cumple el mismo contrato que cualquier otra implementación, por lo que se
 * intercambia desde `services/container.ts` sin tocar la UI ni las queries que
 * la consumen. El aislamiento entre usuarios lo garantizan las políticas RLS.
 */
export const supabaseTransactionRepository: TransactionRepository = {
   async list({ from, to }) {
      // El filtro por fechas se hace en el servidor: así solo viaja el mes que
      // se va a mostrar, no el historial completo. El fin es exclusivo (`lt`)
      // para que el último día del mes no se solape con el primero del siguiente.
      const { data, error } = await supabase
         .from('transactions')
         .select(COLUMNS)
         .gte('date', new Date(from).toISOString())
         .lt('date', new Date(to).toISOString())
         .order('date', { ascending: false })
         .order('created_at', { ascending: false });

      if (error) {
         throw new Error('No pudimos cargar tus movimientos.');
      }
      return (data as TransactionRow[]).map(toTransaction);
   },

   async add(input) {
      // `user_id` lo asigna el servidor con `default auth.uid()`; el cliente
      // nunca decide el dueño de la fila.
      const { data, error } = await supabase
         .from('transactions')
         .insert({
            amount: input.amount,
            category: input.category,
            category_color: input.categoryColor,
            note: input.note,
            account: input.account,
            date: new Date(input.date).toISOString(),
            recurring_id: input.recurringId ?? null,
         })
         .select(COLUMNS)
         .single();

      if (error || !data) {
         throw new Error('No pudimos registrar el movimiento.');
      }
      return toTransaction(data as TransactionRow);
   },
};
