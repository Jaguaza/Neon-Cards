import { html, nothing, svg } from 'lit';
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
import { resolveCardColors, resolveEdgeColor, resolveEffect } from './sensor-colors';
import { gridOptionsFor, hasGraph, resolveSize } from './sensor-size';
import { computeSensorStatus } from './sensor-status';
import type { SensorStatus } from './sensor-status';
import { isSensorEntity } from './sensor-state';
import { NEON_SENSOR_CARD_STYLES } from './neon-sensor-card.styles';
import { SENSOR_TRANSLATIONS } from './translations';
import type { SensorTranslations } from './translations';
import type { NeonEffect, NeonSensorCardConfig, ThresholdLevel } from './types';

let uidCounter = 0;

/** Niveles que tienen una valoración propia (y por tanto etiqueta). */
function isRated(level: SensorStatus['level']): level is ThresholdLevel {
  return level === 'low' || level === 'ok' || level === 'high';
}

/** Datos ya resueltos que consume la plantilla (ver `_buildView`). */
interface SensorView {
  entityId?: string;
  display: SensorDisplay | null;
  /** La entidad no existe en `hass.states`. */
  broken: boolean;
  colors: ReturnType<typeof resolveCardColors>;
  edge: string | null;
  effect: NeonEffect;
  size: ReturnType<typeof resolveSize>;
  rated: ThresholdLevel | null;
  name: string;
  /** `null` = subtítulo oculto (`show_subtitle: false`). */
  subtitle: string | null;
  unit: string;
}

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

  /** Columnas según `size` (ver `SIZE_COLUMNS`); alto automático. */
  getGridOptions(): { rows: 'auto'; columns: number; min_columns: number } {
    return gridOptionsFor(resolveSize(this._config));
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
      enabled: hasGraph(resolveSize(this._config)),
    });
  }

  private _t(key: keyof SensorTranslations): string {
    return localize(this.hass, SENSOR_TRANSLATIONS, key);
  }

  private get _domain(): string {
    return (this._config?.entity ?? '').split('.')[0];
  }

  /** Nombre del nivel: el elegido por el usuario o, si falta o está en
      blanco, el texto por defecto del idioma. */
  private _levelName(level: ThresholdLevel, fallback: keyof SensorTranslations): string {
    return this._config?.threshold_names?.[level]?.trim() || this._t(fallback);
  }

  private _statusLabel(level: ThresholdLevel): string {
    switch (level) {
      case 'low':
        return this._levelName('low', 'status_low');
      case 'ok':
        return this._levelName('ok', 'status_ok');
      default:
        return this._levelName('high', this._domain === 'binary_sensor' ? 'status_alert' : 'status_high');
    }
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

  private _renderGraph(effect: NeonEffect): TemplateResult | typeof nothing {
    const values = this._history.values;
    const d = this._domain === 'binary_sensor' ? buildStepPath(values) : buildTracePath(values);
    if (!d) return nothing;
    const gradId = `${this._uid}-trace`;
    const blurId = `${this._uid}-blur`;
    // Fragmento SVG suelto dentro de otra plantilla: tiene que usar `svg`, no
    // `html`; si no, Lit lo crea en el namespace HTML y el navegador no lo pinta.
    const trace = (cls: string) => svg`<path class="trace ${cls}" d=${d} stroke="url(#${gradId})"></path>`;
    // Resplandor: el MISMO trazo y degradado, más grueso y desenfocado, para
    // que el halo lleve los tres colores en su sitio (y no solo el primero).
    const glow = svg`<path class="glow-path" d=${d} stroke="url(#${gradId})" filter="url(#${blurId})"></path>`;
    const viewBox = `0 0 ${TRACE_WIDTH} ${TRACE_HEIGHT}`;
    // `normal`: trazo fijo con el color del tema, sin barrido ni resplandor.
    const animated = effect !== 'normal';
    return html`
      <div class="graph ${animated ? '' : 'graph--static'}" aria-hidden="true">
        <svg viewBox=${viewBox} preserveAspectRatio="none">
          <defs>
            <!-- Cada color ocupa su tramo y se mezcla con el siguiente: los
                 tres se distinguen a la vez, ninguno queda reducido a un
                 simple punto de paso del degradado. -->
            <linearGradient id=${gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2=${TRACE_WIDTH} y2="0">
              <stop offset="0" style="stop-color: var(--neon-c1)"></stop>
              <stop offset="0.2" style="stop-color: var(--neon-c1)"></stop>
              <stop offset="0.42" style="stop-color: var(--neon-c2)"></stop>
              <stop offset="0.58" style="stop-color: var(--neon-c2)"></stop>
              <stop offset="0.8" style="stop-color: var(--neon-c3)"></stop>
              <stop offset="1" style="stop-color: var(--neon-c3)"></stop>
            </linearGradient>
            <filter id=${blurId} filterUnits="userSpaceOnUse" x="-30" y="-30" width="260" height="120">
              <feGaussianBlur stdDeviation="4"></feGaussianBlur>
            </filter>
          </defs>
          ${trace('trace-base')}
        </svg>
        ${animated
          ? html`<div class="sweep">
              <svg viewBox=${viewBox} preserveAspectRatio="none">${glow}${trace('trace-live')}</svg>
            </div>`
          : nothing}
      </div>
    `;
  }

  /** Todo lo que la plantilla necesita, calculado una sola vez por pintado. */
  private _buildView(config: NeonSensorCardConfig): SensorView {
    const entityId = config.entity;
    const display =
      entityId && this.hass ? getSensorDisplay(entityId, this.hass, { icon: config.icon, decimals: config.decimals }) : null;
    const stateObj = entityId ? this.hass?.states[entityId] : undefined;
    const status: SensorStatus = computeSensorStatus(
      { domain: this._domain, state: stateObj?.state ?? 'unavailable', available: !!display?.available },
      config
    );
    return {
      entityId,
      display,
      broken: !stateObj,
      colors: resolveCardColors(config, status.level),
      // El perímetro lo marcan solo los umbrales; sin ellos, borde normal.
      edge: resolveEdgeColor(config, status.level),
      effect: resolveEffect(config),
      size: resolveSize(config),
      // Etiqueta solo con umbrales activados y una valoración real (bajo /
      // correcto / alto). Sin datos o sin valorar no hay etiqueta, pero el
      // color del perímetro (`edge`) sí se mantiene.
      rated: config.thresholds_enabled && isRated(status.level) ? status.level : null,
      name: config.name || (stateObj?.attributes.friendly_name as string | undefined) || entityId || '',
      subtitle:
        config.show_subtitle === false
          ? null
          : config.subtitle?.trim() || this._t(this._domain === 'binary_sensor' ? 'kind_binary_sensor' : 'kind_sensor'),
      unit: display?.available && this._domain !== 'binary_sensor' ? display.unit : '',
    };
  }

  private _cardClass(view: SensorView): string {
    return [
      `size-${view.size}`,
      `neon-effect-${view.effect}`,
      view.edge ? 'has-edge' : '',
      view.effect === 'normal' ? '' : 'neon-halo-active',
      view.broken ? 'neon-halo-error' : '',
    ].join(' ');
  }

  private _renderHeader(view: SensorView): TemplateResult {
    const iconName = view.broken ? ERROR_ICON : (view.display?.icon ?? ERROR_ICON);
    return html`
      <div class="header">
        <ha-icon class="icon neon-halo-icon" .icon=${iconName}></ha-icon>
        <div class="texts">
          <span class="name">${view.name}</span>
          ${view.subtitle !== null ? html`<span class="kind">${view.subtitle}</span>` : nothing}
        </div>
        <button
          class="menu"
          type="button"
          aria-label=${this._t('more_info_label')}
          @click=${() => view.entityId && openMoreInfo(this, view.entityId)}
        >
          <ha-icon icon="mdi:dots-vertical"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderBody(view: SensorView): TemplateResult {
    return html`
      <div class="body">
        <div class="reading">
          <span class="value">${this._valueText(view.display)}</span>
          ${view.unit ? html`<span class="unit">${view.unit}</span>` : nothing}
        </div>
        ${hasGraph(view.size) ? this._renderGraph(view.effect) : nothing}
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;
    const view = this._buildView(config);
    const hasDoubleTap = !!config.double_tap_action && config.double_tap_action.action !== 'none';
    return html`
      <ha-card
        class=${this._cardClass(view)}
        style=${neonHaloVars(view.colors) + (view.edge ? ` --neon-edge: ${view.edge};` : '')}
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
        ${this._renderHeader(view)} ${this._renderBody(view)}
        ${view.rated ? html`<div class="status"><span class="dot"></span>${this._statusLabel(view.rated)}</div>` : nothing}
      </ha-card>
    `;
  }
}
