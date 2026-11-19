import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import type { HomeAssistant } from '../ha/types';

/**
 * Base común para todas las tarjetas de Neón Cards.
 *
 * Deliberadamente SIN decoradores (`@property`, `@state`) — usamos la
 * forma clásica `static properties` para respetar el acuerdo nº10 ("sin
 * magia... evitar decoradores complejos"). Cada tarjeta que extienda esta
 * clase debe fusionar sus propias `properties` con `BaseNeonCard.properties`:
 *
 * ```ts
 * static properties = {
 *   ...BaseNeonCard.properties,
 *   _config: { state: true },
 * };
 * ```
 */
export abstract class BaseNeonCard extends LitElement {
  static properties = {
    hass: { attribute: false },
  };

  hass?: HomeAssistant;

  /**
   * Marca el host con `data-neon-light` mientras el tema de HA es claro
   * (`hass.themes.darkMode === false`). Las hojas de `src/shared` lo usan
   * (`:host([data-neon-light])`) para adaptar el icono encendido, que en
   * claro pierde la silueta con el halo de color. Sin dato del tema se
   * queda como en oscuro (el aspecto de siempre). Las tarjetas que
   * sobrescriban `willUpdate` deben llamar a `super.willUpdate(changed)`.
   */
  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has('hass')) this.toggleAttribute('data-neon-light', this.hass?.themes?.darkMode === false);
  }

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): { rows: number | 'auto'; columns: number } {
    return { rows: 1, columns: 12 };
  }
}
