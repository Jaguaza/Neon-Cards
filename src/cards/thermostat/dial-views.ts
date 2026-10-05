import { html } from 'lit';
import type { TemplateResult } from 'lit';
import type { ClimateState } from '../../ha/climate';
import { buildArcModel } from './dial-geometry';

export interface PointerHandlers {
  down: (ev: PointerEvent) => void;
  move: (ev: PointerEvent) => void;
  up: () => void;
}

/** Lo que necesita cada vista para pintarse. `pill` es la píldora de
    consigna ya pintada (cada vista la coloca debajo de su cuerpo). */
export interface BodyOptions {
  climate: ClimateState;
  color: string;
  displayTarget: number | null;
  pill: TemplateResult;
  pointer: PointerHandlers;
}

/** Vista grande: temperatura actual a la izquierda y, a la derecha, un
    dial arrastrable — un único arco continuo con un halo que va de
    transparente en los dos extremos a color sólido en el punto. */
export function renderLargeBody(o: BodyOptions): TemplateResult {
  const { climate, color, displayTarget, pointer } = o;
  const arc = buildArcModel('dial-grad', climate.entity, climate.minTemp, climate.maxTemp, displayTarget);

  return html`
    <div class="dial-row">
      <div class="current-temp-block" style="--current-color: ${color}">
        <span class="current-temp-big">${climate.currentTemperature ?? '--'}<span class="unit">°</span></span>
      </div>
      <div class="dial-wrap" style="--current-color: ${color}">
        <svg
          class="dial-svg"
          viewBox="0 0 100 100"
          @pointerdown=${pointer.down}
          @pointermove=${pointer.move}
          @pointerup=${pointer.up}
          @pointercancel=${pointer.up}
        >
          <defs>
            <linearGradient id=${arc.gradientId} gradientUnits="userSpaceOnUse" x1=${arc.start.x} y1=${arc.start.y} x2=${arc.end.x} y2=${arc.end.y}>
              <stop offset="0%" stop-color=${color} stop-opacity="0"></stop>
              <stop offset="${arc.dotFraction * 100}%" stop-color=${color} stop-opacity="1"></stop>
              <stop offset="100%" stop-color=${color} stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          <path class="dial-arc" d=${arc.fullPath} stroke="url(#${arc.gradientId})"></path>
          <circle class="dial-dot" cx=${arc.dot.x} cy=${arc.dot.y} r="4.5"></circle>
          <!-- Zona de toque invisible, más ancha que el trazo/punto
               visibles (que se quedan finos a propósito) — sin esto el
               control es muy difícil de acertar con el dedo. Extremo
               recto (no redondeado) para no invadir la píldora de
               abajo; el punto usa una elipse (más ancha que alta) por
               el mismo motivo. -->
          <path class="dial-hit" d=${arc.fullPath}></path>
          <ellipse class="dial-hit-dot" cx=${arc.dot.x} cy=${arc.dot.y} rx="11" ry="7"></ellipse>
        </svg>
      </div>
    </div>
    ${o.pill}
  `;
}

/** Vista normal: el mismo arco de 180° que el dial de la vista grande,
    como aro alrededor de la temperatura actual, también arrastrable. */
export function renderRingBody(o: BodyOptions): TemplateResult {
  const { climate, color, displayTarget, pointer } = o;
  const arc = buildArcModel('ring-grad', climate.entity, climate.minTemp, climate.maxTemp, displayTarget);

  return html`
    <div class="ring-wrap" style="--ring-size: 176px; --current-color: ${color}">
      <svg
        class="ring-svg"
        viewBox="0 0 100 100"
        @pointerdown=${pointer.down}
        @pointermove=${pointer.move}
        @pointerup=${pointer.up}
        @pointercancel=${pointer.up}
      >
        <defs>
          <linearGradient id=${arc.gradientId} gradientUnits="userSpaceOnUse" x1=${arc.start.x} y1=${arc.start.y} x2=${arc.end.x} y2=${arc.end.y}>
            <stop offset="0%" stop-color=${color} stop-opacity="0"></stop>
            <stop offset="${arc.dotFraction * 100}%" stop-color=${color} stop-opacity="1"></stop>
            <stop offset="100%" stop-color=${color} stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <path class="ring-arc" d=${arc.fullPath} stroke="url(#${arc.gradientId})"></path>
        <circle class="ring-dot" cx=${arc.dot.x} cy=${arc.dot.y} r="3.2"></circle>
        <!-- Zona de toque invisible más ancha, mismo motivo que en el
             dial de la vista grande. Van DIRECTOS aquí dentro del
             mismo <svg> (no en una sub-plantilla html anidada
             condicionalmente) — lección aprendida: una plantilla
             "html" anidada dentro de un <svg> no hereda el
             namespace SVG y esos elementos dejan de responder al
             toque. Al no anidar nada, no hay riesgo. -->
        <path class="ring-hit" d=${arc.fullPath}></path>
        <ellipse class="ring-hit-dot" cx=${arc.dot.x} cy=${arc.dot.y} rx="11" ry="7"></ellipse>
      </svg>
      <div class="ring-center">
        <span class="current-temp">${climate.currentTemperature ?? '--'}<span class="unit">°</span></span>
      </div>
    </div>
    ${o.pill}
  `;
}

/** Vista compacta: sin control arrastrable propio (ni dial ni línea) —
    solo la temperatura actual y la píldora +/- de consigna, a juego con
    el tamaño reducido de la tarjeta. */
export function renderCompactBody(o: Pick<BodyOptions, 'climate' | 'pill'>): TemplateResult {
  return html`
    <div class="ring-center">
      <span class="current-temp">${o.climate.currentTemperature ?? '--'}<span class="unit">°</span></span>
    </div>
    ${o.pill}
  `;
}
