import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getSensorDisplay } from '../../ha/sensors';
import {
  BaseNeonCard,
  createGestureState,
  handlePointerDown,
  cancelHold,
  handleClick,
  dispatchHassAction,
  computeInfoDisplay,
} from '../../core';
import type { GestureState, InfoOption } from '../../core';
import {
  resolveGradientColors,
  NEON_HALO_STYLES,
  NEON_RING_SPLIT_STYLES,
  neonHaloVars,
  neonRingSplitTemplate,
} from '../../shared';
import { DEFAULT_ICON, ERROR_ICON, MAX_GROUPED_SENSORS, RING_ANIMATION_MS } from './constants';
import { NEON_BUTTON_CARD_STYLES } from './neon-button-card.styles';
import type { NeonButtonCardConfig } from './types';

/** Dominios cuyo estado "on" se interpreta como botón activo. */
const ACTIVE_DOMAINS_ON_STATE = new Set([
  'light',
  'switch',
  'fan',
  'input_boolean',
  'automation',
  'media_player',
  'binary_sensor',
  'cover',
]);

/**
 * Neón Button Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Botón de acción para Home Assistant: entidad principal opcional,
 * icono protagonista, aro neón animado en estado activo y sensores
 * contextuales (`sensor`/`binary_sensor`) en la parte inferior. Ver
 * `src/cards/button/README.md` para la especificación completa.
 */
export class NeonButtonCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
    _ringSize: { state: true },
    _tapFlash: { state: true },
  };

  private _config?: NeonButtonCardConfig;
  private _gesture: GestureState = createGestureState();
  /** Id estable por instancia para el <linearGradient> del aro SVG, evita
      colisiones cuando hay varias Button Card en el mismo dashboard. */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  /** Tamaño real de ha-card, necesario porque el <path> del aro partido
      no admite porcentajes (a diferencia de un <rect> con CSS). Se mide
      con requestAnimationFrame en bucle continuo (ver _ringLoop) en vez
      de ResizeObserver: éste dejaba de disparar de forma fiable al
      crear/mover tarjetas en el editor de HA, dejando el aro con un
      tamaño incorrecto hasta recargar la página. Midiendo cada
      fotograma no hay evento que "esperar" — nunca puede desincronizarse. */
  private _ringSize = { width: 0, height: 0, radius: 12 };
  private _ringRafId?: number;
  /** "Flash" del aro al pulsar/mantener/doble-toque sin `entity`
      configurada — sin entidad `_isActive` es siempre false, así que el
      aro nunca se dispara solo; esto lo fuerza y retrasa la acción real
      (p.ej. navigate) hasta que termine de dibujarse, para que sea
      visible antes de cambiar de pestaña/web (ver _handleAction). */
  private _tapFlash = false;
  private _tapFlashTimer?: ReturnType<typeof setTimeout>;
  /** Evita que una pulsación nueva se pise con el cierre/temporizador
      de una anterior todavía en curso. */
  private _flashGeneration = 0;

  static styles = [
    NEON_HALO_STYLES,
    NEON_RING_SPLIT_STYLES,
    NEON_BUTTON_CARD_STYLES,
  ];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-button-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonButtonCardConfig {
    const candidates = [...(entities ?? []), ...(entitiesFallback ?? [])];
    const isLightOrSwitch = (id: string) => id.startsWith('light.') || id.startsWith('switch.');
    const fromCandidates = candidates.find(isLightOrSwitch);
    const fromHass = hass ? Object.keys(hass.states).find(isLightOrSwitch) : undefined;
    const entity = fromCandidates || fromHass || 'light.example_light';

    return {
      entity,
      neon_palette: 'emerald',
      neon_color1: '#39e07a',
      neon_color2: '#2dd6b8',
      neon_color3: '#1ecdf2',
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
      sensors: [],
    };
  }

  setConfig(config: NeonButtonCardConfig): void {
    // La entidad es completamente opcional (punto 10 de la spec): la
    // tarjeta debe funcionar como botón de acción puro sin ella.
    this._config = config;
  }

  getCardSize(): number {
    // Alto en filas de grid, calibrado contra capturas reales de HA (no
    // solo el cálculo teórico de píxeles): sin sensores, 2 filas; con
    // fila de sensores agrupados pero SIN sensor suelto, 2 filas; en
    // cuanto hay sensor suelto (top_sensor) Y agrupados a la vez, hace
    // falta una fila más (3) — esa combinación tiene una línea de
    // contenido de más que el resto.
    return this._sensorRows;
  }

  getGridOptions(): { rows: 'auto'; columns: number } {
    // rows: 'auto' en TODAS las variantes — confirmado en HA real que
    // el alto queda bien así (sin el bug de alineación que había al
    // mezclar 'auto' con filas fijas en la misma rejilla).
    //
    // columns calibrado con medidas reales tomadas en el editor de HA
    // (capturas de las 6 variantes básicas + confirmación de 1 solo
    // sensor agrupado): depende SOLO de sensors.length ≥ 2, top_sensor
    // NO suma ancho por sí solo (con top_sensor y sin agrupados mide
    // igual que sin nada — la fila de top_sensor no necesita más ancho,
    // solo más alto, y eso ya lo da rows:'auto'). Con 1 solo sensor
    // agrupado tampoco hace falta más ancho que la base (3).
    const groupedCount = this._config?.sensors?.length ?? 0;
    let columns = 3; // sin agrupados, o con 1 solo (con o sin top_sensor/subtítulo)
    if (groupedCount === 2) columns = 5;
    if (groupedCount === 3) columns = 6;

    return {
      rows: 'auto',
      columns,
    };
  }

  private get _needsAutoHeight(): boolean {
    return !!this._config?.top_sensor && (this._config?.sensors?.length ?? 0) >= 1;
  }

  private get _sensorRows(): number {
    // Sigue usándose en getCardSize() para vistas masonry antiguas que
    // no entienden 'auto' (getGridOptions ya no lo usa, ver arriba).
    // overlay del editor de HA, no en la tarjeta real gracias a
    // ha-card height:auto) que contenido ilegible.
    return this._needsAutoHeight ? 3 : 2;
  }

  private get _stateObj() {
    return this._config?.entity ? this.hass?.states[this._config.entity] : undefined;
  }

  private get _isActive(): boolean {
    const stateObj = this._stateObj;
    if (!stateObj) return false;
    const domain = this._config!.entity!.split('.')[0];
    if (!ACTIVE_DOMAINS_ON_STATE.has(domain)) return false;
    return stateObj.state === 'on';
  }

  /**
   * `entity:` está configurada pero rota: no existe en `hass.states`
   * (borrada, mal escrita) o su estado es `unavailable`/`unknown`
   * (integración o dispositivo caído). Sin `entity:` configurada NO es
   * un error — es el caso legítimo de botón de acción puro (punto 10
   * de la spec), así que ahí siempre es `false`.
   */
  private get _entityBroken(): boolean {
    if (!this._config?.entity || !this.hass) return false;
    const stateObj = this.hass.states[this._config.entity];
    return !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';
  }

  private get _icon(): string {
    // La entidad rota sustituye SIEMPRE al icono principal, incluso si
    // hay un `icon:` explícito en la config — con la entidad caída el
    // icono debe comunicar el problema, no la acción configurada.
    if (this._entityBroken) return ERROR_ICON;
    return this._config?.icon || (this._stateObj?.attributes.icon as string | undefined) || DEFAULT_ICON;
  }

  private get _name(): string {
    return this._config?.name || (this._stateObj?.attributes.friendly_name as string | undefined) || '';
  }

  /**
   * 'custom' (por defecto) usa el texto libre de `subtitle`; cualquier
   * otro valor delega en `computeInfoDisplay` de `src/core` — el mismo
   * cálculo que ya usa la Entity Card para primary/secondary_info, no
   * se reinventa aquí. Sin entidad configurada, solo 'custom' tiene
   * algo que mostrar.
   */
  private get _subtitle(): string | TemplateResult | typeof nothing {
    const type = this._config?.subtitle_type || 'custom';
    if (type === 'custom') return this._config?.subtitle || nothing;
    const stateObj = this._stateObj;
    if (!stateObj || !this.hass) return nothing;
    return computeInfoDisplay(type as InfoOption, this._name, stateObj.state, stateObj, this.hass);
  }

  private _handleAction(actionType: string): void {
    const hasEntity = !!this._config?.entity;
    const isFlashable = actionType === 'tap' || actionType === 'hold' || actionType === 'double_tap';
    if (isFlashable && !hasEntity) {
      // Sin entidad, _isActive es siempre false y el aro no se dispara
      // solo con el estado — se fuerza un flash aquí (tap, hold o
      // double_tap) y se retrasa la acción real (típicamente navigate)
      // hasta que el trazado del aro termine, para que sea visible
      // antes de cambiar de pestaña/web.
      const gen = ++this._flashGeneration;
      clearTimeout(this._tapFlashTimer);
      this._tapFlash = true;
      this._tapFlashTimer = setTimeout(() => {
        // Si una pulsación más reciente ya tomó el control, no pisar
        // su temporizador ni despachar la acción de esta pulsación
        // vieja dos veces.
        if (gen !== this._flashGeneration) return;
        this._dispatchAction(actionType);
        // Apaga el flash YA (si la tarjeta sigue montada, es decir la
        // acción no navegó fuera): el propio cierre del aro (dashoffset
        // 0→50 + opacity con delay) ya dura 900ms, no hace falta
        // sostenerlo encendido más tiempo antes de empezar a cerrarlo.
        this._tapFlash = false;
      }, RING_ANIMATION_MS);
      return;
    }
    this._dispatchAction(actionType);
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

  /** Sensor suelto y opcional, encima del divisor, sin agrupar. */
  private _renderTopSensor(): TemplateResult | typeof nothing {
    if (!this._config?.top_sensor || !this.hass) return nothing;
    const cfg = this._config.top_sensor;
    const d = getSensorDisplay(cfg.entity, this.hass, { icon: cfg.icon, decimals: cfg.decimals });
    if (!d) return nothing;
    return html`
      <div class="top-sensor">
        <ha-icon icon=${d.icon}></ha-icon>
        <span class="value">${d.state}${d.unit ? ` ${d.unit}` : ''}</span>
      </div>
    `;
  }

  /**
   * Fila agrupada bajo el divisor: siempre icono + estado + unidad,
   * separada por una línea vertical entre cada sensor. Tope de
   * `MAX_GROUPED_SENSORS` para que siga siendo legible.
   */
  private _renderSensors(): TemplateResult | typeof nothing {
    if (!this._config?.sensors?.length || !this.hass) return nothing;
    const displays = this._config.sensors
      .slice(0, MAX_GROUPED_SENSORS)
      .map((s) => getSensorDisplay(s.entity, this.hass!, { icon: s.icon, decimals: s.decimals }))
      .filter((d): d is NonNullable<typeof d> => d !== null);
    if (!displays.length) return nothing;

    return html`
      <div class="sensors ${displays.length === 1 ? 'sensors-single' : ''}" style="grid-template-columns: repeat(${displays.length}, 1fr);">
        ${displays.map(
          (d, i) => html`
            <div class="sensor ${i > 0 ? 'sensor--divided' : ''}">
              <ha-icon icon=${d.icon}></ha-icon>
              <span class="value">${d.state}${d.unit ? ` ${d.unit}` : ''}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    const colors = resolveGradientColors(this._config);
    const active = this._isActive || this._tapFlash;
    const hasDoubleTap = !!this._config.double_tap_action && this._config.double_tap_action.action !== 'none';

    return html`
      <ha-card
        class="neon-ring-host ${active ? 'neon-halo-active' : ''} ${this._entityBroken ? 'neon-halo-error' : ''}"
        style=${neonHaloVars(colors)}
        @pointerdown=${(ev: PointerEvent) => handlePointerDown(this._gesture, ev, '.-none-', () => this._handleAction('hold'))}
        @pointerup=${() => cancelHold(this._gesture)}
        @pointercancel=${() => cancelHold(this._gesture)}
        @click=${(ev: MouseEvent) =>
          handleClick(this._gesture, ev, '.-none-', {
            onTap: () => this._handleAction('tap'),
            onDoubleTap: () => this._handleAction('double_tap'),
            hasDoubleTap,
          })}
      >
        ${neonRingSplitTemplate(this._ringUid, this._ringSize.width, this._ringSize.height, this._ringSize.radius)}
        <div class="content">
          <ha-icon class="neon-halo-icon" icon=${this._icon}></ha-icon>
          <div class="text">
            <span class="name">${this._name}</span>
            ${this._subtitle !== nothing ? html`<span class="subtitle">${this._subtitle}</span>` : nothing}
          </div>
          ${this._renderTopSensor()}
          ${this._config.sensors?.length
            ? html`<div class="divider ${this._config.top_sensor ? 'divider--gap' : ''}"></div>`
            : nothing}
          ${this._renderSensors()}
        </div>
      </ha-card>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._ringLoop();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._tapFlashTimer);
    cancelAnimationFrame(this._ringRafId ?? -1);
  }

  /** Mide ha-card cada fotograma mientras la tarjeta está conectada, en
      vez de esperar a un ResizeObserver (ver el porqué en el comentario
      de _ringSize). Barato: solo offsetWidth/Height + un
      getComputedStyle, y solo actualiza el estado reactivo (dispara
      re-render) si el valor realmente cambió. */
  private _ringLoop(): void {
    const cardEl = this.renderRoot?.querySelector('ha-card') as HTMLElement | null;
    if (cardEl) {
      const width = cardEl.offsetWidth;
      const height = cardEl.offsetHeight;
      // Descarta lecturas degeneradas (0×0), típicas de un frame
      // intermedio antes de que el elemento tenga layout asignado.
      if (width >= 4 && height >= 4) {
        const radius = parseFloat(getComputedStyle(cardEl).borderTopLeftRadius) || 12;
        if (
          width !== this._ringSize.width ||
          height !== this._ringSize.height ||
          radius !== this._ringSize.radius
        ) {
          this._ringSize = { width, height, radius };
        }
      }
    }
    this._ringRafId = requestAnimationFrame(() => this._ringLoop());
  }
}
