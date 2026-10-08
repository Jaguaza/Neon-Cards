import type { Locale } from '../../../core';
import type { ThermostatTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const THERMOSTAT_TRANSLATIONS: Record<Locale, ThermostatTranslations> = { es, en };

export type { ThermostatTranslations } from './types';
