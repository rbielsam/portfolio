import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T2.1: client.js existe y está configurado', () => {
  const content = readFileSync(join(rootDir, 'src/api/client.js'), 'utf8');
  assert.ok(content, 'client.js está vacío');
});

test('T2.1: client.js incluye credentials include', () => {
  const content = readFileSync(join(rootDir, 'src/api/client.js'), 'utf8');
  assert.ok(content.includes('credentials'), 'Falta credentials en client.js');
  assert.ok(content.includes("'include'"), 'Falta credentials include en client.js');
});

test('T2.1: client.js maneja respuestas JSON y errores', () => {
  const content = readFileSync(join(rootDir, 'src/api/client.js'), 'utf8');
  assert.ok(content.includes('json()'), 'Falta llamada a json() en client.js');
  assert.ok(content.includes('response.ok'), 'Falta verificación response.ok en client.js');
});
