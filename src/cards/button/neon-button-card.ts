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
import { resolveGradientColors, NEON_HALO_STYLES, neonHaloVars } from '../../shared';
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

  static styles = [
    NEON_HALO_STYLES,
    css`
    :host {
      display: block;
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
      padding: 10px 20px;
      height: 100%;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      overflow: hidden;
      /* Glassmorphism: nunca colores fijos, solo variables CSS de HA. */
      background: color-mix(in srgb, var(--card-background-color, #1c1c1c) 55%, transparent);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid color-mix(in srgb, var(--divider-color, #ffffff) 14%, transparent);
      box-shadow: 0 1px 0 0 color-mix(in srgb, var(--divider-color, #ffffff) 20%, transparent) inset,
        0 8px 24px rgba(0, 0, 0, 0.12);
      transition: transform 150ms ease;
    }
    ha-card:active {
      transform: scale(0.98);
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      height: 100%;
    }
    ha-icon {
      --mdc-icon-size: 40px;
      color: var(--state-icon-color, var(--primary-text-color));
      margin-bottom: 6px;
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
      margin-top: auto;
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
      display: flex;
      align-items: center;
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }
    .sensor {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      /* Hueco fijo de 1/3 del ancho de la fila para CUALQUIER sensor,
         haya 1, 2 o 3 — así el tamaño de la tarjeta no depende de
         cuántos estén configurados (si sobra sitio, se queda vacío al
         final en vez de repartirse). flex-basis fijo con flex-grow:0;
         solo se agranda (flex-shrink) si el propio contenido de ESE
         sensor lo necesita, nunca por el hueco que dejen los demás.
         El 3 de "calc(100% / 3)" es MAX_GROUPED_SENSORS — si cambia esa
         constante, cambiar también aquí. */
      flex: 0 1 calc(100% / 3);
      font-size: 11px;
      line-height: 14px;
      color: var(--secondary-text-color);
    }
    .sensor-separator {
      width: 1px;
      align-self: stretch;
      background: var(--divider-color, rgba(255, 255, 255, 0.12));
      margin: 0 6px;
      flex: 0 0 auto;
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
      /* 4ch cubre con margen "26 °C"/"100 %"/"230 V" — antes eran 3ch
         y se quedaba corto en tarjetas estrechas de móvil (ver la regla
         @container más abajo para el resto del achique responsivo). */
      min-width: 4ch;
    }

    /* Tarjeta estrecha (móvil, tile pequeña, columna angosta de un
       dashboard): la fila de sensores encoge icono/tipografía/márgenes
       en vez de dejar que el valor se trunque con "…". Los umbrales son
       del ancho REAL de la tarjeta (container query), no del viewport,
       así funciona igual en un móvil que en una columna estrecha de
       PC. */
    @container (max-width: 260px) {
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
        min-width: 3ch;
      }
      .sensor-separator {
        margin: 0 4px;
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
    // Cálculo real de altura de contenido, igual criterio que la Entity
    // Card (padding ajustado a propósito para encajar en unidades de
    // grid de HA, ~56px/fila en sections, +8px de gap entre filas):
    //  Sin sensores: padding(10×2=20) + icono(40+6) + gap(10) + texto(22+2+14=38)
    //    = 20 + 46 + 10 + 38 = 114px → cabe en 2 filas (56×2+8 = 120px)
    //  Con sensores: + gap(10) + divider(1) + gap(10) + fila sensores(14)
    //    = 114 + 35 = 149px → cabe en 3 filas (56×3+16 = 184px)
    return this._hasSensors ? 3 : 2;
  }

  getGridOptions(): { rows: number; columns: number } {
    // Ancho constante: la tarjeta nunca cambia de tamaño según cuántos
    // sensores tenga configurados (cada sensor tiene su propio hueco fijo
    // en la fila — ver `.sensor` en los estilos — así que 4 columnas
    // sirven igual con 1, 2 o 3 sensores agrupados).
    return {
      rows: this._hasSensors ? 3 : 2,
      columns: 4,
    };
  }

  private get _stateObj() {
    return this._config?.entity ? this.hass?.states[this._config.entity] : undefined;
  }

  private get _hasSensors(): boolean {
    return !!this._config?.top_sensor || (this._config?.sensors?.length ?? 0) > 0;
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
      <div class="sensors">
        ${displays.map(
          (d, i) => html`
            ${i > 0 ? html`<span class="sensor-separator"></span>` : nothing}
            <div class="sensor">
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
        class="neon-halo-host ${active ? 'neon-halo-active' : ''}"
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
        <div class="content">
          <ha-icon class="neon-halo-icon" icon=${this._icon}></ha-icon>
          <div class="text">
            <span class="name">${this._name}</span>
            ${this._subtitle !== nothing ? html`<span class="subtitle">${this._subtitle}</span>` : nothing}
          </div>
          ${this._renderTopSensor()}
          ${this._config.sensors?.length ? html`<div class="divider"></div>` : nothing}
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
