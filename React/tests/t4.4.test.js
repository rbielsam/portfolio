import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.4: FloatingButton.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/FloatingButton.jsx'), 'utf8');
  assert.ok(content, 'FloatingButton.jsx está vacío');
});

test('T4.4: FloatingButton tiene icono de rayas de menú', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/FloatingButton.jsx'), 'utf8');
  assert.ok(content.includes('☰') || content.includes('menu') || content.includes('hamburguesa'), 'FloatingButton no tiene icono de menú');
});

test('T4.4: FloatingButton es un componente React válido', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/FloatingButton.jsx'), 'utf8');
  assert.ok(content.includes('export default'), 'FloatingButton no tiene export default');
});
