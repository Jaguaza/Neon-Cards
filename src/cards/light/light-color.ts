import { currentSaturation } from './light-state';
import type { FooterControl } from './types';

type Attributes = Record<string, unknown> | undefined;

/** Valor de una barra del pie que se está arrastrando. */
export interface ColorPreview {
  control: FooterControl;
  value: number;
}

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const clamp255 = (value: number): number => Math.min(255, Math.max(0, Math.round(value)));

export const rgbToCss = (red: number, green: number, blue: number): string => `rgb(${clamp255(red)}, ${clamp255(green)}, ${clamp255(blue)})`;

/**
 * Tono (0-360) y saturación (0-100) a CSS. Con el valor al máximo, HSV pasa a
 * HSL con luminosidad `100 - saturación / 2`: la saturación 100 es el color
 * puro y la 0 el blanco.
 */
export const hsToCss = (hue: number, saturation: number): string => `hsl(${Math.round(hue)}, 100%, ${Math.round(100 - saturation / 2)}%)`;

/** Temperatura de color (K) a RGB (aproximación de Tanner Helland, válida de 1000 a 40000 K). */
export function kelvinToCss(kelvin: number): string {
  const t = kelvin / 100;
  const red = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const green = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const blue = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return rgbToCss(red, green, blue);
}

function stateColor(attributes: Attributes): string | undefined {
  const rgb = attributes?.rgb_color;
  if (Array.isArray(rgb) && rgb.length >= 3 && rgb.slice(0, 3).every(isNumber)) return rgbToCss(rgb[0], rgb[1], rgb[2]);
  const hs = attributes?.hs_color;
  if (Array.isArray(hs) && isNumber(hs[0]) && isNumber(hs[1])) return hsToCss(hs[0], hs[1]);
  return undefined;
}

/**
 * Color con el que se enciende el icono: el que arrastras en la barra de
 * color o de temperatura mientras la arrastras y, si no, el color real de la
 * luz (`rgb_color`; si no lo informa, `hs_color`). `undefined` si la luz no
 * tiene color (solo brillo, o apagada): el icono usa entonces la paleta neón.
 */
export function lightColorCss(attributes: Attributes, preview?: ColorPreview): string | undefined {
  if (preview?.control === 'color') return hsToCss(preview.value, currentSaturation(attributes));
  if (preview?.control === 'color_temp') return kelvinToCss(preview.value);
  return stateColor(attributes);
}
