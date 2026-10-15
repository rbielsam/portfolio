import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('T5.2: useContact.js existe y envía al endpoint correcto', () => {
  const content = readFileSync(join(rootDir, 'src/hooks/useContact.js'), 'utf8');
  assert.ok(content.includes('/contact/messages'), 'Falta endpoint /contact/messages en useContact');
  assert.ok(content.includes('loading'), 'Falta estado loading en useContact');
  assert.ok(content.includes('success'), 'Falta estado success en useContact');
  assert.ok(content.includes('error'), 'Falta estado error en useContact');
});

test('T5.2: Contacto.jsx tiene los campos name, email, message y honeypot', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Contacto.jsx'), 'utf8');
  assert.ok(content.includes('name'), 'Falta campo name en Contacto');
  assert.ok(content.includes('email'), 'Falta campo email en Contacto');
  assert.ok(content.includes('message'), 'Falta campo message en Contacto');
  assert.ok(content.includes('website'), 'Falta campo trampa website en Contacto');
  assert.ok(content.includes('useContact'), 'Falta useContact en Contacto');
});

test('T5.2: Contacto.jsx muestra confirmación y error', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Contacto.jsx'), 'utf8');
  assert.ok(content.includes('success'), 'Falta manejo de success en Contacto');
  assert.ok(content.includes('error'), 'Falta manejo de error en Contacto');
});

test('T5.4: AdminMensajes.jsx lista y gestiona mensajes', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminMensajes.jsx'), 'utf8');
  assert.ok(content.includes('/admin/messages'), 'Falta endpoint /admin/messages en AdminMensajes');
  assert.ok(content.includes('/read'), 'Falta marca de leído en AdminMensajes');
  assert.ok(content.includes('delete'), 'Falta borrado en AdminMensajes');
  assert.ok(content.includes('is_read'), 'Falta is_read en AdminMensajes');
  assert.ok(content.includes('EmptyData'), 'Falta estado vacío en AdminMensajes');
});

test('T5.3: La sección Contacto está integrada en la navegación', () => {
  const nav = readFileSync(join(rootDir, 'src/components/Navigation/NavButtons.jsx'), 'utf8');
  assert.ok(nav.includes('Contacto'), 'Falta botón Contacto en NavButtons');

  const app = readFileSync(join(rootDir, 'src/App.jsx'), 'utf8');
  assert.ok(app.includes('Contacto'), 'Falta sección Contacto en App.jsx');
});

test('T5.3: El panel de administración incluye Mensajes', () => {
  const content = readFileSync(join(rootDir, 'src/pages/admin/AdminLayout.jsx'), 'utf8');
  assert.ok(content.includes('Mensajes'), 'Falta entrada Mensajes en AdminLayout');
});

test('T5.5: Existen los estilos del formulario de contacto', () => {
  assert.ok(existsSync(join(rootDir, 'src/styles/contact.css')), 'Falta contact.css');
  const css = readFileSync(join(rootDir, 'src/styles/contact.css'), 'utf8');
  assert.ok(css.includes('contact'), 'contact.css no contiene clases de contacto');
});

test('T5.1: El formulario no expone datos del administrador', () => {
  const content = readFileSync(join(rootDir, 'src/components/sections/Contacto.jsx'), 'utf8');
  assert.ok(!content.includes('@'), 'El formulario no debe incluir emails hardcodeados');
});
