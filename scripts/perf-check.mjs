#!/usr/bin/env node
/**
 * Benchmark de rendimiento de Neón Cards (acuerdo nº18).
 *
 * Ejecuta el render() real de una tarjeta (compilada, no simulada) en un
 * entorno jsdom, simulando N tarjetas recibiendo M actualizaciones de
 * `hass` seguidas — igual que ocurre cuando Home Assistant reenvía el
 * estado por websocket.
 *
 * NO sustituye una prueba real en el navegador (no mide pintado, GPU, ni
 * layout real) — pero sí detecta: cómputo lento en render(), fugas de
 * memoria, y regresiones de rendimiento al comparar ejecuciones futuras
 * contra estos números.
 *
 * Generalizado para cubrir cualquier tarjeta de `CARD_PROFILES` — cada
 * tarjeta nueva añade su propio perfil aquí en vez de tener su propio
 * script de benchmark (acuerdo nº4: reutilizable, no se copia).
 *
 * Uso: node scripts/perf-check.mjs [card] [numCards] [numUpdates]
 *   card: 'entity' | 'button' | 'all' (por defecto 'all')
 */

import { JSDOM } from 'jsdom';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const cardArg = process.argv[2] && !/^\d+$/.test(process.argv[2]) ? process.argv[2] : 'all';
const argOffset = process.argv[2] && !/^\d+$/.test(process.argv[2]) ? 1 : 0;
const numCards = Number(process.argv[2 + argOffset]) || 20;
const numUpdates = Number(process.argv[3 + argOffset]) || 200;

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

/**
 * Un perfil por tarjeta: cómo construirla, cómo montar su config y cómo
 * generar un `hass` simulado con estado cambiante para forzar
 * actualizaciones reales.
 */
const CARD_PROFILES = {
  entity: {
    elementName: 'neon-card-entity',
    entry: 'src/cards/entity/neon-card-entity.ts',
    exportName: 'NeonCardEntity',
    makeConfig: (entityId) => ({
      entity: entityId,
      primary_info: 'name',
      secondary_info: 'last-changed',
      card_orientation: 'left',
    }),
    makeHass: (entityIds, tick) => {
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
      return { states, callService: async () => {} };
    },
  },
  button: {
    elementName: 'neon-button-card',
    entry: 'src/cards/button/neon-button-card.ts',
    exportName: 'NeonButtonCard',
    makeConfig: (entityId) => ({
      entity: entityId,
      name: 'Salón',
      subtitle: 'Luces',
      tap_action: { action: 'toggle' },
      sensors: [{ entity: `sensor.${entityId.split('.')[1]}_temp` }, { entity: `sensor.${entityId.split('.')[1]}_hum` }],
    }),
    makeHass: (entityIds, tick) => {
      const states = {};
      for (const id of entityIds) {
        states[id] = {
          entity_id: id,
          state: tick % 2 === 0 ? 'on' : 'off',
          last_changed: new Date(Date.now() - tick * 1000).toISOString(),
          last_updated: new Date(Date.now() - tick * 1000).toISOString(),
          attributes: { friendly_name: `Luz de prueba ${id}` },
        };
        const base = id.split('.')[1];
        states[`sensor.${base}_temp`] = {
          entity_id: `sensor.${base}_temp`,
          state: String(20 + (tick % 5)),
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          attributes: { unit_of_measurement: '°C', device_class: 'temperature' },
        };
        states[`sensor.${base}_hum`] = {
          entity_id: `sensor.${base}_hum`,
          state: String(40 + (tick % 10)),
          last_changed: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          attributes: { unit_of_measurement: '%', device_class: 'humidity' },
        };
      }
      return { states, callService: async () => {} };
    },
  },
};

async function loadCardClass(profile) {
  const bundle = await rollup({
    input: profile.entry,
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
  const tmpFile = path.join(tmpDir, `${profile.elementName}.mjs`);
  await writeFile(tmpFile, output[0].code);
  const mod = await import(`file://${tmpFile}`);
  await rm(tmpDir, { recursive: true, force: true });

  const CardClass = mod[profile.exportName];
  if (!customElements.get(profile.elementName)) {
    customElements.define(profile.elementName, CardClass);
  }
  return CardClass;
}

async function benchmarkCard(profile, entityId) {
  const el = document.createElement(profile.elementName);
  document.body.appendChild(el);
  el.setConfig(profile.makeConfig(entityId));

  const start = performance.now();
  for (let tick = 0; tick < numUpdates; tick++) {
    el.hass = profile.makeHass([entityId], tick);
    await el.updateComplete;
  }
  const elapsed = performance.now() - start;

  document.body.removeChild(el);
  return elapsed;
}

async function runProfile(name, profile) {
  console.log(`\n=== ${name} (${profile.elementName}) ===`);
  console.log(`Benchmark: ${numCards} tarjetas x ${numUpdates} actualizaciones de hass cada una\n`);

  await loadCardClass(profile);

  const timings = [];
  for (let i = 0; i < numCards; i++) {
    const elapsed = await benchmarkCard(profile, `light.prueba_${name}_${i}`);
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

  let ok = true;
  if (avgPerRender > 2) {
    console.log('\n⚠️  Media por render > 2ms — revisar antes de dar por validado el rendimiento.');
    ok = false;
  } else {
    console.log('\n✅ Velocidad de render dentro de un rango saludable.');
  }

  // --- Prueba de resistencia: una tarjeta persistente, muchas actualizaciones ---
  console.log('\n--- Prueba de resistencia (fugas de memoria) ---');
  const enduranceUpdates = numUpdates * 20;
  const persistentId = `light.resistencia_${name}`;
  const persistent = document.createElement(profile.elementName);
  document.body.appendChild(persistent);
  persistent.setConfig(profile.makeConfig(persistentId));

  const heapBefore = (() => {
    if (global.gc) global.gc();
    return process.memoryUsage().heapUsed;
  })();
  for (let tick = 0; tick < enduranceUpdates; tick++) {
    persistent.hass = profile.makeHass([persistentId], tick);
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
    ok = false;
  } else {
    console.log('\n✅ Sin indicios de fuga de memoria tras muchas actualizaciones.');
  }

  document.body.removeChild(persistent);
  return ok;
}

const selected = cardArg === 'all' ? Object.keys(CARD_PROFILES) : [cardArg];
const unknown = selected.filter((name) => !CARD_PROFILES[name]);
if (unknown.length) {
  console.error(`Tarjeta(s) desconocida(s): ${unknown.join(', ')}. Disponibles: ${Object.keys(CARD_PROFILES).join(', ')}, all`);
  process.exit(1);
}

let allOk = true;
for (const name of selected) {
  const ok = await runProfile(name, CARD_PROFILES[name]);
  allOk = allOk && ok;
}

process.exitCode = allOk ? 0 : 1;
