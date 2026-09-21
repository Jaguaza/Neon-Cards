import type { Locale } from '../../../core';
import type { ButtonTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const BUTTON_TRANSLATIONS: Record<Locale, ButtonTranslations> = { es, en };

export type { ButtonTranslations } from './types';
