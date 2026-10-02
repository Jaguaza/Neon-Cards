import type { Locale } from '../../core/localize';
import type { SharedTranslations } from './types';
import { es } from './es';

/**
 * Cuando se añada un idioma nuevo: crear `translations/en.ts` con un
 * `export const en: SharedTranslations = {...}`, añadirlo aquí, y
 * añadir `'en'` a `SUPPORTED_LOCALES` en `src/core/localize.ts`.
 * TypeScript exige que `en.ts` tenga las 13 claves de
 * `SharedTranslations` — no hay forma de olvidarse una a medias.
 */
export const SHARED_TRANSLATIONS: Record<Locale, SharedTranslations> = { es };

export type { SharedTranslations } from './types';
