/**
 * Modelos del dominio de cuentas.
 *
 * Una cuenta representa un origen de dinero (banco, efectivo o crédito). Los
 * saldos negativos representan deuda (típico de crédito). Se persisten
 * localmente y podrán migrarse a una API sin cambiar la interfaz del repositorio.
 */

/** Tipo de cuenta. */
export type AccountKind = 'savings' | 'cash' | 'credit';

/** Cuenta almacenada. */
export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  /** Saldo actual; negativo indica deuda. */
  balance: number;
  /** Color de la etiqueta, en hex. */
  color: string;
  /** Día de corte (solo crédito), o null. */
  cutDay: number | null;
  /** Descripción libre del subtítulo; si es null se deriva del tipo. */
  description: string | null;
  createdAt: number;
}

/** Datos para crear una cuenta nueva. */
export interface NewAccount {
  name: string;
  kind: AccountKind;
  balance: number;
  color: string;
  cutDay: number | null;
}
