import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { HomeAssistant } from '../../ha/types';
import { getCoverState } from '../../ha/cover';
import type { CoverState } from '../../ha/cover';
import { BaseNeonCard, localize, openMoreInfo } from '../../core';
import {
  angleFromPoint,
  CARD_GRID,
  neonHaloVars,
  neonRingSplitTemplate,
  NEON_HALO_STYLES,
  NEON_RING_SPLIT_STYLES,
  resolveGradientColors,
  RingSizeController,
  valueForAngle,
} from '../../shared';
import { POSITION_MAX, POSITION_MIN } from './constants';
import { coverIcon, isHaloOn, statusGroup } from './cover-visual';
import { NEON_COVER_BODY_STYLES } from './cover-body.styles';
import { NEON_COVER_CONTROLS_STYLES } from './cover-controls.styles';
import { NEON_COVER_CARD_STYLES } from './neon-cover-card.styles';
import { renderControls } from './controls-view';
import { renderHeader } from './header-view';
import { renderPositionRow, renderScale, renderSlider, renderTilt } from './position-view';
import type { PointerHandlers } from './position-view';
import { COVER_TRANSLATIONS } from './translations';
import type { CoverTranslations } from './translations';
import type { NeonCoverCardConfig } from './types';

/**
 * Neón Cover Card
 * ------------------------------------------------------------
 * Creador: Jaguaza
 *
 * Tarjeta para entidades `cover` de Home Assistant (persianas, venecianas,
 * cortinas…): el icono sigue al tipo de cover y a su estado, el porcentaje de
 * apertura se ve y se fija con un dial y un deslizador, la inclinación de las
 * lamas tiene el suyo si la entidad la soporta, y los botones abren, paran y
 * cierran. Ver `README.md` de esta carpeta para la especificación.
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

  static styles = [NEON_HALO_STYLES, NEON_RING_SPLIT_STYLES, NEON_COVER_CARD_STYLES, NEON_COVER_BODY_STYLES, NEON_COVER_CONTROLS_STYLES];

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
    }
  }

  getCardSize(): number {
    return 5;
  }

  /** Doce columnas de inicio y alto automático (con o sin inclinación). */
  getGridOptions(): { rows: 'auto'; columns: number; min_columns: number } {
    return { rows: 'auto', ...CARD_GRID.large };
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

  /** Dial, deslizador de posición y, si la entidad la soporta, el de inclinación. */
  private _renderBody(cover: CoverState): TemplateResult | typeof nothing {
    const parts: Array<TemplateResult> = [];
    if (cover.position !== null) {
      const value = this._dragPosition ?? cover.position;
      const disabled = !cover.canSetPosition || !cover.available;
      parts.push(
        renderPositionRow({ entity: cover.entity, value, label: this._t('position_label'), pointer: this._pointerHandlers(!disabled) }),
        html`${renderSlider({ value, label: this._t('position_label'), disabled, onInput: (v) => (this._dragPosition = v), onChange: (v) => this._commitPosition(v) })}${renderScale()}`
      );
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

  render(): TemplateResult {
    const cover = this._cover;
    if (!cover) {
      return html`<ha-card><div class="unavailable">${this._t('entity_missing')}</div></ha-card>`;
    }
    const active = isHaloOn(cover);
    const group = statusGroup(cover);
    const colors = resolveGradientColors(this._config);

    return html`
      <ha-card class="neon-ring-host ${active ? 'neon-halo-active' : ''}" style=${neonHaloVars(colors)}>
        ${neonRingSplitTemplate(this._ringUid, this._ring.size.width, this._ring.size.height, this._ring.size.radius)}
        ${renderHeader({
          name: this._name(cover),
          icon: coverIcon(cover),
          statusText: this._t(`state_${cover.state}`),
          group,
          active,
          menuLabel: this._t('more_info'),
          onMenu: () => openMoreInfo(this, cover.entity),
        })}
        ${this._renderBody(cover)}
        ${renderControls({
          cover,
          labels: { open: this._t('action_open'), close: this._t('action_close'), stop: this._t('action_stop') },
          onOpen: () => this._call('open_cover'),
          onStop: () => this._call('stop_cover'),
          onClose: () => this._call('close_cover'),
        })}
      </ha-card>
    `;
  }
}
