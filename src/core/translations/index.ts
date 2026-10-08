import type { Locale } from '../localize';
import type { CoreTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const CORE_TRANSLATIONS: Record<Locale, CoreTranslations> = { es, en };

export type { CoreTranslations } from './types';
