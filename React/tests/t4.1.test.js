import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.1: SectionContext.jsx existe', () => {
  const content = readFileSync(join(rootDir, 'src/context/SectionContext.jsx'), 'utf8');
  assert.ok(content, 'SectionContext.jsx está vacío');
});

test('T4.1: SectionContext define un contexto React', () => {
  const content = readFileSync(join(rootDir, 'src/context/SectionContext.jsx'), 'utf8');
  assert.ok(content.includes('createContext'), 'SectionContext no usa createContext');
});

test('T4.1: SectionContext tiene una sección por defecto "Inicio"', () => {
  const content = readFileSync(join(rootDir, 'src/context/SectionContext.jsx'), 'utf8');
  assert.ok(content.includes('Inicio'), 'SectionContext no tiene "Inicio" como sección por defecto');
});

test('T4.1: SectionContext exporta el provider y el hook', () => {
  const content = readFileSync(join(rootDir, 'src/context/SectionContext.jsx'), 'utf8');
  assert.ok(content.includes('SectionProvider'), 'SectionContext no exporta SectionProvider');
  assert.ok(content.includes('useSection'), 'SectionContext no exporta useSection');
});
