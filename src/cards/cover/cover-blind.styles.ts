import { css } from 'lit';

/**
 * Ajustes de la veneciana: más compacta en vertical que el resto de tipos.
 * Solo cambian huecos, deslizadores y pie; ningún icono, dial ni texto de la
 * tarjeta cambia de tamaño.
 */
export const NEON_COVER_BLIND_STYLES = css`
  ha-card[data-cover-type='blind'] {
    padding-top: 10px;
    padding-bottom: 10px;
    gap: 4px;
  }

  ha-card[data-cover-type='blind'] .hero-body,
  ha-card[data-cover-type='blind'] .header-text {
    gap: 0;
  }

  ha-card[data-cover-type='blind'] .slider {
    --slider-h: 12px;
  }

  ha-card[data-cover-type='blind'] .scale {
    margin-top: -2px;
    font-size: 11px;
    line-height: 12px;
  }

  ha-card[data-cover-type='blind'] .tilt-row {
    margin: 0 0 -4px;
  }

  ha-card[data-cover-type='blind'] .controls {
    padding-top: 2px;
  }

  ha-card[data-cover-type='blind'] .control {
    padding-top: 2px;
    padding-bottom: 2px;
  }
`;
