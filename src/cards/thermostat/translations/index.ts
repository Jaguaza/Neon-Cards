import type { Locale } from '../../../core';
import type { ThermostatTranslations } from './types';
import { es } from './es';

/**
 * Cuando se añada un idioma nuevo: crear `translations/en.ts` con un
 * `export const en: ThermostatTranslations = {...}`, añadirlo aquí, y
 * añadir `'en'` a `SUPPORTED_LOCALES` en `src/core/localize.ts`.
 * TypeScript exige que `en.ts` tenga las 33 claves de
 * `ThermostatTranslations` — no hay forma de olvidarse una a medias.
 */
export const THERMOSTAT_TRANSLATIONS: Record<Locale, ThermostatTranslations> = { es };

export type { ThermostatTranslations } from './types';
