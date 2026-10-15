import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T2.3: useAuth.js existe y expone login, logout y user', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useAuth.jsx'), 'utf8');
  assert.ok(content.includes('const login'), 'Falta login en useAuth');
  assert.ok(content.includes('const logout'), 'Falta logout en useAuth');
  assert.ok(content.includes('user'), 'Falta user en useAuth');
});

test('T2.3: useAuth usa cookie (sin tokens en el navegador)', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useAuth.jsx'), 'utf8');
  assert.ok(!content.includes('localStorage'), 'useAuth no debe usar localStorage');
  assert.ok(!content.includes('sessionStorage'), 'useAuth no debe usar sessionStorage');
  assert.ok(!content.includes('createToken'), 'useAuth no debe crear tokens');
});

test('T2.3: useAuth obtiene el cookie CSRF antes de autenticar', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useAuth.jsx'), 'utf8');
  assert.ok(content.includes('fetchCsrfCookie'), 'Falta fetchCsrfCookie en useAuth');
});

test('T2.3: useAuth es un provider de contexto compartido', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useAuth.jsx'), 'utf8');
  assert.ok(content.includes('AuthProvider'), 'Falta AuthProvider en useAuth');
  assert.ok(content.includes('createContext'), 'Falta createContext en useAuth');
});
