import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T6.1: AdminLayout.jsx tiene menú lateral y logout', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminLayout.jsx'), 'utf8');
  assert.ok(content.includes("'admin.perfil'"), 'Falta enlace Perfil en AdminLayout');
  assert.ok(content.includes("'seccion.formacion'"), 'Falta enlace Formación en AdminLayout');
  assert.ok(content.includes("'seccion.experiencia'"), 'Falta enlace Experiencia en AdminLayout');
  assert.ok(content.includes("'seccion.proyectos'"), 'Falta enlace Proyectos en AdminLayout');
  assert.ok(content.includes('logout'), 'Falta logout en AdminLayout');
  assert.ok(content.includes('onExit'), 'Falta onExit para volver al portfolio');
});

test('T6.2-T6.5: Vistas admin existen y usan la API', () => {
  const views = ['AdminPerfil.jsx', 'AdminFormacion.jsx', 'AdminExperiencia.jsx', 'AdminProyectos.jsx'];
  for (const view of views) {
    const content = readFileSync(join(rootDir, 'src/pages/admin', view), 'utf8');
    assert.ok(content.includes('api'), `Falta api en ${view}`);
  }
});

test('T6.1: Las vistas admin registran operaciones de escritura', () => {
  const views = ['AdminFormacion.jsx', 'AdminExperiencia.jsx', 'AdminProyectos.jsx'];
  for (const view of views) {
    const content = readFileSync(join(rootDir, 'src/pages/admin', view), 'utf8');
    assert.ok(content.includes('post'), `Falta POST en ${view}`);
    assert.ok(content.includes('put'), `Falta PUT en ${view}`);
    assert.ok(content.includes('delete'), `Falta DELETE en ${view}`);
  }
});
