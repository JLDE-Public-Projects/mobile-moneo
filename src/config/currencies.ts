/**
 * Catálogo de monedas soportadas y utilidades de formato.
 *
 * La moneda es una preferencia global (ver `store/settingsStore`). Cada entrada
 * describe cómo se muestra el símbolo y cómo se agrupan los miles, de modo que
 * los importes de toda la app se formateen según la moneda elegida.
 */

/** Código ISO de las monedas soportadas. */
export type CurrencyCode = 'COP' | 'USD' | 'EUR';

/** Descripción de una moneda. */
export interface Currency {
  code: CurrencyCode;
  /** Símbolo mostrado junto al importe. */
  symbol: string;
  /** Nombre legible. */
  name: string;
  /** Separador de miles. */
  thousandSep: string;
  /** Separador decimal. */
  decimalSep: string;
}

/** Monedas disponibles, tomadas del diseño. */
export const CURRENCIES: Currency[] = [
  { code: 'COP', symbol: '$', name: 'Peso colombiano', thousandSep: '.', decimalSep: ',' },
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense', thousandSep: ',', decimalSep: '.' },
  { code: 'EUR', symbol: '€', name: 'Euro', thousandSep: '.', decimalSep: ',' },
];

/** Moneda por defecto. */
export const DEFAULT_CURRENCY_CODE: CurrencyCode = 'COP';

/** Devuelve la moneda por código (o la de por defecto si no existe). */
export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/**
 * Formatea un importe entero agrupando los miles con el separador de la moneda.
 * (Los importes se manejan sin decimales por ahora.)
 */
export function formatNumber(amount: number, currency: Currency): string {
  const sign = amount < 0 ? '-' : '';
  const digits = Math.abs(Math.round(amount)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
  return `${sign}${grouped}`;
}

/** Formatea un importe con el símbolo de la moneda (p. ej. "$ 1.800.000"). */
export function formatCurrency(amount: number, currency: Currency): string {
  return `${currency.symbol} ${formatNumber(amount, currency)}`;
}

/**
 * Formatea un importe con signo pegado al símbolo, como en las cuentas del
 * diseño (p. ej. "−$862.400", "$3.180.000").
 */
export function formatMoney(amount: number, currency: Currency): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}${currency.symbol}${formatNumber(Math.abs(amount), currency)}`;
}

/** Etiqueta corta de la moneda para filas de ajustes (p. ej. "COP $"). */
export function currencyShortLabel(currency: Currency): string {
  return `${currency.code} ${currency.symbol}`;
}
