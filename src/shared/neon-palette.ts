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

export interface NeonPreset {
  c1: string;
  c2: string;
  c3: string;
}

export const NEON_PRESETS: Record<string, NeonPreset> = {
  emerald: { c1: '#39e07a', c2: '#2dd6b8', c3: '#1ecdf2' },
  cyberpunk: { c1: '#ff2a85', c2: '#ff0055', c3: '#7a00ff' },
  electric: { c1: '#00f2fe', c2: '#4facfe', c3: '#005bea' },
  sunset: { c1: '#ffb347', c2: '#ffcc33', c3: '#ff1361' },
  toxic: { c1: '#bf00ff', c2: '#7d12ff', c3: '#00d4ff' },
};

/**
 * Nombre visible de cada preset, en el idioma resuelto de `hass` — antes
 * vivía como `NEON_PRESETS[x].name`, un texto fijo en español que además
 * nadie leía nunca (los dos editores tenían su propia copia literal
 * duplicada, ya divergida en formato). Ahora hay una única fuente en
 * `src/shared/translations`, y ambos editores llaman a esta función en
 * vez de tener su copia.
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
    // NeonPreset ya es exactamente {c1,c2,c3} (el nombre visible del
    // preset vive aparte, en getPaletteName — ver el porqué en el
    // comentario de esa función), así que esto ya es un GradientColors
    // sin necesidad de filtrar nada.
    return NEON_PRESETS[palette];
  }
  return {
    c1: config?.neon_color1 || NEON_PRESETS[DEFAULT_PALETTE].c1,
    c2: config?.neon_color2 || NEON_PRESETS[DEFAULT_PALETTE].c2,
    c3: config?.neon_color3 || NEON_PRESETS[DEFAULT_PALETTE].c3,
  };
}
