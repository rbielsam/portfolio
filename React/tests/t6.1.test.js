import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T6.1: App.jsx integra Layout y navegación', () => {
  const content = readFileSync(join(rootDir, 'src/App.jsx'), 'utf8');
  assert.ok(content.includes('Layout'), 'App.jsx no integra Layout');
  assert.ok(content.includes('SectionProvider'), 'App.jsx no integra SectionProvider');
});

test('T6.1: App.jsx renderiza la sección activa', () => {
  const content = readFileSync(join(rootDir, 'src/App.jsx'), 'utf8');
  assert.ok(content.includes('useSection') || content.includes('Inicio'), 'App.jsx no renderiza la sección activa');
});

test('T6.1: App.jsx incluye navegación responsive', () => {
  const content = readFileSync(join(rootDir, 'src/App.jsx'), 'utf8');
  assert.ok(content.includes('NavButtons') || content.includes('FloatingButton') || content.includes('BottomSheet'), 'App.jsx no incluye navegación responsive');
});
