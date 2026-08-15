import { TFunction } from 'i18next';
import { Account, AccountKind } from '@/services/accounts/account.types';
import { SegmentOption } from '@/components/molecules/SegmentedControl';

/**
 * Opciones del selector de tipo de cuenta (control segmentado del diseño).
 *
 * Es una función y no una constante de módulo porque sus etiquetas dependen
 * del idioma activo: una constante fijada al cargar el módulo no podría
 * refrescarse si el usuario cambia de idioma en caliente.
 */
export function accountKindOptions(t: TFunction): SegmentOption<AccountKind>[] {
  return [
    { value: 'savings', label: t('accounts.kinds.savings') },
    { value: 'cash', label: t('accounts.kinds.cash') },
    { value: 'credit', label: t('accounts.kinds.credit') },
  ];
}

/** Tipo de cuenta por defecto al abrir el formulario de alta. */
export const DEFAULT_ACCOUNT_KIND: AccountKind = 'savings';

/**
 * Subtítulo a mostrar bajo el nombre de la cuenta: usa la descripción si existe,
 * o una derivada del tipo (y el día de corte para crédito).
 */
export function accountSubtitle(account: Account, t: TFunction): string {
  if (account.description) {
    return account.description;
  }
  switch (account.kind) {
    case 'savings':
      return t('accounts.subtitleSavings');
    case 'cash':
      return t('accounts.subtitleCash');
    case 'credit':
      return account.cutDay
        ? t('accounts.subtitleCredit', { day: account.cutDay })
        : t('accounts.kinds.credit');
  }
}

/** Etiqueta del campo de saldo según el tipo (deuda para crédito). */
export function balanceLabel(kind: AccountKind, t: TFunction): string {
  return kind === 'credit' ? t('accounts.debtLabel') : t('accounts.balanceLabel');
}
