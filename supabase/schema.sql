-- Moneo — esquema de autenticación e invitaciones (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor del proyecto. Idempotente en lo posible.

-- ============================================================================
-- Tabla de perfiles: datos públicos del usuario + sistema de invitación.
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  name        text not null,
  invite_code text unique not null,           -- código propio para invitar a otros
  invited_by  uuid references public.profiles (id),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuario solo puede leer y actualizar su propio perfil.
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);
-- No hay policy de INSERT: los perfiles solo los crea el trigger (SECURITY DEFINER).

-- ============================================================================
-- Generador de código de invitación único (formato MONEO-XXXXXX).
-- ============================================================================
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  code text;
  taken boolean;
begin
  loop
    code := 'MONEO-' || upper(substr(md5(random()::text), 1, 6));
    select exists(select 1 from public.profiles where invite_code = code) into taken;
    exit when not taken;
  end loop;
  return code;
end;
$$;

-- ============================================================================
-- Validación de invitación (RPC): la app la llama ANTES de registrar para dar
-- un mensaje claro. El primer usuario del sistema no necesita código.
-- ============================================================================
create or replace function public.is_valid_invite(code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.profiles where invite_code = code)
      or not exists(select 1 from public.profiles);
$$;

grant execute on function public.is_valid_invite(text) to anon, authenticated;

-- ============================================================================
-- Trigger: al crearse un usuario en auth.users, valida la invitación y crea su
-- perfil con un código propio. Es la fuente de verdad de la integridad.
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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
