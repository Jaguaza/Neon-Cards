import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { FooterItemView } from './footer';

/**
 * Un dato del pie. En la mediana, el último acceso lleva el nombre y la
 * fecha en elementos propios para poder apilarlos en dos líneas en
 * tarjetas estrechas.
 */
export function renderFooterItem(item: FooterItemView, medium = false): TemplateResult {
  const value =
    medium && item.who !== undefined
      ? html`<span class="who">${item.who}</span>${item.when ? html`<span class="sep"> · </span><span class="when">${item.when}</span>` : nothing}`
      : item.text;
  return html`
    <div class="item item--${item.tone}" data-type=${item.type} style=${item.color ? `--item-color: ${item.color}` : nothing}>
      <ha-icon icon=${item.icon}></ha-icon>
      <div class="item-text">
        ${item.label ? html`<span class="item-label">${item.label}</span>` : nothing}
        <span class="item-value">${value}</span>
      </div>
    </div>
  `;
}
