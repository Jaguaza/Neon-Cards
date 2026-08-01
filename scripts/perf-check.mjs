#!/usr/bin/env node
/**
 * Benchmark de rendimiento de Neón Card Entity (acuerdo nº18).
 *
 * Ejecuta el render() real de la tarjeta (compilada, no simulada) en un
 * entorno jsdom, simulando N tarjetas recibiendo M actualizaciones de
 * `hass` seguidas — igual que ocurre cuando Home Assistant reenvía el
 * estado por websocket.
 *
 * NO sustituye una prueba real en el navegador (no mide pintado, GPU, ni
 * layout real) — pero sí detecta: cómputo lento en render(), fugas de
 * memoria (el Map de gestos por entidad), y regresiones de rendimiento al
 * comparar ejecuciones futuras contra estos números.
 *
 * Uso: node scripts/perf-check.mjs [numCards] [numUpdates]
 */

import { JSDOM } from 'jsdom';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const numCards = Number(process.argv[2]) || 20;
const numUpdates = Number(process.argv[3]) || 200;

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
});

// Lit necesita estos globals disponibles antes de importarlo.
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.customElements = dom.window.customElements;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Document = dom.window.Document;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.Event = dom.window.Event;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.ShadowRoot = dom.window.ShadowRoot;
globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});

const bundle = await rollup({
  input: 'src/cards/entity/neon-card-entity.ts',
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: false,
      compilerOptions: {
        target: 'ES2021',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ES2021', 'DOM'],
        strict: true,
        experimentalDecorators: true,
        useDefineForClassFields: false,
        declaration: false,
        composite: false,
      },
    }),
  ],
});
const { output } = await bundle.generate({ format: 'es' });
await bundle.close();

const tmpDir = await mkdtemp(path.join(tmpdir(), 'neon-perf-'));
const tmpFile = path.join(tmpDir, 'neon-card-entity.mjs');
await writeFile(tmpFile, output[0].code);

const { NeonCardEntity } = await import(`file://${tmpFile}`);
await rm(tmpDir, { recursive: true, force: true });

if (!customElements.get('neon-card-entity')) {
  customElements.define('neon-card-entity', NeonCardEntity);
}

function makeMockHass(entityIds, tick) {
  const states = {};
  for (const id of entityIds) {
    states[id] = {
      entity_id: id,
      state: tick % 2 === 0 ? 'on' : 'off',
      last_changed: new Date(Date.now() - tick * 1000).toISOString(),
      last_updated: new Date(Date.now() - tick * 1000).toISOString(),
      attributes: { friendly_name: `Luz de prueba ${id}` },
    };
  }
  return {
    states,
    callService: async () => {},
  };
}

async function benchmarkCard(entityId) {
  const el = document.createElement('neon-card-entity');
  document.body.appendChild(el);
  el.setConfig({
    entity: entityId,
    primary_info: 'name',
    secondary_info: 'last-changed',
    card_orientation: 'left',
  });

  const start = performance.now();
  for (let tick = 0; tick < numUpdates; tick++) {
    el.hass = makeMockHass([entityId], tick);
    await el.updateComplete;
  }
  const elapsed = performance.now() - start;

  document.body.removeChild(el);
  return elapsed;
}

console.log(`Benchmark: ${numCards} tarjetas x ${numUpdates} actualizaciones de hass cada una\n`);

const timings = [];
for (let i = 0; i < numCards; i++) {
  const elapsed = await benchmarkCard(`light.prueba_${i}`);
  timings.push(elapsed);
}

const total = timings.reduce((a, b) => a + b, 0);
const avgPerCard = total / numCards;
const avgPerRender = total / (numCards * numUpdates);
const worst = Math.max(...timings);

console.log(`Tiempo total:              ${total.toFixed(1)} ms`);
console.log(`Media por tarjeta:         ${avgPerCard.toFixed(2)} ms (${numUpdates} updates)`);
console.log(`Media por render:          ${avgPerRender.toFixed(3)} ms`);
console.log(`Peor tarjeta:              ${worst.toFixed(2)} ms`);

if (avgPerRender > 2) {
  console.log('\n⚠️  Media por render > 2ms — revisar antes de dar por validado el rendimiento.');
  process.exitCode = 1;
} else {
  console.log('\n✅ Velocidad de render dentro de un rango saludable.');
}

// --- Prueba de resistencia: una tarjeta persistente, muchas actualizaciones ---
// Simula el caso real: la misma tarjeta abierta horas/días recibiendo estado.
console.log('\n--- Prueba de resistencia (fugas de memoria) ---');
const enduranceUpdates = numUpdates * 20;
const persistent = document.createElement('neon-card-entity');
document.body.appendChild(persistent);
persistent.setConfig({
  entity: 'light.resistencia',
  primary_info: 'name',
  secondary_info: 'last-changed',
});

const heapBefore = (() => {
  if (global.gc) global.gc();
  return process.memoryUsage().heapUsed;
})();
for (let tick = 0; tick < enduranceUpdates; tick++) {
  persistent.hass = makeMockHass(['light.resistencia'], tick);
  await persistent.updateComplete;
}
if (global.gc) global.gc();
const heapAfter = process.memoryUsage().heapUsed;
const heapGrowthMb = (heapAfter - heapBefore) / 1024 / 1024;

console.log(`Actualizaciones aplicadas: ${enduranceUpdates}`);
console.log(`Heap antes:                ${(heapBefore / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap después:              ${(heapAfter / 1024 / 1024).toFixed(2)} MB`);
console.log(`Crecimiento:               ${heapGrowthMb.toFixed(2)} MB`);

if (heapGrowthMb > 5) {
  console.log('\n⚠️  Crecimiento de memoria sospechoso — revisar antes de dar por validado el rendimiento.');
  process.exitCode = 1;
} else {
  console.log('\n✅ Sin indicios de fuga de memoria tras muchas actualizaciones.');
}
