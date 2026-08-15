import type { Locale } from '../../../core';
import type { ButtonTranslations } from './types';
import { es } from './es';

/**
 * Cuando se añada un idioma nuevo: crear `translations/en.ts` con un
 * `export const en: ButtonTranslations = {...}`, añadirlo aquí, y
 * añadir `'en'` a `SUPPORTED_LOCALES` en `src/core/localize.ts`.
 * TypeScript exige que `en.ts` tenga las 18 claves de
 * `ButtonTranslations` — no hay forma de olvidarse una a medias.
 */
export const BUTTON_TRANSLATIONS: Record<Locale, ButtonTranslations> = { es };

export type { ButtonTranslations } from './types';
