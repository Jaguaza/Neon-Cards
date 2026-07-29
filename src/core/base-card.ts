import { LitElement } from 'lit';
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

  getCardSize(): number {
    return 1;
  }

  getGridOptions(): { rows: number; columns: number } {
    return { rows: 1, columns: 12 };
  }
}
