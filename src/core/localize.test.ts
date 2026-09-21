import { describe, it, expect } from 'vitest';
import { resolveLocale, localize, DEFAULT_LOCALE } from './localize';
import type { HomeAssistant } from '../ha/types';

/** hass mínimo, solo con el campo que resolveLocale/localize necesitan. */
function hassWithLanguage(language: string | undefined): HomeAssistant | undefined {
  if (language === undefined) return undefined;
  return { locale: { language } } as HomeAssistant;
}

describe('resolveLocale', () => {
  it('cae a DEFAULT_LOCALE sin hass', () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it('cae a DEFAULT_LOCALE si hass.locale falta', () => {
    expect(resolveLocale({} as HomeAssistant)).toBe(DEFAULT_LOCALE);
  });

  it('resuelve un idioma soportado', () => {
    expect(resolveLocale(hassWithLanguage('es'))).toBe('es');
  });

  it('resuelve inglés directamente, ya no cae a DEFAULT_LOCALE', () => {
    expect(resolveLocale(hassWithLanguage('en'))).toBe('en');
  });

  it('cae a DEFAULT_LOCALE si el idioma no está soportado (p. ej. francés)', () => {
    expect(resolveLocale(hassWithLanguage('fr'))).toBe(DEFAULT_LOCALE);
  });

  it('compara solo la parte antes del guion (es-419 -> es, en-US -> en)', () => {
    expect(resolveLocale(hassWithLanguage('es-419'))).toBe('es');
    expect(resolveLocale(hassWithLanguage('en-US'))).toBe('en');
  });
});

describe('localize', () => {
  const dict = { es: { greeting: 'Hola' }, en: { greeting: 'Hello' } };

  it('devuelve la traducción del idioma resuelto', () => {
    expect(localize(hassWithLanguage('es'), dict, 'greeting')).toBe('Hola');
    expect(localize(hassWithLanguage('en'), dict, 'greeting')).toBe('Hello');
  });

  it('cae a DEFAULT_LOCALE sin hass', () => {
    expect(localize(undefined, dict, 'greeting')).toBe('Hola');
  });
});
