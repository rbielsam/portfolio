import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T1.3: node_modules existe', () => {
  assert.ok(existsSync(join(rootDir, 'node_modules')), 'node_modules no existe');
});

test('T1.3: Las dependencias están instaladas', () => {
  const deps = ['react', 'react-dom', 'react-router-dom', 'vite', '@vitejs/plugin-react'];
  for (const dep of deps) {
    assert.ok(existsSync(join(rootDir, 'node_modules', dep)), `La dependencia ${dep} no está instalada`);
  }
});
