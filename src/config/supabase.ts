/**
 * Configuración de Supabase.
 *
 * La `publishable key` (antes `anon key`) es pública por diseño: solo permite lo
 * que las políticas RLS del proyecto autoricen, por eso puede vivir en el
 * cliente. La clave `service_role` NUNCA debe estar aquí.
 */
export const SUPABASE_URL = 'https://vlwhsbiejikttxjzqkeo.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_D9nrjTI4SuclvzbS-6OFCQ_AtBcYrez';

/**
 * Dominio del "email sintético".
 *
 * Supabase Auth se autentica con email+clave, pero la app usa un `username`
 * simple (sin correo). Puenteamos esa brecha mapeando cada usuario a un email
 * interno `username@moneo.app`. No es un correo real: por eso "Confirm email"
 * debe estar DESACTIVADO en Supabase (con confirmación activa, Supabase intenta
 * enviar el correo y falla/limita) y no hay recuperación de clave por correo.
 *
 * IMPORTANTE: se usa un TLD real (`.app`). Supabase RECHAZA TLD reservados como
 * `.local`, `.test` o `.internal` con el error `email_address_invalid`.
 */
export const SYNTHETIC_EMAIL_DOMAIN = 'moneo.app';

/** Construye el email interno a partir del nombre de usuario. */
export function usernameToEmail(username: string): string {
   return `${username.trim().toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
}
