import type { HomeAssistant } from '../ha/types';

/**
 * Motor de traducción genérico (acuerdo nº4: vive en core, reutilizable
 * por cualquier tarjeta o por el propio core — sin un solo texto
 * hardcodeado aquí dentro, eso vive en `translations/<locale>.ts` de
 * cada módulo). `es` y `en` están poblados en los 5 diccionarios del
 * repo (core, shared, entity, button, thermostat) — añadir un tercer
 * idioma sigue el mismo patrón: crear el archivo de traducción en cada
 * módulo y añadir el código aquí abajo, TypeScript avisa si falta
 * alguna clave (ver el tipo `Translations` de cada módulo).
 */

/** Amplíar aquí cuando se añada un idioma nuevo, además de exportar su
    `translations/<locale>.ts` en cada módulo que lo soporte. */
export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Idioma usado cuando `hass.locale.language` falta o no está entre
    los soportados. */
export const DEFAULT_LOCALE: Locale = 'es';

/**
 * Resuelve qué locale usar a partir de `hass.locale.language`
 * (p. ej. 'es', 'en', 'es-419') — se compara solo la parte antes del
 * guion, y si no hay `hass` o el idioma no está soportado, cae a
 * `DEFAULT_LOCALE`.
 */
export function resolveLocale(hass: HomeAssistant | undefined): Locale {
  const lang = hass?.locale?.language?.split('-')[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(lang ?? '') ? (lang as Locale) : DEFAULT_LOCALE;
}

/**
 * Devuelve la traducción de `key` en el idioma resuelto de `hass`,
 * usando `dict` (el `Record<Locale, Translations>` del módulo que
 * llama) — cae a `DEFAULT_LOCALE` si el diccionario del idioma
 * resuelto no tiene esa clave (no debería pasar si `Translations`
 * exige todas las claves, pero es la red de seguridad en runtime).
 */
export function localize<T extends Record<keyof T, string>>(
  hass: HomeAssistant | undefined,
  dict: Record<Locale, T>,
  key: keyof T
): string {
  const locale = resolveLocale(hass);
  return dict[locale]?.[key] ?? dict[DEFAULT_LOCALE][key];
}
