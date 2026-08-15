/**
 * Helpers de validación puros compartidos por los formularios de auth.
 *
 * Mantener la validación libre de UI la hace fácil de testear y permite que
 * login y registro reutilicen exactamente las mismas reglas.
 */

/** Longitud máxima de un nombre de usuario. */
export const MAX_USERNAME_LENGTH = 20;

/** Longitud mínima de un nombre de usuario. */
export const MIN_USERNAME_LENGTH = 3;

/**
 * Normaliza lo que el usuario escribe en el campo "Usuario":
 * - reemplaza los espacios por "_",
 * - elimina cualquier carácter que no sea letra, número o "_",
 * - recorta a la longitud máxima.
 *
 * Así el campo se autocorrige y nunca contiene entradas inválidas.
 */
export function normalizeUsername(value: string): string {
  return value
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .slice(0, MAX_USERNAME_LENGTH);
}

/**
 * Devuelve true cuando el usuario es una palabra simple: solo letras, números
 * o "_", sin espacios ni otros caracteres especiales, entre el mínimo y el
 * máximo de longitud.
 */
export function isValidUsername(value: string): boolean {
  const pattern = new RegExp(
    `^[A-Za-z0-9_]{${MIN_USERNAME_LENGTH},${MAX_USERNAME_LENGTH}}$`,
  );
  return pattern.test(value);
}

/** Longitud mínima aceptada de contraseña, reflejada en el placeholder. */
export const MIN_PASSWORD_LENGTH = 4;

/** Devuelve true cuando la contraseña cumple la longitud mínima. */
export function isValidPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH;
}

/** Longitud mínima de un nombre para considerarlo válido. */
export const MIN_NAME_LENGTH = 2;

/** Devuelve true cuando el nombre tiene al menos dos caracteres visibles. */
export function isValidName(value: string): boolean {
  return value.trim().length >= MIN_NAME_LENGTH;
}

/**
 * Formato del código de invitación: prefijo "MONEO-" seguido de 6 caracteres
 * hexadecimales (0-9, A-F) — así es como Supabase los genera (ver
 * `generate_invite_code` en supabase/schema.sql). Se valida en mayúsculas
 * porque el campo se normaliza al escribir.
 */
const INVITE_CODE_PATTERN = /^MONEO-[0-9A-Z]{6}$/;

/** Normaliza el código a mayúsculas y sin espacios para validarlo/enviarlo. */
export function normalizeInviteCode(value: string): string {
  return value.trim().toUpperCase();
}

/** Devuelve true cuando el código de invitación cumple el formato MONEO-0000. */
export function isValidInviteCode(value: string): boolean {
  return INVITE_CODE_PATTERN.test(normalizeInviteCode(value));
}
