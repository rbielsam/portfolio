import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T5.1: Inicio.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Inicio.jsx'), 'utf8');
  assert.ok(content, 'Inicio.jsx está vacío');
});

test('T5.1: Inicio renderiza el título "Portfolio"', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Inicio.jsx'), 'utf8');
  assert.ok(content.includes('Portfolio'), 'Inicio no tiene el título "Portfolio"');
});

test('T5.1: Inicio tiene un círculo marco', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Inicio.jsx'), 'utf8');
  assert.ok(content.includes('circle') || content.includes('círculo') || content.includes('border-radius'), 'Inicio no tiene un círculo');
});
