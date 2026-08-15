-- Moneo — nombres de categorías con movimientos (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor. Idempotente: se puede correr varias veces.

-- ============================================================================
-- Antes, "categorías en uso" se resolvía trayendo al cliente TODA la columna
-- `category` de la tabla de movimientos del usuario para deduplicarla en JS.
-- Eso crece sin límite con el historial de la cuenta. Este RPC hace el
-- DISTINCT en la base, que es donde corresponde: el cliente solo recibe los
-- nombres únicos, nunca una fila por movimiento.
-- ============================================================================
create or replace function public.used_category_names()
returns table (category text)
language sql
stable
security invoker
set search_path = public
as $$
  select distinct t.category
  from public.transactions t
  where t.user_id = auth.uid();
$$;
