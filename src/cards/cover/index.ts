import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from '../../shared';
import { NeonCoverCard } from './neon-cover-card';
import { NeonCoverCardEditor } from './neon-cover-card-editor';

logCardBanner('NEON COVER CARD', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-cover-card', NeonCoverCard);
customElements.define('neon-cover-card-editor', NeonCoverCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-cover-card',
  name: 'Neón Cover Card',
  description: 'Control de persianas (cover): posición, inclinación y botones abrir, parar y cerrar, con halo neón.',
  preview: true,
});
