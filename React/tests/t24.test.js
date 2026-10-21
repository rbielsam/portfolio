import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const inicio = read('src/components/sections/Inicio.jsx');
const sessionChip = read('src/components/Navigation/SessionChip.jsx');
const adminPerfil = read('src/pages/admin/AdminPerfil.jsx');

test('T24.1: la portada prefiere photo_url y mantiene photoUrl', () => {
  assert.ok(inicio.includes('data.photo_url'), 'Inicio debe preferir photo_url');
  assert.ok(inicio.includes('photoUrl('), 'Inicio debe seguir usando el helper photoUrl');
  assert.ok(inicio.includes('data.photo'), 'Inicio debe caer a photo si no hay photo_url');
});

test('T24.2: el chip de sesión prefiere photo_url', () => {
  assert.ok(sessionChip.includes('profile?.photo_url'), 'SessionChip debe preferir photo_url');
  assert.ok(sessionChip.includes('profile?.photo'), 'SessionChip debe caer a photo');
  assert.ok(sessionChip.includes('photoUrl('), 'SessionChip debe seguir usando photoUrl');
});

test('T24.3: el panel prefiere photo_url', () => {
  assert.ok(adminPerfil.includes('data?.photo_url'), 'AdminPerfil debe preferir photo_url');
  assert.ok(adminPerfil.includes('data?.photo'), 'AdminPerfil debe caer a photo');
});
