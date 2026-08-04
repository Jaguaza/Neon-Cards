import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonButtonCard } from './neon-button-card';
import { NeonButtonCardEditor } from './neon-button-card-editor';

console.info(
  `%c NEON BUTTON CARD %c By ${CARD_AUTHOR} %c v${CARD_VERSION} `,
  'color: white; background: #16241f; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: white; background: #39e07a; font-weight: bold;',
  'color: #39e07a; background: #2a2a31; font-weight: bold; border-radius: 0 3px 3px 0;'
);

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
  description: 'Botón de acción con cristal, icono protagonista y halo neón en estado activo.',
  preview: true,
});
