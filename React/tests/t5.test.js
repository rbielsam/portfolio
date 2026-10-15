import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T5.1: Login.jsx existe y tiene formulario', () => {
  const content = readFileSync(join(rootDir, 'src/pages/Login.jsx'), 'utf8');
  assert.ok(content.includes('email'), 'Falta email en Login');
  assert.ok(content.includes('password'), 'Falta password en Login');
  assert.ok(content.includes('useAuth'), 'Falta useAuth en Login');
  assert.ok(content.includes('login'), 'Falta llamada a login en Login');
});

test('T5.1: Login.jsx muestra mensaje de error', () => {
  const content = readFileSync(join(rootDir, 'src/pages/Login.jsx'), 'utf8');
  assert.ok(content.includes("t('login.error_credenciales')"), 'Falta la clave de error en Login');
});

test('T5.1: Login.jsx no almacena el token en el navegador', () => {
  const content = readFileSync(join(rootDir, 'src/pages/Login.jsx'), 'utf8');
  assert.ok(!content.includes('localStorage'), 'Login no debe usar localStorage');
  assert.ok(!content.includes('sessionStorage'), 'Login no debe usar sessionStorage');
});
