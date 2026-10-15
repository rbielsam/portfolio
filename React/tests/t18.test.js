import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const layout = read('src/components/Layout/Layout.jsx');
const app = read('src/App.jsx');
const navigation = read('src/styles/navigation.css');

// Devuelve el cuerpo de la regla CSS que empieza exactamente en `selector {`
const rule = (source, selector) => {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) return '';
  const end = source.indexOf('}', start);
  return source.slice(start, end);
};

const navButtonsRule = rule(navigation, '.nav-buttons');
const navMobileRule = (() => {
  const media = navigation.indexOf('@media (max-width: 768px)');
  if (media === -1) return '';
  const start = navigation.indexOf('.nav-buttons {', media);
  if (start === -1) return '';
  const end = navigation.indexOf('}', start);
  return navigation.slice(start, end);
})();

// RF-1: la navegación ocupa siempre el mismo sitio, debajo del título
test('T18.1: Layout renderiza {nav} entre Header y la zona de contenido', () => {
  const header = layout.indexOf('<Header');
  const nav = layout.indexOf('{nav}');
  const content = layout.indexOf('layout__content');

  assert.ok(header !== -1, 'Layout no renderiza Header');
  assert.ok(nav !== -1, 'Layout no renderiza la propiedad {nav}');
  assert.ok(content !== -1, 'Layout no tiene zona de contenido');
  assert.ok(nav > header, '{nav} debe ir DESPUÉS del Header');
  assert.ok(nav < content, '{nav} debe ir ANTES de layout__content');
});

test('T18.2: Layout sigue importando y renderizando Header y Footer', () => {
  assert.ok(layout.includes('Header'), 'Layout no importa Header');
  assert.ok(layout.includes('Footer'), 'Layout no importa Footer');
  assert.ok(layout.includes('<Header'), 'Layout no renderiza Header');
  assert.ok(layout.includes('<Footer'), 'Layout no renderiza Footer');
});

test('T18.3: Layout acepta la navegación como propiedad opcional', () => {
  assert.ok(
    /function Layout\(\{[^}]*\bnav\b/.test(layout),
    'Layout no destructura la propiedad nav'
  );
  assert.ok(layout.includes('export default Layout'), 'Layout sin export default');
});

test('T18.4: App.jsx entrega la navegación por la propiedad nav', () => {
  const navLine = app.split('\n').find((line) => line.includes('nav='));
  assert.ok(navLine, 'App.jsx no pasa ninguna propiedad nav a Layout');
  assert.ok(navLine.includes('<NavButtons'), 'nav= debe contener <NavButtons />');
});

test('T18.5: App.jsx no mete NavButtons dentro de children de Layout', () => {
  const hoja = app.slice(app.indexOf('<BottomSheet'), app.indexOf('</BottomSheet>'));
  assert.ok(hoja.includes('<NavButtons'), 'La navegación móvil debe ir dentro de BottomSheet');

  const sinHoja = app.replace(hoja, '');
  const usos = sinHoja.match(/<NavButtons/g) || [];
  assert.equal(
    usos.length,
    1,
    'Fuera de la hoja, NavButtons debe aparecer una sola vez: en la propiedad nav de Layout'
  );
});

test('T18.6: App.jsx conserva el botón flotante y la hoja inferior de móvil', () => {
  assert.ok(app.includes('FloatingButton'), 'App.jsx perdió FloatingButton');
  assert.ok(app.includes('BottomSheet'), 'App.jsx perdió BottomSheet');
  assert.ok(app.includes('isMobile'), 'App.jsx perdió la detección móvil');
});

test('T18.7: La navegación queda pegada arriba al desplazarse', () => {
  assert.ok(navButtonsRule, 'No se encontró la regla .nav-buttons');
  assert.ok(
    navButtonsRule.includes('position: sticky'),
    '.nav-buttons debe usar position: sticky'
  );
  assert.ok(navButtonsRule.includes('top: 0'), '.nav-buttons debe anclarse en top: 0');
});

test('T18.8: La navegación tiene fondo opaco para que el contenido no la atraviese', () => {
  assert.ok(
    navButtonsRule.includes('background-color'),
    '.nav-buttons necesita background-color opaco'
  );
  assert.ok(
    !/background(-color)?\s*:\s*(transparent|none)/.test(navButtonsRule),
    '.nav-buttons no puede ser transparente: el contenido se le vería'
  );
});

test('T18.9: La navegación ocupa todo el ancho, sin franjas laterales', () => {
  assert.ok(
    navButtonsRule.includes('margin-inline'),
    'Sin margin-inline negativo quedan 2rem de layout a cada lado por los que se cuela el contenido'
  );
  assert.ok(
    navButtonsRule.includes('padding-inline'),
    'padding-inline debe devolver a los botones su posición original'
  );
});

test('T18.10: La navegación se coloca por encima del contenido pero debajo de lo flotante', () => {
  assert.ok(navButtonsRule.includes('z-index'), '.nav-buttons necesita z-index');
  const zIndex = Number(navButtonsRule.match(/z-index:\s*(\d+)/)?.[1]);
  assert.ok(zIndex > 0 && zIndex < 999, 'z-index debe superar al contenido y ceder a 999');
});

test('T18.11: Se conserva el comportamiento responsive de móvil', () => {
  assert.ok(
    navigation.includes('@media (max-width: 768px)'),
    'Se ha perdido el corte móvil de 768px'
  );
  assert.ok(navMobileRule.includes('.nav-buttons'), 'El corte móvil ya no afecta a .nav-buttons');
});
