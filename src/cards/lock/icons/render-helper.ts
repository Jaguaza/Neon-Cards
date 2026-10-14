import { render } from 'lit';
import type { LockIconDef } from './types';

/** Renderiza la plantilla de un icono en jsdom y devuelve su <svg> (para los tests). */
export function renderIcon(def: LockIconDef, open = false): SVGElement {
  const host = document.createElement('div');
  render(def.template(open), host);
  return host.querySelector('svg') as SVGElement;
}

export const attr = (svg: SVGElement, sel: string, name: string): string | null | undefined =>
  svg.querySelector(sel)?.getAttribute(name);
