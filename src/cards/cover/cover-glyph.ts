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

/**
 * Una ventana de verdad: marco, cristal y las dos crucetas (cuatro hojas), con
 * el alféizar debajo. Es lo que queda a la vista cuando la persiana, la
 * cortina o el toldo se abren.
 */
function windowPanes(x: number, y: number, width: number, height: number): TemplateResult {
  const midX = x + width / 2;
  const midY = y + height / 2;
  return svg`
    <rect class="g-glass" x=${x + 2} y=${y + 2} width=${width - 4} height=${height - 4}></rect>
    <line class="g-mullion" x1=${midX} y1=${y + 2} x2=${midX} y2=${y + height - 2}></line>
    <line class="g-mullion" x1=${x + 2} y1=${midY} x2=${x + width - 2} y2=${midY}></line>
    <rect class="g-frame" x=${x} y=${y} width=${width} height=${height} rx="2"></rect>
    <line class="g-sill" x1=${x - 4} y1=${y + height + 3} x2=${x + width + 4} y2=${y + height + 3}></line>
  `;
}

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
      ${windowPanes(WINDOW.x, WINDOW.y, WINDOW.width, WINDOW.height)}
      <g clip-path="url(#${clipId})">
        <g class="g-curtain">
          ${Array.from({ length: SHUTTER_SLATS }, (_, i) => svg`<rect class="g-slat" x=${WINDOW.x} y=${WINDOW.y + i * SHUTTER_PITCH} width=${WINDOW.width} height="6" rx="1.5"></rect>`)}
          <rect class="g-bar" x=${WINDOW.x} y=${WINDOW.y + WINDOW.height - 3} width=${WINDOW.width} height="3" rx="1"></rect>
        </g>
      </g>
      <rect class="g-box" x="8" y="8" width="84" height="18" rx="4"></rect>
      <line class="g-guide" x1=${WINDOW.x} y1=${WINDOW.y} x2=${WINDOW.x} y2=${WINDOW.y + WINDOW.height}></line>
      <line class="g-guide" x1=${WINDOW.x + WINDOW.width} y1=${WINDOW.y} x2=${WINDOW.x + WINDOW.width} y2=${WINDOW.y + WINDOW.height}></line>
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
      ${windowPanes(WINDOW.x, 22, WINDOW.width, 76)}
      ${Array.from({ length: BLIND_SLATS }, (_, i) => svg`<rect class="g-slat g-blind-slat" x="16" y=${BLIND_TOP + i * BLIND_PITCH_CLOSED} width="68" height="6" rx="3" style="--k: ${i * shift}px"></rect>`)}
      <rect class="g-box" x="8" y="8" width="84" height="10" rx="3"></rect>
    </svg>
  `;
}

/**
 * Cortina: cada panel son cuatro pliegues colgados de anillas en la barra. Al
 * abrirse (`--open`) los pliegues se recogen hacia su lado, se estrechan y se
 * amontonan, y aparece la alzapaño que los ata; cerrada, los pliegues se
 * reparten y los dos paneles se juntan en el centro. Cada pliegue lleva su
 * anilla y se mueve con ella.
 */
const CURTAIN = { top: 16, height: 84, pleatWidth: 14, pleats: 4, pitch: 8, gathered: 1.5, left: 12, right: 88 } as const;

/** Un pliegue: caída con el borde de abajo redondeado, un brillo central y su anilla en la barra. */
function curtainPleat(x: number, shift: number): TemplateResult {
  const w = CURTAIN.pleatWidth;
  const h = CURTAIN.height;
  return svg`
    <g transform="translate(${x} ${CURTAIN.top})">
      <g class="g-pleat" style="--k: ${shift}px">
        <path class="g-drape" d="M0 0 H${w} V${h - 6} Q${w} ${h} ${w - 6} ${h} H6 Q0 ${h} 0 ${h - 6} Z"></path>
        <line class="g-hilite" x1=${w / 2} y1="6" x2=${w / 2} y2=${h - 8}></line>
        <circle class="g-ring" cx=${w / 2} cy="-4" r="2"></circle>
      </g>
    </g>
  `;
}

/** Los cuatro pliegues de un panel; el de más afuera no se mueve y los de dentro van hacia él. */
function curtainPanel(side: 'left' | 'right'): TemplateResult[] {
  const move = CURTAIN.gathered - CURTAIN.pitch;
  // De dentro afuera, para que el pliegue exterior quede encima al amontonarse.
  return Array.from({ length: CURTAIN.pleats }, (_, n) => CURTAIN.pleats - 1 - n).map((j) => {
    const x = side === 'left' ? CURTAIN.left + j * CURTAIN.pitch : CURTAIN.right - CURTAIN.pleatWidth - j * CURTAIN.pitch;
    return curtainPleat(x, (side === 'left' ? 1 : -1) * j * move);
  });
}

function curtainGlyph(o: GlyphOptions): TemplateResult {
  return svg`
    <svg class="cover-glyph" data-glyph="curtain" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}">
      ${windowPanes(28, 34, 44, 54)}
      ${curtainPanel('left')}
      ${curtainPanel('right')}
      <line class="g-rod" x1="8" y1="12" x2="92" y2="12"></line>
      <circle class="g-finial" cx="8" cy="12" r="2.5"></circle>
      <circle class="g-finial" cx="92" cy="12" r="2.5"></circle>
      <rect class="g-tie" x="12.5" y="58" width="14" height="4" rx="2"></rect>
      <rect class="g-tie" x="73.5" y="58" width="14" height="4" rx="2"></rect>
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
      ${windowPanes(20, 46, 60, 52)}
      <g class="g-stripes">
        ${Array.from({ length: AWNING.stripes }, (_, i) => svg`<rect class=${i % 2 ? 'g-stripe g-stripe-alt' : 'g-stripe'} x=${AWNING.x + (i * AWNING.width) / AWNING.stripes} y=${AWNING.y} width=${AWNING.width / AWNING.stripes} height=${AWNING.height}></rect>`)}
      </g>
      <path class="g-valance" d=${awningValanceTop()}></path>
      <rect class="g-box" x="8" y="8" width="84" height="14" rx="4"></rect>
    </svg>
  `;
}

const SCREEN = { x: 10, y: 22, width: 80, height: 62, rolled: 6 } as const;

/** Triángulo de «play» centrado en (cx, cy): lo que se proyecta cuando la pantalla o la TV están abiertas. */
function playTriangle(cx: number, cy: number): string {
  return `M${cx - 5} ${cy - 7} L${cx - 5} ${cy + 7} L${cx + 8} ${cy} Z`;
}

/**
 * Pantalla de proyector: el cajón (bajo y de esquinas casi rectas) arriba y el lienzo, que baja
 * desde él (`--open`) con su barra de abajo; abierta del todo se proyecta un
 * «play». Binaria: solo abierta o cerrada.
 */
function projectorGlyph(o: GlyphOptions): TemplateResult {
  const travel = SCREEN.height - SCREEN.rolled;
  return svg`
    <svg class="cover-glyph" data-glyph="projector" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}; --travel: ${travel}px; --rolled: ${SCREEN.rolled / SCREEN.height}">
      <rect class="g-canvas g-screen" x=${SCREEN.x} y=${SCREEN.y} width=${SCREEN.width} height=${SCREEN.height}></rect>
      <path class="g-play" d=${playTriangle(50, SCREEN.y + SCREEN.height / 2)}></path>
      <rect class="g-bar g-screen-bar" x="8" y=${SCREEN.y + SCREEN.rolled} width="84" height="4" rx="2"></rect>
      <rect class="g-box" x="8" y="14" width="84" height="8" rx="1.5"></rect>
    </svg>
  `;
}

const TV_LIFT = { cabinetTop: 70, tvTop: 22, travel: 48 } as const;

/**
 * TV en mueble: un mueble bajo con dos puertas y, dentro, una pantalla de TV
 * (sin peana ni soporte) que sube (`--open`) desde el interior y asoma sobre
 * el mueble; su borde de abajo queda siempre dentro, oculto tras la tapa
 * (recortada al borde superior del mueble), y cerrada no se ve. Abierta del
 * todo se proyecta un «play». Binaria: solo abierta o cerrada.
 */
function tvGlyph(o: GlyphOptions): TemplateResult {
  const clipId = `cover-tv-${o.uid}`;
  const top = TV_LIFT.cabinetTop;
  return svg`
    <svg class="cover-glyph" data-glyph="tv" viewBox="0 0 100 110" aria-hidden="true" style="--open: ${o.open}; --travel: ${TV_LIFT.travel}px">
      <defs>
        <clipPath id=${clipId}><rect x="0" y="0" width="100" height=${top}></rect></clipPath>
      </defs>
      <g clip-path="url(#${clipId})">
        <g class="g-tv">
          <rect class="g-tv-body" x="12" y=${TV_LIFT.tvTop} width="76" height="52" rx="3"></rect>
          <rect class="g-tv-screen" x="16" y=${TV_LIFT.tvTop + 4} width="68" height="40" rx="1.5"></rect>
          <path class="g-play" d=${playTriangle(50, TV_LIFT.tvTop + 24)}></path>
        </g>
      </g>
      <rect class="g-cabinet" x="8" y=${top} width="84" height="24" rx="3"></rect>
      <line class="g-cabinet-line" x1="50" y1=${top + 3} x2="50" y2=${top + 21}></line>
      <circle class="g-handle" cx="45" cy=${top + 12} r="1.4"></circle>
      <circle class="g-handle" cx="55" cy=${top + 12} r="1.4"></circle>
      <rect class="g-cabinet" x="14" y=${top + 24} width="6" height="5" rx="1"></rect>
      <rect class="g-cabinet" x="80" y=${top + 24} width="6" height="5" rx="1"></rect>
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
    case 'projector':
      return projectorGlyph(o);
    case 'tv':
      return tvGlyph(o);
    default:
      return shutterGlyph(o);
  }
}
