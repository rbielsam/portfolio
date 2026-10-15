import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const variables = read('src/styles/variables.css');
const admin = read('src/styles/admin.css');
const photoUploader = read('src/styles/photo-uploader.css');
const states = read('src/styles/states.css');
const contact = read('src/styles/contact.css');
const adminLayout = read('src/pages/admin/AdminLayout.jsx');
const bottomSheet = read('src/components/Navigation/BottomSheet.jsx');
const app = read('src/App.jsx');

// Hex sueltos de verdad: descarta selectores tipo #root
const hexCount = (src) => (src.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g) || []).length;

// RF-1: el panel tiene su propio sistema de tokens
test('T19.1: variables.css define tokens --admin-*', () => {
  assert.ok(variables.includes('--admin-bg'), 'Falta --admin-bg');
  assert.ok(variables.includes('--admin-primary'), 'Falta --admin-primary');
  assert.ok(variables.includes('--admin-danger'), 'Falta --admin-danger');
  assert.ok(variables.includes('--admin-nav-bg'), 'Falta --admin-nav-bg');
});

test('T19.2: variables.css define --color-danger para los estados compartidos', () => {
  assert.ok(variables.includes('--color-danger'), 'Falta --color-danger');
});

test('T19.3: admin.css no contiene ningún hex suelto', () => {
  assert.equal(
    hexCount(admin),
    0,
    `admin.css debe usar solo tokens --admin-*, no hex sueltos (hay ${hexCount(admin)})`
  );
});

test('T19.4: photo-uploader.css no contiene ningún hex suelto', () => {
  assert.equal(
    hexCount(photoUploader),
    0,
    `photo-uploader.css debe usar solo tokens --admin-* (hay ${hexCount(photoUploader)})`
  );
});

// RF-2: los componentes compartidos se adaptan al tema
test('T19.5: .admin reescribe los tokens públicos que states.css necesita', () => {
  const bloque = rule(admin, '.admin');
  assert.ok(bloque.includes('--color-text'), '.admin debe reescribir --color-text');
  assert.ok(bloque.includes('--color-text-muted'), '.admin debe reescribir --color-text-muted');
  assert.ok(bloque.includes('--color-accent'), '.admin debe reescribir --color-accent');
  assert.ok(bloque.includes('--color-danger'), '.admin debe reescribir --color-danger');
});

test('T19.6: states.css no contiene hex sueltos', () => {
  assert.equal(hexCount(states), 0, 'states.css debe usar tokens del sitio');
});

// RF-5: cada fichero de estilos contiene su propia sección
test('T19.7: contact.css ya no contiene estilos del panel', () => {
  assert.ok(!contact.includes('.admin-messages'), 'contact.css aún tiene .admin-messages');
  assert.ok(!contact.includes('.admin-view__badge'), 'contact.css aún tiene .admin-view__badge');
  assert.ok(!contact.includes('.admin'), 'contact.css no debe referenciar el panel');
});

test('T19.8: admin.css contiene los estilos de la bandeja de mensajes', () => {
  assert.ok(admin.includes('.admin-messages'), 'admin.css no tiene .admin-messages');
  assert.ok(admin.includes('.admin-view__badge'), 'admin.css no tiene .admin-view__badge');
});

// RF-3: la navegación se adapta a la pantalla
test('T19.9: AdminLayout detecta el punto de ruptura', () => {
  assert.ok(adminLayout.includes('useMediaQuery'), 'AdminLayout no usa useMediaQuery');
  assert.ok(
    adminLayout.includes('(max-width: 768px)'),
    'AdminLayout debe usar el mismo corte de 768px que la web pública'
  );
});

test('T19.10: AdminLayout reutiliza la hoja inferior', () => {
  assert.ok(adminLayout.includes('BottomSheet'), 'AdminLayout no renderiza BottomSheet');
  assert.ok(
    adminLayout.includes('admin__topbar'),
    'AdminLayout necesita una barra superior para móvil'
  );
});

test('T19.11: El menú del panel se define una sola vez', () => {
  assert.ok(adminLayout.includes('menuItems'), 'AdminLayout debe extraer el menú a una constante');
  const accesos = adminLayout.match(/admin__nav-button(?![-_])/g) || [];
  assert.equal(
    accesos.length,
    3,
    'El menú debe existir una sola vez: 3 botones base (el del mapa, Ver portfolio y Cerrar sesión). Si se duplicara para la hoja, serían 6'
  );
});

test('T19.12: BottomSheet renderiza sus hijos', () => {
  assert.ok(bottomSheet.includes('children'), 'BottomSheet no acepta children');
  assert.ok(
    !bottomSheet.includes('<NavButtons'),
    'BottomSheet ya no debe renderizar NavButtons de forma fija'
  );
});

test('T19.13: App.jsx pasa NavButtons como hijo de BottomSheet', () => {
  const hoja = app.slice(app.indexOf('<BottomSheet'), app.indexOf('</BottomSheet>'));
  assert.ok(hoja.includes('<NavButtons'), 'BottomSheet debe recibir <NavButtons /> como hijo');
});

test('T19.14: admin.css declara el punto de ruptura móvil', () => {
  assert.ok(
    admin.includes('@media (max-width: 768px)'),
    'admin.css necesita un @media (max-width: 768px)'
  );
});

// RF-4: usable a 375px
test('T19.15: Las listas envuelven sus acciones en pantalla estrecha', () => {
  assert.ok(
    rule(admin, '.admin-list__item').includes('flex-wrap'),
    '.admin-list__item debe llevar flex-wrap: wrap'
  );
  assert.ok(
    rule(admin, '.admin-messages__actions').includes('flex-wrap'),
    '.admin-messages__actions debe llevar flex-wrap: wrap'
  );
});

test('T19.16: El menú de la hoja no se oculta en móvil', () => {
  const media = admin.slice(admin.indexOf('@media (max-width: 768px)'));
  const selectores = [...media.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim());

  assert.ok(
    selectores.includes('.admin > .admin__nav'),
    'La barra lateral debe ocultarse solo como hijo directo de .admin'
  );
  assert.ok(
    !selectores.includes('.admin__nav'),
    'Ocultar .admin__nav a secas vaciaría la hoja inferior, que reutiliza esa misma clase'
  );
});

// Devuelve el cuerpo de la regla CSS que empieza exactamente en `selector {`
function rule(source, selector) {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) return '';
  const end = source.indexOf('}', start);
  return source.slice(start, end);
}
