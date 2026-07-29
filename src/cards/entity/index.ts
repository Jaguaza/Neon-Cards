import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonCardEntity } from './neon-card-entity';
import { NeonCardEntityEditor } from './neon-card-entity-editor';

console.info(
  `%c NEON CARD ENTITY %c By ${CARD_AUTHOR} %c v${CARD_VERSION} `,
  'color: white; background: #16241f; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: white; background: #39e07a; font-weight: bold;',
  'color: #39e07a; background: #2a2a31; font-weight: bold; border-radius: 0 3px 3px 0;'
);

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
