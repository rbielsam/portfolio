import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T1.1: vite.config.js tiene proxy /api configurado', () => {
  const config = readFileSync(join(rootDir, 'vite.config.js'), 'utf8');
  assert.ok(config.includes('proxy'), 'Falta proxy en vite.config.js');
  assert.ok(config.includes('/api'), 'Falta /api en el proxy');
  assert.ok(config.includes('localhost:8000'), 'Falta localhost:8000 en el proxy');
});

test('T1.1: vite.config.js reenvía también /sanctum (cookie CSRF)', () => {
  const config = readFileSync(join(rootDir, 'vite.config.js'), 'utf8');
  assert.ok(
    config.includes("'/sanctum'"),
    'El proxy debe incluir /sanctum para el cookie CSRF de Sanctum'
  );
});
