import { create } from 'zustand';
import { CurrencyCode, DEFAULT_CURRENCY_CODE } from '@/config/currencies';

/** Estado global de preferencias de la app. */
interface SettingsState {
  /** Moneda seleccionada. */
  currency: CurrencyCode;
  /** Cambia la moneda. */
  setCurrency: (currency: CurrencyCode) => void;
}

/**
 * Store global de preferencias (Zustand).
 *
 * Guarda ajustes de la app accesibles desde cualquier pantalla (moneda y, más
 * adelante, primer día del mes, privacidad, etc.). Es estado de UI, separado
 * del estado del servidor (TanStack Query) y de la sesión.
 *
 * TODO(persist): persistir estas preferencias (SQLite / almacenamiento local)
 * para que sobrevivan a reinicios.
 */
export const useSettingsStore = create<SettingsState>((set) => ({
  currency: DEFAULT_CURRENCY_CODE,
  setCurrency: (currency) => set({ currency }),
}));
