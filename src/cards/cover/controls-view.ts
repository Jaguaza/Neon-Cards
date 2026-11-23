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
  /** Resaltado: la persiana va hacia ahí o ya está ahí. */
  active: boolean;
  onPress: () => void;
}

/** Los botones que la entidad soporta, en el orden cerrar, parar, abrir. */
function buildControls(o: ControlsOptions): Control[] {
  const { cover } = o;
  const controls: Control[] = [];
  if (cover.canClose) controls.push({ key: 'close', label: o.labels.close, active: cover.state === 'closed' || cover.state === 'closing', onPress: o.onClose });
  if (cover.canStop) controls.push({ key: 'stop', label: o.labels.stop, active: false, onPress: o.onStop });
  if (cover.canOpen) controls.push({ key: 'open', label: o.labels.open, active: cover.state === 'open' || cover.state === 'opening', onPress: o.onOpen });
  return controls;
}

/** Fila de botones Cerrar, Parar y Abrir; sin ninguno soportado no se pinta nada. */
export function renderControls(o: ControlsOptions): TemplateResult {
  const controls = buildControls(o);
  if (controls.length === 0) return html``;
  return html`
    <div class="controls" style="--count: ${controls.length}">
      ${controls.map(
        (c) => html`
          <button type="button" class="control" data-control=${c.key} data-active=${c.active ? 'true' : 'false'} ?disabled=${!o.cover.available} @click=${c.onPress}>
            <ha-icon icon=${CONTROL_ICONS[c.key]}></ha-icon>
            <span>${c.label}</span>
          </button>
        `
      )}
    </div>
  `;
}
