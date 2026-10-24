# Plan — Detalle de proyecto con galería comentada (Spec 022)

## Alcance

- **Full-stack**: migración, modelo, servicio de imágenes, peticiones, controlador, rutas, vista pública, panel, estilos, traducciones, documentación y tests.
- **Sin dependencias nuevas**: se reutilizan Laravel 13, PHP 8.5, Intervention Image 4, React 18, Vite y `react-router-dom` (ya instalado).
- **Sin infraestructura nueva**: mismo bucket de S3, misma distribución de CloudFront y mismo disco `photo_disk`.
- **Sin cambios en Nginx ni en `main.jsx`**: la URL del detalle es `/?proyecto=ID`, no una ruta nueva.
- **No se publica** en producción sin confirmación expresa.
- **No se modifica ningún dato real** durante la implementación.

## Stack confirmado

- Backend: Laravel 13 + PHP 8.5 + MySQL, con Intervention Image 4 y el disco configurable `photo_disk`.
- Frontend: React 18 + JavaScript + CSS3 + Vite, con `BrowserRouter` ya montado en `main.jsx`.
- Tests backend: `cd Laravel && php artisan test --compact`.
- Tests frontend: `cd React && npm test` → `node --test tests/*.test.js`.
- Build: `cd React && npm run build`.
- Producción: `deploy/publicar.sh` (tests, build, `rsync`, migraciones y cachés).

## Decisiones de implementación

### D1 — Modelo de datos: una colección ordenada de imágenes por proyecto

Nueva tabla `project_images`:

```text
id
project_id   → projects.id, ON DELETE CASCADE
path         string(255)
caption      string(500) nullable
position     unsigned integer, por defecto 0
timestamps
índice (project_id, position)
```

- `ProjectImage` será un modelo propio con `$fillable = ['path', 'caption', 'position']`, cast de `position` a entero y una relación `belongsTo(Project::class)`.
- `Project` gana `images(): HasMany`, ordenada por `position` y después por `id`.
- `position` se asigna al subir: `max(position) + 1`. La primera imagen queda en `0` y es la portada. No se renumera al borrar: el siguiente `position` más bajo pasa a ser la portada.
- `ProjectImage` expone `url` como atributo añadido y oculta `path`, `project_id` y timestamps en el JSON. El frontend solo necesita `id`, `caption`, `position` y `url`.
- `Project` expone `cover_url` como atributo añadido:
  1. Si tiene imágenes, la URL de la primera.
  2. Si no tiene imágenes y `projects.image` tiene valor absoluto (`http://` o `https://`), ese valor.
  3. Si no, resuelve `projects.image` con el disco `photo_disk`.
  4. Si no hay nada, `null`.
- `projects.image` **no se migra ni se elimina**: se conserva como respaldo heredado. No aparece en la sección de imágenes del panel.

### D2 — Almacenamiento y procesado de las imágenes

Nuevo `ProjectImageService`, siguiendo el patrón de `ProfilePhotoService` pero sin recorte:

- `DIRECTORY = 'projects'`.
- `MAX_WIDTH = 1600`.
- `QUALITY = 82`.
- Ruta: `projects/{project_id}/{Str::random(32)}.{ext}`.
- Procesado: `Image::decode(...)->orient()->scaleDown(width: 1600)` y re-codificación en el formato de origen (JPG, PNG o WebP).
- `scaleDown` **no amplía** imágenes pequeñas y **no recorta**; conserva la proporción.
- La re-codificación elimina los metadatos EXIF.
- Se usa `Storage::disk(config('filesystems.photo_disk', 'public'))`, igual que las fotos de perfil.
- `delete(?string $path)` solo borra rutas que empiecen por `projects/`; cualquier otra ruta se ignora.
- Si la escritura falla, lanza una excepción y no se crea la fila.
- Si la fila falla después de escribir el archivo, se borra el archivo para no dejar huérfanos.

### D3 — API pública y de administración

**Lectura pública**

`GET /api/projects` pasa a cargar las imágenes con `with('images')`. La respuesta mantiene todos los campos actuales y añade:

```json
{
  "id": 2,
  "title": "Portfolio personal",
  "image": "…",
  "cover_url": "https://cdn.rbielsam.es/projects/2/abc.jpg",
  "images": [
    {
      "id": 10,
      "caption": "Panel de administración con datos de ejemplo",
      "position": 0,
      "url": "https://cdn.rbielsam.es/projects/2/abc.jpg"
    }
  ]
}
```

No se crea un endpoint público de detalle: la lista ya trae la galería completa. El detalle se resuelve en el cliente con el proyecto ya cargado.

**Escritura protegida** (dentro de `auth:sanctum` + `role:admin,editor`):

```text
POST   /api/projects/{id}/images
PUT    /api/projects/{id}/images/{imageId}
DELETE /api/projects/{id}/images/{imageId}
```

- `POST` acepta `image` (obligatoria) y `caption` (opcional).
- `PUT` acepta `caption` (opcional; cadena vacía se normaliza a `null`).
- `DELETE` elimina la fila y el archivo.
- El `projectId` y el `imageId` se validan juntos: una imagen de otro proyecto devuelve `404`.
- El máximo de imágenes se comprueba en el controlador y devuelve `422` con un mensaje traducido.

**Validación**

- `image`: `required`, `file`, `mimes:jpg,jpeg,png,webp`, `max:5120` (5 MB).
- `caption`: `nullable`, `string`, `max:500`.
- Se reutiliza el patrón de `prepareForValidation` de la foto de perfil para las subidas inválidas.

**Borrado de proyectos**

`ProjectController@destroy` recoge las rutas de las imágenes, borra el proyecto (la FK elimina las filas) y después elimina los archivos. También intenta borrar `projects.image` si es una ruta relativa bajo `projects/`; el servicio ignora URLs externas y rutas de otros directorios.

**Respuestas de escritura de proyectos**

`store` y `update` devuelven el proyecto con `load('images')` para que el panel conserve la galería en su estado local después de guardar los campos del proyecto.

### D4 — URL compartible y navegación

- `SectionContext` inicializa `activeSection` a `'Proyectos'` si la URL contiene `?proyecto=`. Si no, a `'Inicio'`.
- `AppContent` usa `useSearchParams` y, cuando `activeSection !== 'Proyectos'`, elimina `proyecto` de la URL con `replace: true`.
- `Proyectos.jsx` usa `useSearchParams`:
  - Lee `proyecto`.
  - Al pulsar «Ver proyecto», actualiza la URL con `setSearchParams` conservando otros parámetros.
  - Al pulsar «Volver a Proyectos», elimina `proyecto` con `replace: true`.
  - El botón «Atrás» del navegador funciona porque `useSearchParams` reacciona al historial.
- Al abrir o cerrar el detalle se desplaza la vista al inicio de la página.
- Un ID inexistente muestra «Proyecto no encontrado» y un enlace para volver a la lista.
- No se añaden rutas nuevas, no se toca Nginx y no se cambia `BrowserRouter`.

### D5 — Vista pública del detalle

Nuevo `React/src/components/sections/ProyectoDetalle.jsx`:

```jsx
<article className="proyecto-detalle">
  <a className="proyecto-detalle__back" href="/" onClick={…}>← Volver a Proyectos</a>
  <h3 className="proyecto-detalle__title">…</h3>
  <div className="proyecto-detalle__meta">
    <span className="proyecto-detalle__date">…</span>
    <ul className="section__item-tags">…</ul>
  </div>
  <p className="proyecto-detalle__description">…</p>
  <a className="proyecto-detalle__link" target="_blank" rel="noopener noreferrer">Abrir sitio ↗</a>
  <div className="proyecto-galeria">
    <figure className="proyecto-galeria__item [--solo]">
      <img className="proyecto-galeria__image" loading="lazy" />
      <figcaption className="proyecto-galeria__caption">…</figcaption>
    </figure>
  </div>
</article>
```

- La fecha se formatea con `formatMonthYear(project.date, lang)`; si devuelve cadena vacía, no se muestra.
- Las tecnologías llegan ya limpias desde `Proyectos.jsx`.
- La galería usa `project.images`. Si está vacía y existe `project.cover_url`, se muestra una única figura con la imagen heredada y sin comentario. Si no hay nada, no se renderiza la galería.
- Cada figura con comentario usa `figure` + `figcaption`; sin comentario usa la clase modificadora `proyecto-galeria__item--solo` para que la imagen ocupe todo el ancho.
- `alt` = `t('proyectos.imagen_alt', { n, title })`.
- El comentario conserva saltos de línea con `white-space: pre-line`.
- El enlace externo solo aparece si `project.url` existe.
- El título del proyecto es `h3`; el `h2` sigue siendo el de la sección.

### D6 — Tarjeta de proyecto

`Proyectos.jsx`:

- Usa `item.cover_url` para la portada; ya no usa `item.image` directamente.
- Muestra el resumen con `resumirDescripcion(item.description)`.
- Mantiene las etiquetas de tecnologías con la misma limpieza actual.
- El enlace «Ver proyecto» pasa a ser un `<a href={`?proyecto=${item.id}`}>` con `onClick` que evita la recarga y actualiza el historial. Así el enlace es real, compartible y accesible con teclado.
- Se elimina el enlace externo de la tarjeta; el enlace externo vive en el detalle.
- La flecha pasa de `↗` a `→` para indicar navegación interna.
- **No se importa `formatMonthYear` en `Proyectos.jsx`** (tests `t17.8` y `t25.6`).
- La limpieza de tecnologías se mantiene en `Proyectos.jsx` mediante `parseTecnologias`, para conservar las expresiones que exige `t25.6`.

Nuevo `React/src/utils/text.js`:

```js
export function resumirDescripcion(texto, max = 180) {
  if (!texto) return '';
  const limpio = String(texto).trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const ultimoEspacio = corte.lastIndexOf(' ');
  const base = ultimoEspacio > 0 ? corte.slice(0, ultimoEspacio) : corte;
  return `${base.trimEnd()}…`;
}
```

- El resumen corta en un límite de palabra y añade `…`.
- Se prueba en runtime desde `t27`.

### D7 — Gestión de imágenes en el panel

Nuevo `React/src/components/admin/ProjectImageManager.jsx`:

- Se muestra **solo** cuando se está editando un proyecto ya guardado (`editing?.id`).
- Para un proyecto nuevo se muestra el aviso «Guarda el proyecto antes de añadir imágenes».
- Contenido:
  - Título «Imágenes del proyecto» y ayuda «La primera imagen se usa como portada».
  - Aviso visible de contenido público y de no subir datos personales, correos, mensajes, tokens ni capturas sin redactar.
  - Formulario de subida: archivo + comentario opcional + botón.
  - Lista de imágenes: miniatura, insignia «Portada» en la primera, comentario editable, botón «Guardar comentario» y botón «Eliminar imagen».
  - Confirmación con `window.confirm` antes de eliminar.
  - Mensaje cuando se alcanza el máximo de 10 imágenes o cuando no hay ninguna.
- Validación en cliente: extensión, 5 MB, máximo 10 imágenes y 500 caracteres de comentario.
- Llamadas:
  - `api.upload('/projects/{id}/images', formData)`.
  - `api.put('/projects/{id}/images/{imageId}', { caption })`.
  - `api.delete('/projects/{id}/images/{imageId}')`.
- La lista se mantiene en estado local y se notifica al padre con `onImagesChange(images)`.
- Tras cada cambio, el padre actualiza `editing.images` y la entrada correspondiente de `data`, incluida `cover_url` (primera imagen o `null`).
- `AdminProyectos` renderiza el gestor **después** del formulario del proyecto, no dentro, para evitar formularios anidados.
- Se conservan el CRUD actual, los permisos `can('projects')` y los botones de añadir/editar/borrar.
- Sin `placeholder` en `AdminProyectos` (test `t17.10`).

### D8 — Estilos y responsive

**Web pública — `sections.css`**

- `.proyecto-detalle`: ancho máximo `--content-max`, padding vertical, alineación a la izquierda.
- `.proyecto-detalle__back`: enlace de acento, foco visible, separación inferior.
- `.proyecto-detalle__title`: tamaño de titular, `overflow-wrap`.
- `.proyecto-detalle__meta`: fila con `flex-wrap` para fecha y tecnologías.
- `.proyecto-detalle__date`: monoespaciada, mayúsculas, acento.
- `.proyecto-detalle__description`: `max-width: --reading-max`, `line-height: 1.7`, `white-space: pre-line`.
- `.proyecto-detalle__link`: enlace de acento con foco visible.
- `.proyecto-galeria`: columna con separación.
- `.proyecto-galeria__item`: rejilla de dos columnas, imagen a la izquierda y comentario a la derecha, alineadas al centro.
- `.proyecto-galeria__item--solo`: una sola columna.
- `.proyecto-galeria__image`: ancho 100%, altura automática, borde, radio y fondo de superficie para que una imagen rota siga ocupando un espacio reconocible.
- `.proyecto-galeria__caption`: `max-width: --reading-max`, `line-height: 1.7`, `white-space: pre-line`, `overflow-wrap`, borde izquierdo de acento.
- `.proyecto-detalle__not-found`: mensaje centrado con enlace de vuelta.
- `.section__item-link` se reutiliza para el enlace interno; si hiciera falta, se añade un reset de botón, pero se usará un `<a>` real.

**Panel — `admin.css`**

- `.project-images`: contenedor con superficie, borde, padding y ancho máximo.
- `.project-images__warning`: aviso destacado, fondo cálido y borde de advertencia.
- `.project-images__list`: columna con separación.
- `.project-images__item`: rejilla `140px minmax(0, 1fr)` con miniatura y cuerpo.
- `.project-images__thumb`: miniatura 4:3 con `object-fit: cover`.
- `.project-images__body`, `.project-images__actions`: columna y acciones con `flex-wrap`.
- `.project-images__upload`: formulario con separación y borde superior.

**Responsive**

- `≤768px`:
  - La galería pasa a una columna: imagen arriba y comentario debajo.
  - El comentario pierde el borde izquierdo y gana separación superior.
  - El detalle reduce padding y tamaño de título.
- `≤600px`:
  - Cada imagen del panel pasa a una columna; la miniatura ocupa el ancho disponible con proporción controlada.
- `≤480px`:
  - Ajustes de padding y tipografía del detalle.
- En todos los casos:
  - `min-width: 0` en columnas de rejilla.
  - `overflow-wrap: break-word` en títulos y comentarios.
  - Sin `overflow-x` horizontal.
  - Botones y etiquetas con `flex-wrap`.
- Se mantiene `prefers-reduced-motion: reduce`.

**Puntos de comprobación**

- 1440 px: detalle a dos columnas, imagen y comentario lado a lado.
- 1024 px: rejilla y galería sin desbordamiento.
- 768 px: galería apilada; panel usable.
- 480 px, 375×812 y 320 px: una columna, sin scroll horizontal, botones y textos envueltos.

### D9 — Traducciones

Se añaden las mismas claves en `es.js`, `ca.js` y `en.js`:

```text
proyectos.volver
proyectos.abrir_sitio
proyectos.no_encontrado
proyectos.no_encontrado_ayuda
proyectos.imagen_alt
proyectos.imagenes
proyectos.imagenes_ayuda
proyectos.imagenes_publicas
proyectos.guardar_primero
proyectos.añadir_imagen
proyectos.subir_imagen
proyectos.subiendo
proyectos.comentario
proyectos.comentario_ayuda
proyectos.guardar_comentario
proyectos.portada
proyectos.eliminar_imagen
proyectos.imagen_confirmar
proyectos.imagen_limite
proyectos.imagen_error_formato
proyectos.imagen_error_tamano
proyectos.imagen_error_subir
proyectos.imagen_error_comentario
proyectos.imagen_error_eliminar
proyectos.sin_imagenes
```

- Se conserva `proyectos.ver` para «Ver proyecto».
- Backend: `Laravel/lang/{es,ca,en}/project_images.php` con el mensaje de límite y `caption` añadido a los atributos de `validation.php`.
- Todos los textos de interfaz usan `t()`; no se añaden cadenas duras.

### D10 — Privacidad, seguridad y caché

- Las imágenes y comentarios son públicos; el panel muestra el aviso de forma visible.
- Las rutas de administración siguen protegidas por `auth:sanctum` y `role:admin,editor`.
- El JSON no expone `path` ni rutas internas; solo la URL resuelta.
- La re-codificación elimina EXIF.
- No se suben datos personales; las capturas deben estar redactadas o usar datos de ejemplo.
- **Limitación conocida**: al borrar una imagen se elimina el objeto de S3 y la fila, pero CloudFront puede conservar la URL antigua en caché hasta que expire. No se añade invalidación de CloudFront en esta spec. La galería deja de referenciarla inmediatamente.

### D11 — Despliegue y límites de subida

- En producción, `upload_max_filesize` está en **2M** y el límite de la spec es **5 MB**. Antes de publicar hay que subirlo a **8M**:
  - Crear `/etc/php/8.5/fpm/conf.d/99-portfolio-uploads.ini` con `upload_max_filesize = 8M` y `post_max_size = 8M`.
  - Reiniciar `php8.5-fpm`.
  - Verificar que FPM lo aplica.
- `client_max_body_size 8m` ya está en Nginx.
- `post_max_size` ya está en 8M.
- No se crean bucket, distribución, certificado ni política IAM: el rol actual ya permite `s3:PutObject`, `s3:GetObject` y `s3:DeleteObject` sobre `arn:aws:s3:::<bucket-fotos>/*`.
- `deploy/publicar.sh` ya ejecuta `php artisan migrate --force`; no hay que modificarlo.
- Documentar el ajuste de PHP en `docs/despliegue.md`.
- **No aplicar el cambio de PHP ni publicar sin confirmación.**

## Estructura de ficheros

### Nuevos

```text
Laravel/database/migrations/2026_10_23_120000_create_project_images_table.php
Laravel/app/Models/ProjectImage.php
Laravel/app/Services/ProjectImageService.php
Laravel/app/Http/Requests/StoreProjectImageRequest.php
Laravel/app/Http/Requests/UpdateProjectImageRequest.php
Laravel/app/Http/Controllers/Api/ProjectImageController.php
Laravel/lang/es/project_images.php
Laravel/lang/ca/project_images.php
Laravel/lang/en/project_images.php
Laravel/tests/Feature/ProjectImageServiceTest.php
Laravel/tests/Feature/ProjectImageTest.php
React/src/components/sections/ProyectoDetalle.jsx
React/src/components/admin/ProjectImageManager.jsx
React/src/utils/text.js
React/tests/t27.test.js
React/tests/t28.test.js
```

### Modificados

```text
Laravel/app/Models/Project.php
Laravel/app/Http/Controllers/Api/ProjectController.php
Laravel/routes/api.php
Laravel/lang/es/validation.php
Laravel/lang/ca/validation.php
Laravel/lang/en/validation.php
docs/despliegue.md
React/src/context/SectionContext.jsx
React/src/App.jsx
React/src/components/sections/Proyectos.jsx
React/src/pages/admin/AdminProyectos.jsx
React/src/styles/sections.css
React/src/styles/admin.css
React/src/i18n/es.js
React/src/i18n/ca.js
React/src/i18n/en.js
```

> **No se modifican** `React/src/main.jsx`, `vite.config.js`, `composer.json`, `package.json`, la configuración de Nginx ni `deploy/publicar.sh`.

## Compatibilidad con tests existentes

| Test | Qué exige | Cómo se cumple |
|---|---|---|
| `t17.8` / `t25.6` | `Proyectos.jsx` no usa `formatMonthYear` | El formato de fecha vive en `ProyectoDetalle.jsx` |
| `t25.6` | `Proyectos.jsx` separa por comas, recorta, filtra vacíos, elimina duplicados y usa `section__item-tags`/`section__item-tag` | Se mantiene `parseTecnologias` y el marcado de etiquetas |
| `t17.9` | `AdminProyectos` no usa `type="month"` ni `type="date"` | El gestor de imágenes usa `type="file"` en un componente aparte |
| `t17.10` | `AdminProyectos` no usa `placeholder=` | El gestor no añade placeholders y AdminProyectos conserva sus campos |
| `t17.12` | `AdminProyectos` usa `admin-form__textarea` | El textarea de descripción se mantiene |
| `t20.3` | Los tres diccionarios tienen las mismas claves | Las nuevas claves se añaden en es/ca/en |
| `t20.17` | No hay dependencias nuevas | Se usa `react-router-dom`, ya instalado |
| `t20.18` | Sin cadenas duras conocidas en los componentes | Todos los textos nuevos usan `t()` |
| `t17.3` | `Project` conserva `toArray()`, `format('Y-m')` y `parent::toArray()` | Se mantiene y se añade `cover_url` |
| `t4.4` | `Proyectos` usa `useFetch('/projects')` | Se mantiene |
| `t14` | El panel conserva añadir/editar/borrar | Se mantiene el CRUD y se añade el gestor |
| `t1.4` | `main.jsx` usa `BrowserRouter` | No se toca |
| `t24` | Inicio sigue prefiriendo `photo_url` | No se toca |
| `ApiReadTest` / `DateFormatTest` | La API de proyectos mantiene título, fecha y orden | Se añaden campos, no se eliminan |

## Pasos de implementación

1. Crear la migración `project_images` y el modelo `ProjectImage`.
2. Añadir `images()` y `cover_url` a `Project`; mantener `toArray()` y el formato de fecha.
3. Crear `ProjectImageService` con escalado, re-codificación, disco y borrado seguro.
4. Crear los FormRequest de subida y de comentario.
5. Crear `ProjectImageController` y registrar las rutas protegidas.
6. Actualizar `ProjectController` (`with('images')`, `load('images')` y borrado de archivos) y las respuestas de `store`/`update`.
7. Añadir las traducciones de backend (`project_images.php` y atributo `caption`).
8. Escribir los tests backend de servicio y API.
9. Inicializar la sección desde `?proyecto=` en `SectionContext` y limpiar el parámetro al salir de Proyectos en `App`.
10. Reestructurar `Proyectos.jsx`: `useSearchParams`, portada, resumen, enlace interno y paso de tecnologías al detalle.
11. Crear `ProyectoDetalle.jsx` con fecha, tecnologías, descripción, enlace externo y galería comentada.
12. Crear `utils/text.js` con el resumen de 180 caracteres.
13. Crear `ProjectImageManager.jsx` e integrarlo en `AdminProyectos.jsx`.
14. Añadir las claves de i18n en es/ca/en.
15. Completar `sections.css` y `admin.css` con el detalle, la galería, el gestor y los puntos de ruptura.
16. Crear `t27.test.js` (comportamiento, API y navegación) y `t28.test.js` (estilos y responsive).
17. Actualizar `docs/despliegue.md` con el límite de PHP.
18. Ejecutar suites, build y comprobación visual.
19. Actualizar `MEMORY.md`.
20. Publicar solo con confirmación expresa.

## Verificación

### Automática

- `cd Laravel && php artisan test --compact` → todos los tests actuales y los nuevos en verde.
- `cd React && npm test` → todos los tests actuales + `t27` + `t28`.
- `cd React && npm run build` → sin errores.
- Comprobar que no se ha modificado `package.json` ni `composer.json`.
- Comprobar que `AdminProyectos` sigue sin `placeholder=` y sin `type="month"`/`type="date"`.

`ProjectImageServiceTest` cubre:

- Ruta `projects/{id}/…`, nombre aleatorio y extensión correcta.
- Imagen panorámica 2000×1000 → 1600×800, sin recorte.
- Imagen vertical 1000×2000 → 1000×2000, sin recorte ni ampliación.
- Imagen pequeña 800×600 → 800×600.
- Borrado del archivo y tolerancia a archivos inexistentes.
- Borrado seguro: no borra rutas fuera de `projects/`.
- Uso del disco configurado (`public` y `s3` simulados).

`ProjectImageTest` cubre:

- `POST`, `PUT` y `DELETE` requieren autenticación.
- Lector recibe `403`; editor y administrador pueden escribir.
- Subida válida: `201`, fila en BD, archivo en disco, `url` en la respuesta.
- Formatos JPG, PNG y WebP aceptados; archivo no imagen rechazado.
- Archivo ausente y archivo de más de 5 MB rechazados.
- Comentario opcional, máximo 500 caracteres y actualización posterior.
- Orden por `position` en la respuesta pública.
- `cover_url` es la primera imagen; al borrarla pasa la siguiente.
- Imagen heredada como `cover_url` cuando no hay galería.
- Imagen de otro proyecto devuelve `404` al editar o borrar.
- Borrado de imagen: fila y archivo desaparecen.
- Borrado de proyecto: filas y archivos desaparecen.
- Límite de 10 imágenes devuelve `422`.
- El JSON público no incluye `path`.
- La URL se resuelve con el disco configurado y conserva URLs absolutas.

`t27.test.js` cubre (lectura estática y runtime):

- Migración, modelo, servicio, controlador y rutas existen.
- `Project` carga imágenes y expone `cover_url`.
- Límites 10 imágenes, 5 MB, 1600 px, 500 caracteres.
- `Proyectos.jsx` usa `useSearchParams`, `cover_url`, `ProyectoDetalle` y el enlace `?proyecto=`.
- `ProyectoDetalle.jsx` usa `formatMonthYear`, `figure`, `figcaption`, comentario, imagen heredada y enlaces.
- `ProjectImageManager.jsx` sube, guarda comentario, elimina con confirmación y muestra el aviso público.
- `AdminProyectos.jsx` integra el gestor y el aviso de guardar primero.
- `SectionContext` y `App` gestionan el parámetro `proyecto`.
- `resumirDescripcion` corta a 180 caracteres, respeta palabras y añade `…`.
- Las claves de i18n existen en los tres idiomas.

`t28.test.js` cubre (lectura estática de CSS):

- `.proyecto-detalle`, `.proyecto-galeria`, `.proyecto-galeria__item`, `--solo` y `.proyecto-galeria__caption`.
- Rejilla de dos columnas en escritorio y una columna en `≤768px`.
- `.project-images`, `.project-images__item`, miniatura y acciones.
- Punto de ruptura del panel en `≤600px`.
- `overflow-wrap` y `min-width: 0` en las zonas sensibles.
- `prefers-reduced-motion`.

### Manual — navegador

Con datos locales o de prueba:

**Web pública**

1. **1440 px**: la tarjeta muestra portada, título, resumen de 180 caracteres, tecnologías y «Ver proyecto →».
2. Pulsar «Ver proyecto»: se abre el detalle, la URL pasa a `?proyecto=ID`, la vista sube al inicio y no recarga.
3. El detalle muestra, en orden: volver, título, fecha, tecnologías, descripción, «Abrir sitio» y galería.
4. Cada imagen se ve con su comentario al lado; las imágenes sin comentario ocupan el ancho completo.
5. Los comentarios con saltos de línea se conservan; los muy largos no desbordan.
6. «Abrir sitio» abre en pestaña nueva; si no hay URL, no aparece.
7. «Volver a Proyectos» quita el parámetro y muestra la rejilla.
8. El botón «Atrás» del navegador vuelve a la rejilla; «Adelante» reabre el detalle.
9. Recargar `/?proyecto=ID` abre directamente el detalle y activa Proyectos.
10. Un ID inexistente muestra «Proyecto no encontrado» y el enlace de vuelta.
11. Un proyecto sin imágenes muestra el detalle sin galería.
12. Un proyecto solo con `projects.image` muestra esa imagen como única figura, sin comentario.
13. Navegar a otra sección desde el detalle y volver a Proyectos muestra la rejilla, no el detalle.
14. **1024, 768, 480, 375×812 y 320 px**: la galería se apila a una columna, no hay scroll horizontal y los textos no se solapan.
15. Cambiar a catalán e inglés: todos los textos nuevos se traducen.
16. `prefers-reduced-motion`: sin animaciones añadidas.

**Panel**

17. Crear un proyecto: no aparece el gestor y sí el aviso de guardar primero.
18. Editar el proyecto: aparece «Imágenes del proyecto» con el aviso de contenido público.
19. Subir una imagen sin comentario: se añade a la lista y a la galería pública.
20. Subir una imagen con comentario: se guarda y se muestra junto a la imagen.
21. Editar un comentario y guardar: se actualiza en el panel y en la web.
22. Eliminar una imagen: pide confirmación, desaparece de la lista y del detalle; si era la portada, la siguiente pasa a serlo.
23. Subir 10 imágenes: el botón se deshabilita y se explica el límite.
24. Subir un archivo no admitido o de más de 5 MB: se rechaza con un mensaje claro.
25. Comprobar que la imagen subida conserva la proporción, no supera 1600 px de ancho y no tiene EXIF.
26. **1440, 768, 375 y 320 px**: el gestor no desborda; miniaturas, comentarios y botones se apilan.
27. Comprobar que un lector no puede subir, editar ni borrar imágenes.

### Datos

- No se modifica ningún dato real durante la implementación.
- Para la comprobación manual se puede crear un proyecto temporal y varias imágenes de prueba; al terminar se eliminan.
- No se ejecutan migraciones ni cambios de PHP en producción sin confirmación.

### Despliegue (solo tras aprobación)

1. Aplicar el límite de PHP de 8M y reiniciar `php8.5-fpm`.
2. Ejecutar `deploy/publicar.sh`.
3. Verificar que la migración se aplica y que la web sigue respondiendo.
4. Subir una imagen de prueba desde el panel de producción, comprobar la URL de CloudFront y borrarla.
5. Revisar los logs de Laravel y de Nginx.

## Limitaciones conocidas

- CloudFront puede conservar en caché una imagen borrada hasta que expire; no se invalida el CDN en esta spec.
- La imagen heredada de `projects.image` no se gestiona desde el panel; solo actúa como respaldo.
- No hay reordenación manual de imágenes, lightbox, carrusel ni vídeo.
- Las miniaturas del panel usan la misma URL que la imagen completa; no se generan miniaturas de servidor.

## Criterios de finalización del plan

- La migración y el modelo permiten varias imágenes ordenadas por proyecto, con comentario opcional.
- La API pública devuelve `images` y `cover_url`; las rutas de escritura están protegidas.
- La tarjeta muestra portada y resumen; «Ver proyecto» abre el detalle interno.
- El detalle muestra la información completa y la galería con un comentario junto a cada imagen.
- El panel permite subir, comentar, editar el comentario y eliminar imágenes, con aviso de contenido público.
- La primera imagen es la portada; al eliminarla pasa la siguiente.
- `?proyecto=ID` abre el detalle, se actualiza sin recargar y el botón «Atrás» vuelve a la lista.
- Los proyectos sin imágenes y los que solo tienen imagen heredada se muestran correctamente.
- Los límites de 10 imágenes, 5 MB, 500 caracteres y 1600 px se respetan.
- No hay desbordamiento horizontal entre 320 px y 1440 px, ni en la web ni en el panel.
- Las suites de pruebas y el build están en verde.
- `docs/despliegue.md` recoge el ajuste de `upload_max_filesize`.
