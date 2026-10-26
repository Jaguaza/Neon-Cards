import type { Locale } from '../../../core';
import type { AlarmTranslations } from './types';
import { es } from './es';
import { en } from './en';

export const ALARM_TRANSLATIONS: Record<Locale, AlarmTranslations> = { es, en };

export type { AlarmTranslations } from './types';
