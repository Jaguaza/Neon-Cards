export const CARD_AUTHOR = 'Jaguaza';
export const CARD_VERSION = '1.5.0';

export interface NeonPreset {
  name: string;
  c1: string;
  c2: string;
  c3: string;
}

export const NEON_PRESETS: Record<string, NeonPreset> = {
  emerald: {
    name: 'Cyber Emerald (Verde/Turquesa/Azul)',
    c1: '#39e07a',
    c2: '#2dd6b8',
    c3: '#1ecdf2',
  },
  cyberpunk: {
    name: 'Cyberpunk Pink (Rosa/Carmesí/Púrpura)',
    c1: '#ff2a85',
    c2: '#ff0055',
    c3: '#7a00ff',
  },
  electric: {
    name: 'Electric Blue (Cian/Azul/Oscuro)',
    c1: '#00f2fe',
    c2: '#4facfe',
    c3: '#005bea',
  },
  sunset: {
    name: 'Sunset Amber (Naranja/Amarillo/Rosa)',
    c1: '#ffb347',
    c2: '#ffcc33',
    c3: '#ff1361',
  },
  toxic: {
    name: 'Toxic Purple (Violeta/Púrpura/Azul)',
    c1: '#bf00ff',
    c2: '#7d12ff',
    c3: '#00d4ff',
  },
};

export const DEFAULT_PALETTE = 'emerald';
export const DOUBLE_TAP_DELAY_MS = 280;
export const HOLD_DELAY_MS = 500;
