import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(rootDir, 'src');

function read(relativePath) {
  return readFileSync(join(srcDir, relativePath), 'utf8');
}

test('T20.1: Existen los tres diccionarios y el índice de i18n', () => {
  for (const file of ['i18n/es.js', 'i18n/ca.js', 'i18n/en.js', 'i18n/index.js']) {
    assert.ok(existsSync(join(srcDir, file)), `Falta ${file}`);
  }
});

test('T20.2: Existe LanguageContext con useLanguage y LanguageProvider', () => {
  const context = read('context/LanguageContext.jsx');
  assert.ok(context.includes('LanguageProvider'), 'Falta LanguageProvider');
  assert.ok(context.includes('useLanguage'), 'Falta useLanguage');
  assert.ok(context.includes('setLang'), 'Falta setLang');
  assert.ok(context.includes('function t(') || context.includes('const t ='), 'Falta la función t()');
});

test('T20.3: Los tres diccionarios tienen exactamente las mismas claves', async () => {
  const es = (await import('../src/i18n/es.js')).default;
  const ca = (await import('../src/i18n/ca.js')).default;
  const en = (await import('../src/i18n/en.js')).default;

  const clavesEs = Object.keys(es).sort();
  assert.deepEqual(Object.keys(ca).sort(), clavesEs, 'ca.js no tiene las mismas claves que es.js');
  assert.deepEqual(Object.keys(en).sort(), clavesEs, 'en.js no tiene las mismas claves que es.js');
  assert.ok(clavesEs.length >= 100, `Demasiadas pocas claves: ${clavesEs.length}`);
});

test('T20.4: SUPPORTED es es, ca, en y el idioma por defecto es español', async () => {
  const { SUPPORTED, DEFAULT, resolverIdioma } = await import('../src/i18n/index.js');

  assert.deepEqual([...SUPPORTED], ['es', 'ca', 'en']);
  assert.equal(DEFAULT, 'es');
  assert.equal(resolverIdioma('ca'), 'ca');
  assert.equal(resolverIdioma('zz'), 'es', 'Un idioma no soportado debe caer a es');
  assert.equal(resolverIdioma(undefined), 'es');
});

test('T20.5: t() cae a español y después a la propia clave', async () => {
  const { traducir } = await import('../src/i18n/index.js');

  assert.equal(traducir('en', 'seccion.formacion'), 'Education');
  assert.equal(traducir('es', 'seccion.formacion'), 'Formación');
  assert.equal(traducir('ca', 'clave.que.no.existe'), 'clave.que.no.existe');
  assert.equal(traducir('es', 'clave.que.no.existe'), 'clave.que.no.existe');
  assert.equal(traducir('zz', 'seccion.formacion'), 'Formación');
});

test('T20.6: t() sustituye los parámetros', async () => {
  const { traducir } = await import('../src/i18n/index.js');
  const es = (await import('../src/i18n/es.js')).default;

  const clave = Object.keys(es).find((k) => es[k].includes('{name}'));
  assert.ok(clave, 'Debe existir alguna clave con {name}');

  const salida = traducir('es', clave, { name: 'Ramón' });
  assert.ok(salida.includes('Ramón'), 'El parámetro no se ha sustituido');
  assert.ok(!salida.includes('{name}'), 'Sobra la marca {name} en la salida');
});

test('T20.7: MESES tiene los tres idiomas y 12 meses cada uno', async () => {
  const { MESES } = await import('../src/utils/dates.js');

  assert.deepEqual(Object.keys(MESES).sort(), ['ca', 'en', 'es']);
  for (const idioma of ['es', 'ca', 'en']) {
    assert.equal(MESES[idioma].length, 12, `MESES.${idioma} no tiene 12 meses`);
  }
});

test('T20.8: formatMonthYear traduce el mes según el idioma', async () => {
  const { formatMonthYear } = await import('../src/utils/dates.js');

  assert.equal(formatMonthYear('2025-07', 'es'), 'Julio 2025');
  assert.equal(formatMonthYear('2025-07', 'ca'), 'juliol 2025');
  assert.equal(formatMonthYear('2025-07', 'en'), 'July 2025');
});

test('T20.9: formatMonthYear sin idioma sigue devolviendo español', async () => {
  const { formatMonthYear } = await import('../src/utils/dates.js');

  assert.equal(formatMonthYear('2025-07'), 'Julio 2025');
  assert.equal(formatMonthYear('2024-01'), 'Enero 2024');
  assert.equal(formatMonthYear('mal'), '');
});

test('T20.10: Header ya no muestra el título visible y sí el h1 oculto', async () => {
  const header = read('components/Layout/Header.jsx');

  assert.ok(!header.includes('header__title'), 'Header conserva la clase del título');
  assert.ok(!header.includes('>Portfolio<'), 'Header aún renderiza el título visible');
  assert.ok(header.includes('sr-only'), 'Header no tiene el h1 oculto');
  assert.ok(header.includes('t(\'a11y.h1\')'), 'El h1 debe salir de t()');
  assert.ok(header.includes('LangSwitcher'), 'Header no monta el selector de idioma');

  // RF-7: el h1 oculto y el <title> deben cambiar al cambiar de idioma.
  const es = (await import('../src/i18n/es.js')).default;
  const ca = (await import('../src/i18n/ca.js')).default;
  const en = (await import('../src/i18n/en.js')).default;

  for (const clave of ['a11y.h1', 'doc.titulo']) {
    const textos = [es[clave], ca[clave], en[clave]];
    assert.ok(
      new Set(textos).size === 3,
      `${clave} debe ser distinto en los tres idiomas, no hace más que ${JSON.stringify(textos)}`
    );
  }
});

test('T20.11: Footer ya no usa h1 y conserva el año', () => {
  const footer = read('components/Layout/Footer.jsx');

  assert.ok(!footer.includes('<h1'), 'El pie aún tiene un <h1>');
  assert.ok(footer.includes(String(new Date().getFullYear())), 'El pie debe seguir mostrando el año');
});

test('T20.12: client.js expone err.status y no descarta el mensaje del servidor', () => {
  const client = read('api/client.js');

  assert.ok(!client.includes('HTTP error! status:'), 'client.js sigue tirando el mensaje del backend');
  assert.ok(client.includes('error.status'), 'client.js no adjunta el código HTTP');
  assert.ok(client.includes('response.message') || client.includes('data?.message'), 'client.js no lee el mensaje del backend');
});

test('T20.13: useContact detecta el límite de envíos por código, no por texto', () => {
  const contact = read('hooks/useContact.js');

  assert.ok(!contact.includes("includes('429')"), 'useContact sigue detectando el 429 por el texto');
  assert.ok(contact.includes('429'), 'useContact no contempla el 429');
});

test('T20.14: SetLocale se aplica global, también a rutas no registradas', () => {
  const bootstrap = readFileSync(join(rootDir, '..', 'Laravel', 'bootstrap', 'app.php'), 'utf8');

  assert.ok(bootstrap.includes('SetLocale'), 'No se registra el middleware SetLocale');
  assert.ok(
    bootstrap.includes('append(SetLocale'),
    'SetLocale debe ser global para cubrir también las peticiones que no coinciden con ninguna ruta'
  );
});

test('T20.15: Existen los archivos de idioma es y ca en Laravel', () => {
  const langDir = join(rootDir, '..', 'Laravel', 'lang');

  for (const idioma of ['es', 'ca', 'en']) {
    assert.ok(existsSync(join(langDir, idioma, 'validation.php')), `Falta lang/${idioma}/validation.php`);
  }
});

test('T20.16: El backend responde solo con message en los errores', () => {
  const bootstrap = readFileSync(join(rootDir, '..', 'Laravel', 'bootstrap', 'app.php'), 'utf8');

  assert.ok(bootstrap.includes('shouldRenderJsonWhen'), 'No hay manejo de excepciones');
  assert.ok(bootstrap.includes('$exceptions->render('), 'No hay limpieza de la respuesta de error');
  assert.ok(
    bootstrap.includes("['message' =>"),
    'La respuesta de error debe limitarse al campo message (sin exception, file ni line)'
  );
  assert.ok(!bootstrap.includes("'exception'"), 'No debe devolverse el detalle exception');
});

test('T20.17: package.json no ha ganado dependencias', () => {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['react', 'react-dom', 'react-router-dom']);
});

test('T20.18: Ninguna cadena dura conocida queda en los componentes', () => {
  const duras = [
    "'Ha ocurrido un error inesperado'",
    "'Recarga la página'",
    "'No hay datos disponibles'",
    "'Cargando'",
    "'Credenciales incorrectas'",
    "'No se pudo guardar. Revisa que los campos obligatorios estén completos y que los datos sean válidos.'",
    "'No se pudieron cargar los usuarios.'",
    "'La imagen debe estar en formato JPG, PNG o WebP.'",
    "'La imagen no puede superar los 2 MB.'",
    "'Mensaje enviado. Te responderé pronto.'",
    "HTTP error! status:",
    ">Iniciar sesión<",
    ">Enviar mensaje<",
    ">Crear usuario<",
    ">Ver proyecto<",
  ];

  const ficheros = [
    'components/ErrorMessage.jsx',
    'components/EmptyData.jsx',
    'components/Loading.jsx',
    'components/sections/Contacto.jsx',
    'components/sections/Proyectos.jsx',
    'pages/Login.jsx',
    'components/admin/UserManager.jsx',
    'components/admin/PhotoUploader.jsx',
    'pages/admin/AdminFormacion.jsx',
    'pages/admin/AdminExperiencia.jsx',
    'pages/admin/AdminProyectos.jsx',
    'api/client.js',
  ];

  for (const file of ficheros) {
    const contenido = read(file);
    for (const cadena of duras) {
      assert.ok(
        !contenido.includes(cadena),
        `${file} aún contiene la cadena dura ${cadena}`
      );
    }
  }
});

test('T20.19: El idioma del panel y de la web pública usa el mismo selector', () => {
  const header = read('components/Layout/Header.jsx');
  const admin = read('pages/admin/AdminLayout.jsx');

  assert.ok(header.includes('LangSwitcher'), 'La cabecera pública no monta LangSwitcher');
  assert.ok(admin.includes('LangSwitcher'), 'El panel no monta LangSwitcher');
});
