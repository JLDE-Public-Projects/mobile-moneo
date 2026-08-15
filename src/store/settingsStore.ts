import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { CurrencyCode, DEFAULT_CURRENCY_CODE } from '@/config/currencies';
import i18n, { detectLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n';

/** Preferencia de idioma: uno soportado, o "system" para seguir al dispositivo. */
export type LanguagePreference = SupportedLanguage | 'system';

const LANGUAGE_STORAGE_KEY = '@moneo/language';

/** Estado global de preferencias de la app. */
interface SettingsState {
  /** Moneda seleccionada. */
  currency: CurrencyCode;
  /** Cambia la moneda. */
  setCurrency: (currency: CurrencyCode) => void;
  /** Preferencia de idioma ("system" = el del dispositivo). */
  languagePreference: LanguagePreference;
  /** Cambia el idioma, lo aplica de inmediato y lo persiste. */
  setLanguagePreference: (preference: LanguagePreference) => void;
}

/**
 * Store global de preferencias (Zustand).
 *
 * Guarda ajustes de la app accesibles desde cualquier pantalla (moneda,
 * idioma y, más adelante, primer día del mes, privacidad, etc.). Es estado de
 * UI, separado del estado del servidor (TanStack Query) y de la sesión.
 *
 * TODO(persist): persistir la moneda igual que ya se hace con el idioma.
 */
export const useSettingsStore = create<SettingsState>((set) => ({
  currency: DEFAULT_CURRENCY_CODE,
  setCurrency: (currency) => set({ currency }),

  languagePreference: 'system',
  setLanguagePreference: (preference) => {
    set({ languagePreference: preference });
    void i18n.changeLanguage(preference === 'system' ? detectLanguage() : preference);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
  },
}));

/**
 * Lee la preferencia de idioma guardada y la aplica.
 *
 * Se llama una vez al arrancar la app: hasta que responda, el idioma activo es
 * el detectado del dispositivo (valor inicial fijado en `i18n/index.ts`), que
 * es exactamente lo que corresponde si la preferencia guardada resulta ser
 * "system" o no hay ninguna todavía.
 */
export async function loadLanguagePreference(): Promise<void> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const preference: LanguagePreference =
    stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
      ? (stored as SupportedLanguage)
      : 'system';

  useSettingsStore.setState({ languagePreference: preference });
  if (preference !== 'system') {
    await i18n.changeLanguage(preference);
  }
}
