import type { AuthError, User } from '@supabase/supabase-js';
import { AuthRepository } from '@/services/auth/auth.repository';
import { AuthSession, AuthUser } from '@/services/auth/auth.types';
import { supabase } from '@/services/supabase/client';
import { usernameToEmail } from '@/config/supabase';
import { MIN_PASSWORD_LENGTH } from '@/utils/validation';

/**
 * Traduce el error de registro de Supabase a un mensaje accionable.
 *
 * Un mensaje genérico deja al usuario sin saber qué corregir, así que los casos
 * conocidos se identifican por su código (estable) y no por el texto en inglés.
 */
function describeSignUpError(error: AuthError): string {
  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'Ese usuario ya está registrado.';
    case 'weak_password':
      return `La clave necesita mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
    case 'email_address_invalid':
      return 'Ese nombre de usuario no es válido. Prueba con otro.';
    case 'signup_disabled':
    case 'email_provider_disabled':
      return 'El registro está deshabilitado en este momento.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Demasiados intentos. Espera un momento y vuelve a intentarlo.';
    default:
      // El trigger del servidor rechaza códigos de invitación inexistentes.
      if (error.message.includes('invitación')) {
        return 'El código de invitación no es válido.';
      }
      return 'No pudimos crear tu cuenta. Inténtalo de nuevo.';
  }
}

/**
 * Deriva el usuario del dominio a partir del usuario de Supabase.
 *
 * `username` y `name` se guardan en `user_metadata` durante el registro (y se
 * mantienen ahí), de modo que la sesión no necesita una consulta extra a la
 * tabla `profiles` para conocerlos.
 */
function mapUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    username: (meta.username as string) ?? '',
    name: (meta.name as string) ?? '',
  };
}

/**
 * Implementación de {@link AuthRepository} sobre Supabase Auth.
 *
 * Usa el "email sintético" (`username@moneo.local`) para reconciliar el login
 * por usuario de la app con el login por email de Supabase. El sistema de
 * invitación se valida en el servidor: un RPC comprueba el código antes de
 * registrar (para dar un mensaje claro) y un trigger `on auth.users` crea el
 * perfil y asigna un código único —siendo la fuente de verdad de la integridad.
 */
export const supabaseAuthRepository: AuthRepository = {
  async register({ username, name, password, inviteCode }): Promise<AuthSession> {
    // 1) Validación de la invitación en el servidor (mensaje claro para la UI).
    const { data: isValid, error: rpcError } = await supabase.rpc(
      'is_valid_invite',
      { code: inviteCode },
    );
    if (rpcError) {
      throw new Error('No pudimos validar el código de invitación.');
    }
    if (!isValid) {
      throw new Error('El código de invitación no es válido.');
    }

    // 2) Alta en Supabase Auth. El trigger del servidor crea el perfil con los
    // datos de `data` (username, name) y valida de nuevo la invitación.
    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: { data: { username, name, invite_code: inviteCode } },
    });

    if (error) {
      throw new Error(describeSignUpError(error));
    }

    // Sin sesión = "Confirm email" está activo en Supabase (incompatible con el
    // email sintético). Lo señalamos para poder corregir la configuración.
    if (!data.session || !data.user) {
      throw new Error(
        'La cuenta se creó pero no inició sesión. Desactiva "Confirm email" en Supabase.',
      );
    }

    return { token: data.session.access_token, user: mapUser(data.user) };
  },

  async login({ username, password }): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });

    if (error || !data.session) {
      // No distinguimos "usuario no existe" de "clave incorrecta" para no filtrar
      // qué usuarios están registrados.
      throw new Error('Usuario o clave incorrectos.');
    }

    return { token: data.session.access_token, user: mapUser(data.user) };
  },

  async updateProfile({ name, currentPassword, newPassword }): Promise<AuthUser> {
    // El `username` es la identidad de la cuenta (deriva el email sintético de
    // login), por eso NO se cambia aquí: mutarlo rompería el inicio de sesión.
    // Se actualizan el nombre (en metadata) y, opcionalmente, la clave.
    const { data: current } = await supabase.auth.getUser();
    const username = (current.user?.user_metadata?.username as string) ?? '';

    // Cambio de clave: Supabase NO pide la clave actual para `updateUser`, así
    // que la verificamos nosotros reautenticando. Sin esto, cualquiera con la
    // sesión abierta podría cambiarla sin conocer la actual.
    if (newPassword) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password: currentPassword ?? '',
      });
      if (reauthError) {
        throw new Error('La clave actual no es correcta.');
      }
    }

    const attributes: Parameters<typeof supabase.auth.updateUser>[0] = {
      // Reenviamos `username` para no perderlo (updateUser fusiona metadata).
      data: { name, username },
    };
    if (newPassword) {
      attributes.password = newPassword;
    }

    const { data, error } = await supabase.auth.updateUser(attributes);
    if (error || !data.user) {
      throw new Error('No pudimos actualizar tu perfil.');
    }

    // Mantenemos la tabla `profiles` sincronizada con el nombre visible.
    await supabase.from('profiles').update({ name }).eq('id', data.user.id);

    return mapUser(data.user);
  },

  async getInviteCode(): Promise<string> {
    // RLS limita la lectura al propio perfil, así que no hace falta filtrar por
    // id: `single()` devuelve la única fila visible (la del usuario en sesión).
    const { data, error } = await supabase
      .from('profiles')
      .select('invite_code')
      .single();
    if (error || !data) {
      throw new Error('No pudimos obtener tu código de invitación.');
    }
    return data.invite_code as string;
  },
};
