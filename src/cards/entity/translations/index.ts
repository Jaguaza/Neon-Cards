import type { Locale } from '../../../core/localize';
import type { EntityTranslations } from './types';
import { es } from './es';

/**
 * Cuando se añada un idioma nuevo: crear `translations/en.ts` con un
 * `export const en: EntityTranslations = {...}`, añadirlo aquí, y
 * añadir `'en'` a `SUPPORTED_LOCALES` en `src/core/localize.ts`.
 * TypeScript exige que `en.ts` tenga las 13 claves de
 * `EntityTranslations` — no hay forma de olvidarse una a medias.
 */
export const ENTITY_TRANSLATIONS: Record<Locale, EntityTranslations> = { es };

export type { EntityTranslations } from './types';
