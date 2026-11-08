import { css } from 'lit';

/** Vista flotante de efectos: cubre la tarjeta sin cambiar su alto. */
export const NEON_LIGHT_VIEWS_STYLES = css`
  .view {
    position: absolute;
    inset: 0;
    z-index: 2;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
    background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
    cursor: default;
    animation: view-in 150ms ease-out;
  }
  @keyframes view-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .view {
      animation: none;
    }
  }
  .view-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .view-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .view-close {
    display: flex;
    padding: 2px;
    border: none;
    background: none;
    color: var(--secondary-text-color);
    cursor: pointer;
  }
  .view-list {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 6px;
    overflow-y: auto;
    min-height: 0;
  }
  .effect {
    padding: 4px 10px;
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
    border-radius: 14px;
    background: none;
    color: var(--primary-text-color);
    font-size: 12px;
    cursor: pointer;
  }
  .effect--on {
    border-color: var(--neon-c1);
    background: color-mix(in srgb, var(--neon-c1) 22%, transparent);
  }
`;
