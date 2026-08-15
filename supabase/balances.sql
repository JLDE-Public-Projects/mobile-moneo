-- Moneo — el saldo de las cuentas sigue a los movimientos
-- Pegar y ejecutar en el SQL Editor DESPUÉS de accounts.sql y transactions.sql.
-- Idempotente: se puede correr varias veces.

-- ============================================================================
-- Referencia estable a la cuenta.
--
-- El movimiento ya guardaba el NOMBRE de la cuenta (desnormalizado, para que el
-- historial conserve cómo se veía). Eso sirve para mostrar, pero no para
-- mantener un saldo: al renombrar una cuenta el nombre deja de coincidir. Por
-- eso se añade la referencia, y el nombre se queda solo como dato de lectura.
--
-- Al borrar una cuenta la referencia queda en nulo en vez de arrastrar los
-- movimientos: el historial se conserva, como se le promete al usuario.
-- ============================================================================
alter table public.transactions
  add column if not exists account_id uuid
  references public.accounts (id) on delete set null;

create index if not exists transactions_account_idx
  on public.transactions (account_id);

-- ============================================================================
-- Mantener el saldo al día.
--
-- El importe ya viene con signo (negativo es egreso), así que sumarlo sirve
-- para egresos e ingresos por igual. Se hace en el servidor y en la misma
-- transacción que el movimiento: si algo falla, no queda un saldo a medias.
-- ============================================================================
create or replace function public.apply_transaction_to_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Al editar puede cambiar el importe, la cuenta o ambos: se revierte el
  -- efecto anterior y se aplica el nuevo, que cubre los dos casos a la vez.
  if TG_OP in ('UPDATE', 'DELETE') and old.account_id is not null then
    update public.accounts
       set balance = balance - old.amount
     where id = old.account_id;
  end if;

  if TG_OP in ('INSERT', 'UPDATE') and new.account_id is not null then
    update public.accounts
       set balance = balance + new.amount
     where id = new.account_id;
  end if;

  return null;
end;
$$;

drop trigger if exists transactions_apply_balance on public.transactions;
create trigger transactions_apply_balance
  after insert or update or delete on public.transactions
  for each row execute function public.apply_transaction_to_balance();

-- ============================================================================
-- Enlazar los movimientos que ya existían.
--
-- Va DESPUÉS de crear el trigger a propósito: al asignarles su cuenta, el
-- trigger los aplica al saldo. Así el saldo pasa a ser "lo que había al abrir
-- la cuenta, más todo lo registrado", que es la lectura que espera el usuario.
-- ============================================================================
update public.transactions t
   set account_id = a.id
  from public.accounts a
 where t.account_id is null
   and a.user_id = t.user_id
   and a.name = t.account;
