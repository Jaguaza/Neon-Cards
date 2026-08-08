import { html, css, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
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
import { resolveGradientColors, NEON_HALO_STYLES, NEON_RING_STYLES, neonHaloVars, neonRingTemplate } from '../../shared';
import { CARD_AUTHOR, CARD_VERSION, DEFAULT_ICON, MAX_GROUPED_SENSORS } from './constants';
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
 * cristal (glassmorphism), icono protagonista y sensores contextuales
 * (`sensor`/`binary_sensor`) en la parte inferior. Ver
 * `src/cards/button/README.md` para la especificación completa.
 */
export class NeonButtonCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
  };

  private _config?: NeonButtonCardConfig;
  private _gesture: GestureState = createGestureState();
  /** Id estable por instancia para el <linearGradient> del aro SVG, evita
      colisiones cuando hay varias Button Card en el mismo dashboard. */
  private readonly _ringUid = Math.random().toString(36).slice(2);

  static styles = [
    NEON_HALO_STYLES,
    NEON_RING_STYLES,
    css`
    :host {
      display: block;
      /* ha-card usa height:100%, que solo funciona si :host (el propio
         elemento, tal y como lo mide el grid de HA) tiene una altura
         explícita. Sin esto, en algunos navegadores/WebViews la tarjeta
         puede renderizar más alta de lo que HA le reservó y empujar a
         la siguiente tarjeta del grid hacia arriba, superponiéndose. */
      height: 100%;
    }
    ha-card {
      box-sizing: border-box;
      /* Permite que la fila de sensores consulte el ancho REAL de la
         tarjeta con @container y encoja su propia tipografía en vez de
         truncar el valor — el mismo YAML se ve bien en un dashboard de
         PC ancho y en una tile estrecha de móvil sin números mágicos
         por dispositivo. */
      container-type: inline-size;
      /* Padding vertical ajustado a propósito (ver getCardSize) para que
         el contenido quepa justo en 2 filas de grid sin sensores y 3 con
         sensores — igual que se hizo con el padding de la Entity Card. */
      padding: 4px 20px;
      height: 100%;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      overflow: hidden;
      /* Mismo fondo que la Entity Card: sin overrides, se apoya en el
         fondo por defecto de ha-card que ya da el tema de HA. El
         color-mix + blur anterior oscurecía la tarjeta en todas sus
         variantes al mezclarse con lo que hay detrás del dashboard. */
      transition: transform 150ms ease;
    }
    ha-card:active {
      transform: scale(0.98);
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      height: 100%;
    }
    ha-icon {
      --mdc-icon-size: 40px;
      color: var(--state-icon-color, var(--primary-text-color));
      margin-bottom: 2px;
      transition: color 300ms ease-out, filter 300ms ease-out;
    }
    .text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      width: 100%;
    }
    .name {
      font-size: 18px;
      line-height: 22px;
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .subtitle {
      font-size: 11px;
      line-height: 14px;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .divider {
      width: 100%;
      height: 1px;
      background: var(--divider-color, rgba(255, 255, 255, 0.12));
      /* Sin top_sensor (variante a 2 filas, ya calibrada justa) NO debe
         llevar margen extra — por eso este margen vive en la clase
         .divider--gap de abajo y no aquí, para no aplicarse siempre. */
    }
    .divider.divider--gap {
      /* Solo la variante top_sensor + agrupados (la única a 3 filas)
         lleva este hueco fijo y pequeño antes del grupo — el resto de
         variantes no lo necesita y les desbordaría su altura ajustada. */
      margin-top: 14px;
    }
    .top-sensor {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      line-height: 14px;
      color: var(--secondary-text-color);
    }
    .sensors {
      /* Cuadrícula de N columnas iguales (una por sensor, calculada al
         renderizar) — cada sensor centrado dentro de su propio hueco,
         no el grupo entero centrado en bloque. Así 2 sensores no quedan
         amontonados en el medio: cada uno tiene su mitad de la fila. */
      display: grid;
      align-items: center;
      width: 100%;
      min-width: 0;
    }
    .sensor {
      display: flex;
      align-items: center;
      justify-self: center;
      gap: 4px;
      min-width: 0;
      font-size: 11px;
      line-height: 14px;
      color: var(--secondary-text-color);
    }
    /* Con 1 solo sensor no hay "huecos" que repartir — se queda a la
       izquierda en vez de centrado en toda la tarjeta. */
    .sensors.sensors-single .sensor {
      justify-self: start;
    }
    .sensor.sensor--divided {
      /* Separador como borde en vez de un elemento aparte — así no
         cuenta como columna extra en la cuadrícula. */
      border-left: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      padding-left: 12px;
    }
    .sensor ha-icon,
    .top-sensor ha-icon {
      --mdc-icon-size: 15px;
      margin-bottom: 0;
      /* Igual que el icono principal: neutro en reposo, con el color y
         el resplandor de la paleta solo en estado activo (ver regla
         .neon-halo-active más abajo) — mismo comportamiento, no un
         tinte permanente. */
      color: var(--secondary-text-color);
      transition: color 300ms ease-out, filter 300ms ease-out;
      flex: 0 0 auto;
    }
    .neon-halo-active .sensor ha-icon,
    .neon-halo-active .top-sensor ha-icon {
      color: var(--neon-c2);
      filter: drop-shadow(0 0 4px color-mix(in srgb, var(--neon-c2) 55%, transparent));
    }
    .sensor .value,
    .top-sensor .value {
      font-size: 10px;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 0 1 auto;
      /* Suelo mínimo solo para evitar un colapso a 0px — con contenido
         auto-dimensionado y el salto de línea de arriba como red de
         seguridad, ya no hace falta un mínimo grande. */
      min-width: 2ch;
    }

    /* Tarjeta MUY estrecha (móvil en listados densos, 2-3 tarjetas por
       fila): reduce icono/tipografía antes de necesitar el salto de
       línea, para que quepan más sensores en una sola fila cuando el
       espacio da un poco de margen. El ancho REAL de la tarjeta
       (container query), no el del viewport. */
    @container (max-width: 220px) {
      .sensor,
      .top-sensor {
        font-size: 10px;
        gap: 3px;
      }
      .sensor ha-icon,
      .top-sensor ha-icon {
        --mdc-icon-size: 13px;
      }
      .sensor .value,
      .top-sensor .value {
        font-size: 9px;
      }
      .sensor.sensor--divided {
        padding-left: 8px;
      }
    }
  `,
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
      name: 'Salón',
      subtitle: 'Luces',
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
    // fila de sensores agrupados pero SIN sensor suelto, 3 filas; en
    // cuanto hay sensor suelto (top_sensor) se añade una fila más,
    // porque esa fila ocupa una línea extra por sí sola.
    return this._sensorRows;
  }

  getGridOptions(): { rows: number | 'auto'; columns: number } {
    // rows: 'auto' SOLO para la variante top_sensor + agrupados, la
    // única que nunca encaja limpia en un número entero de filas fijas
    // (confirmado: "altura automática" da el resultado perfecto ahí).
    // El resto usa filas fijas (2, ya calibrado) — 'auto' en todas
    // causaba que, al compartir fila del grid de secciones con esta
    // variante más alta, HA estirase también las tarjetas más cortas
    // al mismo alto, dejando hueco vacío visible debajo de sus
    // sensores.
    const groupedCount = this._config?.sensors?.length ?? 0;
    let columns = 3;
    if (this._config?.top_sensor || groupedCount >= 1) columns = 4;
    if (groupedCount === 3) columns = 6;

    return {
      rows: this._needsAutoHeight ? 'auto' : 2,
      columns,
    };
  }

  private get _needsAutoHeight(): boolean {
    return !!this._config?.top_sensor && (this._config?.sensors?.length ?? 0) >= 1;
  }

  private get _sensorRows(): number {
    // Aproximación numérica para getCardSize (vistas masonry, que no
    // entienden 'auto') — usa el mismo criterio que _needsAutoHeight.
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

  private get _icon(): string {
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
    const active = this._isActive;
    const hasDoubleTap = !!this._config.double_tap_action && this._config.double_tap_action.action !== 'none';

    return html`
      <ha-card
        class="neon-ring-host ${active ? 'neon-halo-active' : ''}"
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
        ${neonRingTemplate(this._ringUid)}
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

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
  }
}

export { CARD_AUTHOR, CARD_VERSION };
