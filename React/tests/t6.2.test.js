import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T6.2: navigation.css existe', () => {
  const content = readFileSync(join(rootDir, 'src/styles/navigation.css'), 'utf8');
  assert.ok(content, 'navigation.css está vacío');
});

test('T6.2: navigation.css tiene estilos para botones en horizontal', () => {
  const content = readFileSync(join(rootDir, 'src/styles/navigation.css'), 'utf8');
  assert.ok(content.includes('nav-buttons') || content.includes('.nav'), 'Faltan estilos para botones en horizontal');
});

test('T6.2: navigation.css tiene estilos responsive para móvil', () => {
  const content = readFileSync(join(rootDir, 'src/styles/navigation.css'), 'utf8');
  assert.ok(content.includes('@media') || content.includes('floating') || content.includes('bottom-sheet'), 'Faltan estilos responsive');
});
