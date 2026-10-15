import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T4.2: PhotoUploader.jsx existe', () => {
  assert.ok(
    existsSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx')),
    'Falta PhotoUploader.jsx'
  );
});

test('T4.2: Acepta solo los formatos permitidos', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(content.includes('ACCEPTED_TYPES'), 'Falta la lista de formatos aceptados');
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    assert.ok(content.includes(ext), `Falta el formato ${ext} en la lista`);
  }
});

test('T4.2: Valida el peso maximo de 2 MB en cliente', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(content.includes('MAX_SIZE'), 'Falta la constante de peso maximo');
  assert.ok(content.includes('1024'), 'Falta la conversion a KB');
});

test('T4.2: Muestra previsualizacion de la imagen elegida', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(content.includes('createObjectURL') || content.includes('preview'), 'Falta la previsualizacion');
  assert.ok(content.includes('<img'), 'Falta el elemento img de la previsualizacion');
});

test('T4.2: Envia con POST o PUT segun exista foto previa', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(content.includes('/profile/photo'), 'Falta el endpoint de foto');
  assert.ok(content.includes('FormData'), 'Debe enviar FormData');
  assert.ok(
    content.includes("'POST'") && content.includes("'PUT'"),
    'Debe elegir entre POST y PUT'
  );
});

test('T4.2: No fija Content-Type al enviar FormData', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(
    !content.includes("'Content-Type': 'application/json'"),
    'No debe forzar Content-Type json con FormData (rompe el boundary)'
  );
});

test('T4.2: Tiene botones de guardar y cancelar, y estado de carga', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(content.includes("t('perfil.guardar_foto')"), 'Falta el boton Guardar');
  assert.ok(content.includes("t('common.cancelar')"), 'Falta el boton Cancelar');
  assert.ok(content.includes('loading'), 'Falta el estado de carga');
});

test('T4.2: Muestra el error del servidor', () => {
  const content = readFileSync(join(rootDir, 'src/components/admin/PhotoUploader.jsx'), 'utf8');
  assert.ok(content.includes('error'), 'Falta el manejo de error');
});

test('T4.3: AdminPerfil incluye PhotoUploader', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminPerfil.jsx'), 'utf8');
  assert.ok(content.includes('PhotoUploader'), 'AdminPerfil no incluye PhotoUploader');
});

test('T4.3: AdminPerfil ya no mantiene el campo URL de foto', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminPerfil.jsx'), 'utf8');
  assert.ok(
    !content.includes('URL Foto'),
    'El campo de URL de foto debe desaparecer (ahora se sube el fichero)'
  );
});
