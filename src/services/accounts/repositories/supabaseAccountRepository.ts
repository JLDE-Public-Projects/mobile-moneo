import { AccountRepository } from '@/services/accounts/account.repository';
import { Account, AccountKind } from '@/services/accounts/account.types';
import { supabase } from '@/services/supabase/client';

/** Fila de la tabla `accounts` tal como la devuelve Supabase. */
interface AccountRow {
   id: string;
   name: string;
   kind: string;
   balance: number;
   color: string;
   cut_day: number | null;
   description: string | null;
   created_at: string;
}

/** Columnas que pedimos siempre (evita traer `user_id`, que no usa la UI). */
const COLUMNS = 'id, name, kind, balance, color, cut_day, description, created_at';

/** Normaliza el tipo crudo al del dominio. */
function toKind(raw: string): AccountKind {
   if (raw === 'cash' || raw === 'credit') {
      return raw;
   }
   return 'savings';
}

/**
 * Convierte una fila al modelo del dominio.
 *
 * `created_at` llega como timestamp ISO y el dominio lo maneja en milisegundos.
 */
function toAccount(row: AccountRow): Account {
   return {
      id: row.id,
      name: row.name,
      kind: toKind(row.kind),
      balance: row.balance,
      color: row.color,
      cutDay: row.cut_day,
      description: row.description,
      createdAt: new Date(row.created_at).getTime(),
   };
}

/**
 * Implementación de {@link AccountRepository} sobre Supabase.
 *
 * Cumple el mismo contrato que la versión local, de modo que se intercambia
 * desde `services/container.ts` sin tocar la UI ni las queries que la consumen.
 * El aislamiento entre usuarios lo garantizan las políticas RLS, no el cliente.
 */
export const supabaseAccountRepository: AccountRepository = {
   async list() {
      // No hace falta filtrar por usuario: las políticas RLS solo dejan ver las
      // propias, así que la consulta ya viene acotada por el servidor.
      const { data, error } = await supabase
         .from('accounts')
         .select(COLUMNS)
         .order('created_at', { ascending: true });

      if (error) {
         throw new Error('No pudimos cargar tus cuentas.');
      }
      return (data as AccountRow[]).map(toAccount);
   },

   async add({ name, kind, balance, color, cutDay }) {
      // `user_id` lo asigna el servidor con `default auth.uid()`; el cliente
      // nunca decide el dueño de la fila. El subtítulo queda nulo para que la
      // app lo derive del tipo, igual que antes.
      const { data, error } = await supabase
         .from('accounts')
         .insert({
            name: name.trim(),
            kind,
            balance,
            color,
            cut_day: cutDay,
         })
         .select(COLUMNS)
         .single();

      if (error || !data) {
         throw new Error('No pudimos crear la cuenta.');
      }
      return toAccount(data as AccountRow);
   },

   async update(id, { name, kind, balance, color, cutDay }) {
      // El día de corte solo aplica a crédito: al cambiar de tipo se limpia
      // para no dejar un dato que ya no corresponde.
      const { data, error } = await supabase
         .from('accounts')
         .update({
            name: name.trim(),
            kind,
            balance,
            color,
            cut_day: kind === 'credit' ? cutDay : null,
         })
         .eq('id', id)
         .select(COLUMNS)
         .single();

      if (error || !data) {
         throw new Error('No pudimos guardar los cambios.');
      }
      return toAccount(data as AccountRow);
   },

   async remove(id) {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) {
         throw new Error('No pudimos eliminar la cuenta.');
      }
   },
};
