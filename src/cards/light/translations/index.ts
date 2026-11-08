import type { Locale } from '../../../core';
import type { LightTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const LIGHT_TRANSLATIONS: Record<Locale, LightTranslations> = { es, en };

export type { LightTranslations } from './types';
