import { logCardBanner } from '../../core';
import { CARD_AUTHOR, CARD_VERSION } from './constants';
import { NeonSensorCard } from './neon-sensor-card';
import { NeonSensorCardEditor } from './neon-sensor-card-editor';

logCardBanner('NEON SENSOR CARD', CARD_AUTHOR, CARD_VERSION);

customElements.define('neon-sensor-card', NeonSensorCard);
customElements.define('neon-sensor-card-editor', NeonSensorCardEditor);

interface CustomCardWindow extends Window {
  customCards?: Array<{ type: string; name: string; description: string; preview: boolean }>;
}

const win = window as CustomCardWindow;
win.customCards = win.customCards || [];
win.customCards.push({
  type: 'neon-sensor-card',
  name: 'Neón Sensor Card',
  description: 'Valor de un sensor o binary_sensor con estado, umbrales y gráfico tipo monitor.',
  preview: true,
});
