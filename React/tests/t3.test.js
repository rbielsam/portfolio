import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T3.1: Loading.jsx existe y muestra cargando', () => {
  const content = readFileSync(join(rootDir, 'src/components/Loading.jsx'), 'utf8');
  assert.ok(content.includes("t('common.cargando')"), 'Falta la clave de cargando en Loading');
});

test('T3.2: ErrorMessage.jsx existe y tiene botón recarga', () => {
  const content = readFileSync(join(rootDir, 'src/components/ErrorMessage.jsx'), 'utf8');
  assert.ok(content.includes("t('common.recargar')"), 'Falta la clave de recarga en ErrorMessage');
  assert.ok(content.includes('window.location.reload'), 'Falta reload en ErrorMessage');
});

test('T3.3: EmptyData.jsx existe y muestra mensaje', () => {
  const content = readFileSync(join(rootDir, 'src/components/EmptyData.jsx'), 'utf8');
  assert.ok(content.includes("t('common.sin_datos')"), 'Falta la clave de mensaje en EmptyData');
});
