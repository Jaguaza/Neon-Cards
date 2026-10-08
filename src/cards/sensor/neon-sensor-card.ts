import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getSensorDisplay } from '../../ha/sensors';
import type { SensorDisplay } from '../../ha/sensors';
import {
  BaseNeonCard,
  localize,
  createGestureState,
  handlePointerDown,
  handleClick,
  cancelHold,
  dispatchHassAction,
  openMoreInfo,
} from '../../core';
import { NEON_HALO_STYLES, neonHaloVars } from '../../shared';
import { DEFAULT_GRAPH_HOURS, ERROR_ICON } from './constants';
import { HistoryController } from './history-controller';
import { buildStepPath, buildTracePath, TRACE_HEIGHT, TRACE_WIDTH } from './monitor-trace';
import { resolveCardColors } from './sensor-colors';
import { computeSensorStatus } from './sensor-status';
import type { SensorStatus } from './sensor-status';
import { isSensorEntity } from './sensor-state';
import { NEON_SENSOR_CARD_STYLES } from './neon-sensor-card.styles';
import { SENSOR_TRANSLATIONS } from './translations';
import type { SensorTranslations } from './translations';
import type { NeonSensorCardConfig } from './types';

let uidCounter = 0;

/**
 * Neón Sensor Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta de solo lectura para una entidad `sensor` o `binary_sensor`.
 * Cualquier otro dominio se rechaza en `setConfig` y no se ofrece en el
 * editor visual. Ver `src/cards/sensor/README.md`.
 */
export class NeonSensorCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };

  private _config?: NeonSensorCardConfig;
  private readonly _uid = `neon-sensor-${++uidCounter}`;
  private readonly _gesture = createGestureState();
  private readonly _history = new HistoryController(this);

  static styles = [NEON_HALO_STYLES, NEON_SENSOR_CARD_STYLES];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-sensor-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonSensorCardConfig {
    const candidates = [...(entities ?? []), ...(entitiesFallback ?? [])];
    const fromCandidates = candidates.find(isSensorEntity);
    const fromHass = hass ? Object.keys(hass.states).find(isSensorEntity) : undefined;
    return { entity: fromCandidates || fromHass || 'sensor.example_sensor' };
  }

  setConfig(config: NeonSensorCardConfig): void {
    if (config.entity && !isSensorEntity(config.entity)) {
      throw new Error(`${this._t('invalid_entity')}: ${config.entity}`);
    }
    this._config = config;
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions(): { rows: 'auto'; columns: number; min_columns: number } {
    return { rows: 'auto', columns: 6, min_columns: 3 };
  }

  /** Con muchas tarjetas, `hass` cambia con cada estado de HA: solo se
      repinta si cambia la entidad propia o el idioma. */
  protected shouldUpdate(changed: Map<PropertyKey, unknown>): boolean {
    if (changed.size > 1 || !changed.has('hass')) return true;
    const old = changed.get('hass') as HomeAssistant | undefined;
    const entity = this._config?.entity;
    if (!old || !this.hass || !entity) return true;
    return old.states[entity] !== this.hass.states[entity] || old.locale?.language !== this.hass.locale?.language;
  }

  protected willUpdate(): void {
    this._history.sync({
      hass: this.hass,
      entity: this._config?.entity,
      hours: this._config?.graph_hours || DEFAULT_GRAPH_HOURS,
      enabled: this._config?.show_graph !== false,
    });
  }

  private _t(key: keyof SensorTranslations): string {
    return localize(this.hass, SENSOR_TRANSLATIONS, key);
  }

  private get _domain(): string {
    return (this._config?.entity ?? '').split('.')[0];
  }

  private _statusLabel(status: SensorStatus): string {
    if (status.level === 'unavailable') return this._t('status_unavailable');
    if (status.level === 'critical') return this._t('status_critical');
    if (status.level === 'warning') return this._t(status.direction === 'low' ? 'status_low' : 'status_high');
    return this._t('status_normal');
  }

  private _valueText(display: SensorDisplay | null): string {
    if (!display || !display.available) return this._t('no_value');
    if (this._domain !== 'binary_sensor') return display.state;
    if (display.state === 'on') return this._t('binary_on');
    if (display.state === 'off') return this._t('binary_off');
    return display.state;
  }

  private _dispatchAction(actionType: string): void {
    dispatchHassAction(
      this,
      {
        entity: this._config?.entity,
        tap_action: this._config?.tap_action || { action: 'more-info' },
        hold_action: this._config?.hold_action || { action: 'none' },
        double_tap_action: this._config?.double_tap_action || { action: 'none' },
      },
      actionType
    );
  }

  private _renderGraph(): TemplateResult | typeof nothing {
    if (this._config?.show_graph === false) return nothing;
    const values = this._history.values;
    const d = this._domain === 'binary_sensor' ? buildStepPath(values) : buildTracePath(values);
    if (!d) return nothing;
    const gradId = `${this._uid}-trace`;
    const trace = (cls: string) => html`<path class="trace ${cls}" d=${d} stroke="url(#${gradId})"></path>`;
    const viewBox = `0 0 ${TRACE_WIDTH} ${TRACE_HEIGHT}`;
    return html`
      <div class="graph" aria-hidden="true">
        <svg viewBox=${viewBox} preserveAspectRatio="none">
          <defs>
            <linearGradient id=${gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2=${TRACE_WIDTH} y2="0">
              <stop offset="0" style="stop-color: var(--neon-c1)"></stop>
              <stop offset="0.5" style="stop-color: var(--neon-c2)"></stop>
              <stop offset="1" style="stop-color: var(--neon-c3)"></stop>
            </linearGradient>
          </defs>
          ${trace('trace-base')}
        </svg>
        <div class="sweep">
          <svg viewBox=${viewBox} preserveAspectRatio="none">${trace('trace-live')}</svg>
        </div>
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;
    const entityId = config.entity;
    const display =
      entityId && this.hass ? getSensorDisplay(entityId, this.hass, { icon: config.icon, decimals: config.decimals }) : null;
    const stateObj = entityId ? this.hass?.states[entityId] : undefined;
    const status: SensorStatus = computeSensorStatus(
      { domain: this._domain, state: stateObj?.state ?? 'unavailable', available: !!display?.available },
      config
    );
    const broken = !stateObj;
    const colors = resolveCardColors(config, status.level);
    const name = config.name || (stateObj?.attributes.friendly_name as string | undefined) || entityId || '';
    const hasDoubleTap = !!config.double_tap_action && config.double_tap_action.action !== 'none';
    const unit = display?.available && this._domain !== 'binary_sensor' ? display.unit : '';

    return html`
      <ha-card
        class="neon-halo-active ${broken ? 'neon-halo-error' : ''}"
        style=${neonHaloVars(colors)}
        @pointerdown=${(ev: PointerEvent) => handlePointerDown(this._gesture, ev, '.menu', () => this._dispatchAction('hold'))}
        @pointerup=${() => cancelHold(this._gesture)}
        @pointercancel=${() => cancelHold(this._gesture)}
        @click=${(ev: MouseEvent) =>
          handleClick(this._gesture, ev, '.menu', {
            onTap: () => this._dispatchAction('tap'),
            onDoubleTap: () => this._dispatchAction('double_tap'),
            hasDoubleTap,
          })}
      >
        <div class="header">
          <div class="icon-ring">
            <ha-icon class="neon-halo-icon" .icon=${broken ? ERROR_ICON : (display?.icon ?? ERROR_ICON)}></ha-icon>
          </div>
          <div class="texts">
            <span class="name">${name}</span>
            <span class="kind">${this._t(this._domain === 'binary_sensor' ? 'kind_binary_sensor' : 'kind_sensor')}</span>
          </div>
          <button
            class="menu"
            type="button"
            aria-label=${this._t('more_info_label')}
            @click=${() => entityId && openMoreInfo(this, entityId)}
          >
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </button>
        </div>
        <div class="body">
          <div class="reading">
            <span class="value">${this._valueText(display)}</span>
            ${unit ? html`<span class="unit">${unit}</span>` : nothing}
          </div>
          ${this._renderGraph()}
        </div>
        <div class="status"><span class="dot"></span>${this._statusLabel(status)}</div>
      </ha-card>
    `;
  }
}
