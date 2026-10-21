// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIRM_REVEAL_MS, CONFIRM_TIMEOUT_MS } from './constants';
import { active, card, click, hassWith, mount } from './neon-lock-card.fixtures';
import type { Card } from './neon-lock-card.fixtures';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('NeonLockCard', () => {
  describe('confirmación al abrir', () => {
    const ask = async (el: Card) => {
      click(el);
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS); // primero el halo, un instante después la vista
      await el.updateComplete;
    };
    beforeEach(() => {
      vi.useFakeTimers();
    });
    const confirmView = (el: Card) => el.shadowRoot!.querySelector('.confirm');
    const btn = (el: Card, cls: 'accept' | 'cancel') => el.shadowRoot!.querySelector<HTMLButtonElement>(`.confirm .${cls}`)!;
    const listen = (el: Card) => {
      const actions: string[] = [];
      el.addEventListener('hass-action', (ev) => actions.push((ev as CustomEvent).detail.action));
      return actions;
    };

    it('con la vista abierta la tarjeta lleva «confirming» (la vista ocupa el sitio del contenido y no se corta) y la pierde al cancelar', async () => {
      const el = await mount({});
      expect(card(el).classList.contains('confirming')).toBe(false);
      await ask(el);
      expect(card(el).classList.contains('confirming')).toBe(true);
      btn(el, 'cancel').click();
      await el.updateComplete;
      vi.advanceTimersByTime?.(0);
      expect(confirmView(el)).toBeNull();
      expect(card(el).classList.contains('confirming')).toBe(false);
    });

    it('pulsar una cerradura cerrada muestra «¿Abrir?» con el halo encendido y NO ejecuta la acción', async () => {
      const el = await mount({});
      const actions = listen(el);
      await ask(el);
      expect(confirmView(el)).not.toBeNull();
      expect(confirmView(el)!.getAttribute('role')).toBe('alertdialog');
      expect(el.shadowRoot!.querySelector('.confirm-title')!.textContent).toBe('¿Abrir?');
      expect(el.shadowRoot!.querySelector('.confirm-name')!.textContent).toBe('Puerta');
      expect(btn(el, 'accept').textContent).toBe('Abrir');
      expect(btn(el, 'cancel').textContent).toBe('Cancelar');
      expect(active(el)).toBe(true);
      expect(actions).toEqual([]);
    });

    it('primero se enciende el halo y la vista aparece un instante después (para que el aro se dibuje bien en iOS)', async () => {
      const el = await mount({});
      click(el);
      await el.updateComplete;
      expect(active(el)).toBe(true); // el halo ya está encendido…
      expect(confirmView(el)).toBeNull(); // …y la vista todavía no
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS - 1);
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
      vi.advanceTimersByTime(1);
      await el.updateComplete;
      expect(confirmView(el)).not.toBeNull();
      expect(active(el)).toBe(true);
    });

    it('una segunda pulsación mientras se pregunta no reinicia ni duplica la vista', async () => {
      const el = await mount({});
      click(el);
      click(el);
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.confirm').length).toBe(1);
    });

    it('cancelar antes de que aparezca la vista no la deja programada', async () => {
      const el = await mount({});
      click(el);
      el.hass = hassWith('unlocked'); // cambia el estado antes de revelarse
      await el.updateComplete;
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS + 10);
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
    });

    it('mientras la vista está abierta se oculta el contenido original (para que no se transparente), y se recupera al cerrarla', async () => {
      const el = await mount({});
      const content = () => el.shadowRoot!.querySelector('.content')!;
      expect(content().classList.contains('content--hidden')).toBe(false);
      click(el);
      await el.updateComplete;
      expect(content().classList.contains('content--hidden')).toBe(false); // aún no se ha mostrado la vista
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS);
      await el.updateComplete;
      expect(content().classList.contains('content--hidden')).toBe(true);
      expect(content().getAttribute('aria-hidden')).toBe('true');
      btn(el, 'cancel').click();
      await el.updateComplete;
      expect(content().classList.contains('content--hidden')).toBe(false);
      expect(content().getAttribute('aria-hidden')).toBe('false');
    });

    it('se muestra en inglés con el idioma de HA en inglés', async () => {
      const el = await mount({}, hassWith('locked', 'en'));
      await ask(el);
      expect(el.shadowRoot!.querySelector('.confirm-title')!.textContent).toBe('Open?');
      expect(btn(el, 'accept').textContent).toBe('Open');
      expect(btn(el, 'cancel').textContent).toBe('Cancel');
    });

    it('el foco va a «Cancelar» para que Intro no abra por accidente', async () => {
      const el = await mount({});
      await ask(el);
      expect(el.shadowRoot!.activeElement).toBe(btn(el, 'cancel'));
    });

    it('Abrir ejecuta la acción original una sola vez y cierra la vista', async () => {
      const el = await mount({});
      const actions = listen(el);
      await ask(el);
      btn(el, 'accept').click();
      await el.updateComplete;
      expect(actions).toEqual(['tap']);
      expect(confirmView(el)).toBeNull();
      expect(active(el)).toBe(true); // espera el cambio de estado (ACTION_PENDING_MS)
    });

    it('Cancelar cierra la vista sin ejecutar nada y apaga el halo', async () => {
      const el = await mount({});
      const actions = listen(el);
      await ask(el);
      btn(el, 'cancel').click();
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
      expect(actions).toEqual([]);
      expect(active(el)).toBe(false);
    });

    it('los gestos dentro de la vista no llegan a la tarjeta (no re-piden confirmación ni mantienen)', async () => {
      const el = await mount({});
      await ask(el);
      const view = confirmView(el)!;
      view.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      view.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
      await el.updateComplete;
      expect(el.shadowRoot!.querySelectorAll('.confirm').length).toBe(1);
    });

    it('Escape cancela', async () => {
      const el = await mount({});
      await ask(el);
      confirmView(el)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
    });

    it('sin respuesta se cancela sola tras CONFIRM_TIMEOUT_MS', async () => {
      vi.useFakeTimers();
      const el = await mount({});
      const actions = listen(el);
      await ask(el);
      vi.advanceTimersByTime(CONFIRM_TIMEOUT_MS - CONFIRM_REVEAL_MS - 1);
      await el.updateComplete;
      expect(confirmView(el)).not.toBeNull();
      vi.advanceTimersByTime(1);
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
      expect(actions).toEqual([]);
    });

    it('si la cerradura cambia de estado mientras se pregunta, la vista se cierra', async () => {
      const el = await mount({});
      await ask(el);
      el.hass = hassWith('unlocked'); // la abrió otra tarjeta, la app, una automatización…
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
    });

    it('si la entidad deja de estar disponible mientras se pregunta, la vista se cierra', async () => {
      const el = await mount({});
      await ask(el);
      el.hass = hassWith('unavailable');
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
    });

    it('cerrar NO pide confirmación: la acción se ejecuta directamente', async () => {
      const el = await mount({}, hassWith('unlocked'));
      const actions = listen(el);
      await ask(el);
      expect(confirmView(el)).toBeNull();
      expect(actions).toEqual(['tap']);
    });

    it('confirm_open: false la desactiva y abre directamente', async () => {
      const el = await mount({ confirm_open: false });
      const actions = listen(el);
      await ask(el);
      expect(confirmView(el)).toBeNull();
      expect(actions).toEqual(['tap']);
    });

    it('las acciones que no operan la cerradura (más info, navegar) no piden confirmación', async () => {
      const el = await mount({ tap_action: { action: 'more-info' } });
      const actions = listen(el);
      await ask(el);
      expect(confirmView(el)).toBeNull();
      expect(actions).toEqual(['tap']);
    });

    it('un servicio lock.lock no pide confirmación; lock.unlock sí', async () => {
      const lockSvc = await mount({ tap_action: { action: 'call-service', service: 'lock.lock' } });
      await ask(lockSvc);
      expect(confirmView(lockSvc)).toBeNull();
      const unlockSvc = await mount({ tap_action: { action: 'call-service', service: 'lock.unlock' } });
      await ask(unlockSvc);
      expect(confirmView(unlockSvc)).not.toBeNull();
    });

    it('el aviso se cancela al desconectar la tarjeta', async () => {
      vi.useFakeTimers();
      const el = await mount({});
      await ask(el);
      el.remove();
      expect(() => vi.advanceTimersByTime(CONFIRM_TIMEOUT_MS + 1)).not.toThrow();
    });
  });

  describe('cerraduras con varias órdenes (supported_features: abrir)', () => {
    const ask = async (el: Card) => {
      click(el);
      vi.advanceTimersByTime(CONFIRM_REVEAL_MS); // primero el halo, un instante después la vista
      await el.updateComplete;
    };
    beforeEach(() => {
      vi.useFakeTimers();
    });
    const OPEN = { supported_features: 1 };
    const confirmView = (el: Card) => el.shadowRoot!.querySelector('.confirm');
    const choices = (el: Card) => Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.confirm .accept')).map((b) => b.dataset.command);
    const choose = (el: Card, command: string) => el.shadowRoot!.querySelector<HTMLButtonElement>(`.confirm .accept[data-command="${command}"]`)!.click();

    it('cerrada: pregunta qué hacer y ofrece Desbloquear o Abrir', async () => {
      const el = await mount({}, hassWith('locked', 'es', OPEN));
      await ask(el);
      expect(el.shadowRoot!.querySelector('.confirm-title')!.textContent).toBe('¿Qué quieres hacer?');
      expect(choices(el)).toEqual(['unlock', 'open']);
      const labels = Array.from(el.shadowRoot!.querySelectorAll('.confirm .accept')).map((b) => b.textContent);
      expect(labels).toEqual(['Desbloquear', 'Abrir']);
    });

    it('desbloqueada: pregunta y ofrece Bloquear o Abrir', async () => {
      const el = await mount({}, hassWith('unlocked', 'es', OPEN));
      await ask(el);
      expect(choices(el)).toEqual(['lock', 'open']);
      const labels = Array.from(el.shadowRoot!.querySelectorAll('.confirm .accept')).map((b) => b.textContent);
      expect(labels).toEqual(['Bloquear', 'Abrir']);
    });

    it('elegir una opción llama al servicio lock.<orden> de la entidad, una sola vez, y espera el cambio de estado', async () => {
      for (const [state, command] of [['locked', 'unlock'], ['locked', 'open'], ['unlocked', 'lock'], ['unlocked', 'open']] as const) {
        const calls: unknown[][] = [];
        const el = await mount({}, hassWith(state, 'es', OPEN, calls));
        await ask(el);
        choose(el, command);
        await el.updateComplete;
        expect(calls, `${state} → ${command}`).toEqual([['lock', command, { entity_id: 'lock.puerta' }]]);
        expect(confirmView(el)).toBeNull();
        expect(active(el)).toBe(true);
      }
    });

    it('la ✕ cancela sin llamar a ningún servicio', async () => {
      const calls: unknown[][] = [];
      const el = await mount({}, hassWith('locked', 'es', OPEN, calls));
      await ask(el);
      el.shadowRoot!.querySelector<HTMLButtonElement>('.confirm .cancel')!.click();
      await el.updateComplete;
      expect(confirmView(el)).toBeNull();
      expect(calls).toEqual([]);
    });

    it('sin soporte de abrir sigue la pregunta simple: cerrada «¿Abrir?»; desbloqueada, cierra directamente', async () => {
      const locked = await mount({}, hassWith('locked', 'es', { supported_features: 0 }));
      await ask(locked);
      expect(locked.shadowRoot!.querySelector('.confirm-title')!.textContent).toBe('¿Abrir?');
      const unlocked = await mount({}, hassWith('unlocked', 'es', { supported_features: 0 }));
      await ask(unlocked);
      expect(confirmView(unlocked)).toBeNull();
    });

    it('en estado open (puerta abierta) o en movimiento no hay nada que elegir: cierra directamente', async () => {
      for (const state of ['open', 'locking', 'unlocking', 'opening']) {
        const el = await mount({}, hassWith(state, 'es', OPEN));
        await ask(el);
        expect(confirmView(el), state).toBeNull();
      }
    });

    it('con una acción de servicio explícita no hay elección: manda esa acción (con su confirmación si abre)', async () => {
      const el = await mount({ tap_action: { action: 'call-service', service: 'lock.unlock' } }, hassWith('locked', 'es', OPEN));
      await ask(el);
      expect(el.shadowRoot!.querySelector('.confirm-title')!.textContent).toBe('¿Abrir?');
    });

    it('con confirm_open: false no se pregunta ni se elige: toggle directo', async () => {
      const el = await mount({ confirm_open: false }, hassWith('locked', 'es', OPEN));
      const actions: string[] = [];
      el.addEventListener('hass-action', (ev) => actions.push((ev as CustomEvent).detail.action));
      await ask(el);
      expect(confirmView(el)).toBeNull();
      expect(actions).toEqual(['tap']);
    });

    it('en inglés: What do you want to do? / Unlock / Open', async () => {
      const el = await mount({}, hassWith('locked', 'en', OPEN));
      await ask(el);
      expect(el.shadowRoot!.querySelector('.confirm-title')!.textContent).toBe('What do you want to do?');
      expect(Array.from(el.shadowRoot!.querySelectorAll('.confirm .accept')).map((b) => b.textContent)).toEqual(['Unlock', 'Open']);
    });
  });
});
