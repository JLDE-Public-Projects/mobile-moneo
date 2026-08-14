/**
 * Modelos del dominio de autenticación.
 *
 * Representan el contrato esperado con la API. Se mantienen aquí, junto al
 * servicio, para que UI y estado global compartan una única fuente de verdad.
 */

/** Usuario autenticado. */
export interface AuthUser {
  id: string;
  /** Nombre de usuario (palabra simple, no un correo). */
  username: string;
  name: string;
}

/** Sesión devuelta por la API tras un login/registro correcto. */
export interface AuthSession {
  /** Token de acceso. TODO(api): definir formato (JWT, opaco, ...). */
  token: string;
  user: AuthUser;
}

/** Datos que la API espera para iniciar sesión. */
export interface LoginPayload {
  username: string;
  password: string;
}

/** Datos que la API espera para crear una cuenta. */
export interface RegisterPayload {
  username: string;
  name: string;
  password: string;
  inviteCode: string;
}

/**
 * Datos para actualizar el perfil. La contraseña solo cambia si `newPassword`
 * viene con valor, y entonces se exige `currentPassword` correcta.
 */
export interface UpdateProfileInput {
  id: string;
  name: string;
  username: string;
  currentPassword?: string;
  newPassword?: string;
}
