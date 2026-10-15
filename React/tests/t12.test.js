import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T3.4: UserManager.jsx existe', () => {
  assert.ok(
    existsSync(join(rootDir, 'src/components/admin/UserManager.jsx')),
    'Falta UserManager.jsx'
  );
});

test('T3.4: Lista usuarios con nombre, email y rol', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/UserManager.jsx'), 'utf8');
  assert.ok(content.includes('/admin/users'), 'Falta el endpoint de usuarios');
  assert.ok(content.includes('name'), 'Falta mostrar el nombre');
  assert.ok(content.includes('email'), 'Falta mostrar el email');
  assert.ok(content.includes('role'), 'Falta mostrar el rol');
});

test('T3.4: Permite crear usuario con formulario', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/UserManager.jsx'), 'utf8');
  assert.ok(content.includes("t('usuarios.crear')"), 'Falta el boton de crear');
  assert.ok(content.includes('password'), 'Falta el campo de contrasena');
  assert.ok(content.includes('password_confirmation'), 'Falta confirmar contrasena');
});

test('T3.4: Permite editar y eliminar usuarios', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/UserManager.jsx'), 'utf8');
  assert.ok(content.includes("t('common.editar')"), 'Falta el boton de editar');
  assert.ok(content.includes("t('common.eliminar')"), 'Falta el boton de eliminar');
});

test('T3.4: Muestra el rol seleccionado en el formulario', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/UserManager.jsx'), 'utf8');
  assert.ok(content.includes("t('usuarios.rol_admin')"), 'Falta la opcion Administrador');
  assert.ok(content.includes("t('usuarios.rol_editor')"), 'Falta la opcion Editor');
  assert.ok(content.includes("t('usuarios.rol_reader')"), 'Falta la opcion Solo lectura');
});

test('T3.4: Muestra estados de carga y error', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/UserManager.jsx'), 'utf8');
  assert.ok(content.includes('loading'), 'Falta el estado de carga');
  assert.ok(content.includes('error'), 'Falta el manejo de error');
});

test('T3.5: Existe la vista AdminUsuarios', () => {
  assert.ok(
    existsSync(join(rootDir, 'src/pages/admin/AdminUsuarios.jsx')),
    'Falta AdminUsuarios.jsx'
  );
});

test('T3.5: AdminLayout incluye la entrada Usuarios', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminLayout.jsx'), 'utf8');
  assert.ok(content.includes('Usuarios'), 'Falta la entrada Usuarios en el menu');
});

test('T3.5: La entrada Usuarios solo se muestra para admin', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminLayout.jsx'), 'utf8');
  assert.ok(content.includes('usePermissions'), 'Debe usar usePermissions');
  assert.ok(content.includes("can('users')"), 'Debe comprobar el permiso de usuarios');
});

test('T3.6: Los botones de contenido se ocultan para reader', () => {
  const admin = readFileSync(join(rootDir, 'src/pages/admin/AdminPerfil.jsx'), 'utf8');
  assert.ok(admin.includes('usePermissions') || admin.includes('can('), 'Debe usar permisos');
});
