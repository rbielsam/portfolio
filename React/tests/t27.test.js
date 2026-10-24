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

const proyectos = read('src/components/sections/Proyectos.jsx');
const detalle = read('src/components/sections/ProyectoDetalle.jsx');
const manager = read('src/components/admin/ProjectImageManager.jsx');
const adminProyectos = read('src/pages/admin/AdminProyectos.jsx');
const sectionContext = read('src/context/SectionContext.jsx');
const app = read('src/App.jsx');

test('T27.1: existe la estructura backend de imágenes de proyecto', () => {
  for (const file of [
    'app/Models/ProjectImage.php',
    'app/Services/ProjectImageService.php',
    'app/Http/Requests/StoreProjectImageRequest.php',
    'app/Http/Requests/UpdateProjectImageRequest.php',
    'app/Http/Controllers/Api/ProjectImageController.php',
  ]) {
    assert.ok(existsLaravel(file), `Falta ${file}`);
  }

  const migrations = readLaravel('database/migrations/2026_10_23_130152_create_project_images_table.php');
  assert.ok(migrations.includes("Schema::create('project_images'"), 'Falta la tabla project_images');
  assert.ok(migrations.includes('project_id'), 'Falta project_id');
  assert.ok(migrations.includes('cascadeOnDelete'), 'Las imágenes deben borrarse con el proyecto');
  assert.ok(migrations.includes('caption'), 'Falta el comentario');
  assert.ok(migrations.includes('position'), 'Falta el orden');
});

test('T27.2: el modelo Project carga imágenes y expone cover_url', () => {
  const project = readLaravel('app/Models/Project.php');

  assert.ok(project.includes('images()'), 'Falta la relación images');
  assert.ok(project.includes('ProjectImage::class'), 'La relación debe apuntar a ProjectImage');
  assert.ok(project.includes("orderBy('position')"), 'Las imágenes deben ordenarse por posición');
  assert.ok(project.includes('cover_url'), 'Falta cover_url');
  assert.ok(project.includes('photo_disk'), 'La portada debe resolverse con el disco configurado');
  assert.ok(project.includes("format('Y-m')"), 'Debe conservarse el formato de fecha actual');
});

test('T27.3: el servicio limita a 1600 px sin recortar y usa el disco configurado', () => {
  const service = readLaravel('app/Services/ProjectImageService.php');

  assert.ok(service.includes('MAX_WIDTH = 1600'), 'Falta el ancho máximo');
  assert.ok(service.includes('QUALITY = 82'), 'Falta la calidad');
  assert.ok(service.includes('scaleDown'), 'Debe escalar sin recortar');
  assert.ok(!service.includes('->cover('), 'No debe recortar las capturas');
  assert.ok(service.includes("DIRECTORY = 'projects'"), 'Debe guardar bajo projects/');
  assert.ok(service.includes('photo_disk'), 'Debe usar el disco configurado');
  assert.ok(service.includes('delete('), 'Falta el borrado de archivos');
});

test('T27.4: la API valida formato, tamaño, comentario y límite de imágenes', () => {
  const store = readLaravel('app/Http/Requests/StoreProjectImageRequest.php');
  const update = readLaravel('app/Http/Requests/UpdateProjectImageRequest.php');
  const controller = readLaravel('app/Http/Controllers/Api/ProjectImageController.php');

  assert.ok(store.includes('mimes:jpg,jpeg,png,webp'), 'Faltan los formatos admitidos');
  assert.ok(store.includes('max:5120'), 'Falta el límite de 5 MB');
  assert.ok(store.includes("'caption'"), 'Falta el comentario');
  assert.ok(store.includes('max:500'), 'Falta el límite del comentario');
  assert.ok(update.includes('max:500'), 'La edición debe limitar el comentario');
  assert.ok(controller.includes('MAX_IMAGES = 10'), 'Falta el límite de 10 imágenes');
  assert.ok(controller.includes('ValidationException'), 'El límite debe responder 422');
  assert.ok(controller.includes('ensureBelongsToProject'), 'Debe comprobar que la imagen es del proyecto');
});

test('T27.5: las rutas de imágenes están protegidas y anidadas en el proyecto', () => {
  const routes = readLaravel('routes/api.php');

  assert.ok(routes.includes("'/projects/{project}/images'"), 'Falta la ruta de subida');
  assert.ok(routes.includes("'/projects/{project}/images/{image}'"), 'Falta la ruta de edición y borrado');
  assert.ok(routes.includes('ProjectImageController'), 'No se usa el controlador de imágenes');
});

test('T27.6: Proyectos usa la URL compartible, la portada y el resumen', () => {
  assert.ok(proyectos.includes('useSearchParams'), 'Falta la lectura del parámetro');
  assert.ok(proyectos.includes("searchParams.get('proyecto')"), 'Falta leer proyecto');
  assert.ok(proyectos.includes('setSearchParams'), 'Falta actualizar la URL');
  assert.ok(proyectos.includes('item.cover_url'), 'La tarjeta debe usar cover_url');
  assert.ok(proyectos.includes('resumirDescripcion'), 'La tarjeta debe resumir la descripción');
  assert.ok(proyectos.includes('ProyectoDetalle'), 'Falta la vista de detalle');
  assert.ok(proyectos.includes('?proyecto=${item.id}'), 'Falta el enlace interno');
  assert.ok(!proyectos.includes('target="_blank"'), 'La tarjeta ya no debe abrir el sitio externo');
  assert.ok(proyectos.includes('proyectos.no_encontrado'), 'Falta el caso de proyecto inexistente');
});

test('T27.7: el detalle muestra fecha, enlaces y galería comentada', () => {
  assert.ok(detalle.includes("from '../../utils/dates.js'"), 'Debe usar el formato de fecha existente');
  assert.ok(detalle.includes('formatMonthYear(project.date, lang)'), 'Falta la fecha');
  assert.ok(detalle.includes('proyectos.abrir_sitio'), 'Falta «Abrir sitio»');
  assert.ok(detalle.includes('target="_blank"'), 'El enlace externo debe abrir otra pestaña');
  assert.ok(detalle.includes('rel="noopener noreferrer"'), 'Falta la protección del enlace externo');
  assert.ok(detalle.includes('<figure'), 'Cada imagen debe ser una figura');
  assert.ok(detalle.includes('<figcaption'), 'El comentario debe ser la leyenda');
  assert.ok(detalle.includes('image.caption'), 'Falta el comentario de la imagen');
  assert.ok(detalle.includes('loading="lazy"'), 'Las imágenes deben cargarse de forma diferida');
  assert.ok(detalle.includes('cover_url'), 'Debe contemplar la imagen heredada');
  assert.ok(detalle.includes('proyectos.imagen_alt'), 'Falta el texto alternativo');
  assert.ok(detalle.includes('proyecto-galeria__item--solo'), 'Las imágenes sin comentario deben ocupar el ancho');
});

test('T27.8: el panel permite subir, comentar y eliminar imágenes', () => {
  assert.ok(existsLaravel('app/Models/ProjectImage.php'), 'Falta el modelo de imagen');
  assert.ok(existsLaravel('app/Http/Controllers/Api/ProjectImageController.php'), 'Falta el controlador');

  assert.ok(manager.includes('MAX_IMAGES = 10'), 'Falta el límite del panel');
  assert.ok(manager.includes('MAX_SIZE = 5 * 1024 * 1024'), 'Falta el límite de 5 MB');
  assert.ok(manager.includes('ACCEPTED_TYPES'), 'Faltan los formatos admitidos');
  assert.ok(manager.includes('api.upload'), 'Falta la subida');
  assert.ok(manager.includes('api.put'), 'Falta guardar el comentario');
  assert.ok(manager.includes('api.delete'), 'Falta eliminar la imagen');
  assert.ok(manager.includes('window.confirm'), 'Falta la confirmación antes de borrar');
  assert.ok(manager.includes('maxLength={500}'), 'Falta el límite del comentario en el formulario');
  assert.ok(manager.includes('proyectos.imagenes_publicas'), 'Falta el aviso de contenido público');
  assert.ok(manager.includes('onImagesChange'), 'Debe notificar los cambios al formulario');
});

test('T27.9: AdminProyectos integra el gestor y avisa de guardar primero', () => {
  assert.ok(adminProyectos.includes('ProjectImageManager'), 'Falta el gestor de imágenes');
  assert.ok(adminProyectos.includes('proyectos.guardar_primero'), 'Falta el aviso para proyectos nuevos');
  assert.ok(adminProyectos.includes('onImagesChange'), 'Falta la actualización de la galería');
  assert.ok(!adminProyectos.includes('placeholder='), 'No debe usarse placeholder');
});

test('T27.10: la sección y la URL se sincronizan con ?proyecto=', () => {
  assert.ok(sectionContext.includes('proyecto'), 'SectionContext debe leer el parámetro');
  assert.ok(sectionContext.includes("'Proyectos'"), 'Debe activar Proyectos');
  assert.ok(app.includes('useSearchParams'), 'App debe leer los parámetros');
  assert.ok(app.includes("searchParams.has('proyecto')"), 'App debe limpiar el parámetro al salir');
  assert.ok(app.includes('next.delete'), 'Debe eliminarse proyecto de la URL');
});

test('T27.11: resumirDescripcion corta a 180 caracteres y respeta palabras', async () => {
  const { resumirDescripcion } = await import('../src/utils/text.js');

  assert.equal(resumirDescripcion(''), '');
  assert.equal(resumirDescripcion(null), '');
  assert.equal(resumirDescripcion('Texto corto'), 'Texto corto');
  assert.equal(resumirDescripcion('a'.repeat(180)), 'a'.repeat(180));

  const largo = 'palabra '.repeat(40).trim();
  const salida = resumirDescripcion(largo);

  assert.ok(salida.length <= 181, 'El resumen no debe superar 180 caracteres más el puntos suspensivos');
  assert.ok(salida.endsWith('…'), 'Debe terminar en puntos suspensivos');
  assert.ok(!salida.includes('  '), 'No debe dejar espacios duplicados');
  assert.ok('palabra '.repeat(40).startsWith(salida.slice(0, -1)), 'Debe cortar en una palabra completa');
});

test('T27.12: las claves nuevas existen en los tres idiomas', async () => {
  const es = (await import('../src/i18n/es.js')).default;
  const ca = (await import('../src/i18n/ca.js')).default;
  const en = (await import('../src/i18n/en.js')).default;

  const claves = [
    'proyectos.volver',
    'proyectos.abrir_sitio',
    'proyectos.no_encontrado',
    'proyectos.no_encontrado_ayuda',
    'proyectos.imagen_alt',
    'proyectos.imagenes',
    'proyectos.imagenes_ayuda',
    'proyectos.imagenes_publicas',
    'proyectos.guardar_primero',
    'proyectos.añadir_imagen',
    'proyectos.subir_imagen',
    'proyectos.subiendo',
    'proyectos.comentario',
    'proyectos.comentario_ayuda',
    'proyectos.guardar_comentario',
    'proyectos.portada',
    'proyectos.eliminar_imagen',
    'proyectos.imagen_confirmar',
    'proyectos.imagen_limite',
    'proyectos.imagen_error_formato',
    'proyectos.imagen_error_tamano',
    'proyectos.imagen_error_subir',
    'proyectos.imagen_error_comentario',
    'proyectos.imagen_error_eliminar',
    'proyectos.sin_imagenes',
  ];

  for (const clave of claves) {
    for (const [idioma, diccionario] of [['es', es], ['ca', ca], ['en', en]]) {
      assert.ok(diccionario[clave], `Falta ${clave} en ${idioma}`);
    }
  }

  assert.ok(es['proyectos.imagen_alt'].includes('{n}'), 'El alt debe incluir el número');
  assert.ok(es['proyectos.imagen_alt'].includes('{title}'), 'El alt debe incluir el título');
});
