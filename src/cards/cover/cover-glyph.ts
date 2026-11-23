import { svg } from 'lit';
import type { TemplateResult } from 'lit';
import type { CoverType } from './types';

export interface GlyphOptions {
  glyph: CoverType;
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

/** Los pliegues de cada panel de la cortina, a estas distancias del borde del panel. */
const CURTAIN_FOLDS = [9, 18, 27] as const;
const CURTAIN_PANEL = { y: 18, width: 36, height: 82 } as const;

/** Un panel de la cortina con sus pliegues; `x` es su borde izquierdo en el dibujo. */
function curtainPanel(side: 'left' | 'right', x: number): TemplateResult {
  return svg`
    <g class="g-panel g-panel-${side}">
      <rect class="g-fabric" x=${x} y=${CURTAIN_PANEL.y} width=${CURTAIN_PANEL.width} height=${CURTAIN_PANEL.height} rx="3"></rect>
      ${CURTAIN_FOLDS.map((dx) => svg`<line class="g-fold" x1=${x + dx} y1=${CURTAIN_PANEL.y + 3} x2=${x + dx} y2=${CURTAIN_PANEL.y + CURTAIN_PANEL.height - 3}></line>`)}
    </g>
  `;
}

/**
 * Cortina: la barra arriba y dos paneles con pliegues que, al abrirse
 * (`--open`), se recogen cada uno hacia su lado y dejan ver la ventana.
 */
function curtainGlyph(o: GlyphOptions): TemplateResult {
  return svg`
    <svg class="cover-glyph" data-glyph="curtain" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}">
      <rect class="g-glass" x="22" y="34" width="56" height="52" rx="2"></rect>
      <line class="g-sill" x1="16" y1="90" x2="84" y2="90"></line>
      ${curtainPanel('left', 14)}
      ${curtainPanel('right', 50)}
      <line class="g-rod" x1="8" y1="12" x2="92" y2="12"></line>
      <circle class="g-finial" cx="8" cy="12" r="2.5"></circle>
      <circle class="g-finial" cx="92" cy="12" r="2.5"></circle>
    </svg>
  `;
}

const AWNING = { x: 14, y: 22, width: 72, height: 56, stripes: 6, rolled: 8, scallop: 6 } as const;

/** Volante festoneado: una fila de semicírculos colgando de su borde superior (y = 0). */
function awningValanceTop(): string {
  const arcs = Array.from({ length: AWNING.stripes }, () => `a${AWNING.scallop} ${AWNING.scallop} 0 0 0 ${AWNING.scallop * 2} 0`).join(' ');
  return `M${AWNING.x} ${AWNING.y + AWNING.rolled} ${arcs} Z`;
}

/**
 * Toldo: el cajón arriba y la lona de rayas, que al abrirse (`--open`) se
 * despliega hacia abajo con su volante festoneado; recogido solo asoma un
 * palmo de lona.
 */
function awningGlyph(o: GlyphOptions): TemplateResult {
  const travel = AWNING.height - AWNING.rolled;
  return svg`
    <svg class="cover-glyph" data-glyph="awning" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}; --travel: ${travel}px; --rolled: ${AWNING.rolled / AWNING.height}">
      <rect class="g-glass" x="18" y="40" width="64" height="58" rx="2"></rect>
      <line class="g-sill" x1="6" y1="102" x2="94" y2="102"></line>
      <g class="g-stripes">
        ${Array.from({ length: AWNING.stripes }, (_, i) => svg`<rect class=${i % 2 ? 'g-stripe g-stripe-alt' : 'g-stripe'} x=${AWNING.x + (i * AWNING.width) / AWNING.stripes} y=${AWNING.y} width=${AWNING.width / AWNING.stripes} height=${AWNING.height}></rect>`)}
      </g>
      <path class="g-valance" d=${awningValanceTop()}></path>
      <rect class="g-box" x="8" y="8" width="84" height="14" rx="4"></rect>
    </svg>
  `;
}

export function renderGlyph(o: GlyphOptions): TemplateResult {
  switch (o.glyph) {
    case 'blind':
      return blindGlyph(o);
    case 'curtain':
      return curtainGlyph(o);
    case 'awning':
      return awningGlyph(o);
    default:
      return shutterGlyph(o);
  }
}
