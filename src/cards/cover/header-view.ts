import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { STATUS_DOT_COLORS } from './constants';
import type { StatusGroup } from './types';

export interface HeaderOptions {
  name: string;
  statusText: string;
  group: StatusGroup;
  /** Color del punto elegido en la config (ya validado); sin él, el de por defecto del grupo. */
  dotColor?: string;
  menuLabel: string;
  onMenu: () => void;
}

/** Cabecera: nombre, estado con su punto de color y los tres puntos de «más información». El icono va aparte, grande, a su izquierda. */
export function renderHeader(o: HeaderOptions): TemplateResult {
  return html`
    <div class="header">
      <div class="header-text">
        <span class="name">${o.name}</span>
        <span class="status" data-group=${o.group} style="--dot-color: ${o.dotColor ?? STATUS_DOT_COLORS[o.group]}">
          <span class="status-dot"></span><span class="status-text">${o.statusText}</span>
        </span>
      </div>
      <button type="button" class="menu" aria-label=${o.menuLabel} title=${o.menuLabel} @click=${o.onMenu}>
        <ha-icon icon="mdi:dots-vertical"></ha-icon>
      </button>
    </div>
  `;
}
