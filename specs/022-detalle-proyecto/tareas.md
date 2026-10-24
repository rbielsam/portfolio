# Tareas — Detalle de proyecto con galería comentada (Spec 022)

Estado: **completada y publicada** (24/10/2026, commit `beb8f29`). Producción verificada con `deploy/publicar.sh`.

> Spec, plan y tareas aprobados por la persona usuaria, que autorizó expresamente la implementación.
>
> Regla de la spec: cada tarea se marca al terminar y no se avanza si las pruebas o el build fallan.
>
> Lo marcado con `[x]` está hecho y verificado con las suites automáticas. Lo que sigue en `[ ]` requiere navegador o producción.

---

## Fase 1 — Backend: datos y modelo

### T1.1 — Migración `project_images`

- [x] Crear `Laravel/database/migrations/2026_10_23_130152_create_project_images_table.php`.
- [x] Columnas: `id`, `project_id` (FK a `projects.id`, `ON DELETE CASCADE`), `path` (string 255), `caption` (string 500, nullable), `position` (unsigned integer, por defecto 0), `timestamps`.
- [x] Índice compuesto `(project_id, position)`.
- [x] Verificar que la migración se aplica y se revierte sin errores (probada sobre una base SQLite temporal, sin tocar la base de desarrollo).

### T1.2 — Modelo `ProjectImage` y relación en `Project`

- [x] Crear `Laravel/app/Models/ProjectImage.php` con `$fillable = ['path', 'caption', 'position']`, cast de `position` a entero y `belongsTo(Project::class)`.
- [x] Exponer `url` como atributo añadido resuelto con el disco `photo_disk`.
- [x] Ocultar en el JSON `path`, `project_id`, `created_at` y `updated_at`.
- [x] Añadir `images(): HasMany` a `Project`, ordenada por `position` y después por `id`.
- [x] Añadir `cover_url` a `Project` con la prioridad: primera imagen → `projects.image` absoluta → `projects.image` resuelta con el disco → `null`.
- [x] Conservar en `Project` el `toArray()` actual, `format('Y-m')` y `parent::toArray()` que exige `t17.3`.
- [x] **No** migrar ni eliminar `projects.image`.

---

## Fase 2 — Backend: servicio, validación y API de imágenes

### T2.1 — `ProjectImageService`

- [x] Crear `Laravel/app/Services/ProjectImageService.php`.
- [x] Constantes: `DIRECTORY = 'projects'`, `MAX_WIDTH = 1600`, `QUALITY = 82`.
- [x] Ruta `projects/{project_id}/{Str::random(32)}.{ext}`.
- [x] Procesar con `Image::decode(...)->orient()->scaleDown(width: 1600)`, sin recorte y sin ampliar imágenes pequeñas.
- [x] Re-codificar en el formato de origen (JPG, PNG o WebP) para eliminar EXIF.
- [x] Guardar en `Storage::disk(config('filesystems.photo_disk', 'public'))`.
- [x] `delete(?string $path)` borra solo rutas que empiecen por `projects/`; ignora el resto.
- [x] Lanzar excepción si la escritura falla.

### T2.2 — Peticiones de validación

- [x] Crear `Laravel/app/Http/Requests/StoreProjectImageRequest.php`: `image` obligatoria, `file`, `mimes:jpg,jpeg,png,webp`, `max:5120`; `caption` nullable, string, `max:500`.
- [x] Crear `Laravel/app/Http/Requests/UpdateProjectImageRequest.php`: `caption` nullable, string, `max:500`; cadena vacía normalizada a `null`.
- [x] Reutilizar el patrón de `prepareForValidation` de la foto de perfil para subidas inválidas.

### T2.3 — `ProjectImageController`

- [x] Crear `Laravel/app/Http/Controllers/Api/ProjectImageController.php` con `store`, `update` y `destroy`.
- [x] `store`: comprobar el límite de 10 imágenes antes de procesar; asignar `position = max(position) + 1`; devolver `201` con la imagen creada.
- [x] Si falla la creación de la fila después de escribir el archivo, borrar el archivo para no dejar huérfanos.
- [x] `update`: devolver `404` si la imagen no pertenece al proyecto.
- [x] `destroy`: borrar la fila y después el archivo; devolver `204`.
- [x] Devolver `422` con mensaje traducido al superar las 10 imágenes.

### T2.4 — Rutas protegidas

- [x] Registrar en `Laravel/routes/api.php`, dentro de `auth:sanctum` + `role:admin,editor`:
  - `POST /api/projects/{project}/images`
  - `PUT /api/projects/{project}/images/{image}`
  - `DELETE /api/projects/{project}/images/{image}`
- [x] Comprobar que un lector recibe `403` y un visitante sin sesión `401` (`ProjectImageTest`).

### T2.5 — Traducciones de backend

- [x] Crear `Laravel/lang/es/project_images.php`, `ca` y `en` con el mensaje de límite de imágenes.
- [x] Añadir `caption` a los atributos de `Laravel/lang/{es,ca,en}/validation.php`.
- [x] Verificar que los tres idiomas tienen las mismas claves.

---

## Fase 3 — Backend: lectura pública y borrado de proyectos

### T3.1 — Lectura pública con galería

- [x] En `ProjectController@index`, cargar `with('images')`.
- [x] Mantener todos los campos actuales y añadir `images` y `cover_url` a la respuesta.
- [x] No exponer `path` ni rutas internas en el JSON público.

### T3.2 — Escritura y borrado de proyectos

- [x] En `ProjectController@store` y `@update`, devolver el proyecto con `load('images')`.
- [x] En `ProjectController@destroy`, recoger las rutas de las imágenes, borrar el proyecto (la FK elimina las filas) y después borrar los archivos.
- [x] Intentar borrar también `projects.image` si es una ruta relativa bajo `projects/`; ignorar URLs externas y rutas de otros directorios.

---

## Fase 4 — Backend: pruebas

### T4.1 — `ProjectImageServiceTest`

- [x] Crear `Laravel/tests/Feature/ProjectImageServiceTest.php`.
- [x] Cubrir: ruta `projects/{id}/…`, nombre aleatorio y extensión correcta.
- [x] Cubrir: panorámica 2000×1000 → 1600×800, sin recorte.
- [x] Cubrir: vertical 1000×2000 → 1000×2000, sin recorte ni ampliación.
- [x] Cubrir: imagen pequeña 800×600 → 800×600.
- [x] Cubrir: borrado del archivo y tolerancia a archivos inexistentes.
- [x] Cubrir: no borra rutas fuera de `projects/`.
- [x] Cubrir: uso del disco configurado (`public` y `s3` simulados).
- [x] Reutilizar los fixtures existentes de `Laravel/tests/Feature/fixtures`.

### T4.2 — `ProjectImageTest`

- [x] Crear `Laravel/tests/Feature/ProjectImageTest.php`.
- [x] Cubrir: `POST`, `PUT` y `DELETE` requieren autenticación.
- [x] Cubrir: lector recibe `403`; editor y administrador pueden escribir.
- [x] Cubrir: subida válida → `201`, fila en BD, archivo en disco y `url` en la respuesta.
- [x] Cubrir: JPG, PNG y WebP aceptados; archivo no imagen rechazado.
- [x] Cubrir: archivo ausente y archivo de más de 5 MB rechazados.
- [x] Cubrir: comentario opcional, máximo 500 caracteres y actualización posterior.
- [x] Cubrir: orden por `position` en la respuesta pública.
- [x] Cubrir: `cover_url` es la primera imagen y, al borrarla, pasa la siguiente.
- [x] Cubrir: imagen heredada como `cover_url` cuando no hay galería.
- [x] Cubrir: imagen de otro proyecto devuelve `404` al editar o borrar.
- [x] Cubrir: borrado de imagen → desaparecen fila y archivo.
- [x] Cubrir: borrado de proyecto → desaparecen filas y archivos.
- [x] Cubrir: límite de 10 imágenes → `422`.
- [x] Cubrir: el JSON público no incluye `path`.
- [x] Cubrir: la URL se resuelve con el disco configurado y conserva URLs absolutas.
- [x] Ejecutar `cd Laravel && php artisan test --compact`: **148/148 en verde** (112 anteriores + 36 nuevos).

---

## Fase 5 — Frontend: navegación y URL compartible

### T5.1 — `SectionContext` desde `?proyecto=`

- [x] Inicializar `activeSection` a `'Proyectos'` si la URL contiene `?proyecto=`; si no, a `'Inicio'`.
- [x] Mantener intacta la API pública del contexto (`activeSection`, `setActiveSection`).

### T5.2 — Limpieza del parámetro al salir de Proyectos

- [x] En `React/src/App.jsx`, usar `useSearchParams`.
- [x] Cuando `activeSection !== 'Proyectos'`, eliminar `proyecto` de la URL con `replace: true`.
- [x] Verificar en navegador que Inicio y Login siguen funcionando; al cambiar de sección desde el detalle el parámetro desaparece.

---

## Fase 6 — Frontend: tarjeta y vista de detalle

### T6.1 — Resumen de descripción

- [x] Crear `React/src/utils/text.js` con `resumirDescripcion(texto, max = 180)`.
- [x] Cortar en un límite de palabra y añadir `…` solo si la descripción supera el máximo.
- [x] Devolver la descripción completa cuando tenga 180 caracteres o menos.

### T6.2 — Tarjeta de proyecto

- [x] En `React/src/components/sections/Proyectos.jsx`, usar `item.cover_url` como portada.
- [x] Mostrar `resumirDescripcion(item.description)` en lugar de la descripción completa.
- [x] Mantener `parseTecnologias` y el marcado `section__item-tags` / `section__item-tag`.
- [x] Convertir «Ver proyecto» en un `<a href={`?proyecto=${item.id}`}>` que actualice el historial sin recargar.
- [x] Eliminar el enlace externo de la tarjeta y cambiar la flecha a `→`.
- [x] **No** importar `formatMonthYear` en `Proyectos.jsx` (tests `t17.8` y `t25.6`).
- [x] Mantener `useFetch('/projects')` (test `t4.4`).

### T6.3 — `ProyectoDetalle.jsx`

- [x] Crear `React/src/components/sections/ProyectoDetalle.jsx`.
- [x] Orden visual: «Volver a Proyectos», título (`h3`), fecha, tecnologías, descripción completa, «Abrir sitio» y galería.
- [x] Formatear la fecha con `formatMonthYear(project.date, lang)`; omitirla si queda vacía.
- [x] Omitir el bloque de tecnologías si no hay; omitir la descripción si no hay.
- [x] Mostrar «Abrir sitio» solo si existe `project.url`, con `target="_blank"` y `rel="noopener noreferrer"`.
- [x] Renderizar la galería desde `project.images` con `figure` + `img` + `figcaption`.
- [x] Cada imagen con `alt` = `t('proyectos.imagen_alt', { n, title })` y `loading="lazy"`.
- [x] Conservar saltos de línea del comentario con `white-space: pre-line`.
- [x] Imagen sin comentario: sin `figcaption` y con la clase `--solo` para ocupar el ancho.
- [x] Si no hay galería y sí `cover_url`, mostrar una única figura con la imagen heredada y sin comentario.
- [x] Si no hay ninguna imagen, no renderizar la galería.
- [x] ID inexistente: mostrar «Proyecto no encontrado» con enlace de vuelta.
- [x] Desplazar la vista al inicio al abrir y al cerrar el detalle.

---

## Fase 7 — Frontend: gestión de imágenes en el panel

### T7.1 — `ProjectImageManager.jsx`

- [x] Crear `React/src/components/admin/ProjectImageManager.jsx`.
- [x] Mostrarlo solo al editar un proyecto ya guardado; para uno nuevo, mostrar «Guarda el proyecto antes de añadir imágenes».
- [x] Título «Imágenes del proyecto» y ayuda «La primera imagen se usa como portada».
- [x] Aviso visible de contenido público: no subir correos, nombres, mensajes, tokens ni datos personales; usar capturas redactadas o con datos de ejemplo.
- [x] Formulario de subida: archivo + comentario opcional + botón.
- [x] Lista de imágenes: miniatura, insignia «Portada» en la primera, comentario editable, «Guardar comentario» y «Eliminar imagen».
- [x] Confirmar con `window.confirm` antes de eliminar.
- [x] Mensajes para el máximo de 10 imágenes y para la lista vacía.
- [x] Validación en cliente: formato, 5 MB, máximo 10 imágenes y 500 caracteres.
- [x] Llamadas `api.upload`, `api.put` y `api.delete` a las rutas de imágenes.
- [x] Mantener la lista en estado local y notificar al padre con `onImagesChange(images)`.
- [x] Tras cada cambio, actualizar `editing.images` y la entrada de `data`, incluida `cover_url`.

### T7.2 — Integración en `AdminProyectos.jsx`

- [x] Renderizar el gestor **después** del formulario, no dentro, para evitar formularios anidados.
- [x] Mantener el CRUD actual, los permisos `can('projects')` y los botones de añadir/editar/borrar (test `t14`).
- [x] Mantener el textarea `admin-form__textarea` (test `t17.12`).
- [x] No añadir `placeholder=` (test `t17.10`) ni `type="month"` / `type="date"` (test `t17.9`).

---

## Fase 8 — Traducciones de interfaz

### T8.1 — Claves nuevas en es/ca/en

- [x] Añadir en `React/src/i18n/es.js`, `ca.js` y `en.js` las claves del plan (volver, abrir sitio, no encontrado, galería, comentario, portada, límites y errores).
- [x] Conservar `proyectos.ver`.
- [x] Verificar que los tres diccionarios tienen exactamente las mismas claves (test `t20.3`).

### T8.2 — Sin cadenas duras

- [x] Revisar los componentes nuevos y modificados: todos los textos de interfaz usan `t()` (test `t20.18`).
- [x] Revisar que catalán e inglés traducen todos los textos nuevos.

---

## Fase 9 — Estilos y responsive

### T9.1 — Detalle y galería en `sections.css`

- [x] `.proyecto-detalle`: ancho máximo `--content-max`, padding vertical y alineación a la izquierda.
- [x] `.proyecto-detalle__back` y `.proyecto-detalle__link`: color de acento y foco visible.
- [x] `.proyecto-detalle__title`: titular con `overflow-wrap`.
- [x] `.proyecto-detalle__meta`: fila con `flex-wrap` para fecha y tecnologías.
- [x] `.proyecto-detalle__date`: monoespaciada, mayúsculas y acento.
- [x] `.proyecto-detalle__description`: `max-width: --reading-max`, `line-height: 1.7` y `white-space: pre-line`.
- [x] `.proyecto-galeria`: columna con separación.
- [x] `.proyecto-galeria__item`: rejilla de dos columnas, imagen a la izquierda y comentario a la derecha, alineadas al centro.
- [x] `.proyecto-galeria__item--solo`: una sola columna.
- [x] `.proyecto-galeria__image`: ancho 100 %, altura automática, borde, radio y fondo de superficie.
- [x] `.proyecto-galeria__caption`: `max-width: --reading-max`, `line-height: 1.7`, `white-space: pre-line`, `overflow-wrap` y borde izquierdo de acento.
- [x] `.proyecto-detalle__not-found`: mensaje centrado con enlace de vuelta.

### T9.2 — Gestor de imágenes en `admin.css`

- [x] `.project-images`: superficie, borde, padding y ancho máximo.
- [x] `.project-images__warning`: aviso destacado con fondo cálido y borde de advertencia.
- [x] `.project-images__list` y `.project-images__item`: rejilla `140px minmax(0, 1fr)`.
- [x] `.project-images__thumb`: miniatura 4:3 con `object-fit: cover`.
- [x] `.project-images__body` y `.project-images__actions`: columna y acciones con `flex-wrap`.
- [x] `.project-images__upload`: formulario con separación y borde superior.

### T9.3 — Puntos de ruptura

- [x] `≤768px`: la galería pasa a una columna; comentario debajo y sin borde izquierdo; el detalle reduce padding y tamaño de título.
- [x] `≤600px`: cada imagen del panel pasa a una columna y la miniatura ocupa el ancho disponible.
- [x] `≤480px`: ajustes de padding y tipografía del detalle.
- [x] En todos los casos: `min-width: 0` en columnas de rejilla, `overflow-wrap: break-word` en títulos y comentarios, y `flex-wrap` en botones y etiquetas.
- [x] Mantener `prefers-reduced-motion: reduce`.
- [x] Comprobar en navegador que no se introduce scroll horizontal.

### T9.4 — Validación responsive manual

Comprobada en navegador (Chrome DevTools) con una base SQLite temporal y datos de demostración, **sin tocar datos reales**. En todas las anchuras `document.scrollWidth` fue igual o menor que el ancho de ventana:

**Web pública**

- [x] **1440 px**: detalle a dos columnas, imagen y comentario lado a lado; rejilla de tarjetas correcta.
- [x] **1024 px**: galería y rejilla sin desbordamiento.
- [x] **768 px**: galería apilada (imagen arriba, comentario debajo); sin cortes en el texto.
- [x] **480 px**: una columna, padding reducido y botones envueltos.
- [x] **375×812**: sin scroll horizontal; imágenes al ancho disponible; comentarios legibles.
- [x] **320 px**: sin scroll horizontal; títulos y comentarios largos no desbordan; enlaces y etiquetas se envuelven.

**Panel**

- [x] **1440 px**: gestor con miniatura y cuerpo en dos columnas.
- [x] **1024 px**: gestor sin desbordamiento.
- [x] **768 px**: panel usable con la barra lateral colapsada; gestor sin cortes.
- [x] **480 px**: formulario y acciones apilados.
- [x] **375×812**: miniaturas a ancho completo, comentarios y botones apilados.
- [x] **320 px**: sin scroll horizontal; botones y campos caben; nada se solapa.

**Común**

- [x] Confirmar que no aparece scroll horizontal en ninguna de las anchuras anteriores, ni en la web ni en el panel.
- [x] Confirmar que `prefers-reduced-motion` no añade animaciones.

> **Incidencia corregida**: el comentario de cada imagen del panel se encogía a ~210 px porque la etiqueta se ajustaba al ancho por defecto del `textarea`. Se añadió `.project-images__body > .admin-form__label { width: 100%; min-width: 0 }`.

---

## Fase 10 — Pruebas de frontend

### T10.1 — `t27.test.js` (comportamiento)

- [x] Crear `React/tests/t27.test.js`.
- [x] Verificar que existen migración, modelo, servicio, controlador y rutas.
- [x] Verificar que `Project` carga imágenes y expone `cover_url`.
- [x] Verificar los límites: 10 imágenes, 5 MB, 1600 px y 500 caracteres.
- [x] Verificar que `Proyectos.jsx` usa `useSearchParams`, `cover_url`, `ProyectoDetalle` y el enlace `?proyecto=`.
- [x] Verificar que `ProyectoDetalle.jsx` usa `formatMonthYear`, `figure`, `figcaption`, comentario, imagen heredada y enlaces.
- [x] Verificar que `ProjectImageManager.jsx` sube, guarda comentario, elimina con confirmación y muestra el aviso público.
- [x] Verificar que `AdminProyectos.jsx` integra el gestor y el aviso de guardar primero.
- [x] Verificar que `SectionContext` y `App` gestionan el parámetro `proyecto`.
- [x] Probar en runtime `resumirDescripcion`: corta a 180, respeta palabras y añade `…`.
- [x] Verificar que las claves de i18n existen en los tres idiomas.

### T10.2 — `t28.test.js` (estilos)

- [x] Crear `React/tests/t28.test.js`.
- [x] Verificar `.proyecto-detalle`, `.proyecto-galeria`, `.proyecto-galeria__item`, `--solo` y `.proyecto-galeria__caption`.
- [x] Verificar rejilla de dos columnas en escritorio y una columna en `≤768px`.
- [x] Verificar `.project-images`, `.project-images__item`, miniatura y acciones.
- [x] Verificar el punto de ruptura del panel en `≤600px`.
- [x] Verificar `overflow-wrap` y `min-width: 0` en las zonas sensibles.
- [x] Verificar `prefers-reduced-motion`.

### T10.3 — Compatibilidad con tests existentes

- [x] `t17.8` y `t25.6`: `Proyectos.jsx` no usa `formatMonthYear`.
- [x] `t25.6`: se mantiene la limpieza de tecnologías y el marcado de etiquetas.
- [x] `t17.9`, `t17.10` y `t17.12`: el formulario de proyectos conserva sus restricciones.
- [x] `t20.3`, `t20.17` y `t20.18`: diccionarios equivalentes, sin dependencias nuevas y sin cadenas duras.
- [x] `t17.3`, `t4.4`, `t14`, `t1.4` y `t24`: sin regresiones.

---

## Fase 11 — Documentación y verificación automática

### T11.1 — `docs/despliegue.md`

- [x] Documentar el ajuste de `upload_max_filesize` a **8M** y `post_max_size` a **8M**.
- [x] Indicar el fichero `/etc/php/8.5/fpm/conf.d/99-portfolio-uploads.ini` y el reinicio de `php8.5-fpm`.
- [x] Dejar claro que `client_max_body_size 8m` ya existe en Nginx y que no se crea infraestructura nueva.

### T11.2 — Suites

- [x] `cd Laravel && php artisan test --compact` → **148/148**.
- [x] `cd React && npm test` → **278/278** (incluye `t27` y `t28`).
- [x] `cd React && npm run build` → sin errores.

### T11.3 — Comprobaciones de no regresión

- [x] Confirmar que no se ha modificado `package.json` ni `composer.json`.
- [x] Confirmar que `React/src/main.jsx`, `vite.config.js`, la configuración de Nginx y `deploy/publicar.sh` siguen intactos.
- [x] Confirmar que `AdminProyectos` sigue sin `placeholder=` y sin `type="month"` / `type="date"`.

### T11.4 — Comprobación funcional manual

Comprobada en navegador con datos de demostración sobre una base SQLite temporal:

- [x] «Ver proyecto» abre el detalle sin recargar y la URL pasa a `?proyecto=ID`.
- [x] Recargar `/?proyecto=ID` abre directamente el detalle y activa Proyectos.
- [x] «Volver a Proyectos» quita el parámetro y muestra la rejilla.
- [x] «Atrás» del navegador vuelve a la rejilla; «Adelante» reabre el detalle.
- [x] Un ID inexistente muestra «Proyecto no encontrado» y el enlace de vuelta.
- [x] Un proyecto sin imágenes muestra el detalle sin galería.
- [x] Un proyecto solo con `projects.image` muestra esa imagen como única figura, sin comentario.
- [x] Navegar a otra sección desde el detalle y volver a Proyectos muestra la rejilla, no el detalle.
- [x] Cambiar a catalán e inglés: todos los textos nuevos se traducen.
- [x] Subir una imagen sin comentario, subir otra con comentario y editar el comentario.
- [x] Eliminar una imagen: pide confirmación y, si era la portada, la siguiente pasa a serlo (`cover_url` verificado en la API).
- [x] Subir 10 imágenes: se impide añadir más y se explica el límite.
- [x] Rechazar un formato no admitido y un archivo de más de 5 MB con mensaje claro.
- [x] Comprobar que la imagen subida conserva la proporción, no supera 1600 px de ancho y no tiene EXIF (cubierto por `ProjectImageServiceTest`).
- [x] Comprobar que un lector no puede subir, editar ni borrar imágenes (cubierto por `ProjectImageTest`).

---

## Fase 12 — Cierre

### T12.1 — Datos de prueba

- [x] Eliminar cualquier proyecto temporal y sus imágenes usados en la comprobación manual (se usó una base SQLite temporal en `/tmp` y archivos de demostración ya borrados).
- [x] Confirmar que no se ha modificado ningún dato real: la base de desarrollo y la de producción no se tocaron.

### T12.2 — Memoria

- [x] Actualizar `MEMORY.md`: estado de la spec 022, decisiones relevantes y aprendizajes.

### T12.3 — Publicación (solo con confirmación expresa)

- [x] Pedir confirmación explícita antes de publicar.
- [x] Aplicar el límite de PHP de 8M en producción (`/etc/php/8.5/fpm/conf.d/99-portfolio-uploads.ini`) y reiniciar `php8.5-fpm`; FPM muestra `upload_max_filesize = 8M` y `post_max_size = 8M`.
- [x] Ejecutar `deploy/publicar.sh` → 278/278 frontend, 148/148 backend, build correcto y migración `2026_10_23_130152_create_project_images_table` aplicada en RDS.
- [x] Verificar que la web sigue respondiendo: raíz `200` con el portfolio, `/api/projects` `200` y `/?proyecto=2` abre el detalle sin galería.
- [x] Subir una imagen de prueba desde el panel de producción, comprobar la URL de CloudFront (`cdn.rbielsam.es`, `200`, `image/png`), el acceso directo a S3 (`403`) y borrarla; además se probó un PNG de 2,5 MB (por encima del límite anterior de 2 MB) que se guardó a 1200×700.
- [x] Revisar los logs de Laravel y de Nginx: sin errores nuevos (el único `production.ERROR` del log es del 19/10, de `setup-admin` sin interacción).

**Contenido**: tras la publicación se subieron a producción las **5 capturas del panel** del proyecto «Portfolio personal» (id 2), en el mismo orden y con los mismos comentarios que en local; la primera (perfil) es la portada. Verificado en `https://rbielsam.es/?proyecto=2` a 1440 y 375 px (5 figuras, sin desbordamiento) y las 5 URLs de CloudFront responden `200`.
