import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { CoverState } from '../../ha/cover';
import { CONTROL_ICONS } from './constants';

export interface ControlsOptions {
  cover: CoverState;
  labels: { open: string; close: string; stop: string };
  onOpen: () => void;
  onStop: () => void;
  onClose: () => void;
}

interface Control {
  key: 'close' | 'stop' | 'open';
  label: string;
  onPress: () => void;
}

/** Los botones que la entidad soporta, en el orden cerrar, parar, abrir. */
function buildControls(o: ControlsOptions): Control[] {
  const { cover } = o;
  const controls: Control[] = [];
  if (cover.canClose) controls.push({ key: 'close', label: o.labels.close, onPress: o.onClose });
  if (cover.canStop) controls.push({ key: 'stop', label: o.labels.stop, onPress: o.onStop });
  if (cover.canOpen) controls.push({ key: 'open', label: o.labels.open, onPress: o.onOpen });
  return controls;
}

/**
 * Pie de la tarjeta con los botones Cerrar, Parar y Abrir: columnas iguales
 * con un divisor vertical entre ellas, como el pie de sensores de la
 * Thermostat. Sin ninguno soportado no se pinta nada.
 */
export function renderControls(o: ControlsOptions): TemplateResult {
  const controls = buildControls(o);
  if (controls.length === 0) return html``;
  return html`
    <div class="controls" style="--count: ${controls.length}">
      ${controls.map(
        (c, i) => html`
          <button type="button" class="control ${i > 0 ? 'control--divided' : ''}" data-control=${c.key} aria-label=${c.label} title=${c.label} ?disabled=${!o.cover.available} @click=${c.onPress}>
            <ha-icon icon=${CONTROL_ICONS[c.key]}></ha-icon>
            <span class="control-label">${c.label}</span>
          </button>
        `
      )}
    </div>
  `;
}
