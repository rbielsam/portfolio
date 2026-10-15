import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const views = ['AdminFormacion.jsx', 'AdminExperiencia.jsx', 'AdminProyectos.jsx'];
const adminCss = readFileSync(join(rootDir, 'src/styles/admin.css'), 'utf8');

for (const view of views) {
  const content = readFileSync(join(rootDir, 'src/pages/admin', view), 'utf8');

  test(`T14.1: ${view} ya no oculta el formulario cuando la lista está vacía`, () => {
    assert.ok(
      !content.includes('return <EmptyData />'),
      `${view} sigue devolviendo EmptyData antes del formulario`
    );
    assert.ok(content.includes('EmptyData'), `${view} debe seguir mostrando el estado vacío`);
  });

  test(`T14.2: ${view} tiene botón de añadir siempre disponible`, () => {
    assert.ok(content.includes('showForm'), `Falta el estado showForm en ${view}`);
    assert.ok(content.includes('handleAdd'), `Falta handleAdd en ${view}`);
    assert.ok(content.includes("t('common.añadir')"), `Falta el botón Añadir en ${view}`);
  });

  test(`T14.3: ${view} distingue creación y actualización`, () => {
    assert.ok(
      content.includes("t('common.actualizar') : t('common.crear')"),
      `${view} debe distinguir el botón de actualizar del de crear`
    );
  });

  test(`T14.4: ${view} permite cancelar creación y edición`, () => {
    assert.ok(content.includes('handleCancel'), `Falta handleCancel en ${view}`);
    assert.ok(content.includes("t('common.cancelar')"), `Falta el botón Cancelar en ${view}`);
  });

  test(`T14.5: ${view} conserva las operaciones de escritura`, () => {
    assert.ok(content.includes('post'), `Falta POST en ${view}`);
    assert.ok(content.includes('put'), `Falta PUT en ${view}`);
    assert.ok(content.includes('delete'), `Falta DELETE en ${view}`);
  });
}

test('T14.6: admin.css define las clases que usa la vista de Usuarios', () => {
  const required = [
    '.user-manager',
    '.user-manager__header',
    '.user-list',
    '.user-list__item',
    '.user-list__info',
    '.user-list__actions',
    '.user-role',
    '.admin-btn',
    '.admin-form__title',
    '.admin-form__actions',
    '.admin-error',
    '.admin-view__header',
  ];

  for (const cls of required) {
    assert.ok(adminCss.includes(cls), `Falta la regla ${cls} en admin.css`);
  }
});

test('T14.7: El botón de añadir va acompañado del título de sección', () => {
  for (const view of views) {
    const content = readFileSync(join(rootDir, 'src/pages/admin', view), 'utf8');
    assert.ok(
      content.includes('admin-view__header'),
      `${view} debe agrupar título y botón en admin-view__header`
    );
  }
});

test('T14.8: Un error del servidor al guardar se muestra al usuario', () => {
  for (const view of views) {
    const content = readFileSync(join(rootDir, 'src/pages/admin', view), 'utf8');
    assert.ok(content.includes('formError'), `Falta el estado formError en ${view}`);
    assert.ok(content.includes('admin-error'), `${view} debe mostrar el error dentro del formulario`);
    assert.ok(content.includes('catch'), `${view} debe capturar el fallo del guardado`);
  }
});

test('T14.9: La insignia de rol no queda pisada por el estilo del texto de la lista', () => {
  assert.ok(
    !adminCss.includes('.user-list__info span {'),
    'La regla .user-list__info span pisa color y tamaño de .user-role'
  );
  assert.ok(
    adminCss.includes('.user-list__info span:not(.user-role)'),
    'El texto de la lista debe excluir la insignia de rol'
  );
});
