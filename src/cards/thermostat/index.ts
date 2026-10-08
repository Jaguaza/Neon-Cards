import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonThermostatCard } from './neon-thermostat-card';
import { NeonThermostatCardEditor } from './neon-thermostat-card-editor';

logCardBanner('NEON THERMOSTAT CARD', CARD_AUTHOR, CARD_VERSION);

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
