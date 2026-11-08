import { html } from 'lit';
import type { TemplateResult } from 'lit';

/**
 * Icono de la luz, valga el que valga: una copia apagada debajo y otra
 * encendida encima, recortada desde abajo hasta `fill` (0-100 %) y teñida con
 * `color` (el de la luz; sin él, la paleta neón de la tarjeta). Con la luz
 * apagada no se ve nada de la encendida; al encender, el icono se ilumina de
 * abajo arriba hasta el brillo marcado (o entero si la luz solo enciende y
 * apaga). El recorte lo anima la hoja de estilos (`light-icon.styles.ts`).
 */
export function renderLightIcon(icon: string, fill: number, color?: string): TemplateResult {
  const style = color ? `--fill: ${fill}%; --light-color: ${color}` : `--fill: ${fill}%`;
  return html`
    <div class="light-icon" style=${style}>
      <ha-icon class="icon-base" icon=${icon}></ha-icon>
      <div class="icon-glow"><div class="icon-lit"><ha-icon icon=${icon}></ha-icon></div></div>
    </div>
  `;
}
