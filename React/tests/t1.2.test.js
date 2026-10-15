import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..', 'Laravel');

test('T1.2: config/sanctum.php tiene stateful con dominio frontend', () => {
  const config = readFileSync(join(rootDir, 'config/sanctum.php'), 'utf8');
  assert.ok(config.includes('stateful'), 'Falta stateful en sanctum.php');
  assert.ok(config.includes('localhost'), 'Falta localhost en stateful');
});

test('T1.2: config/cors.php tiene credentials y paths correctos', () => {
  const config = readFileSync(join(rootDir, 'config/cors.php'), 'utf8');
  assert.ok(config.includes("'supports_credentials' => true"), 'Falta supports_credentials true');
  assert.ok(config.includes('sanctum/csrf-cookie'), 'Falta sanctum/csrf-cookie en paths');
});

test('T1.2: config/session.php tiene same_site lax', () => {
  const config = readFileSync(join(rootDir, 'config/session.php'), 'utf8');
  assert.ok(config.includes("SESSION_SAME_SITE"), 'Falta SESSION_SAME_SITE en session.php');
  assert.ok(config.includes("'lax'"), 'Falta valor lax por defecto en session.php');
});
