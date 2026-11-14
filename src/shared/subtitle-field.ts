import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { INFO_OPTIONS, getInfoLabels } from '../core/info';
import type { HomeAssistant } from '../ha/types';

/** Lo que el campo lee de la configuración de la tarjeta. */
export interface SubtitleFieldConfig {
  subtitle_type?: string;
  subtitle?: string;
}

export interface SubtitleFieldTexts {
  /** Etiqueta del selector («Subtítulo»). */
  label: string;
  /** Texto de la opción `custom` («Personalizado»). */
  custom: string;
  /** Texto de ejemplo del campo de texto libre. */
  placeholder: string;
  /** Si se da, se muestra bajo el selector cuando el tipo no es `custom` (p. ej. «Se calcula a partir de la entidad»). */
  computedHint?: string;
}

export interface SubtitleFieldParams {
  hass: HomeAssistant | undefined;
  config: SubtitleFieldConfig;
  texts: SubtitleFieldTexts;
  /** Se llama con `subtitle_type` (`undefined` si es el valor por defecto, que no se guarda) o con `subtitle` (el texto libre). */
  onChange: (key: 'subtitle_type' | 'subtitle', value: string | undefined) => void;
  /** Tipos que ofrece el selector, en orden. Por defecto `custom` y los datos de la entidad (`INFO_OPTIONS` sin `none`). */
  types?: readonly string[];
  /** Tipo de una tarjeta sin `subtitle_type` en su configuración. Por defecto `custom`. */
  defaultType?: string;
}

const DEFAULT_TYPES: readonly string[] = ['custom', ...INFO_OPTIONS.filter((option) => option !== 'none')];

/**
 * El selector de subtítulo de los editores: un desplegable de tipo
 * (personalizado o un dato de la entidad) y, con «personalizado», el campo de
 * texto libre. Elegir el tipo que ya estaba, o dejarlo vacío, no avisa.
 */
export function renderSubtitleField(params: SubtitleFieldParams): TemplateResult {
  const { hass, config, texts, onChange, types = DEFAULT_TYPES, defaultType = 'custom' } = params;
  const current = config.subtitle_type || defaultType;
  const labels = getInfoLabels(hass);
  return html`
    <label class="native-select-label" for="subtitle-type">${texts.label}</label>
    <select
      id="subtitle-type"
      class="native-select"
      .value=${current}
      @change=${(ev: Event) => {
        const value = (ev.target as HTMLSelectElement).value;
        if (!value || value === current) return;
        onChange('subtitle_type', value === defaultType ? undefined : value);
      }}
    >
      ${types.map((type) => html`<option value=${type} ?selected=${type === current}>${type === 'custom' ? texts.custom : labels[type as keyof typeof labels]}</option>`)}
    </select>
    ${current === 'custom'
      ? html`<input id="subtitle" type="text" class="native-input" placeholder=${texts.placeholder} .value=${config.subtitle || ''} @input=${(ev: InputEvent) => onChange('subtitle', (ev.target as HTMLInputElement).value)} />`
      : texts.computedHint
        ? html`<span class="native-select-label">${texts.computedHint}</span>`
        : nothing}
  `;
}
