import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MonthNames } from '@/utils/date';

/**
 * Nombres de mes del idioma activo, listos para pasar a las funciones de
 * `utils/date.ts`. Centralizado aquí para no repetir el `t(..., {returnObjects})`
 * en cada pantalla que formatea una fecha.
 */
export function useMonthNames(): MonthNames {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => ({
      long: t('months.long', { returnObjects: true }) as unknown as string[],
      short: t('months.short', { returnObjects: true }) as unknown as string[],
    }),
    // `i18n.language` fuerza a recalcular al cambiar de idioma.
    [t, i18n.language],
  );
}
