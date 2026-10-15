import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.2: useMediaQuery.js existe', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useMediaQuery.js'), 'utf8');
  assert.ok(content, 'useMediaQuery.js está vacío');
});

test('T4.2: useMediaQuery es un hook válido', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useMediaQuery.js'), 'utf8');
  assert.ok(content.includes('useState'), 'useMediaQuery no usa useState');
  assert.ok(content.includes('useEffect'), 'useMediaQuery no usa useEffect');
});

test('T4.2: useMediaQuery exporta el hook', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useMediaQuery.js'), 'utf8');
  assert.ok(content.includes('export default useMediaQuery') || content.includes('export function useMediaQuery'), 'useMediaQuery no tiene export');
});
