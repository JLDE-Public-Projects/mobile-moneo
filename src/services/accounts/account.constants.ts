import { Account, AccountKind } from '@/services/accounts/account.types';
import { SegmentOption } from '@/components/molecules/SegmentedControl';

/** Opciones del selector de tipo de cuenta (control segmentado del diseño). */
export const ACCOUNT_KIND_OPTIONS: SegmentOption<AccountKind>[] = [
  { value: 'savings', label: 'Banco' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit', label: 'Crédito' },
];

/** Tipo de cuenta por defecto al abrir el formulario de alta. */
export const DEFAULT_ACCOUNT_KIND: AccountKind = 'savings';

/** Semilla de cuenta (sin id ni fecha; se asignan al sembrar). */
type AccountSeed = Omit<Account, 'id' | 'createdAt'>;

/** Cuentas con las que arranca la app la primera vez, tomadas del diseño. */
export const DEFAULT_ACCOUNTS: AccountSeed[] = [
  {
    name: 'Débito Bancolombia',
    kind: 'savings',
    balance: 3180000,
    color: '#D1A84B',
    cutDay: null,
    description: 'Cuenta de ahorros',
  },
  {
    name: 'Efectivo',
    kind: 'cash',
    balance: 240000,
    color: '#85BF86',
    cutDay: null,
    description: 'Billetera',
  },
  {
    name: 'Tarjeta Visa',
    kind: 'credit',
    balance: -862400,
    color: '#6C85BD',
    cutDay: 15,
    description: 'Crédito · corte el 15',
  },
  {
    name: 'Ahorros Nu',
    kind: 'savings',
    balance: 4500000,
    color: '#B96BCB',
    cutDay: null,
    description: 'Fondo de emergencia',
  },
];

/**
 * Subtítulo a mostrar bajo el nombre de la cuenta: usa la descripción si existe,
 * o una derivada del tipo (y el día de corte para crédito).
 */
export function accountSubtitle(account: Account): string {
  if (account.description) {
    return account.description;
  }
  switch (account.kind) {
    case 'savings':
      return 'Banco';
    case 'cash':
      return 'Efectivo';
    case 'credit':
      return account.cutDay ? `Crédito · corte el ${account.cutDay}` : 'Crédito';
  }
}

/** Etiqueta del campo de saldo según el tipo (deuda para crédito). */
export function balanceLabel(kind: AccountKind): string {
  return kind === 'credit' ? 'Deuda actual' : 'Saldo actual';
}
