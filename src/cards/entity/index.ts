import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonCardEntity } from './neon-card-entity';
import { NeonCardEntityEditor } from './neon-card-entity-editor';

logCardBanner('NEON CARD ENTITY', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-card-entity', NeonCardEntity);
customElements.define('neon-card-entity-editor', NeonCardEntityEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-card-entity',
  name: 'Neón Card Entity',
  description: 'Interruptor Neón Card Entity con aro degradado de 3 colores.',
  preview: true,
});
