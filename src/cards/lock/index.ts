import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonLockCard } from './neon-lock-card';
import { NeonLockCardEditor } from './neon-lock-card-editor';

logCardBanner('NEON LOCK CARD', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-lock-card', NeonLockCard);
customElements.define('neon-lock-card-editor', NeonLockCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-lock-card',
  name: 'Neón Lock Card',
  description: 'Cerradura con icono animado, halo neón que sigue al estado, confirmación al abrir y pie informativo.',
  preview: true,
});
