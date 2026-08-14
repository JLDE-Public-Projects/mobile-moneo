import { categoryColorByName } from '@/services/transactions/transaction.constants';
import { Recurring, RECURRING_IDS } from '@/services/recurrings/recurring.types';

/** Semilla de recurrente con id estable (para enlazar con los movimientos). */
type RecurringSeed = Omit<Recurring, 'active' | 'createdAt' | 'categoryColor'>;

const SEED: RecurringSeed[] = [
  { id: RECURRING_IDS.chatgpt, name: 'ChatGPT Plus', amount: 74300, day: 2, category: 'Suscripciones', account: 'Tarjeta Visa' },
  { id: RECURRING_IDS.netflix, name: 'Netflix', amount: 64900, day: 3, category: 'Suscripciones', account: 'Tarjeta Visa' },
  { id: RECURRING_IDS.icloud, name: 'iCloud 2 TB', amount: 19900, day: 4, category: 'Suscripciones', account: 'Tarjeta Visa' },
  { id: RECURRING_IDS.fondo, name: 'Fondo de emergencia', amount: 800000, day: 5, category: 'Ahorros', account: 'Ahorros Nu' },
  { id: RECURRING_IDS.etf, name: 'ETF mensual', amount: 254000, day: 5, category: 'Inversiones', account: 'Débito Bancolombia' },
  { id: RECURRING_IDS.spotify, name: 'Spotify', amount: 26900, day: 11, category: 'Suscripciones', account: 'Tarjeta Visa' },
  { id: RECURRING_IDS.arriendo, name: 'Arriendo', amount: 1800000, day: 12, category: 'Arriendo', account: 'Débito Bancolombia' },
  { id: RECURRING_IDS.gimnasio, name: 'Gimnasio', amount: 120000, day: 18, category: 'Salud', account: 'Débito Bancolombia' },
  { id: RECURRING_IDS.carro, name: 'Cuota del carro', amount: 340000, day: 25, category: 'Transporte', account: 'Débito Bancolombia' },
];

/**
 * Recurrentes con los que arranca la app la primera vez, tomados del diseño.
 * El color se resuelve desde la categoría.
 */
export const DEFAULT_RECURRINGS: Omit<Recurring, 'active' | 'createdAt'>[] =
  SEED.map((r) => ({ ...r, categoryColor: categoryColorByName(r.category) }));
