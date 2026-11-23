import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { STATUS_DOT_COLORS } from './constants';
import type { StatusGroup } from './types';

export interface HeaderOptions {
  name: string;
  icon: string;
  statusText: string;
  group: StatusGroup;
  /** Icono y halo encendidos (la persiana no está cerrada). */
  active: boolean;
  menuLabel: string;
  onMenu: () => void;
}

/** Cabecera: icono del cover con su halo, nombre, estado con su punto de color y los tres puntos de «más información». */
export function renderHeader(o: HeaderOptions): TemplateResult {
  return html`
    <div class="header">
      <span class="icon-box ${o.active ? 'neon-halo-active' : ''}">
        <ha-icon class="header-icon neon-halo-icon" .icon=${o.icon}></ha-icon>
      </span>
      <div class="header-text">
        <span class="name">${o.name}</span>
        <span class="status" data-group=${o.group} style="--dot-color: ${STATUS_DOT_COLORS[o.group]}">
          <span class="status-dot"></span><span class="status-text">${o.statusText}</span>
        </span>
      </div>
      <button type="button" class="menu" aria-label=${o.menuLabel} title=${o.menuLabel} @click=${o.onMenu}>
        <ha-icon icon="mdi:dots-vertical"></ha-icon>
      </button>
    </div>
  `;
}
