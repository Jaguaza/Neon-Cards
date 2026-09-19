import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getClimateState, clampToStep } from '../../ha/climate';
import type { ClimateState, HvacMode } from '../../ha/climate';
import { getSensorDisplay } from '../../ha/sensors';
import { BaseNeonCard, localize, openMoreInfo } from '../../core';
import {
  NEON_HALO_STYLES,
  NEON_RING_SPLIT_STYLES,
  neonHaloVars,
  neonRingSplitTemplate,
  resolveGradientColors,
} from '../../shared';
import {
  DEFAULT_SIZE,
  DEFAULT_TEMP_STEP,
  MAX_FOOTER_SENSORS,
  HVAC_MODE_ICONS,
  HVAC_MODE_DEFAULT_COLORS,
  HVAC_MODE_LABEL_KEYS,
  DIAL_START_ANGLE,
  DIAL_END_ANGLE,
} from './constants';
import { NEON_THERMOSTAT_CARD_STYLES } from './neon-thermostat-card.styles';
import { THERMOSTAT_TRANSLATIONS } from './translations';
import type { NeonThermostatCardConfig, ThermostatSize } from './types';

/** Punto (x,y) sobre el aro para un ángulo dado, convención reloj
    (0° = arriba, crece en sentido horario). */
function pointOnDial(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** Trazo SVG del arco entre dos ángulos. El barrido de esta tarjeta es
    siempre exactamente 180° (DIAL_START_ANGLE a DIAL_END_ANGLE), así
    que el flag de "arco grande" queda fijo en 0. */
function dialArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = pointOnDial(cx, cy, r, startAngle);
  const end = pointOnDial(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
}

/**
 * Vista combinada de 1 o 2 entidades `climate` configuradas —
 * `entities` en el orden de configuración (`entity`, luego `entity_2`
 * si existe), y `modeOwner` resuelve qué entidad concreta gestiona cada
 * modo del selector (reglas en `types.ts`, junto a `entity_2`).
 */
interface CombinedClimate {
  entities: ClimateState[];
  modeOwner: Map<HvacMode, ClimateState>;
}

/** Construye el "estado mostrado" (mismo tipo `ClimateState` que usa
    todo el resto del render): si hay una entidad activa se usa esa; si
    las dos están en "off" se usa la última que estuvo activa (o la
    primera configurada si nunca lo estuvo). `hvacModes` es siempre la
    unión ya resuelta en `modeOwner`, y `mode` es "off" solo cuando
    NINGUNA entidad configurada está activa. */
function buildDisplayState(combined: CombinedClimate, lastActiveEntity: string | null): ClimateState {
  const active = combined.entities.find((e) => e.mode !== 'off') ?? null;
  const fallback = combined.entities.find((e) => e.entity === lastActiveEntity) ?? combined.entities[0];
  const base = active ?? fallback;
  return {
    entity: base.entity,
    mode: active ? active.mode : 'off',
    hvacModes: Array.from(combined.modeOwner.keys()),
    hvacAction: active ? active.hvacAction : null,
    currentTemperature: base.currentTemperature,
    targetTemperature: base.targetTemperature,
    minTemp: base.minTemp,
    maxTemp: base.maxTemp,
    step: base.step,
    available: base.available,
  };
}

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
    _ringSize: { state: true },
    _ringForcedOff: { state: true },
  };

  private _config?: NeonThermostatCardConfig;
  /** Valor optimista mientras se arrastra el dial/aro/línea; `null`
      cuando no se está arrastrando (entonces se pinta el valor real). */
  private _dragTemp: number | null = null;
  private _dragging = false;

  /** Aro perimetral de la tarjeta (borde): id estable por instancia
      para el <linearGradient>, tamaño real medido con
      requestAnimationFrame en bucle continuo mientras la tarjeta esté
      conectada (un ResizeObserver no disparaba de forma fiable tras
      crear/mover tarjetas en el editor de HA). */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  private _ringSize = { width: 0, height: 0, radius: 12 };
  private _ringRafId?: number;

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

  /** Última entidad configurada que estuvo activa (mode !== 'off') —
      se usa como "climate a mostrar" cuando TODAS las configuradas
      están en off. Se actualiza en `updated()`. */
  private _lastActiveEntity: string | null = null;

  static styles = [NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, NEON_THERMOSTAT_CARD_STYLES];

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

    const modeOwner = new Map<HvacMode, ClimateState>();
    for (const e of entities) {
      for (const mode of e.hvacModes) {
        if (!modeOwner.has(mode)) modeOwner.set(mode, e);
      }
    }
    if (entities.length > 1 && this._config.mode_owner) {
      for (const [modeKey, ownerIndex] of Object.entries(this._config.mode_owner)) {
        const mode = modeKey as HvacMode;
        const owner = entities[(ownerIndex as number) - 1];
        if (owner && entities.every((e) => e.hvacModes.includes(mode))) {
          modeOwner.set(mode, owner);
        }
      }
    }

    return { entities, modeOwner };
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

  /** Con una sola entidad: comportamiento normal. Con dos: mutuamente
      excluyentes — la entidad dueña del modo elegido pasa a ese modo y
      CUALQUIER otra entidad configurada pasa a "off", nunca dos activas
      a la vez. */
  private _handleModeSelect(mode: HvacMode): void {
    const combined = this._combined;
    if (!combined || !this.hass) return;
    const owner = combined.modeOwner.get(mode) ?? combined.entities[0];
    for (const e of combined.entities) {
      this.hass.callService('climate', 'set_hvac_mode', {
        entity_id: e.entity,
        hvac_mode: e.entity === owner.entity ? mode : 'off',
      });
    }
  }

  private _angleForTemp(temp: number, climate: ClimateState): number {
    const range = climate.maxTemp - climate.minTemp;
    const fraction = range <= 0 ? 0 : Math.min(1, Math.max(0, (temp - climate.minTemp) / range));
    return DIAL_START_ANGLE + 180 * fraction;
  }

  private _updateDragFromPointer(ev: PointerEvent, climate: ClimateState): void {
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ev.clientX - cx;
    const dy = ev.clientY - cy;
    const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    const clampedAngle = Math.max(DIAL_START_ANGLE, Math.min(DIAL_END_ANGLE, angle));
    const fraction = (clampedAngle - DIAL_START_ANGLE) / 180;
    const rawTemp = climate.minTemp + fraction * (climate.maxTemp - climate.minTemp);
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

  /** Climate "operativo" (funcionando de verdad ahora mismo) — usado
      por el ARO PERIMETRAL de la tarjeta. Lógica: si expone
      `hvac_action`, se confía en eso; si no, compara consigna vs.
      actual según el modo. */
  private _isActive(climate: ClimateState): boolean {
    if (climate.mode === 'off') return false;
    if (climate.hvacAction) return climate.hvacAction !== 'idle' && climate.hvacAction !== 'off';
    if (climate.currentTemperature === null || climate.targetTemperature === null) return true;
    if (climate.mode === 'heat') return climate.currentTemperature < climate.targetTemperature;
    if (climate.mode === 'cool') return climate.currentTemperature > climate.targetTemperature;
    return climate.currentTemperature !== climate.targetTemperature;
  }

  /** Simplemente "hay un modo HVAC seleccionado distinto de off" — sin
      mirar si está funcionando de verdad ahora mismo. Usado por el
      icono del header. */
  private _isModeOn(climate: ClimateState): boolean {
    return climate.mode !== 'off';
  }

  private _renderHeader(climate: ClimateState): TemplateResult {
    if (this._size === 'compact') return this._renderCompactHeader(climate);
    const name = this._config?.name || climate.entity;
    const icon = HVAC_MODE_ICONS[climate.mode];
    const modeOn = this._isModeOn(climate);
    const color = this._colorFor(climate.mode);
    return html`
      <div class="header">
        <span class="icon-halo-wrap ${modeOn ? 'neon-halo-active' : ''}" style="--neon-c1: ${color}">
          <ha-icon class="header-icon neon-halo-icon" .icon=${icon}></ha-icon>
        </span>
        <div class="header-text">
          <span class="name">${name}</span>
        </div>
        ${this._renderHeaderActions()}
      </div>
    `;
  }

  /** Cabecera de la vista compacta: en columna — fila de iconos (modo +
      accesos a cada entidad) arriba, nombre debajo (solo si se ha
      configurado uno; a diferencia del resto de vistas, aquí NO cae a
      la entidad como nombre por defecto, para no ocupar espacio de
      más). */
  private _renderCompactHeader(climate: ClimateState): TemplateResult {
    const name = this._config?.name;
    const icon = HVAC_MODE_ICONS[climate.mode];
    const modeOn = this._isModeOn(climate);
    const color = this._colorFor(climate.mode);
    return html`
      <div class="header header--compact">
        <div class="header-icons">
          <span class="icon-halo-wrap ${modeOn ? 'neon-halo-active' : ''}" style="--neon-c1: ${color}">
            <ha-icon class="header-icon neon-halo-icon" .icon=${icon}></ha-icon>
          </span>
          ${this._renderHeaderActions()}
        </div>
        ${name ? html`<span class="name">${name}</span>` : nothing}
      </div>
    `;
  }

  /** Uno o dos iconos pequeños arriba a la derecha (uno por cada
      entidad climate configurada) para abrir su diálogo de "más
      información" — icono = el propio modo de ESA entidad. */
  private _renderHeaderActions(): TemplateResult | typeof nothing {
    const combined = this._combined;
    if (!combined || !this.hass) return nothing;
    const hass = this.hass;
    return html`
      <div class="header-actions">
        ${combined.entities.map((e) => {
          const label = hass.states[e.entity]?.attributes.friendly_name || e.entity;
          return html`
            <button
              class="header-action-btn"
              title=${label}
              aria-label=${label}
              @click=${(ev: Event) => {
                ev.stopPropagation();
                openMoreInfo(this, e.entity);
              }}
            >
              <ha-icon icon=${HVAC_MODE_ICONS[e.mode]}></ha-icon>
            </button>
          `;
        })}
      </div>
    `;
  }

  private _renderModeSelector(climate: ClimateState): TemplateResult {
    const color = this._colorFor(climate.mode);
    return html`
      <div class="mode-selector-wrap" style="--current-color: ${color}">
        <div class="mode-selector-display">
          <ha-icon icon=${HVAC_MODE_ICONS[climate.mode]}></ha-icon>
          <span>${this._modeLabel(climate.mode)}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </div>
        <select
          class="mode-selector-native"
          aria-label=${this._modeLabel(climate.mode)}
          @change=${(ev: Event) => this._handleModeSelect((ev.target as HTMLSelectElement).value as HvacMode)}
        >
          ${climate.hvacModes.map(
            (mode) => html`<option value=${mode} ?selected=${mode === climate.mode}>${this._modeLabel(mode)}</option>`
          )}
        </select>
      </div>
    `;
  }

  private _renderTargetPill(
    climate: ClimateState,
    variant: 'large' | 'normal' | 'compact',
    displayTarget: number | null
  ): TemplateResult {
    const color = this._colorFor(climate.mode);
    return html`
      <div class="target-pill target-pill--${variant}" style="--current-color: ${color}">
        <button class="target-pill-btn" @click=${() => this._handleStep(-1)}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <span class="target-value">${displayTarget ?? '--'}°</span>
        <button class="target-pill-btn" @click=${() => this._handleStep(1)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    `;
  }

  /** Dial arrastrable de la vista grande: un único arco continuo con un
      halo que va de transparente en los dos extremos a color sólido en
      el punto. Arrastrando el punto se cambia la temperatura objetivo. */
  private _renderDial(climate: ClimateState, displayTarget: number | null): TemplateResult {
    const color = this._colorFor(climate.mode);
    const cx = 50;
    const cy = 50;
    const r = 42;
    const fullPath = dialArcPath(cx, cy, r, DIAL_START_ANGLE, DIAL_END_ANGLE);
    const targetAngle = displayTarget !== null ? this._angleForTemp(displayTarget, climate) : DIAL_START_ANGLE;
    const dot = pointOnDial(cx, cy, r, targetAngle);
    const start = pointOnDial(cx, cy, r, DIAL_START_ANGLE);
    const end = pointOnDial(cx, cy, r, DIAL_END_ANGLE);
    const dotFraction = Math.min(0.92, Math.max(0.08, (targetAngle - DIAL_START_ANGLE) / 180));
    const gradientId = `dial-grad-${climate.entity.replace(/[^a-zA-Z0-9]/g, '-')}`;

    return html`
      <div class="dial-wrap" style="--current-color: ${color}">
        <svg
          class="dial-svg"
          viewBox="0 0 100 100"
          @pointerdown=${(ev: PointerEvent) => this._onDialPointerDown(ev, climate)}
          @pointermove=${(ev: PointerEvent) => this._onDialPointerMove(ev, climate)}
          @pointerup=${() => this._onDialPointerUp()}
          @pointercancel=${() => this._onDialPointerUp()}
        >
          <defs>
            <linearGradient id=${gradientId} gradientUnits="userSpaceOnUse" x1=${start.x} y1=${start.y} x2=${end.x} y2=${end.y}>
              <stop offset="0%" stop-color=${color} stop-opacity="0"></stop>
              <stop offset="${dotFraction * 100}%" stop-color=${color} stop-opacity="1"></stop>
              <stop offset="100%" stop-color=${color} stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          <path class="dial-arc" d=${fullPath} stroke="url(#${gradientId})"></path>
          <circle class="dial-dot" cx=${dot.x} cy=${dot.y} r="4.5"></circle>
          <!-- Zona de toque invisible, más ancha que el trazo/punto
               visibles (que se quedan finos a propósito) — sin esto el
               control es muy difícil de acertar con el dedo. Extremo
               recto (no redondeado) para no invadir la píldora de
               abajo; el punto usa una elipse (más ancha que alta) por
               el mismo motivo. -->
          <path class="dial-hit" d=${fullPath}></path>
          <ellipse class="dial-hit-dot" cx=${dot.x} cy=${dot.y} rx="11" ry="7"></ellipse>
        </svg>
      </div>
    `;
  }

  private _renderLargeBody(climate: ClimateState): TemplateResult {
    const color = this._colorFor(climate.mode);
    const displayTarget = this._dragTemp ?? climate.targetTemperature;
    return html`
      <div class="dial-row">
        <div class="current-temp-block" style="--current-color: ${color}">
          <span class="current-temp-big">${climate.currentTemperature ?? '--'}<span class="unit">°</span></span>
        </div>
        ${this._renderDial(climate, displayTarget)}
      </div>
      ${this._renderTargetPill(climate, 'large', displayTarget)}
    `;
  }

  /** Vista compacta: sin control arrastrable propio (ni dial ni línea) —
      solo la temperatura actual y la píldora +/- de consigna, a juego
      con el tamaño reducido de la tarjeta. */
  private _renderCompactBody(climate: ClimateState, displayTarget: number | null): TemplateResult {
    return html`
      <div class="ring-center">
        <span class="current-temp">${climate.currentTemperature ?? '--'}<span class="unit">°</span></span>
      </div>
      ${this._renderTargetPill(climate, 'compact', displayTarget)}
    `;
  }

  /** Vista normal: mismo arco de 180° que el dial de la vista grande,
      como aro alrededor de la temperatura actual, también arrastrable. */
  private _renderRingBody(climate: ClimateState, displayTarget: number | null): TemplateResult {
    const color = this._colorFor(climate.mode);
    const cx = 50;
    const cy = 50;
    const r = 42;
    const fullPath = dialArcPath(cx, cy, r, DIAL_START_ANGLE, DIAL_END_ANGLE);
    const targetAngle = displayTarget !== null ? this._angleForTemp(displayTarget, climate) : DIAL_START_ANGLE;
    const dot = pointOnDial(cx, cy, r, targetAngle);
    const start = pointOnDial(cx, cy, r, DIAL_START_ANGLE);
    const end = pointOnDial(cx, cy, r, DIAL_END_ANGLE);
    const dotFraction = Math.min(0.92, Math.max(0.08, (targetAngle - DIAL_START_ANGLE) / 180));
    const gradientId = `ring-grad-${climate.entity.replace(/[^a-zA-Z0-9]/g, '-')}`;

    return html`
      <div class="ring-wrap" style="--ring-size: 176px; --current-color: ${color}">
        <svg
          class="ring-svg"
          viewBox="0 0 100 100"
          @pointerdown=${(ev: PointerEvent) => this._onDialPointerDown(ev, climate)}
          @pointermove=${(ev: PointerEvent) => this._onDialPointerMove(ev, climate)}
          @pointerup=${() => this._onDialPointerUp()}
          @pointercancel=${() => this._onDialPointerUp()}
        >
          <defs>
            <linearGradient id=${gradientId} gradientUnits="userSpaceOnUse" x1=${start.x} y1=${start.y} x2=${end.x} y2=${end.y}>
              <stop offset="0%" stop-color=${color} stop-opacity="0"></stop>
              <stop offset="${dotFraction * 100}%" stop-color=${color} stop-opacity="1"></stop>
              <stop offset="100%" stop-color=${color} stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          <path class="ring-arc" d=${fullPath} stroke="url(#${gradientId})"></path>
          <circle class="ring-dot" cx=${dot.x} cy=${dot.y} r="3.2"></circle>
          <!-- Zona de toque invisible más ancha, mismo motivo que en el
               dial de la vista grande. Van DIRECTOS aquí dentro del
               mismo <svg> (no en una sub-plantilla html anidada
               condicionalmente) — lección aprendida: una plantilla
               "html" anidada dentro de un <svg> no hereda el
               namespace SVG y esos elementos dejan de responder al
               toque. Al no anidar nada, no hay riesgo. -->
          <path class="ring-hit" d=${fullPath}></path>
          <ellipse class="ring-hit-dot" cx=${dot.x} cy=${dot.y} rx="11" ry="7"></ellipse>
        </svg>
        <div class="ring-center">
          <span class="current-temp">${climate.currentTemperature ?? '--'}<span class="unit">°</span></span>
        </div>
      </div>
      ${this._renderTargetPill(climate, 'normal', displayTarget)}
    `;
  }

  private _renderFooter(size: ThermostatSize): TemplateResult | typeof nothing {
    if (size === 'compact') return nothing;
    const footer = this._config?.footer;
    if (!footer?.length || !this.hass) return nothing;
    const hass = this.hass;
    const configured = footer.slice(0, MAX_FOOTER_SENSORS);
    const displays = configured
      .map((item) => getSensorDisplay(item.entity, hass, { icon: item.icon }))
      .filter((d): d is NonNullable<typeof d> => d !== null);
    if (!displays.length) return nothing;

    return html`
      <div class="footer ${displays.length === 1 ? 'footer-single' : ''}" style="grid-template-columns: repeat(${displays.length}, 1fr)">
        ${displays.map(
          (d, i) => html`
            <div class="footer-item ${i > 0 ? 'footer-item--divided' : ''}">
              <ha-icon icon=${d.icon}></ha-icon>
              <span>${d.state}${d.unit}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  render(): TemplateResult {
    const climate = this._climate;
    if (!climate) {
      return html`<ha-card><div class="header">Entidad climate no disponible.</div></ha-card>`;
    }

    const size = this._size;
    const active = this._isActive(climate) && !this._ringForcedOff;
    const ringColors = resolveGradientColors(this._config);
    const displayTarget = this._dragTemp ?? climate.targetTemperature;

    return html`
      <ha-card data-size=${size} class="neon-ring-host ${active ? 'neon-halo-active' : ''}" style=${neonHaloVars(ringColors)}>
        ${neonRingSplitTemplate(this._ringUid, this._ringSize.width, this._ringSize.height, this._ringSize.radius)}
        ${this._renderHeader(climate)}
        ${size === 'large'
          ? this._renderLargeBody(climate)
          : size === 'compact'
            ? this._renderCompactBody(climate, displayTarget)
            : this._renderRingBody(climate, displayTarget)}
        ${this._renderModeSelector(climate)} ${this._renderFooter(size)}
      </ha-card>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._ringLoop();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._ringRafId ?? -1);
    clearTimeout(this._ringForceTimer);
  }

  protected updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed);

    const combined = this._combined;
    if (combined) {
      const active = combined.entities.find((e) => e.mode !== 'off');
      if (active) this._lastActiveEntity = active.entity;
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

  private _ringLoop(): void {
    const cardEl = this.renderRoot?.querySelector('ha-card') as HTMLElement | null;
    if (cardEl) {
      const width = cardEl.offsetWidth;
      const height = cardEl.offsetHeight;
      if (width >= 4 && height >= 4) {
        const radius = parseFloat(getComputedStyle(cardEl).borderTopLeftRadius) || 12;
        if (width !== this._ringSize.width || height !== this._ringSize.height || radius !== this._ringSize.radius) {
          this._ringSize = { width, height, radius };
        }
      }
    }
    this._ringRafId = requestAnimationFrame(() => this._ringLoop());
  }
}
