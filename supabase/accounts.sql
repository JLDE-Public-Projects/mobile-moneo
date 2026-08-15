-- Moneo — cuentas por usuario (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor. Idempotente: se puede correr varias veces.

-- ============================================================================
-- Tabla de cuentas. Cada usuario tiene las suyas (aisladas por RLS).
-- ============================================================================
create table if not exists public.accounts (
  id          uuid primary key default gen_random_uuid(),
  -- `default auth.uid()` permite insertar sin enviar el dueño: lo toma del JWT.
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  kind        text not null check (kind in ('savings', 'cash', 'credit')),
  -- Saldo actual; negativo indica deuda (típico de crédito), por eso sin check.
  balance     bigint not null default 0,
  color       text not null,
  -- Día de corte, solo para crédito.
  cut_day     smallint check (cut_day between 1 and 31),
  -- Subtítulo libre; si es null, la app lo deriva del tipo de cuenta.
  description text,
  created_at  timestamptz not null default now()
);

-- La lista se ordena por fecha de creación y siempre se filtra por dueño.
create index if not exists accounts_user_created_idx
  on public.accounts (user_id, created_at);

alter table public.accounts enable row level security;

-- Cada usuario solo ve y manipula sus propias cuentas.
drop policy if exists "own accounts select" on public.accounts;
create policy "own accounts select" on public.accounts
  for select using (auth.uid() = user_id);

drop policy if exists "own accounts insert" on public.accounts;
create policy "own accounts insert" on public.accounts
  for insert with check (auth.uid() = user_id);

drop policy if exists "own accounts update" on public.accounts;
create policy "own accounts update" on public.accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own accounts delete" on public.accounts;
create policy "own accounts delete" on public.accounts
  for delete using (auth.uid() = user_id);

-- Nota: a diferencia de las categorías, las cuentas NO se siembran. Las de la
-- versión local eran datos de demostración (un banco y unas tarjetas concretas)
-- que no tienen por qué ser las del usuario: cada quien crea las suyas.
