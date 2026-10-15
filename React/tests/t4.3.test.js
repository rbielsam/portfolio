import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.3: NavButtons.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/NavButtons.jsx'), 'utf8');
  assert.ok(content, 'NavButtons.jsx está vacío');
});

test('T4.3: NavButtons tiene los cinco botones', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/NavButtons.jsx'), 'utf8');
  const labels = ['Inicio', 'Formación', 'Experiencia', 'Proyectos', 'Login'];
  for (const label of labels) {
    assert.ok(content.includes(label), `Falta el botón "${label}"`);
  }
});

test('T4.3: NavButtons usa useSection', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/NavButtons.jsx'), 'utf8');
  assert.ok(content.includes('useSection'), 'NavButtons no usa useSection');
});
