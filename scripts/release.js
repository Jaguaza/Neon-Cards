#!/usr/bin/env node
/**
 * Script de release de Neón Cards.
 *
 * Uso:
 *   node scripts/release.js patch|minor|major   → sube la versión y crea el tag
 *   node scripts/release.js 1.0.0               → salta a una versión concreta
 *   node scripts/release.js beta                → tag de prueba, versión sin cambiar
 *
 * No publica en el registro de npm: esto no es una librería de npm, es una
 * tarjeta de Home Assistant distribuida vía HACS a partir de un GitHub
 * Release. El workflow `.github/workflows/release.yml` construye los
 * assets y crea el Release cuando detecta un tag `v*`.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG_PATH = path.join(ROOT, 'package.json');
const SEMVER_BUMPS = ['patch', 'minor', 'major'];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readVersion() {
  return readJson(PKG_PATH).version;
}

const VERSION_TS_PATH = path.join(ROOT, 'src', 'version.ts');

function writeVersionEverywhere(version) {
  const rootPkg = readJson(PKG_PATH);
  rootPkg.version = version;
  writeJson(PKG_PATH, rootPkg);

  const versionTs = readFileSync(VERSION_TS_PATH, 'utf8');
  const updated = versionTs.replace(
    /export const NEON_CARDS_VERSION = '[^']*';/,
    `export const NEON_CARDS_VERSION = '${version}';`
  );
  if (updated === versionTs) {
    console.error(`No se encontró NEON_CARDS_VERSION en ${VERSION_TS_PATH}; revísalo a mano.`);
    process.exit(1);
  }
  writeFileSync(VERSION_TS_PATH, updated);
}

function bumpSemver(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function assertCleanWorkingTree() {
  const status = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
  if (status) {
    console.error(
      'El árbol de trabajo tiene cambios sin commitear. Haz commit o stash antes de lanzar un release.'
    );
    process.exit(1);
  }
}

function releaseBeta() {
  const version = readVersion();
  const existingTags = execSync(`git tag -l "v${version}-Beta.*"`, { cwd: ROOT })
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean);
  const nextNumber = existingTags.length + 1;
  const tag = `v${version}-Beta.${nextNumber}`;

  run(`git tag -a ${tag} -m "Beta release ${tag}"`);
  run(`git push origin ${tag}`);
  console.log(`Beta publicada como tag ${tag} (versión en package.json sin cambios: ${version}).`);
}

function releaseVersion(newVersion) {
  assertCleanWorkingTree();
  writeVersionEverywhere(newVersion);

  run('git add -A');
  run(`git commit -m "chore(release): v${newVersion}"`);

  const tag = `v${newVersion}`;
  run(`git tag -a ${tag} -m "Release ${tag}"`);
  run('git push origin main');
  run(`git push origin ${tag}`);

  console.log(`Release ${tag} publicado. GitHub Actions construirá los assets y creará el GitHub Release.`);
}

function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.error('Uso: npm run release -- <patch|minor|major|beta|X.Y.Z>');
    process.exit(1);
  }

  if (arg === 'beta') {
    releaseBeta();
    return;
  }

  if (SEMVER_BUMPS.includes(arg)) {
    const current = readVersion();
    releaseVersion(bumpSemver(current, arg));
    return;
  }

  if (/^\d+\.\d+\.\d+$/.test(arg)) {
    releaseVersion(arg);
    return;
  }

  console.error(`Argumento no reconocido: "${arg}". Usa patch, minor, major, beta o X.Y.Z.`);
  process.exit(1);
}

main();
