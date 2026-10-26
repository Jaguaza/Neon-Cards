import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonAlarmCard } from './neon-alarm-card';
import { NeonAlarmCardEditor } from './neon-alarm-card-editor';

logCardBanner('NEON ALARM CARD', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-alarm-card', NeonAlarmCard);
customElements.define('neon-alarm-card-editor', NeonAlarmCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-alarm-card',
  name: 'Neón Alarm Card',
  description: 'Alarma con escudo animado, halo neón según el estado, selección de modo, teclado de código y pie con sensores de seguridad.',
  preview: true,
});
