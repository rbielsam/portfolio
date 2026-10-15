import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const admin = read('src/styles/admin.css');
const switcher = read('src/components/Language/LangSwitcher.jsx');

const SELECTOR = '.admin__nav .lang-switcher__menu';

// Devuelve el cuerpo de la regla que empieza exactamente en `selector {`
function rule(source, selector) {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) return '';
  const end = source.indexOf('}', start);
  return source.slice(start, end);
}

// Devuelve el cuerpo completo de una función declarada en `source`
function cuerpoDeFuncion(source, nombre) {
  const inicio = source.indexOf(nombre);
  if (inicio === -1) return '';
  const llave = source.indexOf('{', inicio);
  if (llave === -1) return '';

  let nivel = 0;
  for (let i = llave; i < source.length; i += 1) {
    if (source[i] === '{') nivel += 1;
    else if (source[i] === '}') {
      nivel -= 1;
      if (nivel === 0) return source.slice(llave, i + 1);
    }
  }
  return '';
}

// Devuelve la posición de la llave de cierre del bloque que empieza en `inicio`
function finDeBloque(source, inicio) {
  let nivel = 0;
  for (let i = inicio; i < source.length; i += 1) {
    if (source[i] === '{') nivel += 1;
    else if (source[i] === '}') {
      nivel -= 1;
      if (nivel === 0) return i;
    }
  }
  return -1;
}

// RF-1: el menú se ancla al borde izquierdo del botón
test('T21.1: admin.css ancla el menú del selector a la barra lateral', () => {
  assert.ok(admin.includes(SELECTOR), `Falta la regla ${SELECTOR} en admin.css`);
});

test('T21.2: la regla ancla por la izquierda y libera la derecha', () => {
  const cuerpo = rule(admin, SELECTOR);
  assert.ok(cuerpo, `No se pudo extraer el cuerpo de ${SELECTOR}`);

  assert.match(cuerpo, /left:\s*0/, `${SELECTOR} debe declarar left: 0`);
  assert.match(
    cuerpo,
    /right:\s*auto/,
    'Sin right: auto la regla base deja right: 0 y el menú se estira a todo el ancho disponible'
  );
});

// D3: dentro del @media la barra lateral está oculta, así que la regla quedaría muerta
test('T21.3: la regla queda fuera del bloque @media móvil', () => {
  const inicioMedia = admin.indexOf('@media (max-width: 768px)');
  assert.ok(inicioMedia !== -1, 'admin.css debe seguir teniendo su @media móvil');

  const finMedia = finDeBloque(admin, inicioMedia);
  assert.ok(finMedia !== -1, 'No se pudo localizar el cierre del bloque @media');

  const regla = admin.indexOf(`${SELECTOR} {`);
  assert.ok(regla !== -1, `Falta la regla ${SELECTOR}`);

  assert.ok(
    !(regla > inicioMedia && regla < finMedia),
    'La regla va fuera del @media: dentro, la barra lateral está oculta y la regla no llegaría a aplicarse'
  );
});

// D4: solo reposiciona horizontalmente; el posicionamiento es de la spec 015
test('T21.4: la regla no cambia el posicionamiento base del menú', () => {
  const cuerpo = rule(admin, SELECTOR);
  assert.ok(cuerpo, `No se pudo extraer el cuerpo de ${SELECTOR}`);

  for (const propiedad of ['position', 'top', 'min-width']) {
    assert.ok(
      !new RegExp(`(^|[;{\\s])${propiedad}\\s*:`).test(cuerpo),
      `La regla no debe declarar ${propiedad}: eso lo fija la spec 015`
    );
  }
});

// RF-3: la variante oscura se usa también en la barra superior móvil, que sí funciona
test('T21.5: solo la barra lateral cambia de anclaje', () => {
  const reglas = admin.match(/[^{}]*lang-switcher__menu[^{}]*\{[^}]*\}/g) || [];
  const queAnclan = reglas.filter((regla) => /(^|[;{\s])(left|right)\s*:/.test(regla));

  assert.equal(
    queAnclan.length,
    1,
    `Solo debe haber una regla que mueva el anclaje horizontal del menú: la de la barra lateral. Hay ${queAnclan.length}: ${queAnclan.join(' | ')}`
  );
  assert.ok(
    queAnclan[0].includes(SELECTOR),
    'La única regla que mueve el anclaje debe ser la de .admin__nav, para no tocar la barra superior móvil'
  );
});

// RF-4: el foco vuelve al botón al cerrarse
test('T21.6: el botón del selector puede recibir el foco', () => {
  assert.ok(
    switcher.includes('ref={botonRef}'),
    'El botón necesita una referencia para poder devolverle el foco'
  );
  assert.ok(
    /const botonRef = useRef\(/.test(switcher),
    'Falta declarar botonRef con useRef'
  );
});

test('T21.7: cerrar con Escape devuelve el foco al botón', () => {
  const cuerpo = cuerpoDeFuncion(switcher, 'function cerrarConTecla');
  assert.ok(cuerpo, 'No se pudo extraer el cuerpo de cerrarConTecla');

  assert.match(
    cuerpo,
    /botonRef\.current\?\.focus\(\)/,
    'Escape deja el foco en <body>; hay que devolverlo al botón del selector'
  );
});

test('T21.8: elegir una opción devuelve el foco al botón', () => {
  const cuerpo = cuerpoDeFuncion(switcher, 'function elegir');
  assert.ok(cuerpo, 'No se pudo extraer el cuerpo de elegir');

  assert.match(
    cuerpo,
    /botonRef\.current\?\.focus\(\)/,
    'La opción deja de existir al cerrar el menú; hay que devolver el foco al botón'
  );
});

test('T21.9: cerrar por clic fuera no roba el foco', () => {
  const cuerpo = cuerpoDeFuncion(switcher, 'function cerrarFuera');
  assert.ok(cuerpo, 'No se pudo extraer el cuerpo de cerrarFuera');

  assert.ok(
    !/\.focus\(/.test(cuerpo),
    'El foco debe seguir el sitio donde se ha hecho clic: cerrarFuera solo cierra'
  );
});
