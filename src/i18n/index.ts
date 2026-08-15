import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import es from '@/i18n/locales/es';
import en from '@/i18n/locales/en';

/** Idiomas que la app sabe mostrar. El primero es el de respaldo. */
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: SupportedLanguage = 'es';

/**
 * Detecta el idioma preferido del dispositivo entre los que la app soporta.
 *
 * `expo-localization` devuelve las preferencias del sistema en orden; se toma
 * la primera que coincida con un idioma soportado, y si ninguna coincide se
 * cae al idioma por defecto en vez de a un idioma a medias o inexistente.
 */
function detectLanguage(): SupportedLanguage {
  const tags = Localization.getLocales();
  for (const tag of tags) {
    const code = tag.languageCode?.toLowerCase();
    if (code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code)) {
      return code as SupportedLanguage;
    }
  }
  return DEFAULT_LANGUAGE;
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  // React ya escapa el contenido; escapar aquí además rompería acentos.
  interpolation: { escapeValue: false },
  // Evita advertencias por Suspense: la app siempre tiene los recursos ya
  // cargados en memoria (van en el bundle), no hace falta esperarlos.
  react: { useSuspense: false },
});

export default i18n;
