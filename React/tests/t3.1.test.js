import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T3.1: Header.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Header.jsx'), 'utf8');
  assert.ok(content, 'Header.jsx está vacío');
});

test('T3.1: Header renderiza el título traducido como h1 oculto', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Header.jsx'), 'utf8');
  assert.ok(content.includes("t('a11y.h1')"), 'El título accesible no está traducido en Header.jsx');
  assert.ok(content.includes('sr-only'), 'El h1 debe quedar oculto visualmente');
  assert.ok(!content.includes('header__title'), 'El título visible debe retirarse de la cabecera');
});

test('T3.1: Header es un componente React válido', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Header.jsx'), 'utf8');
  assert.ok(content.includes('function Header') || content.includes('const Header'), 'Header no es un componente válido');
  assert.ok(content.includes('export default Header'), 'Header no tiene export default');
});
