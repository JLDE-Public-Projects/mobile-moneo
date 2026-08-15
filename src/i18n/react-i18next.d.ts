import 'i18next';
import es from '@/i18n/locales/es';

/**
 * Tipa `t()` con las claves reales del recurso en español (la fuente de
 * verdad de la estructura). Así un typo en una clave o un parámetro de
 * interpolación que falta se detecta en compilación, no al ver la pantalla
 * en blanco.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof es;
    };
  }
}
