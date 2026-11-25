// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { hassWith, mount, root } from './neon-cover-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const qa = (el: Awaited<ReturnType<typeof mount>>, sel: string) => Array.from(root(el).querySelectorAll(sel)) as HTMLElement[];

describe('tarjeta estrecha: botones del pie', () => {
  it('cada botón lleva su nombre en aria-label y title y el texto en un span propio, para poder ocultarlo en tarjetas estrechas', async () => {
    const el = await mount({}, hassWith('open'));
    const buttons = qa(el, '.control');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['Cerrar', 'Parar', 'Abrir']);
    expect(buttons.map((b) => b.getAttribute('title'))).toEqual(['Cerrar', 'Parar', 'Abrir']);
    expect(buttons.map((b) => b.querySelector('.control-label')?.textContent)).toEqual(['Cerrar', 'Parar', 'Abrir']);
  });

  it('en la mediana también', async () => {
    const el = await mount({ size: 'medium' }, hassWith('open'));
    expect(qa(el, '.control').map((b) => b.getAttribute('aria-label'))).toEqual(['Cerrar', 'Parar', 'Abrir']);
  });

  it('el dial sigue en la grande (los anchos los decide el CSS) y el porcentaje no se pierde', async () => {
    const el = await mount({}, hassWith('open'));
    expect(qa(el, '.dial-wrap')).toHaveLength(1);
    expect(qa(el, '.position-block .position-value')[0].textContent).toContain('%');
  });
});
