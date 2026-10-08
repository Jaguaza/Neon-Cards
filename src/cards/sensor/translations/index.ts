import type { Locale } from '../../../core';
import type { SensorTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const SENSOR_TRANSLATIONS: Record<Locale, SensorTranslations> = { es, en };

export type { SensorTranslations } from './types';
