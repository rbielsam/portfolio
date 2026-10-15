import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T3.2: usePermissions.js existe y exporta el hook', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/usePermissions.js'), 'utf8');
  assert.ok(content.includes('useAuth'), 'Debe integrarse con useAuth');
  assert.ok(content.includes('export'), 'Debe exportar el hook');
});

test('T3.2: usePermissions usa el rol para comprobar permisos', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/usePermissions.js'), 'utf8');
  assert.ok(content.includes('role'), 'Debe leer el rol del usuario');
  assert.ok(content.includes('can'), 'Debe exportar una funcion can()');
});

test('T3.2: Los permisos estan definidos por rol', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/usePermissions.js'), 'utf8');
  assert.ok(content.includes('admin'), 'Debe incluir el rol admin');
  assert.ok(content.includes('editor'), 'Debe incluir el rol editor');
  assert.ok(content.includes('reader'), 'Debe incluir el rol reader');
});

test('T3.2: admin tiene todos los permisos', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/usePermissions.js'), 'utf8');
  for (const perm of ['profile', 'education', 'experience', 'projects', 'messages', 'users']) {
    assert.ok(
      content.includes(perm),
      `Falta el permiso ${perm} en la definicion`
    );
  }
});
