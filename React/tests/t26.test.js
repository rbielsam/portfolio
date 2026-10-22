import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const variables = read('src/styles/variables.css');
const sections = read('src/styles/sections.css');
const admin = read('src/styles/admin.css');
const layout = read('src/styles/layout.css');

test('T26.1: Los tokens nuevos existen en variables.css', () => {
  for (const token of [
    '--color-surface',
    '--color-accent-soft',
    '--font-mono',
    '--content-max',
    '--reading-max',
  ]) {
    assert.ok(variables.includes(token), `Falta el token ${token}`);
  }
});

test('T26.2: Inicio usa rejilla, columna derecha y bloque de bio centrado', () => {
  assert.ok(sections.includes('.inicio__hero'), 'Falta .inicio__hero');
  assert.ok(
    /\.inicio__hero\s*\{[^}]*grid-template-columns/s.test(sections),
    'El hero debe ser una rejilla'
  );
  assert.ok(sections.includes('.inicio__intro'), 'Falta la columna derecha');
  assert.ok(
    /\.inicio__bio\s*\{[^}]*max-width:\s*var\(--reading-max\)/s.test(sections),
    'La biografía debe limitar su anchura'
  );
  assert.ok(
    /\.inicio__bio\s*\{[^}]*align-self:\s*center/s.test(sections),
    'El bloque de la biografía debe estar centrado'
  );
  assert.ok(
    /\.inicio__bio\s*\{[^}]*text-align:\s*left/s.test(sections),
    'Las líneas de la biografía no deben centrarse'
  );
});

test('T26.3: Las listas tienen separación, línea de tiempo y descripción legible', () => {
  assert.ok(
    /\.section__list\s*\{[^}]*gap:\s*var\(--spacing-md\)/s.test(sections),
    'La lista debe separar entradas'
  );
  assert.ok(sections.includes('.section__list::before'), 'Falta la línea de tiempo');
  assert.ok(sections.includes('.section__item::before'), 'Falta el punto de la ficha');
  assert.ok(sections.includes('.section__item-date'), 'Falta el estilo de fecha');
  assert.ok(
    /\.section__item-desc\s*\{[^}]*max-width:\s*var\(--reading-max\)/s.test(sections),
    'La descripción debe limitar su anchura'
  );
});

test('T26.4: Proyectos usa rejilla, tarjeta, imagen y etiquetas', () => {
  assert.ok(sections.includes('.section__list--grid'), 'Falta la rejilla de proyectos');
  assert.ok(
    /\.section__list--grid\s*\{[^}]*grid-template-columns/s.test(sections),
    'La rejilla debe declarar columnas'
  );
  assert.ok(
    /\.section__list--grid\s*\{[^}]*justify-content:\s*center/s.test(sections),
    'La rejilla debe centrar las tarjetas'
  );
  assert.ok(sections.includes('auto-fit'), 'La rejilla debe repartir las tarjetas sin columnas vacías');
  assert.ok(
    /\.section__list--grid \.section__item\s*\{[^}]*max-width:\s*420px/s.test(sections),
    'Una sola tarjeta no debe estirarse a todo el ancho'
  );
  assert.ok(
    /\.section__item-image\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s.test(sections),
    'La imagen debe tener proporción fija'
  );
  assert.ok(sections.includes('.section__item-tags'), 'Falta el contenedor de etiquetas');
  assert.ok(sections.includes('.section__item-tag'), 'Falta la etiqueta');
});

test('T26.5: Hay puntos de ruptura y respeto por el movimiento reducido', () => {
  assert.ok(sections.includes('@media (max-width: 768px)'), 'Falta el punto de ruptura de 768px');
  assert.ok(sections.includes('@media (max-width: 480px)'), 'Falta el punto de ruptura de 480px');
  assert.ok(
    sections.includes('@media (prefers-reduced-motion: reduce)'),
    'Falta la regla de movimiento reducido'
  );
});

test('T26.6: El panel muestra fechas y ayuda, y el layout evita recortes', () => {
  assert.ok(admin.includes('.admin-list__dates'), 'Falta el estilo de fechas del panel');
  assert.ok(admin.includes('.admin-form__hint'), 'Falta el estilo de ayuda');
  assert.ok(
    layout.includes('justify-content: safe center'),
    'El contenido largo no debe recortarse al centrar'
  );
});
