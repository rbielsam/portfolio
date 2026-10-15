import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T3.2: Footer.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Footer.jsx'), 'utf8');
  assert.ok(content, 'Footer.jsx está vacío');
});

test('T3.2: Footer muestra el año como pie de página', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Footer.jsx'), 'utf8');
  assert.ok(
    content.includes(String(new Date().getFullYear())),
    'El footer debe mostrar el año actual'
  );
});

test('T3.2: Footer es un componente React válido', () => {
  const content = readFileSync(join(rootDir, 'src/components/Layout/Footer.jsx'), 'utf8');
  assert.ok(
    content.includes('function Footer') || content.includes('const Footer'),
    'Footer no es un componente válido'
  );
  assert.ok(content.includes('export default Footer'), 'Footer no tiene export default');
});
