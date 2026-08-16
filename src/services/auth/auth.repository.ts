import {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfileInput,
} from '@/services/auth/auth.types';

/**
 * Contrato del repositorio de autenticación (patrón Repository).
 *
 * Define QUÉ operaciones existen, no CÓMO se implementan. Gracias a esta
 * abstracción, el resto de la app (mutaciones de TanStack Query, pantallas) no
 * sabe si detrás hay datos simulados, una base de datos local (SQLite) o una
 * API externa: cualquiera de esas implementaciones puede intercambiarse en un
 * único punto (ver `services/container.ts`) sin tocar a los consumidores.
 */
export interface AuthRepository {
  /** Inicia sesión y devuelve la sesión resultante. */
  login(payload: LoginPayload): Promise<AuthSession>;
  /** Crea una cuenta y devuelve la sesión resultante. */
  register(payload: RegisterPayload): Promise<AuthSession>;
  /** Actualiza el perfil (y, opcionalmente, la clave). Devuelve el usuario. */
  updateProfile(input: UpdateProfileInput): Promise<AuthUser>;
  /** Código de invitación propio del usuario autenticado (para compartir). */
  getInviteCode(): Promise<string>;
  /**
   * Elimina la cuenta del usuario en sesión y todos sus datos.
   *
   * Pide la clave actual porque es irreversible: tener la sesión abierta (un
   * teléfono desbloqueado, prestado un momento) no debería bastar para borrar
   * el historial completo de alguien.
   */
  deleteAccount(password: string): Promise<void>;
}
