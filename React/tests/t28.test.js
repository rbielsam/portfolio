import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const sections = read('src/styles/sections.css');
const admin = read('src/styles/admin.css');
const variables = read('src/styles/variables.css');

test('T28.1: existen los estilos del detalle de proyecto', () => {
  assert.ok(sections.includes('.proyecto-detalle'), 'Falta el contenedor del detalle');
  assert.ok(sections.includes('.proyecto-detalle__back'), 'Falta el enlace de vuelta');
  assert.ok(sections.includes('.proyecto-detalle__title'), 'Falta el título');
  assert.ok(sections.includes('.proyecto-detalle__date'), 'Falta la fecha');
  assert.ok(sections.includes('.proyecto-detalle__description'), 'Falta la descripción');
  assert.ok(sections.includes('.proyecto-detalle__link'), 'Falta el enlace externo');
  assert.ok(sections.includes('.proyecto-detalle__not-found'), 'Falta el estado no encontrado');
});

test('T28.2: la galería muestra imagen y comentario en dos columnas', () => {
  assert.ok(sections.includes('.proyecto-galeria'), 'Falta la galería');
  assert.ok(sections.includes('.proyecto-galeria__item'), 'Falta cada figura');
  assert.ok(sections.includes('.proyecto-galeria__item--solo'), 'Falta el caso sin comentario');
  assert.ok(sections.includes('.proyecto-galeria__image'), 'Falta la imagen');
  assert.ok(sections.includes('.proyecto-galeria__caption'), 'Falta el comentario');
  assert.ok(
    /\.proyecto-galeria__item\s*\{[^}]*grid-template-columns/s.test(sections),
    'La figura debe usar rejilla de columnas'
  );
  assert.ok(
    /\.proyecto-galeria__caption\s*\{[^}]*white-space:\s*pre-line/s.test(sections),
    'El comentario debe conservar los saltos de línea'
  );
  assert.ok(
    /\.proyecto-galeria__caption\s*\{[^}]*overflow-wrap:\s*break-word/s.test(sections),
    'El comentario debe poder partir palabras largas'
  );
});

test('T28.3: la galería se apila en pantalla estrecha', () => {
  const bloque = sections.slice(sections.indexOf('@media (max-width: 768px)'));

  assert.ok(bloque.includes('.proyecto-galeria__item'), 'Falta el ajuste móvil de la galería');
  assert.ok(bloque.includes('grid-template-columns: 1fr'), 'Debe pasar a una columna');
  assert.ok(bloque.includes('border-top'), 'El comentario debe separarse por arriba');
  assert.ok(bloque.includes('border-left: 0'), 'El comentario no debe conservar el borde izquierdo');
  assert.ok(sections.includes('@media (max-width: 480px)'), 'Falta el ajuste de 480 px');
});

test('T28.4: existen los estilos del gestor de imágenes del panel', () => {
  assert.ok(admin.includes('.project-images'), 'Falta el contenedor del gestor');
  assert.ok(admin.includes('.project-images__warning'), 'Falta el aviso de contenido público');
  assert.ok(admin.includes('.project-images__list'), 'Falta la lista');
  assert.ok(admin.includes('.project-images__item'), 'Falta cada imagen');
  assert.ok(admin.includes('.project-images__thumb'), 'Falta la miniatura');
  assert.ok(admin.includes('.project-images__body'), 'Falta el cuerpo');
  assert.ok(admin.includes('.project-images__actions'), 'Faltan las acciones');
  assert.ok(admin.includes('.project-images__upload'), 'Falta el formulario de subida');
  assert.ok(
    /\.project-images__thumb\s*\{[^}]*object-fit:\s*cover/s.test(admin),
    'La miniatura debe recortar con object-fit'
  );
});

test('T28.5: el gestor del panel se apila a 600 px', () => {
  const bloque = admin.slice(admin.indexOf('@media (max-width: 600px)'));

  assert.ok(bloque.includes('.project-images__item'), 'Falta el ajuste de las imágenes');
  assert.ok(bloque.includes('grid-template-columns: 1fr'), 'Debe pasar a una columna');
});

test('T28.6: las zonas sensibles evitan desbordamientos', () => {
  assert.ok(
    /\.proyecto-galeria__caption\s*\{[^}]*overflow-wrap/s.test(sections),
    'La galería debe partir palabras largas'
  );
  assert.ok(
    /\.proyecto-detalle__title\s*\{[^}]*overflow-wrap/s.test(sections),
    'El título debe poder partirse'
  );
  assert.ok(
    /\.project-images__body\s*\{[^}]*min-width:\s*0/s.test(admin),
    'La columna del panel debe permitir encogerse'
  );
  assert.ok(
    /\.project-images__actions\s*\{[^}]*flex-wrap:\s*wrap/s.test(admin),
    'Las acciones del panel deben envolverse'
  );
});

test('T28.7: los avisos usan tokens y se respeta el movimiento reducido', () => {
  assert.ok(variables.includes('--admin-warning-bg'), 'Falta el token del fondo de aviso');
  assert.ok(variables.includes('--admin-warning-border'), 'Falta el token del borde de aviso');
  assert.ok(variables.includes('--admin-warning-text'), 'Falta el token del texto de aviso');
  assert.ok(
    !/#[0-9a-fA-F]{3,8}/.test(admin),
    'admin.css no debe contener colores hexadecimales sueltos'
  );
  assert.ok(sections.includes('prefers-reduced-motion'), 'Falta el respeto por el movimiento reducido');
});
