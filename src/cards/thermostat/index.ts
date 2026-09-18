import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonThermostatCard } from './neon-thermostat-card';
import { NeonThermostatCardEditor } from './neon-thermostat-card-editor';

console.info(
  `%c NEON THERMOSTAT CARD %c By ${CARD_AUTHOR} %c v${CARD_VERSION} `,
  'color: white; background: #16241f; font-weight: bold; border-radius: 3px 0 0 3px;',
  'color: white; background: #39e07a; font-weight: bold;',
  'color: #39e07a; background: #2a2a31; font-weight: bold; border-radius: 0 3px 3px 0;'
);

customElements.define('neon-thermostat-card', NeonThermostatCard);
customElements.define('neon-thermostat-card-editor', NeonThermostatCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-thermostat-card',
  name: 'Neón Thermostat Card',
  description: 'Control de clima con temperatura, modo HVAC y color neón configurable.',
  preview: true,
});
