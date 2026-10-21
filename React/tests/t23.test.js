import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const app = read('src/App.jsx');
const navButtons = read('src/components/Navigation/NavButtons.jsx');

// Bloque <BottomSheet ...> ... </BottomSheet> de App.jsx
const hoja = (() => {
  const start = app.indexOf('<BottomSheet');
  if (start === -1) return '';
  const end = app.indexOf('</BottomSheet>', start);
  return end === -1 ? app.slice(start) : app.slice(start, end);
})();

test('T23.1: el botón flotante conmuta la hoja', () => {
  const line = app.split('\n').find((l) => l.includes('<FloatingButton')) || '';
  assert.ok(line, 'App.jsx debe renderizar FloatingButton');
  assert.ok(
    !line.includes('setIsSheetOpen(true)'),
    'El botón no debe fijar siempre true: debe poder cerrar la hoja'
  );
  assert.ok(
    /setIsSheetOpen\([\s\S]*=>\s*!/.test(line),
    `El botón debe conmutar el estado con un callback. Línea: ${line.trim()}`
  );
});

test('T23.2: la hoja pasa onNavigate a NavButtons', () => {
  assert.ok(hoja.includes('<NavButtons'), 'La hoja debe contener NavButtons');
  assert.ok(hoja.includes('onNavigate'), 'La hoja debe pasar onNavigate a NavButtons');
  assert.ok(
    hoja.includes('setIsSheetOpen(false)'),
    'onNavigate debe cerrar la hoja'
  );
});

test('T23.3: NavButtons acepta onNavigate', () => {
  assert.ok(
    /function NavButtons\(\{[^}]*onNavigate/.test(navButtons),
    'NavButtons debe aceptar la prop onNavigate'
  );
});

test('T23.4: NavButtons ejecuta onNavigate tras cambiar de sección', () => {
  const goIdx = navButtons.indexOf('const go =');
  assert.ok(goIdx !== -1, 'Falta el helper go');
  const setIdx = navButtons.indexOf('setActiveSection(id)', goIdx);
  const navIdx = navButtons.indexOf('onNavigate(', goIdx);
  assert.ok(setIdx !== -1, 'go debe llamar a setActiveSection');
  assert.ok(navIdx !== -1, 'go debe llamar a onNavigate');
  assert.ok(navIdx > setIdx, 'onNavigate debe ejecutarse después de setActiveSection');
});

test('T23.5: los botones usan go en vez de setActiveSection directo', () => {
  assert.ok(navButtons.includes('go(id)'), 'Los botones de sección deben llamar a go(id)');
  assert.ok(navButtons.includes("go('Login')"), 'El botón Login debe llamar a go(\'Login\')');
});
