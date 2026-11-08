import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from '../../shared';
import { NeonLightCard } from './neon-light-card';
import { NeonLightCardEditor } from './neon-light-card-editor';

logCardBanner('NEON LIGHT CARD', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-light-card', NeonLightCard);
customElements.define('neon-light-card-editor', NeonLightCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-light-card',
  name: 'Neón Light Card',
  description: 'Luz con icono que se enciende de abajo arriba según el brillo y pie con brillo, temperatura de color, color y efectos.',
  preview: true,
});
