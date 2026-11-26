import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getCoverState } from '../../ha/cover';
import type { CoverState } from '../../ha/cover';
import { BaseNeonCard, localize, openMoreInfo } from '../../core';
import {
  angleFromPoint,
  neonHaloVars,
  neonRingSplitTemplate,
  NEON_HALO_STYLES,
  NEON_RING_SPLIT_STYLES,
  resolveGradientColors,
  RingSizeController,
  valueForAngle,
} from '../../shared';
import { COVER_GRID, COVER_TYPES, POSITION_MAX, POSITION_MIN } from './constants';
import { iconColor, isBinaryCoverType, isHaloOn, openFraction, resolveCoverSize, resolveCoverType, statusDotColor, statusGroup } from './cover-visual';
import { renderGlyph } from './cover-glyph';
import { NEON_COVER_GLYPH_STYLES } from './cover-glyph.styles';
import { NEON_COVER_BODY_STYLES } from './cover-body.styles';
import { NEON_COVER_BLIND_STYLES } from './cover-blind.styles';
import { NEON_COVER_CONTROLS_STYLES } from './cover-controls.styles';
import { NEON_COVER_COMPACT_STYLES } from './cover-compact.styles';
import { NEON_COVER_MEDIUM_STYLES } from './cover-medium.styles';
import { NEON_COVER_CARD_STYLES } from './neon-cover-card.styles';
import { renderControls } from './controls-view';
import { renderHeader } from './header-view';
import { renderPositionBlock, renderPositionRow, renderScale, renderSlider, renderTilt } from './position-view';
import type { PointerHandlers } from './position-view';
import { COVER_TRANSLATIONS } from './translations';
import type { CoverTranslations } from './translations';
import type { CoverSize, CoverType, NeonCoverCardConfig } from './types';

/**
 * Neón Cover Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta para entidades `cover` de Home Assistant: persianas, venecianas,
 * cortinas, toldos, pantallas de proyector y TV en mueble. El icono, grande, se dibuja según el tipo de cover y sube,
 * gira o se despliega con el porcentaje de apertura y la inclinación; el porcentaje se ve y se
 * fija con un dial y un deslizador, la inclinación de las lamas tiene el suyo
 * si la entidad la soporta, y el pie tiene los botones abrir, parar y cerrar. Ver `README.md` de esta carpeta para la especificación.
 */
export class NeonCoverCard extends BaseNeonCard {
  static properties = {
    ...BaseNeonCard.properties,
    _config: { state: true },
    _dragPosition: { state: true },
    _dragTilt: { state: true },
  };

  private _config?: NeonCoverCardConfig;
  /** Valores optimistas mientras se arrastra el dial o un deslizador; `null` si no se arrastra (se pinta el valor real). */
  private _dragPosition: number | null = null;
  private _dragTilt: number | null = null;
  private _dragging = false;

  /** Id estable por instancia para el degradado del aro, y tamaño real de ha-card (ver `RingSizeController`). */
  private readonly _ringUid = Math.random().toString(36).slice(2);
  private readonly _ring = new RingSizeController(this);

  static styles = [NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, NEON_COVER_CARD_STYLES, NEON_COVER_GLYPH_STYLES, NEON_COVER_BODY_STYLES, NEON_COVER_CONTROLS_STYLES, NEON_COVER_BLIND_STYLES, NEON_COVER_MEDIUM_STYLES, NEON_COVER_COMPACT_STYLES];

  static getConfigElement(): HTMLElement {
    return document.createElement('neon-cover-card-editor');
  }

  static getStubConfig(hass?: HomeAssistant, entities?: string[], entitiesFallback?: string[]): NeonCoverCardConfig {
    const isCover = (id: string) => id.startsWith('cover.');
    const fromCandidates = [...(entities ?? []), ...(entitiesFallback ?? [])].find(isCover);
    const fromHass = hass ? Object.keys(hass.states).find(isCover) : undefined;
    return { entity: fromCandidates || fromHass || 'cover.example_cover' };
  }

  setConfig(config: NeonCoverCardConfig): void {
    // Sin lanzar error si falta la entidad: la vista previa del selector de
    // tarjetas de HA y el editor llaman a setConfig con configs incompletas.
    this._config = config;
    // Solo en modo desarrollo (acuerdo nº22).
    if (__DEV__) {
      if (!config.entity) {
        console.warn('[neon-cover-card] falta `entity:` — la tarjeta se muestra como «no disponible».');
      } else if (!config.entity.startsWith('cover.')) {
        console.warn(`[neon-cover-card] entity ("${config.entity}") no es del dominio cover — se muestra como «no disponible».`);
      }
      if (config.cover_type !== undefined && !COVER_TYPES.includes(config.cover_type)) {
        console.warn(`[neon-cover-card] cover_type ("${String(config.cover_type)}") no es uno de los seis tipos — se dibuja una persiana.`);
      }
    }
  }

  getCardSize(): number {
    return 5;
  }

  /** Alto automático y ancho según el tamaño: la grande, entre 9 y 12 columnas; la mediana, entre 6 y 8; la compacta, entre 3 y 6. */
  getGridOptions(): { rows: 'auto'; columns: number; min_columns: number; max_columns: number } {
    return { rows: 'auto', ...COVER_GRID[resolveCoverSize(this._config?.size)] };
  }

  private get _cover(): CoverState | null {
    if (!this._config?.entity || !this.hass) return null;
    return getCoverState(this._config.entity, this.hass);
  }

  private _t(key: keyof CoverTranslations): string {
    return localize(this.hass, COVER_TRANSLATIONS, key);
  }

  private _name(cover: CoverState): string {
    return this._config?.name || (this.hass?.states[cover.entity]?.attributes.friendly_name as string | undefined) || cover.entity;
  }

  /** Lanza un servicio `cover.*` sobre la entidad de la tarjeta. */
  private _call(service: string, data: Record<string, unknown> = {}): void {
    const entity = this._config?.entity;
    if (!entity || !this.hass) return;
    void this.hass.callService('cover', service, { entity_id: entity, ...data });
  }

  private _positionFromPointer(ev: PointerEvent): number {
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    return Math.round(valueForAngle(angleFromPoint(rect, ev.clientX, ev.clientY), POSITION_MIN, POSITION_MAX));
  }

  /** Arrastre del dial: el valor se ve al instante y la orden sale al soltar. */
  private _pointerHandlers(canSet: boolean): PointerHandlers {
    return {
      down: (ev) => {
        if (!canSet) return;
        ev.preventDefault();
        (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
        this._dragging = true;
        this._dragPosition = this._positionFromPointer(ev);
      },
      move: (ev) => {
        if (canSet && this._dragging) this._dragPosition = this._positionFromPointer(ev);
      },
      up: () => {
        if (!canSet || !this._dragging) return;
        this._dragging = false;
        if (this._dragPosition !== null) this._call('set_cover_position', { position: this._dragPosition });
        this._dragPosition = null;
      },
    };
  }

  private _commitPosition(value: number): void {
    this._call('set_cover_position', { position: value });
    this._dragPosition = null;
  }

  private _commitTilt(value: number): void {
    this._call('set_cover_tilt_position', { tilt_position: value });
    this._dragTilt = null;
  }

  /** Porcentaje mostrado: el que se arrastra o, si no, el real. */
  private _shownPosition(cover: CoverState): number | null {
    return this._dragPosition ?? cover.position;
  }

  /**
   * Posición actual en grande y su dial; sin `current_position` no hay nada
   * que mostrar. Un tipo binario (proyector, TV) llena el hueco de la derecha
   * con el porcentaje solo, sin dial: 0 % cerrado y 100 % abierto (o el de la
   * entidad, si lo informa), que no se puede elegir.
   */
  private _renderPositionRow(cover: CoverState, type: CoverType): TemplateResult | typeof nothing {
    if (isBinaryCoverType(type)) {
      const value = Math.round(openFraction(cover, cover.position) * 100);
      return html`<div class="position-row position-row--binary">${renderPositionBlock({ label: this._t('position_label'), value })}</div>`;
    }
    const value = this._shownPosition(cover);
    if (value === null) return nothing;
    const canSet = cover.canSetPosition && cover.available;
    return renderPositionRow({ entity: cover.entity, value, label: this._t('position_label'), pointer: this._pointerHandlers(canSet) });
  }

  /** Deslizador de posición con su escala y, si la entidad la soporta, el de inclinación. */
  private _renderSliders(cover: CoverState, type: CoverType): TemplateResult | typeof nothing {
    if (isBinaryCoverType(type)) return nothing;
    const parts: TemplateResult[] = [];
    const value = this._shownPosition(cover);
    if (value !== null) {
      const disabled = !cover.canSetPosition || !cover.available;
      parts.push(html`${renderSlider({ value, label: this._t('position_label'), disabled, onInput: (v) => (this._dragPosition = v), onChange: (v) => this._commitPosition(v) })}${renderScale()}`);
    }
    if (cover.canSetTilt && cover.tiltPosition !== null) {
      parts.push(
        renderTilt({
          heading: this._t('tilt_label'),
          label: this._t('tilt_label'),
          value: this._dragTilt ?? cover.tiltPosition,
          disabled: !cover.available,
          onInput: (v) => (this._dragTilt = v),
          onChange: (v) => this._commitTilt(v),
        })
      );
    }
    return parts.length ? html`${parts}` : nothing;
  }

  /**
   * Icono grande: el dibujo del tipo de cover, que se mueve con el porcentaje
   * y la inclinación (también mientras se arrastran) o, sin porcentaje, con el
   * estado.
   */
  private _renderHeroIcon(cover: CoverState, type: CoverType, active: boolean): TemplateResult {
    const dragging = this._dragPosition !== null || this._dragTilt !== null;
    const glyph = renderGlyph({
      glyph: type,
      open: openFraction(cover, this._shownPosition(cover)),
      tilt: (this._dragTilt ?? cover.tiltPosition ?? 0) / 100,
      uid: this._ringUid,
    });
    // Color del icono elegido en la config: solo con la tarjeta activa, como el
    // halo; cerrada (o caída) el icono vuelve al color de texto.
    const color = active ? iconColor(this._config) : undefined;
    return html`<div class="hero-icon ${dragging ? 'dragging' : ''}" style=${color ? `--cover-color: ${color}` : nothing}>${glyph}</div>`;
  }

  /** Cabecera: nombre, estado con su punto y los tres puntos de «más información». */
  private _renderHeader(cover: CoverState): TemplateResult {
    const group = statusGroup(cover);
    return renderHeader({
      name: this._name(cover),
      statusText: this._t(`state_${cover.state}`),
      group,
      dotColor: statusDotColor(this._config, group),
      menuLabel: this._t('more_info'),
      onMenu: () => openMoreInfo(this, cover.entity),
    });
  }

  /** Grande: el icono a la izquierda y, a su derecha, la cabecera y la posición con su dial. */
  private _renderLargeMain(cover: CoverState, type: CoverType, active: boolean): TemplateResult {
    return html`
      <div class="hero">
        ${this._renderHeroIcon(cover, type, active)}
        <div class="hero-body">${this._renderHeader(cover)} ${this._renderPositionRow(cover, type)}</div>
      </div>
    `;
  }

  /**
   * Mediana y compacta: el nombre con los tres puntos, el estado y el
   * porcentaje (sin dial) a un lado y el icono al otro. En la mediana el nombre
   * va arriba a todo el ancho y el icono, grande, a la derecha a la altura del
   * estado; en la compacta el icono, pequeño, va a la izquierda. Un tipo
   * binario o sin `current_position` no tiene porcentaje.
   */
  private _renderIconMain(cover: CoverState, type: CoverType, active: boolean, size: 'medium' | 'compact'): TemplateResult {
    const value = this._shownPosition(cover);
    const block = value === null || isBinaryCoverType(type) ? nothing : renderPositionBlock({ label: this._t('position_label'), value });
    return html`<div class="${size}-main">${this._renderHeader(cover)} ${block} ${this._renderHeroIcon(cover, type, active)}</div>`;
  }

  /** La cabecera y la posición de cada tamaño: grande con dial, mediana y compacta sin él. */
  private _renderMain(cover: CoverState, type: CoverType, active: boolean, size: CoverSize): TemplateResult {
    return size === 'large' ? this._renderLargeMain(cover, type, active) : this._renderIconMain(cover, type, active, size);
  }

  render(): TemplateResult {
    const cover = this._cover;
    if (!cover) {
      return html`<ha-card><div class="unavailable">${this._t('entity_missing')}</div></ha-card>`;
    }
    const active = isHaloOn(cover);
    const colors = resolveGradientColors(this._config);
    const type = resolveCoverType(this._config?.cover_type);
    const size = resolveCoverSize(this._config?.size);

    return html`
      <ha-card class="neon-ring-host ${active ? 'neon-halo-active' : ''}" data-cover-type=${type} data-cover-size=${size} style=${neonHaloVars(colors)}>
        ${neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)}
        ${this._renderMain(cover, type, active, size)}
        ${size === 'compact' ? nothing : this._renderSliders(cover, type)}
        ${renderControls({
          cover,
          type,
          labels: { open: this._t('action_open'), close: this._t('action_close'), stop: this._t('action_stop') },
          onOpen: () => this._call('open_cover'),
          onStop: () => this._call('stop_cover'),
          onClose: () => this._call('close_cover'),
        })}
      </ha-card>
    `;
  }
}
