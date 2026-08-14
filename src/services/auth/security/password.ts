import * as Crypto from 'expo-crypto';

/**
 * Utilidades de hashing de contraseñas para el almacenamiento LOCAL.
 *
 * Nunca guardamos la clave en texto plano: se almacena un hash con sal única
 * por usuario. Es SHA-256 salado, suficiente para una base de datos local del
 * dispositivo. Cuando la autenticación pase a un servidor, el hashing seguro
 * (con estiramiento de clave) vivirá en el backend.
 */

/** Genera una sal aleatoria en hexadecimal (16 bytes). */
export async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Deriva el hash de una contraseña con su sal. */
export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
}
