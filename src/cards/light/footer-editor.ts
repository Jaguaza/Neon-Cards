import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { labeledControl } from '../../shared';
import { DEFAULT_FAVORITE_COLORS, FOOTER_OPTIONS, MAX_FAVORITES } from './constants';
import type { FooterItem } from './types';

export interface FooterOptionsTexts {
  label: string;
  hint: string;
  /** Nombre de cada opción del pie. */
  names: Record<FooterItem, string>;
}

export interface FavoritesEditorTexts {
  label: string;
  hint: string;
  /** Texto accesible del selector de cada color (se le añade su número). */
  color: string;
  add: string;
  remove: string;
}

export interface FavoritesEditorHandlers {
  onChange: (index: number, hex: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/** Opciones del pie que quiere el usuario: `footer_options` o, sin él, todas. */
export function enabledOptions(value: unknown): FooterItem[] {
  return Array.isArray(value) ? FOOTER_OPTIONS.filter((option) => value.includes(option)) : [...FOOTER_OPTIONS];
}

/** El valor de `footer_options` tras marcar o desmarcar una opción; `undefined` (sin clave) si quedan todas marcadas. */
export function toggleOption(current: readonly FooterItem[], option: FooterItem, on: boolean): FooterItem[] | undefined {
  const next = FOOTER_OPTIONS.filter((item) => (item === option ? on : current.includes(item)));
  return next.length === FOOTER_OPTIONS.length ? undefined : next;
}

/** El color con el que se propone el siguiente favorito: el primero de la lista de propuestas que aún no está. */
export function nextFavoriteColor(current: readonly string[]): string {
  return DEFAULT_FAVORITE_COLORS.find((color) => !current.includes(color)) ?? DEFAULT_FAVORITE_COLORS[0];
}

/** Una casilla por opción del pie; solo salen en la tarjeta las que la luz soporte. */
export function renderFooterOptions(enabled: readonly FooterItem[], texts: FooterOptionsTexts, onToggle: (option: FooterItem, on: boolean) => void): TemplateResult {
  return html`
    <span class="native-select-label">${texts.label}</span>
    <span class="data-hint">${texts.hint}</span>
    <div class="footer-options">
      ${FOOTER_OPTIONS.map((option) =>
        labeledControl(texts.names[option], (label) => html`<ha-checkbox data-option=${option} .checked=${enabled.includes(option)} @change=${(ev: Event) => onToggle(option, (ev.target as HTMLInputElement).checked)}>${label}</ha-checkbox>`)
      )}
    </div>
  `;
}

/** Hasta cinco colores favoritos: un selector de color con su botón de quitar por cada uno, y «Añadir color». */
export function renderFavoritesEditor(favorites: readonly string[], texts: FavoritesEditorTexts, handlers: FavoritesEditorHandlers): TemplateResult {
  return html`
    <span class="native-select-label">${texts.label}</span>
    <span class="data-hint">${texts.hint}</span>
    <div class="favorites-list">
      ${favorites.map(
        (hex, index) => html`
          <div class="favorite-row">
            <input type="color" data-favorite=${index} .value=${hex} aria-label=${`${texts.color} ${index + 1}`} @input=${(ev: Event) => handlers.onChange(index, (ev.target as HTMLInputElement).value)} />
            <button type="button" class="list-btn" data-remove=${index} @click=${() => handlers.onRemove(index)}>${texts.remove}</button>
          </div>
        `
      )}
    </div>
    <button type="button" class="list-btn" data-add ?disabled=${favorites.length >= MAX_FAVORITES} @click=${() => handlers.onAdd()}>${texts.add}</button>
  `;
}
