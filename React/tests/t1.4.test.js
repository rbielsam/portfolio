import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T1.4: vite.config.js está configurado con React', () => {
  const config = readFileSync(join(rootDir, 'vite.config.js'), 'utf8');
  assert.ok(config.includes('@vitejs/plugin-react'), 'Falta el plugin de React en vite.config.js');
  assert.ok(config.includes('react()'), 'Falta la llamada a react() en vite.config.js');
});

test('T1.4: main.jsx usa React Router', () => {
  const main = readFileSync(join(rootDir, 'src/main.jsx'), 'utf8');
  assert.ok(main.includes('react-router-dom'), 'Falta react-router-dom en main.jsx');
  assert.ok(main.includes('BrowserRouter'), 'Falta BrowserRouter en main.jsx');
});
