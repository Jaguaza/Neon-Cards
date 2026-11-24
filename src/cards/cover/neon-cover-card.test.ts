// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { BASIC_FEATURES, TILT_FEATURES, card, hassWith, mount, root, text } from './neon-cover-card.fixtures';
import type { Card } from './neon-cover-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const q = (el: Card, sel: string) => root(el).querySelector(sel);
const qa = (el: Card, sel: string) => Array.from(root(el).querySelectorAll(sel));

describe('cabecera y estado', () => {
  it('muestra el nombre de la entidad, el estado traducido y el porcentaje', async () => {
    const el = await mount();
    expect(text(el, '.name')).toBe('Persiana Salón');
    expect(text(el, '.status-text')).toBe('Abierta');
    expect(text(el, '.position-value')).toBe('72%');
    expect(text(el, '.position-label')).toBe('Posición actual');
  });

  it('el nombre de la config manda sobre el de la entidad', async () => {
    const el = await mount({ name: 'Salón' });
    expect(text(el, '.name')).toBe('Salón');
  });

  it('en inglés traduce estado y etiquetas', async () => {
    const el = await mount({}, hassWith('closing', { language: 'en' }));
    expect(text(el, '.status-text')).toBe('Closing…');
    expect(text(el, '.position-label')).toBe('Current position');
    expect(qa(el, '.control').map((b) => b.textContent?.trim())).toEqual(['Close', 'Stop', 'Open']);
  });

  it('un cover de otra clase (garaje, puerta…) se dibuja como persiana', async () => {
    const el = await mount({}, hassWith('open', { attributes: { device_class: 'garage' } }));
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe('shutter');
  });

  it('el halo está encendido con la persiana abierta o en movimiento y apagado cerrada', async () => {
    expect(card(await mount({}, hassWith('open'))).classList.contains('neon-halo-active')).toBe(true);
    document.body.innerHTML = '';
    expect(card(await mount({}, hassWith('opening'))).classList.contains('neon-halo-active')).toBe(true);
    document.body.innerHTML = '';
    expect(card(await mount({}, hassWith('closed', { attributes: { current_position: 0 } }))).classList.contains('neon-halo-active')).toBe(false);
  });

  it('los tres puntos abren «más información» de la entidad', async () => {
    const el = await mount();
    let entityId = '';
    el.addEventListener('hass-more-info', (ev) => (entityId = (ev as CustomEvent).detail.entityId));
    (q(el, '.menu') as HTMLButtonElement).click();
    expect(entityId).toBe('cover.salon');
  });

  it('una entidad que no existe o no es cover muestra el aviso', async () => {
    const el = await mount({ entity: 'light.salon' });
    expect(text(el, '.unavailable')).toBe('Persiana no disponible.');
    expect(q(el, '.controls')).toBeNull();
  });
});

describe('icono grande', () => {
  const style = (el: Card) => q(el, '.cover-glyph')!.getAttribute('style') ?? '';

  it('shutter y sin device_class dibujan la persiana enrollable; blind, la veneciana', async () => {
    expect(q(await mount({}, hassWith('open')), '.cover-glyph')?.getAttribute('data-glyph')).toBe('shutter');
    document.body.innerHTML = '';
    expect(q(await mount({}, hassWith('open', { attributes: { device_class: undefined } })), '.cover-glyph')?.getAttribute('data-glyph')).toBe('shutter');
    document.body.innerHTML = '';
    expect(q(await mount({}, hassWith('open', { attributes: { device_class: 'blind' } })), '.cover-glyph')?.getAttribute('data-glyph')).toBe('blind');
  });

  it('la apertura del dibujo sigue al porcentaje', async () => {
    const el = await mount({}, hassWith('open'));
    expect(style(el)).toContain('--open: 0.72');
    expect(qa(el, '.g-slat')).toHaveLength(9);
  });

  it('sin porcentaje, abierta del todo o cerrada según el estado', async () => {
    const attrs = { current_position: undefined, supported_features: 1 | 2 | 8 };
    expect(style(await mount({}, hassWith('open', { attributes: attrs })))).toContain('--open: 1');
    document.body.innerHTML = '';
    expect(style(await mount({}, hassWith('closed', { attributes: attrs })))).toContain('--open: 0');
  });

  it('el dibujo se mueve en directo mientras se arrastra el deslizador', async () => {
    const el = await mount({}, hassWith('open'));
    const slider = q(el, '.slider') as HTMLInputElement;
    slider.value = '20';
    slider.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(style(el)).toContain('--open: 0.2');
    expect(q(el, '.hero-icon')!.classList.contains('dragging')).toBe(true);
    slider.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(style(el)).toContain('--open: 0.72');
    expect(q(el, '.hero-icon')!.classList.contains('dragging')).toBe(false);
  });

  it('cover_type elige el dibujo aunque la entidad sea de otra clase', async () => {
    const el = await mount({ cover_type: 'awning' }, hassWith('open', { attributes: { device_class: 'blind' } }));
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe('awning');
    document.body.innerHTML = '';
    const curtain = await mount({ cover_type: 'curtain' }, hassWith('open', { attributes: { device_class: undefined } }));
    expect(q(curtain, '.cover-glyph')?.getAttribute('data-glyph')).toBe('curtain');
  });

  it('un cover_type inválido se ignora y manda el device_class', async () => {
    const el = await mount({ cover_type: 'garage' }, hassWith('open', { attributes: { device_class: 'blind' } }));
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe('blind');
  });

  it('la cortina tiene dos paneles de cuatro pliegues con su anilla, y una alzapaño por lado', async () => {
    const el = await mount({}, hassWith('open', { attributes: { device_class: 'curtain', current_position: 60 } }));
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe('curtain');
    expect(qa(el, '.g-pleat')).toHaveLength(8);
    expect(qa(el, '.g-ring')).toHaveLength(8);
    expect(qa(el, '.g-tie')).toHaveLength(2);
    expect(style(el)).toContain('--open: 0.6');
  });

  it('los pliegues de cada lado se recogen hacia su lado: el exterior no se mueve y los de dentro, sí', async () => {
    const el = await mount({}, hassWith('open', { attributes: { device_class: 'curtain' } }));
    const shifts = qa(el, '.g-pleat').map((p) => parseFloat((p.getAttribute('style') ?? '').replace('--k:', '')));
    // Izquierda de dentro afuera (-19,5, -13, -6,5, 0) y derecha (+19,5, +13, +6,5, 0).
    expect(shifts.filter((k) => k < 0).sort((a, b) => a - b)).toEqual([-19.5, -13, -6.5]);
    expect(shifts.filter((k) => k > 0).sort((a, b) => a - b)).toEqual([6.5, 13, 19.5]);
    expect(shifts.filter((k) => k === 0)).toHaveLength(2);
  });

  it('todas las ventanas llevan marco, cristal y crucetas', async () => {
    for (const cover_type of ['shutter', 'blind', 'curtain', 'awning']) {
      document.body.innerHTML = '';
      const el = await mount({ cover_type });
      expect(qa(el, '.g-frame')).toHaveLength(1);
      expect(qa(el, '.g-glass')).toHaveLength(1);
      expect(qa(el, '.g-mullion')).toHaveLength(2);
      expect(qa(el, '.g-sill')).toHaveLength(1);
    }
  });

  it('el toldo se despliega con el porcentaje: lona de rayas y volante', async () => {
    const el = await mount({}, hassWith('open', { attributes: { device_class: 'awning', current_position: 80 } }));
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe('awning');
    expect(qa(el, '.g-stripe')).toHaveLength(6);
    expect(qa(el, '.g-stripe-alt')).toHaveLength(3);
    expect(q(el, '.g-valance')).not.toBeNull();
    expect(style(el)).toContain('--open: 0.8');
    const slider = q(el, '.slider') as HTMLInputElement;
    slider.value = '10';
    slider.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(style(el)).toContain('--open: 0.1');
  });

  it('la veneciana gira las lamas con la inclinación, también arrastrándola', async () => {
    const attrs = { device_class: 'blind', supported_features: TILT_FEATURES, current_tilt_position: 40 };
    const el = await mount({}, hassWith('open', { attributes: attrs }));
    expect(qa(el, '.g-blind-slat')).toHaveLength(8);
    expect(style(el)).toContain('--tilt: 0.4');
    const tilt = qa(el, '.slider')[1] as HTMLInputElement;
    tilt.value = '90';
    tilt.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(style(el)).toContain('--tilt: 0.9');
  });
});

describe('tipos binarios: pantalla de proyector y TV en mueble', () => {
  const style = (el: Card) => q(el, '.cover-glyph')!.getAttribute('style') ?? '';
  const full = { current_tilt_position: 40, supported_features: TILT_FEATURES };

  it.each(['projector', 'tv'])('%s dibuja su icono y no tiene porcentaje, dial ni deslizadores', async (cover_type) => {
    const el = await mount({ cover_type }, hassWith('open', { attributes: full }));
    expect(q(el, '.cover-glyph')?.getAttribute('data-glyph')).toBe(cover_type);
    for (const sel of ['.position-row', '.position-value', '.dial-svg', '.slider', '.scale', '.tilt-row']) expect(q(el, sel)).toBeNull();
    expect(qa(el, '.control').map((b) => (b as HTMLElement).dataset.control)).toEqual(['close', 'stop', 'open']);
    expect(text(el, '.name')).toBe('Persiana Salón');
    expect(text(el, '.status-text')).toBe('Abierta');
  });

  it.each(['projector', 'tv'])('%s sin porcentaje se anima a abierta o cerrada según el estado', async (cover_type) => {
    const attrs = { current_position: undefined, supported_features: 1 | 2 | 8 };
    expect(style(await mount({ cover_type }, hassWith('open', { attributes: attrs })))).toContain('--open: 1');
    document.body.innerHTML = '';
    expect(style(await mount({ cover_type }, hassWith('closed', { attributes: attrs })))).toContain('--open: 0');
    document.body.innerHTML = '';
    expect(style(await mount({ cover_type }, hassWith('opening', { attributes: attrs })))).toContain('--open: 1');
    document.body.innerHTML = '';
    expect(style(await mount({ cover_type }, hassWith('closing', { attributes: attrs })))).toContain('--open: 0');
  });

  it('con porcentaje del cover el dibujo lo sigue, pero sin mostrarlo', async () => {
    const el = await mount({ cover_type: 'tv' }, hassWith('opening', { attributes: { current_position: 40 } }));
    expect(style(el)).toContain('--open: 0.4');
    expect(q(el, '.position-value')).toBeNull();
  });

  it('los botones abren y cierran como en los demás tipos', async () => {
    const calls: unknown[][] = [];
    const el = await mount({ cover_type: 'projector' }, hassWith('closed', { calls, attributes: { current_position: 0 } }));
    (q(el, '[data-control="open"]') as HTMLButtonElement).click();
    expect(calls).toEqual([['cover', 'open_cover', { entity_id: 'cover.salon' }]]);
  });

  it('la pantalla tiene lienzo y barra; la TV, mueble y una TV que sube de su interior', async () => {
    const screen = await mount({ cover_type: 'projector' });
    expect(q(screen, '.g-canvas')).not.toBeNull();
    expect(q(screen, '.g-screen-bar')).not.toBeNull();
    expect(q(screen, '.g-play')).not.toBeNull();
    document.body.innerHTML = '';
    const tv = await mount({ cover_type: 'tv' });
    expect(q(tv, '.g-tv')).not.toBeNull();
    expect(qa(tv, '.g-cabinet').length).toBeGreaterThanOrEqual(1);
    expect(q(tv, 'clipPath')).not.toBeNull();
  });

  it('un cover_type inválido sigue sin ser binario: lleva porcentaje', async () => {
    const el = await mount({ cover_type: 'television' });
    expect(q(el, '.position-value')).not.toBeNull();
  });
});

describe('botones', () => {
  it('Cerrar, Parar y Abrir llaman a su servicio con la entidad', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('open', { calls }));
    for (const key of ['close', 'stop', 'open']) (q(el, `[data-control="${key}"]`) as HTMLButtonElement).click();
    expect(calls).toEqual([
      ['cover', 'close_cover', { entity_id: 'cover.salon' }],
      ['cover', 'stop_cover', { entity_id: 'cover.salon' }],
      ['cover', 'open_cover', { entity_id: 'cover.salon' }],
    ]);
  });

  it('solo salen los botones que la entidad soporta', async () => {
    const el = await mount({}, hassWith('open', { attributes: { supported_features: 1 | 2 } }));
    expect(qa(el, '.control').map((b) => (b as HTMLElement).dataset.control)).toEqual(['close', 'open']);
    expect(text(el, '.controls')).not.toContain('Parar');
    expect(qa(el, '.control--divided')).toHaveLength(1);
  });

  it('resalta Abrir con la persiana abierta y Cerrar con ella cerrada', async () => {
    const open = await mount({}, hassWith('open'));
    expect(qa(open, '.control').map((b) => (b as HTMLElement).dataset.active)).toEqual(['false', 'false', 'true']);
    document.body.innerHTML = '';
    const closing = await mount({}, hassWith('closing'));
    expect(qa(closing, '.control').map((b) => (b as HTMLElement).dataset.active)).toEqual(['true', 'false', 'false']);
  });

  it('con la entidad no disponible los botones están desactivados', async () => {
    const el = await mount({}, hassWith('unavailable'));
    expect(qa(el, '.control').every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    expect(text(el, '.status-text')).toBe('No disponible');
  });
});

describe('posición', () => {
  it('el deslizador manda set_cover_position al soltar y muestra el valor mientras se arrastra', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('open', { calls }));
    const slider = q(el, '.slider') as HTMLInputElement;
    expect(slider.value).toBe('72');
    slider.value = '30';
    slider.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(text(el, '.position-value')).toBe('30%');
    expect(calls).toEqual([]);
    slider.dispatchEvent(new Event('change'));
    expect(calls).toEqual([['cover', 'set_cover_position', { entity_id: 'cover.salon', position: 30 }]]);
    await el.updateComplete;
    expect(text(el, '.position-value')).toBe('72%');
  });

  it('sin SET_POSITION el deslizador está desactivado y el dial no manda nada', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('open', { calls, attributes: { supported_features: 1 | 2 | 8 } }));
    expect((q(el, '.slider') as HTMLInputElement).disabled).toBe(true);
    const svg = q(el, '.dial-svg') as SVGSVGElement;
    svg.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
    svg.dispatchEvent(new PointerEvent('pointerup'));
    expect(calls).toEqual([]);
  });

  it('sin current_position no hay porcentaje, dial ni deslizador, pero sí botones', async () => {
    const el = await mount({}, hassWith('open', { attributes: { current_position: undefined, supported_features: 1 | 2 | 8 } }));
    expect(q(el, '.position-row')).toBeNull();
    expect(q(el, '.slider')).toBeNull();
    expect(qa(el, '.control')).toHaveLength(3);
  });

  it('el dial se arrastra: el punto sigue al puntero y la orden sale al soltar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, hassWith('open', { calls }));
    const svg = q(el, '.dial-svg') as SVGSVGElement;
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) });
    (svg as unknown as { setPointerCapture: () => void }).setPointerCapture = () => undefined;
    // Justo encima del centro: 0° = mitad del recorrido = 50 %.
    svg.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, clientY: 0 }));
    await el.updateComplete;
    expect(text(el, '.position-value')).toBe('50%');
    // A la derecha del todo: 90° = 100 %.
    svg.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 50 }));
    await el.updateComplete;
    expect(text(el, '.position-value')).toBe('100%');
    expect(calls).toEqual([]);
    svg.dispatchEvent(new PointerEvent('pointerup'));
    expect(calls).toEqual([['cover', 'set_cover_position', { entity_id: 'cover.salon', position: 100 }]]);
  });
});

describe('inclinación', () => {
  const tilted = (calls: unknown[][] = []) => hassWith('open', { calls, attributes: { supported_features: TILT_FEATURES, current_tilt_position: 40, device_class: 'blind' } });

  it('con SET_TILT_POSITION sale un segundo deslizador bajo el de posición', async () => {
    const el = await mount({}, tilted());
    const sliders = qa(el, '.slider') as HTMLInputElement[];
    expect(sliders).toHaveLength(2);
    expect(sliders[1].value).toBe('40');
    expect(text(el, '.tilt-label')).toBe('Inclinación');
    expect(text(el, '.tilt-value')).toBe('40%');
  });

  it('manda set_cover_tilt_position al soltar', async () => {
    const calls: unknown[][] = [];
    const el = await mount({}, tilted(calls));
    const tilt = qa(el, '.slider')[1] as HTMLInputElement;
    tilt.value = '65';
    tilt.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(text(el, '.tilt-value')).toBe('65%');
    tilt.dispatchEvent(new Event('change'));
    expect(calls).toEqual([['cover', 'set_cover_tilt_position', { entity_id: 'cover.salon', tilt_position: 65 }]]);
  });

  it('sin soporte de inclinación no sale el deslizador', async () => {
    const el = await mount({}, hassWith('open', { attributes: { supported_features: BASIC_FEATURES, current_tilt_position: 40 } }));
    expect(qa(el, '.slider')).toHaveLength(1);
    expect(q(el, '.tilt-row')).toBeNull();
  });
});

describe('registro', () => {
  it('getGridOptions: doce columnas y alto automático', async () => {
    const el = (await mount()) as unknown as { getGridOptions(): unknown };
    expect(el.getGridOptions()).toEqual({ rows: 'auto', columns: 12, min_columns: 4 });
  });

  it('getStubConfig elige un cover de los candidatos, luego de hass y, si no, uno de ejemplo', async () => {
    await mount();
    const ctor = customElements.get('neon-cover-card') as unknown as { getStubConfig(h?: unknown, e?: string[], f?: string[]): { entity: string } };
    expect(ctor.getStubConfig(undefined, ['light.a', 'cover.b']).entity).toBe('cover.b');
    expect(ctor.getStubConfig(hassWith('open')).entity).toBe('cover.salon');
    expect(ctor.getStubConfig().entity).toBe('cover.example_cover');
  });
});
