import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T3.3: Layout.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Layout.jsx'), 'utf8');
  assert.ok(content, 'Layout.jsx está vacío');
});

test('T3.3: Layout importa Header y Footer', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Layout.jsx'), 'utf8');
  assert.ok(content.includes('Header'), 'Layout no importa Header');
  assert.ok(content.includes('Footer'), 'Layout no importa Footer');
});

test('T3.3: Layout renderiza Header y Footer', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Layout.jsx'), 'utf8');
  assert.ok(content.includes('<Header'), 'Layout no renderiza Header');
  assert.ok(content.includes('<Footer'), 'Layout no renderiza Footer');
});

test('T3.3: Layout tiene una zona de contenido', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Layout.jsx'), 'utf8');
  assert.ok(content.includes('content') || content.includes('children'), 'Layout no tiene zona de contenido');
});

test('T3.3: Layout es un componente React válido', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Layout.jsx'), 'utf8');
  assert.ok(content.includes('function Layout') || content.includes('const Layout'), 'Layout no es un componente válido');
  assert.ok(content.includes('export default Layout'), 'Layout no tiene export default');
});
