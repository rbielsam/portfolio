import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const loginContent = readFileSync(join(rootDir, 'src/pages/Login.jsx'), 'utf8');
const loginCss = readFileSync(join(rootDir, 'src/styles/login.css'), 'utf8');

test('T13.1: Login.jsx tiene el botón de volver con su clase', () => {
  assert.ok(loginContent.includes('login__back'), 'Falta la clase login__back en Login');
});

test('T13.2: El botón de volver tiene nombre accesible', () => {
  assert.ok(
    loginContent.includes("aria-label={t('nav.volver_inicio')}"),
    'Falta el nombre accesible del botón de volver'
  );
});

test('T13.3: El clic del botón lleva a la sección Inicio', () => {
  assert.ok(loginContent.includes('useSection'), 'Login debe usar useSection');
  assert.ok(
    loginContent.includes("setActiveSection('Inicio')"),
    'El botón debe llamar a setActiveSection(\'Inicio\')'
  );
});

test('T13.4: El botón de volver no envía el formulario', () => {
  assert.ok(
    loginContent.includes('type="button"'),
    'El botón de volver debe ser type="button" para no enviar el formulario'
  );
});

test('T13.5: El icono de flecha está oculto para lectores de pantalla', () => {
  assert.ok(loginContent.includes('aria-hidden="true"'), 'Falta aria-hidden en el icono de flecha');
});

test('T13.6: login.css define los estilos del botón de volver', () => {
  assert.ok(loginCss.includes('.login__back'), 'Falta la regla .login__back en login.css');
  assert.ok(
    loginCss.includes('.login__back:focus-visible'),
    'Falta el estado de foco visible del botón de volver'
  );
});
