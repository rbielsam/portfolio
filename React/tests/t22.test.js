import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const favicon = read('public/favicon.svg');
const indexHtml = read('index.html');
const publicar = readFileSync(join(rootDir, '..', 'deploy', 'publicar.sh'), 'utf8');

test('T22.1: existe React/public/favicon.svg', () => {
  assert.ok(favicon.length > 0, 'favicon.svg está vacío');
  assert.ok(favicon.includes('<svg'), 'favicon.svg no es un SVG válido');
  assert.ok(favicon.includes('viewBox="0 0 64 64"'), 'El favicon debe ser cuadrado (viewBox 64×64)');
});

test('T22.2: el favicon usa la paleta del sitio', () => {
  const colores = ['#1a3a5c', '#0a1628', '#5ba3d9'];
  colores.forEach((color) => {
    assert.ok(
      favicon.toLowerCase().includes(color),
      `El favicon debe usar el color de la paleta ${color}`
    );
  });
});

test('T22.3: index.html enlaza /favicon.svg', () => {
  assert.ok(
    indexHtml.includes('rel="icon"') && indexHtml.includes('/favicon.svg'),
    'index.html debe seguir enlazando /favicon.svg'
  );
});

test('T22.4: publicar.sh sincroniza el favicon', () => {
  assert.ok(
    publicar.includes('React/dist/favicon.svg'),
    'publicar.sh debe subir dist/favicon.svg a Laravel/public/'
  );
  assert.ok(
    publicar.includes('Laravel/public/favicon.svg'),
    'publicar.sh debe dejar el favicon en Laravel/public/favicon.svg'
  );
});
