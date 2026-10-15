import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.1: Inicio.jsx usa useFetch para perfil', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Inicio.jsx'), 'utf8');
  assert.ok(content.includes('useFetch'), 'Falta useFetch en Inicio');
  assert.ok(content.includes("'/profile'"), "Falta '/profile' en Inicio");
  assert.ok(content.includes('name'), 'Falta name en Inicio');
  assert.ok(content.includes('title'), 'Falta title en Inicio');
  assert.ok(content.includes('bio'), 'Falta bio en Inicio');
  assert.ok(content.includes('photo'), 'Falta photo en Inicio');
});

test('T4.2: Formacion.jsx usa useFetch', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Formacion.jsx'), 'utf8');
  assert.ok(content.includes('useFetch'), 'Falta useFetch en Formacion');
  assert.ok(content.includes("'/education'"), "Falta '/education' en Formacion");
});

test('T4.3: Experiencia.jsx usa useFetch', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Experiencia.jsx'), 'utf8');
  assert.ok(content.includes('useFetch'), 'Falta useFetch en Experiencia');
  assert.ok(content.includes("'/experience'"), "Falta '/experience' en Experiencia");
});

test('T4.4: Proyectos.jsx usa useFetch', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Proyectos.jsx'), 'utf8');
  assert.ok(content.includes('useFetch'), 'Falta useFetch en Proyectos');
  assert.ok(content.includes("'/projects'"), "Falta '/projects' en Proyectos");
});
