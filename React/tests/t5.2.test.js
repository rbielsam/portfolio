import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T5.2: Formacion.jsx existe y tiene mensaje en creación', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Formacion.jsx'), 'utf8');
  assert.ok(content.includes('Formación'), 'Falta "Formación"');
  assert.ok(content.includes('en creación'), 'Falta "en creación"');
});

test('T5.2: Experiencia.jsx existe y tiene mensaje en creación', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Experiencia.jsx'), 'utf8');
  assert.ok(content.includes('Experiencia'), 'Falta "Experiencia"');
  assert.ok(content.includes('en creación'), 'Falta "en creación"');
});

test('T5.2: Proyectos.jsx existe y tiene mensaje en creación', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Proyectos.jsx'), 'utf8');
  assert.ok(content.includes('Proyectos'), 'Falta "Proyectos"');
  assert.ok(content.includes('en creación'), 'Falta "en creación"');
});

test('T5.2: Login.jsx existe y tiene mensaje en creación', () => {
  const content = readFileSync(join(rootDir, 'src/components/Sections/Login.jsx'), 'utf8');
  assert.ok(content.includes('Login'), 'Falta "Login"');
  assert.ok(content.includes('en creación'), 'Falta "en creación"');
});
