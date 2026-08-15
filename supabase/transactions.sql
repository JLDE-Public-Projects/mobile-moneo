-- Moneo — movimientos por usuario (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor. Idempotente: se puede correr varias veces.

-- ============================================================================
-- Tabla de movimientos. Cada usuario tiene los suyos (aislados por RLS).
--
-- La categoría se guarda desnormalizada (nombre + color) igual que en el
-- diseño original: un movimiento conserva cómo se veía cuando se registró, así
-- que renombrar o borrar una categoría no reescribe el historial.
-- ============================================================================
create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  -- `default auth.uid()` permite insertar sin enviar el dueño: lo toma del JWT.
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Importe con signo: negativo = egreso, positivo = ingreso.
  amount         bigint not null,
  category       text not null,
  category_color text not null,
  note           text not null default '',
  account        text not null,
  -- Fecha del movimiento (la que ve el usuario), distinta de `created_at`.
  date           timestamptz not null,
  -- Recurrente que lo originó, si aplica. Los recurrentes siguen siendo locales,
  -- por eso es texto libre y no una clave foránea.
  recurring_id   text,
  created_at     timestamptz not null default now()
);

-- La app siempre pide los movimientos de un mes concreto, del más reciente al
-- más antiguo: este índice cubre exactamente esa consulta.
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

-- Cada usuario solo ve y manipula sus propios movimientos.
drop policy if exists "own transactions select" on public.transactions;
create policy "own transactions select" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "own transactions insert" on public.transactions;
create policy "own transactions insert" on public.transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "own transactions update" on public.transactions;
create policy "own transactions update" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own transactions delete" on public.transactions;
create policy "own transactions delete" on public.transactions
  for delete using (auth.uid() = user_id);

-- Nota: a diferencia de las categorías, los movimientos NO se siembran. Una
-- cuenta nueva empieza sin movimientos y la app muestra su estado vacío, que es
-- la lectura correcta: todavía no ha registrado nada.
