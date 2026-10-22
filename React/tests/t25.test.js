import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const inicio = read('src/components/sections/Inicio.jsx');
const formacion = read('src/components/sections/Formacion.jsx');
const experiencia = read('src/components/sections/Experiencia.jsx');
const proyectos = read('src/components/sections/Proyectos.jsx');

const adminExperiencia = read('src/pages/admin/AdminExperiencia.jsx');
const adminFormacion = read('src/pages/admin/AdminFormacion.jsx');
const adminProyectos = read('src/pages/admin/AdminProyectos.jsx');

const dates = read('src/utils/dates.js');

test('T25.1: Inicio compone foto y nombre a la izquierda, y título y bio a la derecha', () => {
  assert.ok(inicio.includes('inicio__hero'), 'Falta el contenedor de dos columnas');
  assert.ok(inicio.includes('inicio__identity'), 'Falta el bloque de foto y nombre');
  assert.ok(inicio.includes('inicio__name'), 'Falta el nombre');
  assert.ok(inicio.includes('inicio__intro'), 'Falta la columna derecha');
  assert.ok(inicio.includes('inicio__title'), 'Falta el título profesional');
  assert.ok(
    inicio.indexOf('inicio__intro') < inicio.indexOf('inicio__title'),
    'El título debe ir dentro de la columna derecha'
  );
  assert.ok(
    inicio.indexOf('inicio__title') < inicio.indexOf('inicio__bio'),
    'La biografía debe ir debajo del título'
  );
  assert.ok(/data\.bio\s*&&/.test(inicio), 'La biografía debe renderizarse solo si tiene contenido');
  assert.ok(inicio.includes('data.photo_url'), 'Debe seguir prefiriendo photo_url');
  assert.ok(inicio.includes('photoUrl('), 'Debe seguir usando photoUrl()');
  assert.ok(inicio.includes('data.photo'), 'Debe seguir cayendo a photo');
});

test('T25.2: Formación y Experiencia ponen la fecha primero y conservan su formato', () => {
  for (const [name, src] of [
    ['Formacion', formacion],
    ['Experiencia', experiencia],
  ]) {
    assert.ok(src.includes('section__item-date'), `${name}: falta la fecha`);
    assert.ok(src.includes('section__item-body'), `${name}: falta el cuerpo de la ficha`);
    assert.ok(
      src.indexOf('section__item-date') < src.indexOf('section__item-body'),
      `${name}: la fecha debe ir antes del cuerpo`
    );
    assert.ok(src.includes('formatMonthYear(item.start_date, lang)'), `${name}: falta la fecha inicial`);
    assert.ok(src.includes('formatMonthYear(item.end_date, lang)'), `${name}: falta la fecha final`);
    assert.ok(src.includes("t('fecha.actualidad')"), `${name}: falta el caso Actualidad`);
    assert.ok(src.includes('section__item-desc'), `${name}: falta el bloque de descripción`);
  }
});

test('T25.3: El panel de Experiencia muestra fechas y permite editar la descripción', () => {
  assert.ok(adminExperiencia.includes("import { formatMonthYear } from '../../utils/dates.js'"));
  assert.ok(adminExperiencia.includes('admin-list__dates'), 'Falta la fecha en el listado');
  assert.ok(adminExperiencia.includes('formatMonthYear(item.start_date, lang)'));
  assert.ok(adminExperiencia.includes("t('fecha.actualidad')"));
  assert.ok(adminExperiencia.includes("t('common.descripcion')"), 'Falta la etiqueta Descripción');
  assert.ok(adminExperiencia.includes('admin-form__textarea'), 'Falta el textarea de descripción');
  assert.ok(adminExperiencia.includes('description'), 'Falta el campo description');
});

test('T25.4: El panel de Formación muestra fechas y permite editar la descripción', () => {
  assert.ok(adminFormacion.includes("import { formatMonthYear } from '../../utils/dates.js'"));
  assert.ok(adminFormacion.includes('admin-list__dates'), 'Falta la fecha en el listado');
  assert.ok(adminFormacion.includes('formatMonthYear(item.start_date, lang)'));
  assert.ok(adminFormacion.includes("t('fecha.actualidad')"));
  assert.ok(adminFormacion.includes("t('common.descripcion')"), 'Falta la etiqueta Descripción');
  assert.ok(adminFormacion.includes('admin-form__textarea'), 'Falta el textarea de descripción');
  assert.ok(adminFormacion.includes('description'), 'Falta el campo description');
});

test('T25.5: Proyectos permite editar tecnologías con una ayuda, sin placeholder', () => {
  assert.ok(adminProyectos.includes("t('proyectos.tecnologias')"), 'Falta la etiqueta Tecnologías');
  assert.ok(adminProyectos.includes("t('proyectos.tecnologias_ayuda')"), 'Falta la ayuda');
  assert.ok(adminProyectos.includes('admin-form__hint'), 'Falta el estilo de ayuda');
  assert.ok(adminProyectos.includes('technologies'), 'Falta el campo technologies');
  assert.ok(!adminProyectos.includes('placeholder='), 'No debe usarse placeholder');
});

test('T25.6: Proyectos separa las tecnologías, limpia vacíos y elimina duplicados', () => {
  assert.ok(proyectos.includes("split(',')"), 'Debe separar por comas');
  assert.ok(proyectos.includes('.trim()'), 'Debe recortar espacios');
  assert.ok(proyectos.includes('.filter(Boolean)'), 'Debe descartar valores vacíos');
  assert.ok(proyectos.includes('new Set'), 'Debe eliminar duplicados');
  assert.ok(proyectos.includes('section__item-tags'), 'Falta el contenedor de etiquetas');
  assert.ok(proyectos.includes('section__item-tag'), 'Falta la etiqueta');
  assert.ok(!proyectos.includes('formatMonthYear'), 'Proyectos no debe formatear fechas');
});

test('T25.7: No se ha añadido un formateador de fechas nuevo', () => {
  assert.ok(
    !dates.includes('formatMonthYearRange'),
    'El formato de fecha no debe cambiar: se reutiliza formatMonthYear'
  );
});
