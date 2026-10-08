import type { Locale } from '../../core/localize';
import type { SharedTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const SHARED_TRANSLATIONS: Record<Locale, SharedTranslations> = { es, en };

export type { SharedTranslations } from './types';
