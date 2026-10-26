import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { LOCK_SENSOR_TYPE } from './constants';
import type { FooterSensorView, SensorEntry } from './alarm-sensors';
import { cancelButton, viewDialog } from './flow-views';
import type { ViewContext } from './flow-views';

/** Texto del estado de un sensor de la lista (las cerraduras hablan de «sin cerrar», el resto de «activo»). */
function entryState(ctx: ViewContext, type: string, entry: SensorEntry): string {
  if (type === LOCK_SENSOR_TYPE) return ctx.translate(entry.active ? 'sensor_lock_open' : 'sensor_lock_closed');
  return ctx.translate(entry.active ? 'sensor_on' : 'sensor_off');
}

function entryRow(ctx: ViewContext, type: string, entry: SensorEntry): TemplateResult {
  return html`
    <li class="sensor-row ${entry.active ? 'is-active' : ''}" data-entity=${entry.entityId}>
      <span class="sensor-name">${entry.name}</span>
      <span class="sensor-state">${entryState(ctx, type, entry)}</span>
    </li>
  `;
}

/**
 * Lista de los sensores de un tipo del pie: los activos primero. La lista
 * hace scroll por dentro, así la tarjeta no crece sin límite en una casa con
 * muchos sensores.
 */
export function renderSensorsView(ctx: ViewContext, sensor: FooterSensorView, typeLabel: string): TemplateResult {
  const title = `${ctx.translate('sensors_title')} · ${typeLabel}`;
  const rows = sensor.entries.length
    ? html`<ul class="sensor-list">${sensor.entries.map((entry) => entryRow(ctx, sensor.type, entry))}</ul>`
    : html`<p class="sensor-empty">${ctx.translate('sensors_empty')}</p>`;
  return viewDialog(
    'view view--sensors',
    title,
    ctx.onCancel,
    html`
      <div class="keypad-head"><span class="view-title">${title}</span>${cancelButton(ctx)}</div>
      ${rows}
    `
  );
}
