import * as Crypto from 'expo-crypto';
import { AuthRepository } from '@/services/auth/auth.repository';
import { AuthSession, AuthUser } from '@/services/auth/auth.types';
import { getDatabase } from '@/services/db/database';
import {
  generateSalt,
  hashPassword,
} from '@/services/auth/security/password';

/** Fila de la tabla `users` tal como se almacena en SQLite. */
interface UserRow {
  id: string;
  username: string;
  name: string;
  password_hash: string;
  password_salt: string;
  created_at: number;
}

/** Construye la sesión (con un token local) a partir de un usuario. */
function buildSession(user: AuthUser): AuthSession {
  return { token: Crypto.randomUUID(), user };
}

/**
 * Implementación de {@link AuthRepository} sobre la base de datos SQLite local.
 *
 * Persiste los usuarios en el dispositivo y valida las credenciales contra esa
 * base. Al cumplir el mismo contrato que cualquier otra implementación, puede
 * intercambiarse por una basada en API desde `services/container.ts` sin tocar
 * la UI ni las mutaciones que la consumen.
 */
export const sqliteAuthRepository: AuthRepository = {
  async register({ username, name, password }) {
    const db = await getDatabase();

    // Evitamos duplicados antes de insertar.
    const existing = await db.getFirstAsync<Pick<UserRow, 'id'>>(
      'SELECT id FROM users WHERE username = ?',
      username,
    );
    if (existing) {
      throw new Error('Ese usuario ya está registrado.');
    }

    const salt = await generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const user: AuthUser = {
      id: Crypto.randomUUID(),
      username,
      name: name.trim(),
    };

    await db.runAsync(
      `INSERT INTO users (id, username, name, password_hash, password_salt, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      user.id,
      user.username,
      user.name,
      passwordHash,
      salt,
      Date.now(),
    );

    // El código de invitación ya se valida en el formulario; cuando exista el
    // backend, su verificación real vivirá en el servidor.
    return buildSession(user);
  },

  async login({ username, password }) {
    const db = await getDatabase();

    const row = await db.getFirstAsync<UserRow>(
      'SELECT * FROM users WHERE username = ?',
      username,
    );
    if (!row) {
      throw new Error('No encontramos una cuenta con ese usuario.');
    }

    // Rehash con la sal almacenada y comparamos.
    const passwordHash = await hashPassword(password, row.password_salt);
    if (passwordHash !== row.password_hash) {
      throw new Error('La clave no es correcta.');
    }

    return buildSession({ id: row.id, username: row.username, name: row.name });
  },

  async updateProfile({ id, name, username, currentPassword, newPassword }) {
    const db = await getDatabase();

    const row = await db.getFirstAsync<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      id,
    );
    if (!row) {
      throw new Error('No encontramos tu cuenta.');
    }

    const normalizedUsername = username.trim();

    // Si cambia el usuario, verificamos que no esté tomado por otro.
    if (normalizedUsername !== row.username) {
      const taken = await db.getFirstAsync<Pick<UserRow, 'id'>>(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        normalizedUsername,
        id,
      );
      if (taken) {
        throw new Error('Ese usuario ya está en uso.');
      }
    }

    // Cambio de clave opcional: solo si viene una nueva.
    let passwordHash = row.password_hash;
    let passwordSalt = row.password_salt;
    if (newPassword) {
      const currentHash = await hashPassword(
        currentPassword ?? '',
        row.password_salt,
      );
      if (currentHash !== row.password_hash) {
        throw new Error('La clave actual no es correcta.');
      }
      passwordSalt = await generateSalt();
      passwordHash = await hashPassword(newPassword, passwordSalt);
    }

    await db.runAsync(
      `UPDATE users
       SET name = ?, username = ?, password_hash = ?, password_salt = ?
       WHERE id = ?`,
      name.trim(),
      normalizedUsername,
      passwordHash,
      passwordSalt,
      id,
    );

    return { id, username: normalizedUsername, name: name.trim() };
  },
};
