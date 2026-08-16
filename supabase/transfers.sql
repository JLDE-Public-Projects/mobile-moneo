-- Moneo — transferencias entre cuentas propias (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor DESPUÉS de balances.sql. Idempotente.

-- ============================================================================
-- Una transferencia son DOS movimientos enlazados (egreso en la cuenta de
-- origen, ingreso en la de destino), cada uno con su propio account_id: el
-- disparador de balances.sql ya sabe ajustar el saldo de cada cuenta por
-- separado, así que no hace falta lógica de saldo nueva.
--
-- `is_transfer` es la fuente de verdad para excluirlas de los totales de
-- ingresos/egresos y del desglose por categoría (no son ni un gasto ni un
-- ingreso real, solo el dinero cambiando de bolsillo). `transfer_group_id`
-- enlaza las dos filas para poder borrarlas juntas.
-- ============================================================================
alter table public.transactions
  add column if not exists is_transfer boolean not null default false;

alter table public.transactions
  add column if not exists transfer_group_id uuid;

create index if not exists transactions_transfer_group_idx
  on public.transactions (transfer_group_id)
  where transfer_group_id is not null;

-- ============================================================================
-- Crea las dos filas de una transferencia en una sola llamada. Evita que un
-- fallo de red a mitad de camino deje un solo lado registrado (el saldo de una
-- cuenta bajaría sin que el de la otra subiera).
-- ============================================================================
create or replace function public.create_transfer(
  p_from_account uuid,
  p_to_account uuid,
  p_amount bigint,
  p_date timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_from_name text;
  v_to_name   text;
  v_group     uuid := gen_random_uuid();
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;
  if p_amount <= 0 then
    raise exception 'El importe debe ser mayor que cero';
  end if;
  if p_from_account = p_to_account then
    raise exception 'Elige dos cuentas distintas';
  end if;

  -- Confirma que ambas cuentas son del usuario autenticado (no de otro) y de
  -- paso trae sus nombres para denormalizarlos en los movimientos.
  select name into v_from_name from public.accounts
   where id = p_from_account and user_id = v_user;
  select name into v_to_name from public.accounts
   where id = p_to_account and user_id = v_user;

  if v_from_name is null or v_to_name is null then
    raise exception 'Cuenta inválida';
  end if;

  -- `note` guarda el nombre de la cuenta contraria: la UI arma "Transferencia
  -- a/desde {note}" según el signo, sin necesitar más columnas.
  insert into public.transactions
    (user_id, amount, category, category_color, note, account, account_id,
     date, is_transfer, transfer_group_id)
  values
    (v_user, -p_amount, 'transfer', '#8E8E93', v_to_name,   v_from_name, p_from_account, p_date, true, v_group),
    (v_user,  p_amount, 'transfer', '#8E8E93', v_from_name, v_to_name,   p_to_account,   p_date, true, v_group);
end;
$$;

grant execute on function public.create_transfer(uuid, uuid, bigint, timestamptz) to authenticated;
