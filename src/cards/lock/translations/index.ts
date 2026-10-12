import type { Locale } from '../../../core';
import type { LockTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const LOCK_TRANSLATIONS: Record<Locale, LockTranslations> = { es, en };

export type { LockTranslations } from './types';
