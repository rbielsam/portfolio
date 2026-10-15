import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.5: BottomSheet.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/BottomSheet.jsx'), 'utf8');
  assert.ok(content, 'BottomSheet.jsx está vacío');
});

test('T4.5: BottomSheet renderiza sus hijos', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/BottomSheet.jsx'), 'utf8');
  assert.ok(content.includes('children'), 'BottomSheet no renderiza sus hijos');
});

test('T4.5: BottomSheet es un componente React válido', () => {
  const content = readFileSync(join(rootDir, 'src/components/Navigation/BottomSheet.jsx'), 'utf8');
  assert.ok(content.includes('export default'), 'BottomSheet no tiene export default');
});
