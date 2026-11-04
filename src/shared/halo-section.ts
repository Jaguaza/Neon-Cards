import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { localize } from '../core/localize';
import { DEFAULT_PALETTE, PALETTE_IDS, getPaletteCustomLabel, getPaletteName } from './neon-palette';
import { SHARED_TRANSLATIONS } from './translations';

/** Claves de configuración que toca la sección del halo. */
export type HaloConfigKey = 'neon_palette' | 'neon_color1' | 'neon_color2' | 'neon_color3';

/** Lo que la sección del halo lee de la configuración de la tarjeta. */
export interface HaloConfig {
  neon_palette?: string;
  neon_color1?: string;
  neon_color2?: string;
  neon_color3?: string;
}

/** Textos propios de cada tarjeta (los de los colores son comunes y los pone la sección). */
export interface HaloSectionTexts {
  section: string;
  palette: string;
}

export type HaloChange = (key: HaloConfigKey, value: string) => void;

/**
 * Los tres selectores de color de la paleta «personalizada» (inicio, medio y
 * fin del degradado), con los colores de la paleta esmeralda por defecto.
 */
export function renderCustomColors(hass: HomeAssistant | undefined, config: HaloConfig, onChange: HaloChange): TemplateResult {
  const picker = (label: 'color_start' | 'color_middle' | 'color_end', key: HaloConfigKey, value: string) => html`
    <div class="color-picker-wrapper">
      <span>${localize(hass, SHARED_TRANSLATIONS, label)}</span>
      <input type="color" .value=${value} @input=${(ev: Event) => onChange(key, (ev.target as HTMLInputElement).value)} />
    </div>
  `;
  return html`
    <div class="custom-colors-grid">
      ${picker('color_start', 'neon_color1', config.neon_color1 || '#39e07a')} ${picker('color_middle', 'neon_color2', config.neon_color2 || '#2dd6b8')}
      ${picker('color_end', 'neon_color3', config.neon_color3 || '#1ecdf2')}
    </div>
  `;
}

/**
 * Sección «Apariencia del halo» de los editores: título, selector de paleta
 * y, con la paleta «personalizada», los tres selectores de color.
 *
 * @param hass Para el idioma de los nombres de paleta y de color.
 * @param config La configuración de la tarjeta.
 * @param texts Título de la sección y etiqueta del selector de paleta.
 * @param onChange Se llama con la clave y el valor nuevo cuando el usuario elige.
 */
export function renderHaloSection(hass: HomeAssistant | undefined, config: HaloConfig, texts: HaloSectionTexts, onChange: HaloChange): TemplateResult {
  const currentPalette = config.neon_palette || DEFAULT_PALETTE;
  return html`
    <div class="editor-section">
      <div class="section-header">${texts.section}</div>
      <label class="native-select-label" for="palette">${texts.palette}</label>
      <select
        id="palette"
        class="native-select"
        .value=${currentPalette}
        @change=${(ev: Event) => {
          const value = (ev.target as HTMLSelectElement).value;
          if (!value || value === currentPalette) return;
          onChange('neon_palette', value);
        }}
      >
        ${PALETTE_IDS.map((id) => html`<option value=${id} ?selected=${id === currentPalette}>${getPaletteName(hass, id)}</option>`)}
        <option value="custom" ?selected=${currentPalette === 'custom'}>${getPaletteCustomLabel(hass)}</option>
      </select>
      ${currentPalette === 'custom' ? renderCustomColors(hass, config, onChange) : nothing}
    </div>
  `;
}
