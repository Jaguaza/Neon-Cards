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

  it('cae a DEFAULT_LOCALE si el idioma no está soportado (p. ej. inglés, todavía sin en.ts)', () => {
    expect(resolveLocale(hassWithLanguage('en'))).toBe(DEFAULT_LOCALE);
  });

  it('compara solo la parte antes del guion (es-419 -> es)', () => {
    expect(resolveLocale(hassWithLanguage('es-419'))).toBe('es');
  });
});

describe('localize', () => {
  const dict = { es: { greeting: 'Hola' } };

  it('devuelve la traducción del idioma resuelto', () => {
    expect(localize(hassWithLanguage('es'), dict, 'greeting')).toBe('Hola');
  });

  it('cae a DEFAULT_LOCALE sin hass', () => {
    expect(localize(undefined, dict, 'greeting')).toBe('Hola');
  });
});
