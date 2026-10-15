import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T7.1: Todos los ficheros del frontend existen', () => {
  const files = [
    'src/api/client.js',
    'src/hooks/useFetch.js',
    'src/hooks/useAuth.jsx',
    'src/components/Loading.jsx',
    'src/components/ErrorMessage.jsx',
    'src/components/EmptyData.jsx',
    'src/components/sections/Inicio.jsx',
    'src/components/sections/Formacion.jsx',
    'src/components/sections/Experiencia.jsx',
    'src/components/sections/Proyectos.jsx',
    'src/pages/Login.jsx',
    'src/pages/admin/AdminLayout.jsx',
    'src/pages/admin/AdminPerfil.jsx',
    'src/pages/admin/AdminFormacion.jsx',
    'src/pages/admin/AdminExperiencia.jsx',
    'src/pages/admin/AdminProyectos.jsx',
  ];

  for (const file of files) {
    assert.ok(existsSync(join(rootDir, file)), `Falta el fichero ${file}`);
  }
});

test('T7.1: Estilos admin existen', () => {
  const content = readFileSync(join(rootDir, 'src/styles/admin.css'), 'utf8');
  assert.ok(content, 'admin.css está vacío');
});
