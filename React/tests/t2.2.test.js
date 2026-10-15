import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T2.2: useFetch.js existe', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useFetch.js'), 'utf8');
  assert.ok(content, 'useFetch.js está vacío');
});

test('T2.2: useFetch devuelve estados correctamente', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useFetch.js'), 'utf8');
  assert.ok(content.includes('useState'), 'Falta useState en useFetch');
  assert.ok(content.includes('useEffect'), 'Falta useEffect en useFetch');
  assert.ok(content.includes('loading'), 'Falta estado loading en useFetch');
  assert.ok(content.includes('error'), 'Falta estado error en useFetch');
  assert.ok(content.includes('data'), 'Falta estado data en useFetch');
});

test('T2.2: useFetch usa el cliente api', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useFetch.js'), 'utf8');
  assert.ok(content.includes('api'), 'Falta importación de api en useFetch');
});
