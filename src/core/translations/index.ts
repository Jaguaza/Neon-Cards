import type { Locale } from '../localize';
import type { CoreTranslations } from './types';
import { es } from './es';

/**
 * Cuando se añada un idioma nuevo: crear `translations/en.ts` con un
 * `export const en: CoreTranslations = {...}`, añadirlo aquí, y añadir
 * `'en'` a `SUPPORTED_LOCALES` en `../localize.ts`. TypeScript exige
 * que `en.ts` tenga las 5 claves de `CoreTranslations` — no hay forma
 * de olvidarse una a medias.
 */
export const CORE_TRANSLATIONS: Record<Locale, CoreTranslations> = { es };

export type { CoreTranslations } from './types';
