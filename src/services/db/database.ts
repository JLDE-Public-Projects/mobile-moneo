import * as SQLite from 'expo-sqlite';

/**
 * Acceso centralizado a la base de datos SQLite local.
 *
 * Encapsula la apertura de la BD y las migraciones de esquema para que los
 * repositorios no repitan esa lógica. La conexión se abre una sola vez y se
 * reutiliza (patrón singleton perezoso).
 *
 * La migración a Supabase es progresiva: los dominios ya migrados (usuarios,
 * categorías, cuentas y movimientos) dejaron de usar esta base y sus tablas se
 * eliminan en las migraciones v9 a v11. Solo quedan aquí los pagos recurrentes,
 * hasta que también se migren.
 */

/** Nombre del archivo de base de datos en el dispositivo. */
const DATABASE_NAME = 'moneo.db';

/**
 * Versión del esquema. Se incrementa cada vez que cambia la estructura para
 * disparar la migración correspondiente en dispositivos ya instalados.
 */
const SCHEMA_VERSION = 11;

/** Promesa cacheada de la conexión ya inicializada. */
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Aplica las migraciones necesarias según la versión guardada en la BD.
 *
 * Como la app aún está en desarrollo y no hay datos productivos, la migración a
 * la v2 (usuario en vez de correo) recrea la tabla desde cero. Las migraciones
 * futuras deberán preservar datos.
 */
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) {
    return;
  }

  // v2: usuarios (usuario en vez de correo). Sin datos productivos, se recrea.
  if (currentVersion < 2) {
    await db.execAsync(`
      DROP TABLE IF EXISTS users;
      CREATE TABLE users (
        id            TEXT PRIMARY KEY NOT NULL,
        username      TEXT NOT NULL UNIQUE,
        name          TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at    INTEGER NOT NULL
      );
    `);
  }

  // v3: categorías de movimientos.
  if (currentVersion < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id         TEXT PRIMARY KEY NOT NULL,
        name       TEXT NOT NULL,
        type       TEXT NOT NULL,
        color      TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  // v4: cuentas.
  if (currentVersion < 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id          TEXT PRIMARY KEY NOT NULL,
        name        TEXT NOT NULL,
        kind        TEXT NOT NULL,
        balance     INTEGER NOT NULL,
        color       TEXT NOT NULL,
        cut_day     INTEGER,
        description TEXT,
        created_at  INTEGER NOT NULL
      );
    `);
  }

  // v5: movimientos (transacciones).
  if (currentVersion < 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id             TEXT PRIMARY KEY NOT NULL,
        amount         INTEGER NOT NULL,
        category       TEXT NOT NULL,
        category_color TEXT NOT NULL,
        note           TEXT NOT NULL,
        account        TEXT NOT NULL,
        date           INTEGER NOT NULL,
        created_at     INTEGER NOT NULL
      );
    `);
  }

  // v6: presupuesto por categoría. Añade la columna y, para instalaciones ya
  // sembradas, aplica los presupuestos por defecto del diseño (los valores se
  // congelan aquí como parte de la migración, no se leen de constantes).
  if (currentVersion < 6) {
    await db.execAsync(
      'ALTER TABLE categories ADD COLUMN budget INTEGER NOT NULL DEFAULT 0;',
    );
    const defaults: [string, number][] = [
      ['Arriendo', 1800000],
      ['Mercado', 800000],
      ['Transporte', 400000],
      ['Suscripciones', 150000],
      ['Salud', 500000],
      ['Ahorros', 800000],
      ['Inversiones', 250000],
    ];
    for (const [name, budget] of defaults) {
      await db.runAsync(
        'UPDATE categories SET budget = ? WHERE name = ?',
        budget,
        name,
      );
    }
  }

  // v7: pagos recurrentes.
  if (currentVersion < 7) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recurrings (
        id             TEXT PRIMARY KEY NOT NULL,
        name           TEXT NOT NULL,
        amount         INTEGER NOT NULL,
        day            INTEGER NOT NULL,
        category       TEXT NOT NULL,
        category_color TEXT NOT NULL,
        account        TEXT NOT NULL,
        active         INTEGER NOT NULL DEFAULT 1,
        created_at     INTEGER NOT NULL
      );
    `);
  }

  // v8: enlace de un movimiento con el recurrente que lo originó. Para las
  // instalaciones ya sembradas, se enlazan por nota los movimientos semilla que
  // corresponden a un recurrente (valores congelados aquí).
  if (currentVersion < 8) {
    await db.execAsync(
      'ALTER TABLE transactions ADD COLUMN recurring_id TEXT;',
    );
    const links: [string, string][] = [
      ['Arriendo agosto', 'rec-101'],
      ['Spotify', 'rec-104'],
      ['Fondo de emergencia', 'rec-105'],
      ['ETF mensual', 'rec-106'],
      ['iCloud 2 TB', 'rec-103'],
      ['Netflix', 'rec-102'],
      ['ChatGPT Plus', 'rec-100'],
    ];
    for (const [note, recurringId] of links) {
      await db.runAsync(
        'UPDATE transactions SET recurring_id = ? WHERE note = ? AND recurring_id IS NULL',
        recurringId,
        note,
      );
    }
  }

  // v9: usuarios y categorías pasaron a Supabase, así que sus tablas locales
  // sobran. Se eliminan aquí (y no borrando las migraciones anteriores) porque
  // los pasos previos son también el camino de una instalación nueva: quitar la
  // creación de `categories` rompería el ALTER de la v6 que depende de ella.
  if (currentVersion < 9) {
    await db.execAsync(`
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS categories;
    `);
  }

  // v10: las cuentas también pasaron a Supabase.
  if (currentVersion < 10) {
    await db.execAsync('DROP TABLE IF EXISTS accounts;');
  }

  // v11: y los movimientos. Solo quedan los recurrentes en local.
  if (currentVersion < 11) {
    await db.execAsync('DROP TABLE IF EXISTS transactions;');
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
}

/**
 * Devuelve la conexión a la BD, abriéndola y migrando el esquema la primera
 * vez. Las llamadas siguientes reutilizan la misma conexión.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      // WAL mejora la concurrencia de lecturas/escrituras en móvil.
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await migrate(db);
      return db;
    });
  }
  return databasePromise;
}
