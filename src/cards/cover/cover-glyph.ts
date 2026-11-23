import { svg } from 'lit';
import type { TemplateResult } from 'lit';
import type { CoverGlyph } from './cover-visual';

export interface GlyphOptions {
  glyph: CoverGlyph;
  /** Apertura de 0 (cerrada) a 1 (abierta del todo). */
  open: number;
  /** Inclinación de las lamas de 0 (cerradas) a 1 (abiertas); solo la veneciana la usa. */
  tilt: number;
  /** Id único por tarjeta para el recorte de la ventana. */
  uid: string;
}

/** Ventana de la persiana enrollable: ancho y alto en unidades del dibujo. */
const WINDOW = { x: 14, y: 26, width: 72, height: 72 } as const;
const SHUTTER_SLATS = 9;
const SHUTTER_PITCH = 8;
/** Lo que sube el cortinaje entero al abrirse del todo; queda a la vista el último tramo. */
const SHUTTER_TRAVEL = 64;

const BLIND_SLATS = 8;
const BLIND_PITCH_CLOSED = 9;
const BLIND_PITCH_STACKED = 2;
const BLIND_TOP = 24;

/**
 * Persiana enrollable: el cajón arriba, las guías a los lados y el cortinaje
 * de lamas, que sube hacia el cajón según `open` (`--open`). Cerrada tapa
 * toda la ventana; abierta del todo solo asoma el último tramo bajo el cajón.
 */
function shutterGlyph(o: GlyphOptions): TemplateResult {
  const clipId = `cover-win-${o.uid}`;
  return svg`
    <svg class="cover-glyph" data-glyph="shutter" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}; --travel: ${SHUTTER_TRAVEL}px">
      <defs>
        <clipPath id=${clipId}><rect x=${WINDOW.x} y=${WINDOW.y} width=${WINDOW.width} height=${WINDOW.height}></rect></clipPath>
      </defs>
      <rect class="g-glass" x=${WINDOW.x} y=${WINDOW.y} width=${WINDOW.width} height=${WINDOW.height} rx="2"></rect>
      <g clip-path="url(#${clipId})">
        <g class="g-curtain">
          ${Array.from({ length: SHUTTER_SLATS }, (_, i) => svg`<rect class="g-slat" x=${WINDOW.x} y=${WINDOW.y + i * SHUTTER_PITCH} width=${WINDOW.width} height="6" rx="1.5"></rect>`)}
          <rect class="g-bar" x=${WINDOW.x} y=${WINDOW.y + WINDOW.height - 3} width=${WINDOW.width} height="3" rx="1"></rect>
        </g>
      </g>
      <rect class="g-box" x="8" y="8" width="84" height="18" rx="4"></rect>
      <line class="g-guide" x1=${WINDOW.x} y1=${WINDOW.y} x2=${WINDOW.x} y2=${WINDOW.y + WINDOW.height}></line>
      <line class="g-guide" x1=${WINDOW.x + WINDOW.width} y1=${WINDOW.y} x2=${WINDOW.x + WINDOW.width} y2=${WINDOW.y + WINDOW.height}></line>
      <line class="g-sill" x1="6" y1="102" x2="94" y2="102"></line>
    </svg>
  `;
}

/**
 * Veneciana: el cabezal arriba y las lamas, que al abrirse se recogen contra
 * él (`--open`) y giran hasta quedar de canto con la inclinación (`--tilt`).
 */
function blindGlyph(o: GlyphOptions): TemplateResult {
  const shift = BLIND_PITCH_STACKED - BLIND_PITCH_CLOSED;
  return svg`
    <svg class="cover-glyph" data-glyph="blind" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}; --tilt: ${o.tilt}">
      <rect class="g-glass" x=${WINDOW.x} y="22" width=${WINDOW.width} height="76" rx="2"></rect>
      ${Array.from({ length: BLIND_SLATS }, (_, i) => svg`<rect class="g-slat g-blind-slat" x="16" y=${BLIND_TOP + i * BLIND_PITCH_CLOSED} width="68" height="6" rx="3" style="--k: ${i * shift}px"></rect>`)}
      <rect class="g-box" x="8" y="8" width="84" height="10" rx="3"></rect>
      <line class="g-sill" x1="6" y1="102" x2="94" y2="102"></line>
    </svg>
  `;
}

export function renderGlyph(o: GlyphOptions): TemplateResult {
  return o.glyph === 'blind' ? blindGlyph(o) : shutterGlyph(o);
}
