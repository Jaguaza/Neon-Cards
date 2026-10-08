import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonButtonCard } from './neon-button-card';
import { NeonButtonCardEditor } from './neon-button-card-editor';

logCardBanner('NEON BUTTON CARD', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-button-card', NeonButtonCard);
customElements.define('neon-button-card-editor', NeonButtonCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-button-card',
  name: 'Neón Button Card',
  description: 'Botón de acción con icono protagonista, aro neón animado y halo en estado activo.',
  preview: true,
});
