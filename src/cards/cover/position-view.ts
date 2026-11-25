import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { buildArcModel } from '../../shared';
import { POSITION_MAX, POSITION_MIN } from './constants';

export interface PointerHandlers {
  down: (ev: PointerEvent) => void;
  move: (ev: PointerEvent) => void;
  up: () => void;
}

export interface PositionOptions {
  entity: string;
  /** Porcentaje mostrado: el que se está arrastrando o, si no, el real. */
  value: number;
  label: string;
  pointer: PointerHandlers;
}

export interface PositionBlockOptions {
  label: string;
  value: number;
}

/** La etiqueta «Posición actual» con el porcentaje en grande; lo usan la grande (con el dial) y la mediana (sin él). */
export function renderPositionBlock(o: PositionBlockOptions): TemplateResult {
  return html`
    <div class="position-block">
      <span class="position-label">${o.label}</span>
      <span class="position-value">${o.value}<span class="unit">%</span></span>
    </div>
  `;
}

/**
 * Posición actual: la etiqueta y el porcentaje grande a la izquierda y, a la
 * derecha, el dial en arco con su punto, con el mismo tamaño y aspecto que el
 * del termostato. El arco va de transparente en los dos extremos a color
 * sólido en el punto; el color lo pone `--cover-color` de la tarjeta.
 */
export function renderPositionRow(o: PositionOptions): TemplateResult {
  const arc = buildArcModel('cover-dial', o.entity, POSITION_MIN, POSITION_MAX, o.value);
  return html`
    <div class="position-row">
      ${renderPositionBlock({ label: o.label, value: o.value })}
      <div class="dial-wrap">
        <svg
          class="dial-svg"
          viewBox="0 0 100 100"
          aria-hidden="true"
          @pointerdown=${o.pointer.down}
          @pointermove=${o.pointer.move}
          @pointerup=${o.pointer.up}
          @pointercancel=${o.pointer.up}
        >
          <defs>
            <linearGradient id=${arc.gradientId} gradientUnits="userSpaceOnUse" x1=${arc.start.x} y1=${arc.start.y} x2=${arc.end.x} y2=${arc.end.y}>
              <stop offset="0%" style="stop-color: var(--cover-color); stop-opacity: 0"></stop>
              <stop offset="${arc.dotFraction * 100}%" style="stop-color: var(--cover-color); stop-opacity: 1"></stop>
              <stop offset="100%" style="stop-color: var(--cover-color); stop-opacity: 0"></stop>
            </linearGradient>
          </defs>
          <path class="dial-arc" d=${arc.fullPath} stroke="url(#${arc.gradientId})"></path>
          <circle class="dial-dot" cx=${arc.dot.x} cy=${arc.dot.y} r="4.5"></circle>
          <path class="dial-hit" d=${arc.fullPath}></path>
          <ellipse class="dial-hit-dot" cx=${arc.dot.x} cy=${arc.dot.y} rx="14" ry="10"></ellipse>
        </svg>
      </div>
    </div>
  `;
}

export interface SliderOptions {
  value: number;
  label: string;
  disabled: boolean;
  /** Mientras se arrastra: actualiza el valor mostrado. */
  onInput: (value: number) => void;
  /** Al soltar: manda la orden. */
  onChange: (value: number) => void;
}

/** Deslizador de 0 a 100 con el tramo recorrido relleno (`--frac`, de 0 a 1). */
export function renderSlider(o: SliderOptions): TemplateResult {
  const read = (ev: Event) => Number((ev.target as HTMLInputElement).value);
  return html`
    <input
      type="range"
      class="slider"
      min=${POSITION_MIN}
      max=${POSITION_MAX}
      step="1"
      aria-label=${o.label}
      ?disabled=${o.disabled}
      .value=${String(o.value)}
      style="--frac: ${o.value / 100}"
      @input=${(ev: Event) => o.onInput(read(ev))}
      @change=${(ev: Event) => o.onChange(read(ev))}
    />
  `;
}

/** Los dos extremos del deslizador de posición. */
export function renderScale(): TemplateResult {
  return html`<div class="scale"><span>${POSITION_MIN}%</span><span>${POSITION_MAX}%</span></div>`;
}

export interface TiltOptions extends SliderOptions {
  heading: string;
}

/** Inclinación de las lamas: título, porcentaje y su deslizador. */
export function renderTilt(o: TiltOptions): TemplateResult {
  return html`
    <div class="tilt-row"><span class="tilt-label">${o.heading}</span><span class="tilt-value">${o.value}%</span></div>
    ${renderSlider(o)}
  `;
}
