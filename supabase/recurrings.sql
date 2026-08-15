-- Moneo — recurrentes por usuario (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor. Idempotente: se puede correr varias veces.

-- ============================================================================
-- Tabla de recurrentes: movimientos que se repiten cada mes y que la app
-- recuerda para registrarlos de un toque. No son solo gastos —un salario
-- también es recurrente—, por eso el importe lleva signo igual que en los
-- movimientos: negativo es egreso, positivo es ingreso.
-- ============================================================================
create table if not exists public.recurrings (
  id             uuid primary key default gen_random_uuid(),
  -- `default auth.uid()` permite insertar sin enviar el dueño: lo toma del JWT.
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null,
  -- Importe con signo. Cero no tiene sentido: no habría nada que registrar.
  amount         bigint not null check (amount <> 0),
  -- Día del mes en que vence.
  day            smallint not null check (day between 1 and 31),
  category       text not null,
  category_color text not null,
  account        text not null,
  -- Cuenta a la que afecta; en nulo si esa cuenta se eliminó.
  account_id     uuid references public.accounts (id) on delete set null,
  -- Los pausados no cuentan en los totales ni aparecen como pendientes.
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

-- La lista se ordena por día de vencimiento y siempre se filtra por dueño.
create index if not exists recurrings_user_day_idx
  on public.recurrings (user_id, day);

alter table public.recurrings enable row level security;

-- Cada usuario solo ve y manipula sus propios recurrentes.
drop policy if exists "own recurrings select" on public.recurrings;
create policy "own recurrings select" on public.recurrings
  for select using (auth.uid() = user_id);

drop policy if exists "own recurrings insert" on public.recurrings;
create policy "own recurrings insert" on public.recurrings
  for insert with check (auth.uid() = user_id);

drop policy if exists "own recurrings update" on public.recurrings;
create policy "own recurrings update" on public.recurrings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own recurrings delete" on public.recurrings;
create policy "own recurrings delete" on public.recurrings
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- El movimiento generado guarda de qué recurrente vino. Hasta ahora era texto
-- libre porque los recurrentes eran locales; al pasar a la base puede ser una
-- referencia de verdad, que en nulo si el recurrente se elimina: el movimiento
-- ya registrado se conserva.
-- ============================================================================
alter table public.transactions
  drop column if exists recurring_id;

alter table public.transactions
  add column if not exists recurring_id uuid
  references public.recurrings (id) on delete set null;

create index if not exists transactions_recurring_idx
  on public.transactions (recurring_id);

-- Nota: los recurrentes NO se siembran. Los de la versión local eran ejemplos
-- del diseño (unas suscripciones y un arriendo concretos) que no tienen por qué
-- ser los del usuario.
