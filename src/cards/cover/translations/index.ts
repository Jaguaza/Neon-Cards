import type { Locale } from '../../../core';
import type { CoverTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const COVER_TRANSLATIONS: Record<Locale, CoverTranslations> = { es, en };

export type { CoverTranslations } from './types';
