// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { hassWith, mount, root } from './neon-cover-card.fixtures';
import type { Card } from './neon-cover-card.fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

const dotColor = (el: Card) => (root(el).querySelector('.status') as HTMLElement).style.getPropertyValue('--dot-color');
const heroStyle = (el: Card) => (root(el).querySelector('.hero-icon') as HTMLElement).style.getPropertyValue('--cover-color');

describe('color del punto de estado', () => {
  it('sin configurar usa el color por defecto de cada grupo', async () => {
    const colors: Record<string, string> = { open: '#39e07a', opening: '#ffb02e', closing: '#ffb02e', closed: '#9aa0a6', unavailable: '#ff5c5c' };
    for (const [state, color] of Object.entries(colors)) {
      document.body.innerHTML = '';
      expect(dotColor(await mount({}, hassWith(state)))).toBe(color);
    }
  });

  it('cada grupo toma su color de la config', async () => {
    const config = { status_color_open: '#010101', status_color_moving: '#020202', status_color_closed: '#030303', status_color_alert: '#040404' };
    const expected: Record<string, string> = { open: '#010101', opening: '#020202', closing: '#020202', closed: '#030303', unavailable: '#040404' };
    for (const [state, color] of Object.entries(expected)) {
      document.body.innerHTML = '';
      expect(dotColor(await mount(config, hassWith(state)))).toBe(color);
    }
  });

  it('un color inválido se ignora y vale el de por defecto', async () => {
    expect(dotColor(await mount({ status_color_open: 'rojo;color:red' }, hassWith('open')))).toBe('#39e07a');
  });

  it('acepta cualquier color CSS válido', async () => {
    expect(dotColor(await mount({ status_color_closed: 'var(--primary-color)' }, hassWith('closed')))).toBe('var(--primary-color)');
  });
});

describe('color del icono', () => {
  it('sin configurar el icono hereda el color del halo (no fija ninguno)', async () => {
    expect(heroStyle(await mount({}, hassWith('open')))).toBe('');
    document.body.innerHTML = '';
    expect(heroStyle(await mount({}, hassWith('closed')))).toBe('');
  });

  it('icon_color solo se aplica con la tarjeta activa, como el halo: abierta, abriéndose o cerrándose', async () => {
    for (const state of ['open', 'opening', 'closing']) {
      document.body.innerHTML = '';
      expect(heroStyle(await mount({ icon_color: '#ff8800' }, hassWith(state)))).toBe('#ff8800');
    }
  });

  it('con la persiana cerrada o la entidad no disponible, el icono no lleva icon_color', async () => {
    for (const state of ['closed', 'unavailable']) {
      document.body.innerHTML = '';
      expect(heroStyle(await mount({ icon_color: '#ff8800' }, hassWith(state)))).toBe('');
    }
  });

  it('un icon_color inválido se ignora y el icono sigue al halo', async () => {
    expect(heroStyle(await mount({ icon_color: 'rojo;color:red' }, hassWith('open')))).toBe('');
  });

  it('solo cambia el icono: el porcentaje y el dial siguen con el color del halo', async () => {
    const el = await mount({ icon_color: '#ff8800' }, hassWith('open'));
    expect((root(el).querySelector('ha-card') as HTMLElement).style.getPropertyValue('--cover-color')).toBe('');
    expect(root(el).querySelector('.position-row')!.closest('.hero-icon')).toBeNull();
  });
});
