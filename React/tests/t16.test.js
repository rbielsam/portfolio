import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const uploader = read('src/components/admin/PhotoUploader.jsx');
const inicio = read('src/components/sections/Inicio.jsx');
const chip = read('src/components/Navigation/SessionChip.jsx');

test('T16.1: PhotoUploader importa photoUrl desde utils/initials.js', () => {
  assert.ok(
    /import\s*\{[^}]*photoUrl[^}]*\}/.test(uploader),
    'PhotoUploader debe importar photoUrl'
  );
  assert.ok(
    /from\s*['"][^'"]*utils\/initials\.js['"]/.test(uploader),
    'PhotoUploader debe importar desde utils/initials.js'
  );
});

test('T16.2: La URL de la foto guardada se construye con photoUrl(currentPhoto)', () => {
  assert.ok(
    /photoUrl\(\s*currentPhoto\s*\)/.test(uploader),
    'Debe aplicarse photoUrl() a currentPhoto (RF-1)'
  );
});

test('T16.3: Se conserva el orden preview || photoUrl(...)', () => {
  assert.ok(
    /preview\s*\|\|\s*photoUrl\(/.test(uploader),
    'La previsualización local debe tener preferencia sobre la foto guardada (RF-2)'
  );
});

test('T16.4: preview NO se pasa por photoUrl (rompería el blob:)', () => {
  assert.ok(
    !/photoUrl\(\s*preview\s*\)/.test(uploader),
    'preview es un blob: local y no debe resolverse contra /storage (RF-2)'
  );
});

test('T16.5: El <img> declara onError', () => {
  assert.ok(/onError\s*=\s*\{/.test(uploader), 'Debe gestionarse el fallo de carga (RF-3)');
});

test('T16.6: La zona de vista previa conserva el marcador de respaldo', () => {
  assert.ok(
    uploader.includes('photo-uploader__placeholder'),
    'Debe seguir renderizándose photo-uploader__placeholder'
  );
});

test('T16.7: Inicio y el indicador de sesión siguen usando photoUrl (regresión)', () => {
  assert.ok(inicio.includes('photoUrl'), 'Inicio debe seguir usando photoUrl (spec 005)');
  assert.ok(chip.includes('photoUrl'), 'SessionChip debe seguir usando photoUrl (spec 010)');
});
