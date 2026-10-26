import { css } from 'lit';

/**
 * Estilos del escudo animado: tamaño, trazos, relleno suave cuando vigila y
 * animaciones (entrada del dibujo y pulso en transición o disparada).
 */
export const NEON_SHIELD_ICON_STYLES = css`
  .alarm-icon {
    width: 40px;
    height: 40px;
    flex: none;
    margin-bottom: 2px;
    overflow: visible;
    color: var(--state-icon-color, var(--primary-text-color));
    transition: color 300ms ease-out;
  }
  .alarm-icon .shield {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linejoin: round;
    transition: fill-opacity 300ms ease-out;
  }
  .alarm-icon.is-filled .shield {
    fill: currentColor;
    fill-opacity: 0.22;
  }
  .alarm-icon .glyph.line {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .alarm-icon .glyph.solid {
    fill: currentColor;
  }
  .alarm-icon .glyph {
    transform-box: fill-box;
    transform-origin: center;
    animation: glyph-in 280ms ease-out;
  }
  .alarm-moving .alarm-icon,
  .alarm-moving .status-dot {
    animation: alarm-pulse 1.1s ease-in-out infinite;
  }
  .alarm-triggered .alarm-icon {
    animation-duration: 0.6s;
  }
  @keyframes glyph-in {
    from {
      opacity: 0;
      transform: scale(0.4);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes alarm-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .alarm-icon .glyph,
    .alarm-moving .alarm-icon,
    .alarm-moving .status-dot {
      animation: none;
    }
  }
`;
