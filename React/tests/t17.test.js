import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');
const readLaravel = (p) => readFileSync(join(rootDir, '..', 'Laravel', p), 'utf8');

const education = readLaravel('app/Models/Education.php');
const experience = readLaravel('app/Models/Experience.php');
const project = readLaravel('app/Models/Project.php');

const formacion = read('src/components/sections/Formacion.jsx');
const experiencia = read('src/components/sections/Experiencia.jsx');
const proyectos = read('src/components/sections/Proyectos.jsx');

const adminFormacion = read('src/pages/admin/AdminFormacion.jsx');
const adminExperiencia = read('src/pages/admin/AdminExperiencia.jsx');
const adminProyectos = read('src/pages/admin/AdminProyectos.jsx');

const adminForms = [
  ['AdminFormacion', adminFormacion],
  ['AdminExperiencia', adminExperiencia],
  ['AdminProyectos', adminProyectos],
];

const monthYearPicker = read('src/components/admin/MonthYearPicker.jsx');

// RF-1: la base de datos guarda la fecha completa y la API publica solo mes y año
test('T17.1: Education y Experience usan el cast date, sin formato', () => {
  for (const [name, src] of [['Education', education], ['Experience', experience]]) {
    assert.ok(src.includes("'start_date' => 'date'"), `${name}.start_date debe ser date`);
    assert.ok(src.includes("'end_date' => 'date'"), `${name}.end_date debe ser date`);
    assert.ok(
      !src.includes('date:Y-m'),
      `${name}: date:Y-m guardaría 2024-09 y MySQL lo rechazaría`
    );
  }
});

test('T17.2: Project usa el cast date, sin formato', () => {
  assert.ok(project.includes("'date' => 'date'"), 'Project.date debe ser date');
  assert.ok(!project.includes('date:Y-m'), 'date:Y-m guardaría 2019-01 y MySQL lo rechazaría');
});

test('T17.3: Los tres modelos publican las fechas como mes y año en toArray', () => {
  for (const [name, src] of [
    ['Education', education],
    ['Experience', experience],
    ['Project', project],
  ]) {
    assert.ok(src.includes('function toArray()'), `${name} debe sobrescribir toArray`);
    assert.ok(src.includes("format('Y-m')"), `${name} debe formatear como Y-m`);
    assert.ok(src.includes('parent::toArray()'), `${name} debe partir del serializado original`);
  }
});

test('T17.4: Education gana is_current como boolean, igual que Experience (spec 013)', () => {
  assert.ok(experience.includes("'is_current' => 'boolean'"), 'is_current debe seguir siendo boolean');
  assert.ok(
    education.includes("'is_current' => 'boolean'"),
    'Education debe publicar is_current como boolean'
  );
});

// RF-3: la muestra pública formatea las fechas
test('T17.5: Formacion y Experiencia importan formatMonthYear desde utils/dates.js', () => {
  for (const [name, src] of [['Formacion', formacion], ['Experiencia', experiencia]]) {
    assert.ok(
      /import\s*\{[^}]*formatMonthYear[^}]*\}/.test(src),
      `${name} debe importar formatMonthYear`
    );
    assert.ok(
      /from\s*['"][^'"]*utils\/dates\.js['"]/.test(src),
      `${name} debe importar desde utils/dates.js`
    );
  }
});

test('T17.6: Formacion formatea ambas fechas y reserva Actualidad', () => {
  assert.ok(formacion.includes('formatMonthYear(item.start_date, lang)'), 'Debe formatear start_date');
  assert.ok(formacion.includes('formatMonthYear(item.end_date, lang)'), 'Debe formatear end_date');
  assert.ok(formacion.includes("t('fecha.actualidad')"), 'Debe mostrar Actualidad sin fecha final');
  assert.ok(
    formacion.includes('item.is_current'),
    'Debe mostrar Actualidad también con is_current marcado (spec 013)'
  );
  assert.ok(
    !/\{item\.(start_date|end_date)\}/.test(formacion),
    'No debe renderizarse ninguna fecha en crudo'
  );
});

test('T17.7: Experiencia formatea las fechas y muestra Actualidad sin fecha final', () => {
  assert.ok(experiencia.includes('formatMonthYear(item.start_date, lang)'), 'Debe formatear start_date');
  assert.ok(experiencia.includes('formatMonthYear(item.end_date, lang)'), 'Debe formatear end_date');
  assert.ok(experiencia.includes('!item.end_date'), 'Debe cubrirse el caso de fecha final vacía');
  assert.ok(experiencia.includes("t('fecha.actualidad')"), 'Debe mostrar Actualidad');
  assert.ok(
    !/\{item\.(start_date|end_date)\}/.test(experiencia),
    'No debe renderizarse ninguna fecha en crudo'
  );
});

test('T17.8: Proyectos sigue sin mostrar fecha (fuera de alcance)', () => {
  assert.ok(!proyectos.includes('formatMonthYear'), 'Proyectos no debe ganar formato de fecha');
  assert.ok(!proyectos.includes('start_date'), 'Proyectos no tiene start_date');
});

// RF-2: el panel captura solo mes y año
test('T17.9: Los tres formularios usan el selector propio, sin inputs de fecha nativos', () => {
  for (const [name, src] of adminForms) {
    assert.ok(src.includes('MonthYearPicker'), `${name} debe usar MonthYearPicker`);
    assert.ok(!src.includes('type="month"'), `${name} ya no debe usar type="month"`);
    assert.ok(!src.includes('type="date"'), `${name} ya no debe usar type="date"`);
  }
});

test('T17.10: Los tres formularios etiquetan todos sus campos', () => {
  for (const [name, src] of adminForms) {
    assert.ok(src.includes('admin-form__label'), `${name} debe usar admin-form__label`);
    assert.ok(src.includes('admin-form__input'), `${name} debe usar admin-form__input`);
    assert.ok(!src.includes('placeholder='), `${name} ya no debe usar placeholders sueltos`);
  }
});

test('T17.11: Los campos de fecha quedan identificados', () => {
  assert.ok(adminFormacion.includes("t('fecha.desde')"), 'Formacion: etiqueta Desde');
  assert.ok(adminFormacion.includes("t('fecha.hasta')"), 'Formacion: etiqueta Hasta');
  assert.ok(adminExperiencia.includes("t('fecha.desde')"), 'Experiencia: etiqueta Desde');
  assert.ok(adminExperiencia.includes("t('fecha.hasta')"), 'Experiencia: etiqueta Hasta');
  assert.ok(adminProyectos.includes("t('proyectos.fecha')"), 'Proyectos: etiqueta Fecha');
});

test('T17.12: El textarea de Proyectos usa admin-form__textarea', () => {
  assert.ok(adminProyectos.includes('admin-form__textarea'), 'Debe usarse admin-form__textarea');
});

test('T17.13: El checkbox Actual no se modifica (plan D5)', () => {
  assert.ok(adminExperiencia.includes('type="checkbox"'), 'Debe seguir existiendo la casilla Actual');
  assert.ok(adminExperiencia.includes('is_current'), 'Debe seguir vinculada a is_current');
  assert.ok(
    !adminExperiencia.includes('admin-form__input" type="checkbox"'),
    'El checkbox no debe recibir la clase de caja de texto'
  );
});

// RF-3: el helper de formato
test('T17.14: formatMonthYear convierte YYYY-MM a mes en español con año', async () => {
  const { formatMonthYear } = await import('../src/utils/dates.js');
  assert.strictEqual(formatMonthYear('2025-07'), 'Julio 2025');
  assert.strictEqual(formatMonthYear('2026-04'), 'Abril 2026');
  assert.strictEqual(formatMonthYear('2022-12'), 'Diciembre 2022');
  assert.strictEqual(formatMonthYear('2018-01'), 'Enero 2018');
});

test('T17.15: formatMonthYear devuelve cadena vacía ante entradas inválidas', async () => {
  const { formatMonthYear } = await import('../src/utils/dates.js');
  assert.strictEqual(formatMonthYear(null), '');
  assert.strictEqual(formatMonthYear(undefined), '');
  assert.strictEqual(formatMonthYear(''), '');
  assert.strictEqual(formatMonthYear('no-fecha'), '');
  assert.strictEqual(formatMonthYear('2025-13'), '');
  assert.strictEqual(formatMonthYear('2025-07-03'), '');
});

test('T17.16: formatMonthYear no devuelve undefined nunca', async () => {
  const { formatMonthYear } = await import('../src/utils/dates.js');
  for (const entrada of [null, undefined, '', 'x', '2025-99', '2025-07-03', 12345]) {
    const salida = formatMonthYear(entrada);
    assert.strictEqual(typeof salida, 'string', `entrada ${String(entrada)} debe devolver string`);
  }
});

// RF-2 (Cambio 1): selector propio de mes y año, porque Firefox y Safari no soportan type="month"
test('T17.17: El selector propio no usa type="month" y compone YYYY-MM', () => {
  assert.ok(!monthYearPicker.includes('type="month"'), 'No debe depender de type="month"');
  assert.ok(monthYearPicker.includes('MESES'), 'Debe reutilizar los meses en español');
  assert.ok(monthYearPicker.includes('.padStart(2'), 'El mes debe llevar cero a la izquierda');
  assert.ok(monthYearPicker.includes('`${nextYear}-${nextMonth}`'), 'Debe componer el formato YYYY-MM');
  assert.ok(/: ''\)/.test(monthYearPicker), 'Debe emitir cadena vacía si falta año o mes');
  assert.ok(
    monthYearPicker.indexOf("aria-label={`${label} ${t('picker.mes')}`}") <
      monthYearPicker.indexOf("aria-label={`${label} ${t('picker.anio')}`}"),
    'El mes debe renderizarse antes que el año (spec 013)'
  );
});

test('T17.18: aniosDisponibles devuelve los años en orden descendente y conserva el guardado', async () => {
  const { aniosDisponibles, ANIO_MINIMO, ANIO_MAXIMO } = await import('../src/utils/dates.js');

  const comun = aniosDisponibles('');
  assert.ok(comun.includes(ANIO_MINIMO), 'Debe empezar en el año mínimo');
  assert.ok(comun.includes(ANIO_MAXIMO), 'Debe llegar al año máximo');
  assert.strictEqual(
    ANIO_MAXIMO,
    new Date().getFullYear(),
    'No debe ofrecer años por encima del actual (spec 013)'
  );
  assert.ok(!comun.includes(ANIO_MAXIMO + 1), 'No debe ofrecer años futuros');
  assert.ok(!comun.includes(ANIO_MINIMO - 1), 'No debe ofrecer años fuera del rango');
  assert.deepStrictEqual(comun, [...comun].sort((a, b) => b - a), 'Debe ir de mayor a menor');

  const raro = aniosDisponibles('1985');
  assert.ok(raro.includes(1985), 'Debe incluir el año guardado para no perderlo al editar');
  assert.deepStrictEqual(raro, [...raro].sort((a, b) => b - a), 'Debe seguir el orden descendente');

  const futuro = aniosDisponibles(String(ANIO_MAXIMO + 1));
  assert.ok(
    futuro.includes(ANIO_MAXIMO + 1),
    'Una fecha futura ya guardada debe seguir siendo editable'
  );
  assert.ok(futuro.includes(ANIO_MAXIMO), 'Debe seguir ofreciendo el año actual');

  assert.ok(monthYearPicker.includes('aniosDisponibles'), 'El selector debe usar el helper');
});

test('T17.19: El selector admite campo vacío y lleva etiqueta propia', () => {
  assert.ok(monthYearPicker.includes("value = ''"), 'Debe admitir valor vacío');
  assert.ok(
    monthYearPicker.includes('admin-form__dates'),
    'Debe envolverse en la clase del formulario'
  );
  assert.ok(
    monthYearPicker.includes('aria-label'),
    'Cada lista debe llevar nombre accesible propio, porque un label solo asocia al primer campo'
  );
  assert.ok(monthYearPicker.includes('label='), 'El formulario debe indicar qué campo es');
  for (const [name, src] of adminForms) {
    assert.ok(
      /MonthYearPicker[\s\S]{0,200}value=/.test(src),
      `${name} debe pasarle el valor al selector`
    );
    assert.ok(
      /onChange=\{\(v\)/.test(src) && src.includes('MonthYearPicker'),
      `${name} debe manejar el cambio con el valor, no con el evento`
    );
  }
});

// RF-1 (spec 013): Formación gana la opción Actual, igual que Experiencia
test('T17.20: Formación tiene la casilla Actual vinculada a is_current', () => {
  assert.ok(adminFormacion.includes('type="checkbox"'), 'Debe existir la casilla Actual');
  assert.ok(adminFormacion.includes('is_current'), 'Debe vincularse a is_current');
  assert.ok(
    !adminFormacion.includes('admin-form__input" type="checkbox"'),
    'La casilla no debe recibir la clase de caja de texto (plan D5 de la 012)'
  );
  assert.ok(
    adminFormacion.indexOf('is_current') > adminFormacion.indexOf('label="Hasta"'),
    'Debe ir después del campo Hasta'
  );
});

// RF-3 (spec 013): el mes pasa a ser la primera lista, así que el ancho cambia de sitio
test('T17.21: El CSS da el ancho a la primera lista, que ahora es la del mes', () => {
  const admin = read('src/styles/admin.css');
  assert.ok(admin.includes('admin-form__dates select:first-child'), 'Debe usar first-child');
  assert.ok(
    !admin.includes('admin-form__dates select:last-child'),
    'Ya no debe usar last-child: el último es el año'
  );
});
