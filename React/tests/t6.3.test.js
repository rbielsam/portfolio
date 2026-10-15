import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T6.3: sections.css existe', () => {
  const content = readFileSync(join(rootDir, 'src/styles/sections.css'), 'utf8');
  assert.ok(content, 'sections.css está vacío');
});

test('T6.3: sections.css tiene estilos para la sección Inicio', () => {
  const content = readFileSync(join(rootDir, 'src/styles/sections.css'), 'utf8');
  assert.ok(content.includes('inicio') || content.includes('circle') || content.includes('círculo'), 'Faltan estilos para Inicio');
});

test('T6.3: sections.css tiene estilos para secciones placeholder', () => {
  const content = readFileSync(join(rootDir, 'src/styles/sections.css'), 'utf8');
  assert.ok(content.includes('section') || content.includes('placeholder'), 'Faltan estilos para secciones placeholder');
});
