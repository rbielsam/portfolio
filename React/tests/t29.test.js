import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');
const readLaravel = (p) => readFileSync(join(rootDir, '..', 'Laravel', p), 'utf8');
const existsLaravel = (p) => existsSync(join(rootDir, '..', 'Laravel', p));

const migrationPath = 'database/migrations/2026_10_24_120000_add_social_links_to_profile_table.php';

test('T29.1: existe la migración con los dos enlaces opcionales', () => {
  assert.ok(existsLaravel(migrationPath), 'Falta la migración de enlaces sociales');

  const migration = readLaravel(migrationPath);
  assert.ok(migration.includes("Schema::table('profile'"), 'La migración debe modificar la tabla profile');
  assert.ok(migration.includes('github_url'), 'Falta github_url');
  assert.ok(migration.includes('linkedin_url'), 'Falta linkedin_url');
  assert.ok(migration.includes('nullable'), 'Los enlaces deben ser opcionales');
  assert.ok(migration.includes('dropColumn'), 'La migración debe poder revertirse');
});

test('T29.2: el modelo Profile permite guardar los enlaces', () => {
  const profile = readLaravel('app/Models/Profile.php');

  assert.ok(profile.includes("'github_url'"), 'github_url no está en $fillable');
  assert.ok(profile.includes("'linkedin_url'"), 'linkedin_url no está en $fillable');
});

test('T29.3: la API valida las URL como http o https y limita a 255', () => {
  const controller = readLaravel('app/Http/Controllers/Api/ProfileController.php');

  assert.ok(controller.includes("'github_url'"), 'Falta la validación de github_url');
  assert.ok(controller.includes("'linkedin_url'"), 'Falta la validación de linkedin_url');
  assert.ok(controller.includes("'url:http,https'"), 'Debe exigir esquema http o https');
  assert.ok(controller.includes("'max:255'"), 'Debe limitar la longitud a 255');
});

test('T29.4: SocialLinks abre en pestaña nueva y es accesible', () => {
  const social = read('src/components/SocialLinks.jsx');

  assert.ok(social.includes('target="_blank"'), 'Falta target="_blank"');
  assert.ok(social.includes('rel="noopener noreferrer"'), 'Falta rel="noopener noreferrer"');
  assert.ok(social.includes('aria-label'), 'Falta el nombre accesible del pie');
  assert.ok(social.includes('aria-hidden="true"'), 'Los iconos deben ser decorativos');
  assert.ok(social.includes('fill="currentColor"'), 'Los iconos deben heredar el color');
  assert.ok(social.includes('<svg'), 'Faltan los SVG en línea');
  assert.ok(social.includes("variant === 'footer'"), 'Falta la variante del pie');
});

test('T29.5: SocialLinks no reserva espacio cuando no hay enlaces', () => {
  const social = read('src/components/SocialLinks.jsx');

  assert.ok(social.includes('.filter'), 'Debe filtrar los enlaces vacíos');
  assert.ok(social.includes('links.length === 0'), 'Debe devolver null sin enlaces');
  assert.ok(social.includes('return null'), 'Debe devolver null sin enlaces');
});

test('T29.6: Inicio muestra los enlaces debajo de la biografía', () => {
  const inicio = read('src/components/sections/Inicio.jsx');

  assert.ok(inicio.includes("useFetch('/profile')"), 'Inicio debe seguir cargando el perfil');
  assert.ok(inicio.includes('<SocialLinks profile={data} />'), 'Falta SocialLinks en Inicio');

  const bio = inicio.indexOf('inicio__bio');
  const social = inicio.indexOf('<SocialLinks');
  assert.ok(bio !== -1 && social > bio, 'SocialLinks debe ir después de la biografía');
});

test('T29.7: el pie carga el perfil y usa la variante footer', () => {
  const footer = read('src/components/Layout/Footer.jsx');

  assert.ok(footer.includes("useFetch('/profile')"), 'El pie debe cargar el perfil');
  assert.ok(footer.includes('variant="footer"'), 'El pie debe usar la variante footer');
  assert.ok(footer.includes('footer__title'), 'El pie debe conservar el copyright');
});

test('T29.8: el panel permite editar los dos enlaces', () => {
  const admin = read('src/pages/admin/AdminPerfil.jsx');

  assert.ok(admin.includes('github_url'), 'Falta el campo github_url');
  assert.ok(admin.includes('linkedin_url'), 'Falta el campo linkedin_url');
  assert.ok(admin.includes('type="url"'), 'Los campos deben ser de tipo url');
  assert.ok(admin.includes("t('perfil.github')"), 'Falta la etiqueta de GitHub');
  assert.ok(admin.includes("t('perfil.linkedin')"), 'Falta la etiqueta de LinkedIn');
});

test('T29.9: los tres diccionarios tienen las claves nuevas', async () => {
  const es = (await import('../src/i18n/es.js')).default;
  const ca = (await import('../src/i18n/ca.js')).default;
  const en = (await import('../src/i18n/en.js')).default;

  const claves = [
    'social.github',
    'social.linkedin',
    'social.github_aria',
    'social.linkedin_aria',
    'perfil.github',
    'perfil.linkedin',
  ];

  for (const clave of claves) {
    assert.ok(clave in es, `Falta ${clave} en es.js`);
    assert.ok(clave in ca, `Falta ${clave} en ca.js`);
    assert.ok(clave in en, `Falta ${clave} en en.js`);
  }
});

test('T29.10: los estilos cubren Inicio, el pie y el foco visible', () => {
  const sections = read('src/styles/sections.css');
  const layout = read('src/styles/layout.css');

  assert.ok(sections.includes('.social-links'), 'Falta el contenedor en sections.css');
  assert.ok(sections.includes('.social-links__link'), 'Falta el enlace en sections.css');
  assert.ok(sections.includes('.social-links__icon'), 'Falta el icono en sections.css');
  assert.ok(sections.includes('min-height: 44px'), 'El área táctil debe medir 44 px');
  assert.ok(sections.includes('focus-visible'), 'Falta el foco visible');
  assert.ok(
    /@media \(max-width: 768px\)[\s\S]*\.inicio \.social-links[\s\S]*justify-content: center/s.test(sections),
    'En móvil la fila de Inicio debe centrarse'
  );

  assert.ok(layout.includes('.social-links--footer'), 'Falta la variante del pie');
  assert.ok(
    /\.social-links--footer \.social-links__link\s*\{[^}]*width: 44px[^}]*height: 44px/s.test(layout),
    'Los iconos del pie deben medir 44 × 44 px'
  );
});

test('T29.11: no se añaden dependencias de iconos', () => {
  const pkg = JSON.parse(read('package.json'));
  const dependencias = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const nombre of Object.keys(dependencias)) {
    assert.ok(
      !/icon|lucide|heroicons|fontawesome|feather/i.test(nombre),
      `No debe añadirse una librería de iconos: ${nombre}`
    );
  }
});
