import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getClimateState, clampToStep, formatClimateOption, isClimateRunning } from '../../ha/climate';
import type { ClimateState, HvacMode } from '../../ha/climate';
import { BaseNeonCard, localize, openMoreInfo } from '../../core';
import {
  NEON_HALO_STYLES,
  NEON_RING_SPLIT_STYLES,
  neonHaloVars,
  neonRingSplitTemplate,
  RingSizeController,
  resolveGradientColors,
} from '../../shared';
import {
  DEFAULT_SIZE,
  DEFAULT_TEMP_STEP,
  HVAC_MODE_ICONS,
  PRESET_ICON,
  FAN_ICON,
  HVAC_MODE_DEFAULT_COLORS,
  HVAC_MODE_LABEL_KEYS,
} from './constants';
import { NEON_THERMOSTAT_CARD_STYLES } from './neon-thermostat-card.styles';
import { THERMOSTAT_DIAL_STYLES } from './dial-styles';
import { THERMOSTAT_TARGET_PILL_STYLES } from './target-pill-styles';
import { THERMOSTAT_RING_STYLES } from './ring-styles';
import { THERMOSTAT_MODE_FOOTER_STYLES } from './mode-footer-styles';
import { THERMOSTAT_TRANSLATIONS } from './translations';
import type { NeonThermostatCardConfig, ThermostatSize } from './types';
import { tempForAngle } from './dial-geometry';
import { renderLargeBody, renderRingBody, renderCompactBody } from './dial-views';
import { renderFooter } from './footer';
import { renderHeader, renderCompactHeader, renderHeaderActions } from './header';
import type { HeaderOptions } from './header';
import { renderTargetPill } from './target-pill';
import { renderSelectorPill } from './selector-pill';
import { combineClimates, buildDisplayState, findMutualExclusionTargets } from './combined-climate';
import type { CombinedClimate } from './combined-climate';

/**
 * Neón Thermostat Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Visualiza y controla 1 o 2 entidades `climate` con la identidad
 * gráfica de Neón Cards. Ver `README.md` de esta carpeta para la
 * especificación completa.
 */
export class NeonThermostatCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
    _dragTemp: { state: true },
    _ringForcedOff: { state: true },
  };

  private _config?: NeonThermostatCardConfig;
  /** Valor optimista mientras se arrastra el dial/aro/línea; `null`
      cuando no se está arrastrando (entonces se pinta el valor real). */
  private _dragTemp: number | null = null;
  private _dragging = false;

  /** Aro perimetral de la tarjeta (borde): id estable por instancia
      para el <linearGradient>, y tamaño real de ha-card, que mantiene al
      día `RingSizeController` con ResizeObserver, una medida tras cada
      renderizado y una ráfaga corta al conectar: nada corre en reposo. */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  private readonly _ring = new RingSizeController(this);

  /** Último `hvac_mode` visto — para detectar un CAMBIO de modo (no
      solo de actividad). Sin esto, pasar de un modo activo a otro que
      también resulta activo (p. ej. calor → auto, siempre activo) deja
      la clase `neon-halo-active` puesta todo el rato y la transición
      CSS no se reproduce. */
  private _lastMode: HvacMode | null = null;
  /** Fuerza el aro a apagado durante un instante justo tras cambiar de
      modo, para que la transición de apagado/encendido se reproduzca
      siempre. */
  private _ringForcedOff = false;
  private _ringForceTimer?: number;

  /** Último `hvac_mode` visto **por entidad** — para detectar, con 2
      entidades configuradas, que una acaba de cambiar a un modo activo
      distinto del de la otra (estando esta también activa). Dentro de
      la tarjeta la exclusión ya la fuerza `_handleModeSelect` al
      vuelo; esto cubre cambios hechos FUERA de la tarjeta (diálogo
      nativo de la entidad, otra tarjeta, una automatización...). */
  private _prevEntityModes = new Map<string, HvacMode>();

  /** Última entidad configurada que estuvo activa (mode !== 'off') —
      se usa como "climate a mostrar" cuando TODAS las configuradas
      están en off. Se actualiza en `updated()`. */
  private _lastActiveEntity: string | null = null;

  static styles = [
    NEON_HALO_STYLES,
    NEON_RING_SPLIT_STYLES,
    NEON_THERMOSTAT_CARD_STYLES,
    THERMOSTAT_DIAL_STYLES,
    THERMOSTAT_TARGET_PILL_STYLES,
    THERMOSTAT_RING_STYLES,
    THERMOSTAT_MODE_FOOTER_STYLES,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-thermostat-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonThermostatCardConfig {
    const isClimate = (id: string) => id.startsWith('climate.');
    const fromCandidates = [...(entities ?? []), ...(entitiesFallback ?? [])].find(isClimate);
    const fromHass = hass ? Object.keys(hass.states).find(isClimate) : undefined;
    const entity = fromCandidates || fromHass || 'climate.example_thermostat';

    return {
      entity,
      size: DEFAULT_SIZE,
    };
  }

  setConfig(config: NeonThermostatCardConfig): void {
    if (!config.entity) {
      throw new Error('neon-thermostat-card: falta "entity" (debe ser una entidad climate).');
    }
    this._config = config;
    this._prevEntityModes.clear();
  }

  getCardSize(): number {
    switch (this._size) {
      case 'large':
        return 5;
      case 'compact':
        return 4;
      default:
        return 6;
    }
  }

  getGridOptions(): { rows: number | 'auto'; columns: number } {
    switch (this._size) {
      case 'large':
        return { rows: 'auto', columns: 12 };
      case 'compact':
        return { rows: 'auto', columns: 4 };
      default:
        return { rows: 'auto', columns: 6 };
    }
  }

  private get _size(): ThermostatSize {
    return this._config?.size ?? DEFAULT_SIZE;
  }

  /** Entidades `climate` configuradas (1 o 2, ver `entity_2` en
      types.ts) resueltas, más qué entidad concreta gestiona cada modo
      del selector. `null` si la primera entidad (obligatoria) no
      resuelve. */
  private get _combined(): CombinedClimate | null {
    if (!this._config?.entity || !this.hass) return null;
    const primary = getClimateState(this._config.entity, this.hass);
    if (!primary) return null;
    const entities: ClimateState[] = [primary];
    if (this._config.entity_2) {
      const secondary = getClimateState(this._config.entity_2, this.hass);
      if (secondary) entities.push(secondary);
    }
    return combineClimates(entities, this._config.mode_owner);
  }

  /** Estado "a mostrar": con una sola entidad configurada es
      exactamente esa. Con dos, ver `buildDisplayState` — el resto de la
      tarjeta sigue trabajando con un `ClimateState` normal sin saber
      que puede haber dos entidades detrás. */
  private get _climate(): ClimateState | null {
    const combined = this._combined;
    if (!combined) return null;
    return buildDisplayState(combined, this._lastActiveEntity);
  }

  private get _step(): number {
    return this._config?.step ?? this._climate?.step ?? DEFAULT_TEMP_STEP;
  }

  /** Resuelve el color Neon para un modo HVAC dado. En "off" ignora
      deliberadamente la config de color y siempre devuelve el neutro
      del tema — mismo criterio que Entity/Button: neutro en reposo,
      color solo en estado activo. */
  private _colorFor(mode: HvacMode): string {
    if (mode === 'off') return 'var(--primary-text-color)';
    const color = this._config?.color;
    if (!color) return HVAC_MODE_DEFAULT_COLORS[mode];
    if (typeof color === 'string') return color;
    if (color.mode === 'custom') return color[mode] ?? HVAC_MODE_DEFAULT_COLORS[mode];
    return HVAC_MODE_DEFAULT_COLORS[mode];
  }

  private _modeLabel(mode: HvacMode): string {
    return localize(this.hass, THERMOSTAT_TRANSLATIONS, HVAC_MODE_LABEL_KEYS[mode]);
  }

  /** Con una sola entidad: comportamiento normal. Con dos: si hay
      alguna activa, el cambio de consigna va SOLO a esa; si las dos
      están en "off", va a AMBAS a la vez (cada una respetando su
      propio min/max/step) — el modo no cambia, solo la consigna
      guardada para cuando se active una u otra. */
  private _setTargetTemperature(newTemp: number): void {
    const combined = this._combined;
    if (!combined || !this.hass) return;
    const active = combined.entities.find((e) => e.mode !== 'off');
    const targets = active ? [active] : combined.entities;
    for (const e of targets) {
      const step = this._config?.step ?? e.step ?? DEFAULT_TEMP_STEP;
      const clamped = clampToStep(newTemp, e.minTemp, e.maxTemp, step);
      this.hass.callService('climate', 'set_temperature', {
        entity_id: e.entity,
        temperature: clamped,
      });
    }
  }

  private _handleStep(direction: 1 | -1): void {
    const climate = this._climate;
    if (!climate || climate.targetTemperature === null) return;
    this._setTargetTemperature(climate.targetTemperature + direction * this._step);
  }

  /** Con una sola entidad: comportamiento normal. Con dos: la entidad
      dueña del modo elegido pasa a ese modo; el resto de entidades solo
      se apagan si estaban en un modo DISTINTO al elegido — si ya
      estaban en ese mismo modo (p. ej. las dos en "calor"), se dejan
      como están, ambas activas a la vez. Solo se evita tener dos
      entidades activas en modos DIFERENTES, nunca en el mismo. */
  private _handleModeSelect(mode: HvacMode): void {
    const combined = this._combined;
    if (!combined || !this.hass) return;
    const owner = combined.modeOwner.get(mode) ?? combined.entities[0];
    for (const e of combined.entities) {
      if (e.entity === owner.entity) {
        this.hass.callService('climate', 'set_hvac_mode', { entity_id: e.entity, hvac_mode: mode });
      } else if (e.mode !== 'off' && e.mode !== mode) {
        this.hass.callService('climate', 'set_hvac_mode', { entity_id: e.entity, hvac_mode: 'off' });
      }
    }
  }

  /** Preset y ventilador siempre van a la entidad que se está
      mostrando (`climate.entity`): cada equipo tiene los suyos. */
  private _handlePresetSelect(entity: string, preset: string): void {
    this.hass?.callService('climate', 'set_preset_mode', { entity_id: entity, preset_mode: preset });
  }

  private _handleFanSelect(entity: string, fan: string): void {
    this.hass?.callService('climate', 'set_fan_mode', { entity_id: entity, fan_mode: fan });
  }

  private _updateDragFromPointer(ev: PointerEvent, climate: ClimateState): void {
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(ev.clientX - cx, -(ev.clientY - cy)) * (180 / Math.PI);
    const rawTemp = tempForAngle(angle, climate.minTemp, climate.maxTemp);
    this._dragTemp = clampToStep(rawTemp, climate.minTemp, climate.maxTemp, this._step);
  }

  private _onDialPointerDown(ev: PointerEvent, climate: ClimateState, interactive = true): void {
    if (!interactive) return;
    ev.preventDefault();
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
    this._dragging = true;
    this._updateDragFromPointer(ev, climate);
  }

  private _onDialPointerMove(ev: PointerEvent, climate: ClimateState, interactive = true): void {
    if (!interactive || !this._dragging) return;
    this._updateDragFromPointer(ev, climate);
  }

  private _onDialPointerUp(interactive = true): void {
    if (!interactive || !this._dragging) return;
    this._dragging = false;
    if (this._dragTemp !== null) this._setTargetTemperature(this._dragTemp);
    this._dragTemp = null;
  }

  /** Selectores bajo el cuerpo. Vista grande: modo HVAC y, si la
      entidad los expone, preset y ventilador, repartidos en una fila
      (1, 2 o 3 píldoras). Resto de vistas: solo el de modo. */
  private _renderModeSelectors(climate: ClimateState, size: ThermostatSize): TemplateResult {
    const color = this._colorFor(climate.mode);
    const pills = [this._renderModePill(climate, color)];
    if (size === 'large') {
      if (climate.presetModes.length) pills.push(this._renderPresetPill(climate, color));
      if (climate.fanModes.length) pills.push(this._renderFanPill(climate, color));
    }
    if (pills.length === 1) return pills[0];
    return html`<div class="mode-selector-row mode-selector-row--${pills.length}">${pills}</div>`;
  }

  private _renderModePill(climate: ClimateState, color: string): TemplateResult {
    return renderSelectorPill({
      icon: HVAC_MODE_ICONS[climate.mode],
      display: this._modeLabel(climate.mode),
      ariaLabel: this._modeLabel(climate.mode),
      value: climate.mode,
      options: climate.hvacModes.map((mode) => ({ value: mode, label: this._modeLabel(mode) })),
      color,
      onSelect: (value) => this._handleModeSelect(value as HvacMode),
    });
  }

  private _renderPresetPill(climate: ClimateState, color: string): TemplateResult {
    const label = (value: string) => formatClimateOption(this.hass, climate.entity, 'preset_mode', value);
    return renderSelectorPill({
      icon: PRESET_ICON,
      display: climate.presetMode ? label(climate.presetMode) : '—',
      ariaLabel: localize(this.hass, THERMOSTAT_TRANSLATIONS, 'preset_label'),
      value: climate.presetMode ?? '',
      options: climate.presetModes.map((value) => ({ value, label: label(value) })),
      color,
      onSelect: (value) => this._handlePresetSelect(climate.entity, value),
    });
  }

  private _renderFanPill(climate: ClimateState, color: string): TemplateResult {
    const label = (value: string) => formatClimateOption(this.hass, climate.entity, 'fan_mode', value);
    return renderSelectorPill({
      icon: FAN_ICON,
      display: climate.fanMode ? label(climate.fanMode) : '—',
      ariaLabel: localize(this.hass, THERMOSTAT_TRANSLATIONS, 'fan_label'),
      value: climate.fanMode ?? '',
      options: climate.fanModes.map((value) => ({ value, label: label(value) })),
      color,
      onSelect: (value) => this._handleFanSelect(climate.entity, value),
    });
  }

  /** Píldora −/valor/+ de la consigna (la comparten las tres vistas). */
  private _targetPill(climate: ClimateState, displayTarget: number | null): TemplateResult {
    return renderTargetPill({
      color: this._colorFor(climate.mode),
      variant: this._size,
      displayTarget,
      onStep: (direction) => this._handleStep(direction),
    });
  }

  /** Uno o dos iconos arriba a la derecha que abren el diálogo de «más
      información» de cada entidad configurada. */
  private _headerActions(): TemplateResult | typeof nothing {
    const combined = this._combined;
    if (!combined || !this.hass) return nothing;
    return renderHeaderActions(combined.entities, this.hass, (entityId) => openMoreInfo(this, entityId));
  }

  private _renderBody(climate: ClimateState, size: ThermostatSize, displayTarget: number | null): TemplateResult {
    const color = this._colorFor(climate.mode);
    const pill = this._targetPill(climate, displayTarget);
    if (size === 'compact') return renderCompactBody({ climate, pill });
    const pointer = {
      down: (ev: PointerEvent) => this._onDialPointerDown(ev, climate),
      move: (ev: PointerEvent) => this._onDialPointerMove(ev, climate),
      up: () => this._onDialPointerUp(),
    };
    const options = { climate, color, displayTarget, pill, pointer };
    return size === 'large' ? renderLargeBody(options) : renderRingBody(options);
  }

  render(): TemplateResult {
    const climate = this._climate;
    if (!climate) {
      return html`<ha-card><div class="header">Entidad climate no disponible.</div></ha-card>`;
    }

    const size = this._size;
    const active = isClimateRunning(climate) && !this._ringForcedOff;
    const ringColors = resolveGradientColors(this._config);
    const displayTarget = this._dragTemp ?? climate.targetTemperature;
    const header: HeaderOptions = {
      climate,
      configName: this._config?.name,
      color: this._colorFor(climate.mode),
      actions: this._headerActions(),
    };

    return html`
      <ha-card data-size=${size} class="neon-ring-host ${active ? 'neon-halo-active' : ''}" style=${neonHaloVars(ringColors)}>
        ${neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)}
        ${size === 'compact' ? renderCompactHeader(header) : renderHeader(header)}
        ${this._renderBody(climate, size, displayTarget)} ${this._renderModeSelectors(climate, size)}
        ${renderFooter(this._config?.footer, this.hass, size)}
      </ha-card>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._ringForceTimer);
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed);

    const combined = this._combined;
    if (combined) {
      const active = combined.entities.find((e) => e.mode !== 'off');
      if (active) this._lastActiveEntity = active.entity;

      // Exclusión mutua con 2 entidades para cambios hechos FUERA de la
      // tarjeta: si una entidad configurada acaba de CAMBIAR de modo
      // (a uno activo) mientras la otra YA estaba activa en un modo
      // DISTINTO, se apaga esa otra — se conserva la que acaba de
      // cambiar. Si las dos acaban en el MISMO modo se dejan tal cual,
      // ambas activas a la vez; eso está permitido, solo se evitan
      // modos diferentes simultáneos. Decisión en combined-climate.ts
      // (pura); aquí solo se ejecuta el efecto.
      if (this.hass) {
        for (const entityId of findMutualExclusionTargets(combined, this._prevEntityModes)) {
          this.hass.callService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: 'off' });
        }
      }
      for (const e of combined.entities) this._prevEntityModes.set(e.entity, e.mode);
    }

    const climate = this._climate;
    if (!climate) return;

    if (this._lastMode === null) {
      this._lastMode = climate.mode;
      return;
    }
    if (climate.mode === this._lastMode) return;

    this._lastMode = climate.mode;
    clearTimeout(this._ringForceTimer);
    this._ringForcedOff = true;
    this._ringForceTimer = window.setTimeout(() => {
      this._ringForcedOff = false;
    }, 950);
  }
}
