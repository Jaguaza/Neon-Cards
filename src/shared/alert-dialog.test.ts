// @vitest-environment jsdom
import { html, render } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { renderAlertDialog } from './alert-dialog';

function mount(onCancel = vi.fn()) {
  const host = document.createElement('div');
  render(renderAlertDialog('vista extra', 'Título', onCancel, html`<button>ok</button>`), host);
  return { host, dialog: host.querySelector<HTMLElement>('[role="alertdialog"]')!, onCancel };
}

describe('renderAlertDialog', () => {
  it('es un alertdialog con las clases y el nombre accesible dados', () => {
    const { dialog } = mount();
    expect(dialog.className).toBe('vista extra');
    expect(dialog.getAttribute('aria-label')).toBe('Título');
    expect(dialog.querySelector('button')!.textContent).toBe('ok');
  });

  it('Escape llama a onCancel y otras teclas no', () => {
    const { dialog, onCancel } = mount();
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(onCancel).not.toHaveBeenCalled();
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('corta pointerdown, pointerup, pointercancel y click antes de que lleguen a la tarjeta', () => {
    const { host, dialog } = mount();
    const seen: string[] = [];
    for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click']) host.addEventListener(type, () => seen.push(type));
    for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click']) dialog.dispatchEvent(new Event(type, { bubbles: true }));
    expect(seen).toEqual([]);
  });
});
