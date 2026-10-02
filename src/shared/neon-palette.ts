/**
 * Paleta de colores "neón" compartida por todas las tarjetas de la
 * colección (acuerdo nº4: lo reutilizable vive en `src/shared`, no se
 * copia por tarjeta). Nace en la Entity Card y se extrae aquí para que
 * la Button Card (y cualquier tarjeta futura) use exactamente los mismos
 * presets y la misma lógica de resolución de colores.
 *
 * Esto es intencionadamente independiente del tema de Home Assistant: la
 * identidad "neón" de la colección no depende del tema activo (ver
 * `docs/*​/api.md`), solo el resto de la tarjeta (fondo, texto) sí lo
 * hace a través de variables CSS de HA.
 */

import type { HomeAssistant } from '../ha/types';
import { localize } from '../core/localize';
import { SHARED_TRANSLATIONS } from './translations';
import type { SharedTranslations } from './translations';

export interface NeonPreset {
  /**
   * Nombre fijo en español — parte de la API pública ya congelada
   * (acuerdo nº25, línea base commit 12da870, docs/es/api.md lo
   * documentaba como `{ name, c1, c2, c3 }`). No se usa para pintar la
   * UI — para eso está `getPaletteName(hass, presetId)`, que sí
   * resuelve por idioma — pero quitar este campo sería una ruptura de
   * la API congelada sin pasar por el proceso de excepción
   * (docs/es/framework-freeze.md), así que se mantiene tal cual estaba
   * en el momento del freeze.
   */
  name: string;
  c1: string;
  c2: string;
  c3: string;
}

export const NEON_PRESETS: Record<string, NeonPreset> = {
  emerald: {
    name: 'Cyber Emerald (Verde/Turquesa/Azul)',
    c1: '#39e07a',
    c2: '#2dd6b8',
    c3: '#1ecdf2',
  },
  cyberpunk: {
    name: 'Cyberpunk Pink (Rosa/Carmesí/Púrpura)',
    c1: '#ff2a85',
    c2: '#ff0055',
    c3: '#7a00ff',
  },
  electric: {
    name: 'Electric Blue (Cian/Azul/Oscuro)',
    c1: '#00f2fe',
    c2: '#4facfe',
    c3: '#005bea',
  },
  sunset: {
    name: 'Sunset Amber (Naranja/Amarillo/Rosa)',
    c1: '#ffb347',
    c2: '#ffcc33',
    c3: '#ff1361',
  },
  toxic: {
    name: 'Toxic Purple (Violeta/Púrpura/Azul)',
    c1: '#bf00ff',
    c2: '#7d12ff',
    c3: '#00d4ff',
  },
};

/**
 * Nombre visible de cada preset, en el idioma resuelto de `hass` — la
 * fuente real para pintar la UI. `NEON_PRESETS[x].name` (arriba) es un
 * campo congelado que ya nadie lee para renderizar (los dos editores
 * tenían su propia copia literal duplicada, ya divergida en formato
 * respecto a él); esta función y `src/shared/translations` son la
 * única fuente que ambos editores consultan de verdad.
 */
const PALETTE_NAME_KEYS: Record<string, keyof SharedTranslations> = {
  emerald: 'palette_emerald',
  cyberpunk: 'palette_cyberpunk',
  electric: 'palette_electric',
  sunset: 'palette_sunset',
  toxic: 'palette_toxic',
};

export function getPaletteName(hass: HomeAssistant | undefined, presetId: string): string {
  const key = PALETTE_NAME_KEYS[presetId];
  return key ? localize(hass, SHARED_TRANSLATIONS, key) : presetId;
}

/** Texto de la opción "personalizado" del propio selector de paleta —
    compartido por el mismo motivo que los nombres de preset. */
export function getPaletteCustomLabel(hass: HomeAssistant | undefined): string {
  return localize(hass, SHARED_TRANSLATIONS, 'palette_custom');
}

export const DEFAULT_PALETTE = 'emerald';

export interface GradientColors {
  c1: string;
  c2: string;
  c3: string;
}

/**
 * Config mínima que necesita cualquier tarjeta para resolver sus 3
 * colores neón: un preset con nombre, o los 3 colores personalizados
 * cuando `neon_palette` es `'custom'`.
 */
export interface NeonPaletteConfig {
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
}

/**
 * Resuelve los 3 colores del degradado neón a partir de la config de una
 * tarjeta. Misma lógica para todas las tarjetas (antes vivía duplicada
 * dentro de cada una).
 */
export function resolveGradientColors(config: NeonPaletteConfig | undefined): GradientColors {
  const palette = config?.neon_palette || DEFAULT_PALETTE;
  if (palette !== 'custom' && NEON_PRESETS[palette]) {
    // Solo {c1,c2,c3} — NEON_PRESETS[palette] también trae `name`, que
    // no forma parte de GradientColors y no debe filtrarse a quien
    // llama (p. ej. a un JSON.stringify de la config resuelta).
    const { c1, c2, c3 } = NEON_PRESETS[palette];
    return { c1, c2, c3 };
  }
  return {
    c1: config?.neon_color1 || NEON_PRESETS[DEFAULT_PALETTE].c1,
    c2: config?.neon_color2 || NEON_PRESETS[DEFAULT_PALETTE].c2,
    c3: config?.neon_color3 || NEON_PRESETS[DEFAULT_PALETTE].c3,
  };
}
