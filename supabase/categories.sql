-- Moneo — categorías por usuario (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor. Idempotente: se puede correr varias veces.

-- ============================================================================
-- Tabla de categorías. Cada usuario tiene las suyas (aisladas por RLS).
-- ============================================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  -- `default auth.uid()` permite insertar desde el cliente sin enviar el dueño:
  -- Postgres lo toma del JWT, así nadie puede crear categorías a nombre de otro.
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null,
  type       text not null check (type in ('expense', 'income')),
  color      text not null,
  -- Presupuesto mensual en la moneda base; 0 = sin límite.
  budget     bigint not null default 0 check (budget >= 0),
  created_at timestamptz not null default now()
);

-- El orden de la lista es por fecha de creación, y siempre se filtra por dueño.
create index if not exists categories_user_created_idx
  on public.categories (user_id, created_at);

alter table public.categories enable row level security;

-- Cada usuario solo ve y manipula sus propias categorías.
drop policy if exists "own categories select" on public.categories;
create policy "own categories select" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "own categories insert" on public.categories;
create policy "own categories insert" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "own categories update" on public.categories;
create policy "own categories update" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own categories delete" on public.categories;
create policy "own categories delete" on public.categories
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- Bandera de siembra: distingue "todavía no se sembró" de "el usuario borró
-- todo a propósito". Antes, seed_default_categories se fijaba en si la tabla
-- tenía filas para decidir si sembrar, así que borrar todas las categorías
-- hacía que la próxima lectura las resembrara solas.
-- ============================================================================
alter table public.profiles
  add column if not exists categories_seeded boolean not null default false;

-- Backfill: quien ya tiene categorías hoy, ya fue sembrado en algún momento
-- (por el trigger o por una lectura anterior), aunque la bandera no existiera
-- todavía. Sin esto, ese usuario podría resembrarse la próxima vez que borre
-- todo, que es justo el bug que esta migración corrige.
update public.profiles p
set categories_seeded = true
where exists (select 1 from public.categories c where c.user_id = p.id);

-- ============================================================================
-- Siembra de categorías por defecto (las del diseño), una sola vez por usuario.
-- ============================================================================
create or replace function public.seed_default_categories(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Idempotente: una vez sembrado para este usuario, no se vuelve a tocar,
  -- sin importar si luego borró todas sus categorías.
  if exists (select 1 from public.profiles where id = p_user and categories_seeded) then
    return;
  end if;

  -- `ord` preserva el orden del diseño desplazando `created_at` un milisegundo
  -- por fila, que es como la lista se ordena al leerse.
  insert into public.categories (user_id, name, type, color, budget, created_at)
  select p_user, d.name, d.type, d.color, d.budget,
         now() + (d.ord * interval '1 millisecond')
  from (values
    (1, 'Arriendo',      'expense', '#89A4DE', 0),
    (2, 'Mercado',       'expense', '#76C479',  0),
    (3, 'Transporte',    'expense', '#D78951',  0),
    (4, 'Suscripciones', 'expense', '#C480D4',  0),
    (5, 'Salud',         'expense', '#CA8377',  0),
    (6, 'Ahorros',       'expense', '#60AD64',  0),
    (7, 'Inversiones',   'expense', '#48B7BD',  0),
    (8, 'Salario',       'income',  '#47944C',       0),
    (9, 'Freelance',     'income',  '#4E9A52',       0)
  ) as d(ord, name, type, color, budget);

  update public.profiles set categories_seeded = true where id = p_user;
end;
$$;

-- RPC que la app llama cuando encuentra la lista vacía. Cubre a los usuarios ya
-- registrados antes de existir esta tabla (a los nuevos los siembra el trigger)
-- y ahora es un no-op si ese usuario ya fue sembrado antes.
create or replace function public.ensure_default_categories()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  perform public.seed_default_categories(auth.uid());
end;
$$;

grant execute on function public.ensure_default_categories() to authenticated;

-- ============================================================================
-- Alta de usuario: además del perfil, ahora siembra sus categorías por defecto.
-- (Reemplaza la versión de schema.sql; el trigger sigue siendo el mismo.)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite   text := new.raw_user_meta_data ->> 'invite_code';
  v_username text := new.raw_user_meta_data ->> 'username';
  v_name     text := new.raw_user_meta_data ->> 'name';
  v_inviter  uuid;
  v_is_first boolean;
begin
  select not exists(select 1 from public.profiles) into v_is_first;

  if v_is_first then
    v_inviter := null;                          -- primer usuario: sin invitador
  else
    select id into v_inviter from public.profiles where invite_code = v_invite;
    if v_inviter is null then
      raise exception 'Código de invitación inválido';
    end if;
  end if;

  insert into public.profiles (id, username, name, invite_code, invited_by)
  values (new.id, v_username, v_name, public.generate_invite_code(), v_inviter);

  perform public.seed_default_categories(new.id);

  return new;
end;
$$;
