-- Moneo — eliminación de la propia cuenta (Supabase / Postgres)
-- Pegar y ejecutar en el SQL Editor. Idempotente: se puede correr varias veces.

-- ============================================================================
-- Borrar el usuario de `auth.users` arrastra todo lo suyo: `profiles`,
-- categorías, cuentas, movimientos y recurrentes declaran su `user_id` con
-- `on delete cascade`, así que no hace falta borrar tabla por tabla (y no
-- queda nada huérfano si mañana se añade otra).
--
-- Va como RPC `security definer` porque el cliente no puede tocar `auth.users`
-- (eso exige la clave de servicio, que jamás debe viajar en la app). La
-- función solo borra `auth.uid()` —el usuario de la sesión que la llama—, así
-- que no hay forma de pedir el borrado de la cuenta de otro.
--
-- La clave se verifica ANTES en el cliente, reautenticando: aquí ya llega la
-- decisión tomada.
-- ============================================================================
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;

  delete from auth.users where id = v_user;
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
