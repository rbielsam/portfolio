import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T5.2: Inicio.jsx muestra la foto cuando existe', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Inicio.jsx'), 'utf8');
  assert.ok(content.includes('data.photo'), 'Falta la foto en Inicio');
  assert.ok(content.includes('<img'), 'Falta el elemento img');
});

test('T5.2: La ruta de la foto se sirve desde /storage', () => {
  const helper = readFileSync(join(rootDir, 'src/utils/initials.js'), 'utf8');
  assert.ok(
    helper.includes('/storage/'),
    'La foto debe servirse desde /storage/ porque la API devuelve una ruta relativa'
  );

  const inicio = readFileSync(join(rootDir, 'src/components/sections/Inicio.jsx'), 'utf8');
  assert.ok(inicio.includes('photoUrl'), 'Inicio debe usar el helper photoUrl');
});

test('T5.2: Sin foto muestra iniciales sobre degradado', () => {
  const inicio = readFileSync(join(rootDir, 'src/components/sections/Inicio.jsx'), 'utf8');
  assert.ok(inicio.includes('initials'), 'Falta el calculo de iniciales');
  assert.ok(inicio.includes('avatar--initials'), 'Falta la variante de iniciales');

  const css = readFileSync(join(rootDir, 'src/styles/avatar.css'), 'utf8');
  assert.ok(css.includes('gradient'), 'Falta el fondo degradado para las iniciales');
});

test('T5.2: El calculo de iniciales maneja una sola palabra', () => {
  const helper = readFileSync(join(rootDir, 'src/utils/initials.js'), 'utf8');
  assert.ok(helper, 'Falta el helper de iniciales');
});

test('T5.2: Existe el helper de iniciales con casos límite cubiertos', () => {
  const content = readFileSync(join(rootDir, 'src/utils/initials.js'), 'utf8');
  assert.ok(content.includes('export'), 'El helper debe exportar la función');
  assert.ok(content.includes('split'), 'Debe separar el nombre por espacios');
  assert.ok(content.includes('toUpperCase'), 'Debe pasar a mayusculas');
});

test('T5.3: Existen los estilos del avatar', () => {
  const path = join(rootDir, 'src/styles/avatar.css');
  assert.ok(existsSync(path), 'Falta avatar.css');
  const css = readFileSync(path, 'utf8');
  assert.ok(css.includes('border-radius: 50%') || css.includes('border-radius:50%'), 'El avatar debe ser circular');
  assert.ok(css.includes('gradient'), 'Falta el degradado de las iniciales');
});

test('T5.3: Los estilos del avatar son adaptables a movil', () => {
  const css = readFileSync(join(rootDir, 'src/styles/avatar.css'), 'utf8');
  assert.ok(css.includes('@media'), 'Falta consulta de medios para movil');
});
