import type { Locale } from '../../../core/localize';
import type { EntityTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const ENTITY_TRANSLATIONS: Record<Locale, EntityTranslations> = { es, en };

export type { EntityTranslations } from './types';
