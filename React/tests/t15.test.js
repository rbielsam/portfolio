import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const read = (p) => readFileSync(join(rootDir, p), 'utf8');

const chipPath = 'src/components/Navigation/SessionChip.jsx';
const chipExists = existsSync(join(rootDir, chipPath));
const chip = chipExists ? readFileSync(join(rootDir, chipPath), 'utf8') : '';

const navButtons = read('src/components/Navigation/NavButtons.jsx');
const app = read('src/App.jsx');
const login = read('src/pages/Login.jsx');
const navCss = read('src/styles/navigation.css');

test('T15.1: Existe el componente SessionChip', () => {
  assert.ok(chipExists, `Falta el fichero ${chipPath}`);
  assert.ok(chip.length > 0, 'SessionChip.jsx está vacío');
});

test('T15.2: NavButtons conserva el literal "Login" (requisito de t4.3)', () => {
  assert.ok(navButtons.includes('Login'), 'NavButtons debe seguir conteniendo el literal "Login"');
});

test('T15.3: NavButtons lee la sesión y renderiza el chip', () => {
  assert.ok(navButtons.includes('useAuth'), 'NavButtons debe usar useAuth');
  assert.ok(navButtons.includes('SessionChip'), 'NavButtons debe renderizar SessionChip');
});

test('T15.4: NavButtons conserva los botones de sección', () => {
  const labels = ['Inicio', 'Formación', 'Experiencia', 'Proyectos', 'Contacto'];
  for (const label of labels) {
    assert.ok(navButtons.includes(label), `Falta el botón "${label}"`);
  }
});

test('T15.5: SessionChip lee sesión, navegación y perfil', () => {
  assert.ok(chip.includes('useAuth'), 'SessionChip debe usar useAuth');
  assert.ok(chip.includes('useSection'), 'SessionChip debe usar useSection');
  assert.ok(chip.includes("useFetch('/profile')"), "SessionChip debe cargar '/profile'");
});

test('T15.6: SessionChip muestra la foto con respaldo de iniciales', () => {
  assert.ok(chip.includes('photoUrl'), 'SessionChip debe construir la URL con photoUrl');
  assert.ok(chip.includes('getInitials'), 'SessionChip debe usar getInitials como respaldo');
  assert.ok(chip.includes('onError'), 'SessionChip debe gestionar el fallo de carga de la imagen');
});

test('T15.7: SessionChip muestra user.name y la imagen es decorativa', () => {
  assert.ok(/user\??\.name/.test(chip), 'SessionChip debe mostrar user.name, no el correo');
  assert.ok(chip.includes('alt=""'), 'La imagen debe ser decorativa (alt vacío)');
});

test('T15.8: SessionChip abre el panel de administración', () => {
  assert.ok(
    chip.includes("setActiveSection('Login')"),
    'El clic debe llamar a setActiveSection("Login")'
  );
  assert.ok(chip.includes('aria-label'), 'El chip debe tener nombre accesible');
});

test('T15.9: Login y App ya no redirigen a Inicio con onSuccess', () => {
  assert.ok(!login.includes('onSuccess'), 'Login.jsx ya no debe recibir onSuccess');
  assert.ok(!app.includes('onSuccess'), 'App.jsx ya no debe pasar onSuccess a <Login />');
});

test('T15.10: navigation.css define los estilos del chip', () => {
  for (const cls of ['.nav-session', '.nav-session__photo', '.nav-session__initials']) {
    assert.ok(navCss.includes(cls), `Falta la regla ${cls} en navigation.css`);
  }
});
