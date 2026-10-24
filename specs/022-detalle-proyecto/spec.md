# Spec 022 — Detalle de proyecto con galería comentada

## Contexto y objetivo

Hoy la sección **Proyectos** muestra una rejilla de tarjetas con título, descripción, tecnologías y, si existe, una imagen. El enlace «Ver proyecto» lleva directamente a la URL externa del proyecto, de modo que el visitante sale del portfolio y no puede ver nada más sobre él.

La columna `projects.image` existe y la tarjeta la muestra si tiene valor, pero el panel **no permite subir ni editar imágenes de proyecto**. Tampoco existe una forma de explicar qué se está viendo en cada captura.

La persona usuaria quiere que «Ver proyecto» abra una **vista interna de detalle** con una o varias imágenes del proyecto y un **comentario cerca de cada imagen**. Los comentarios sirven para explicar zonas que un visitante no puede ver sin iniciar sesión y para reforzar con imágenes lo que sí se ve.

**Objetivo**: convertir «Ver proyecto» en una vista de detalle dentro del portfolio, con una galería de imágenes comentadas gestionada desde el panel, sin salir del sitio y sin añadir infraestructura nueva.

## Usuarios

- **Visitante** del portfolio: quiere entender qué hace el proyecto, ver capturas reales y leer la explicación de cada zona sin necesidad de iniciar sesión.
- **Persona propietaria** del portfolio (administrador o editor): sube las imágenes desde el panel, escribe el comentario de cada una, las ordena por orden de subida y las elimina cuando ya no las necesita.

## Diagnóstico técnico

| Zona | Situación actual |
|---|---|
| `Proyectos.jsx` | Tarjeta con imagen, título, descripción completa, tecnologías y enlace externo. No hay vista de detalle. |
| `projects.image` | Columna de texto con una única URL o ruta. La API la devuelve tal cual y la tarjeta la muestra si existe. El panel no la edita. |
| `AdminProyectos.jsx` | El formulario guarda título, descripción, URL, tecnologías y fecha. No hay gestión de imágenes. |
| API de proyectos | Lectura pública de la lista y escritura protegida para administradores y editores. No hay recurso de imágenes por proyecto. |
| Almacenamiento | Existe un disco de fotos (`photo_disk`) que en producción usa S3 y CloudFront. Las fotos de perfil se procesan con Intervention Image, pero se recortan en cuadrado, un tratamiento que no sirve para capturas de pantalla. |
| Navegación | La web pública es una single page con secciones por estado (`SectionContext`). No hay router ni URLs por sección. |

La vista de detalle se integrará en la sección **Proyectos** existente. No será un subdominio ni un sitio aparte: la URL compartible será la misma del portfolio con un parámetro `?proyecto=ID`.

## Requisitos funcionales

### RF-1 — Tarjeta de proyecto con portada y resumen

**QUÉ**: la tarjeta de cada proyecto muestra una imagen de portada, el título, un resumen de la descripción, las tecnologías y el enlace «Ver proyecto», que abre el detalle interno.

**POR QUÉ**: las descripciones completas hacen las tarjetas muy largas y el enlace actual expulsa al visitante del portfolio. Una tarjeta más breve permite escanear la lista y decidir qué proyecto abrir.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** mostrar como portada la **primera imagen** de la galería del proyecto.
- **Cuando** el proyecto no tenga imágenes en la galería pero sí una imagen heredada en `projects.image`, **el sistema deberá** usar esa imagen como portada.
- **Cuando** el proyecto no tenga ninguna imagen, **el sistema deberá** mostrar la tarjeta sin bloque de imagen y sin romper la alineación de la rejilla.
- **El sistema deberá** mostrar un **resumen** de la descripción, no el texto completo.
- **El sistema deberá** limitar el resumen a un máximo aproximado de **180 caracteres**, cortando en un límite de palabra y añadiendo puntos suspensivos cuando la descripción sea más larga.
- **Cuando** la descripción tenga 180 caracteres o menos, **el sistema deberá** mostrarla completa.
- **El sistema deberá** mostrar las tecnologías como etiquetas, con el mismo tratamiento y la misma limpieza de valores que en la versión actual.
- **El sistema deberá** mostrar el enlace **«Ver proyecto»** y, al pulsarlo, abrir el detalle interno del proyecto.
- **El sistema deberá** dejar de mostrar el enlace externo en la tarjeta; el enlace externo pasará al detalle como **«Abrir sitio»**.

### RF-2 — Vista de detalle del proyecto

**QUÉ**: al abrir «Ver proyecto» se muestra una vista interna con la información completa del proyecto y su galería comentada, con un camino claro de vuelta a la lista.

**POR QUÉ**: el visitante necesita contexto (título, fecha, tecnologías, descripción) antes de interpretar las capturas, y debe poder volver a la lista sin usar el botón del navegador.

**Criterios de aceptación (EARS)**:

- **Cuando** el visitante pulse «Ver proyecto», **el sistema deberá** mostrar la vista de detalle dentro de la sección Proyectos, sin recargar la página.
- **El sistema deberá** mostrar en el detalle, en este orden: enlace «Volver a Proyectos», título, fecha, tecnologías, descripción completa, enlace «Abrir sitio» (si existe URL) y galería de imágenes.
- **El sistema deberá** mostrar la fecha en formato «Mes Año» según el idioma activo, usando el mismo criterio que el resto del portfolio.
- **Cuando** el proyecto no tenga fecha, **el sistema deberá** omitir ese dato sin dejar un hueco vacío.
- **Cuando** el proyecto no tenga tecnologías, **el sistema deberá** omitir ese bloque.
- **Cuando** el proyecto no tenga descripción, **el sistema deberá** mostrar el detalle con el resto de bloques disponibles.
- **Cuando** el proyecto tenga URL, **el sistema deberá** mostrar el enlace «Abrir sitio» y abrirlo en una pestaña nueva con `rel="noopener noreferrer"`.
- **Cuando** el proyecto no tenga URL, **el sistema deberá** omitir el enlace «Abrir sitio».
- **Cuando** el visitante pulse «Volver a Proyectos», **el sistema deberá** volver a la rejilla de proyectos.
- **El sistema deberá** mantener visibles la cabecera, el pie y la navegación general mientras se muestra el detalle.

### RF-3 — Galería con un comentario junto a cada imagen

**QUÉ**: el detalle muestra las imágenes del proyecto en orden y, junto a cada una, el comentario que la persona propietaria haya escrito para explicarla.

**POR QUÉ**: una captura sin explicación obliga a adivinar qué se está viendo. El comentario permite señalar la zona relevante, explicar lo que no se ve sin login o reforzar visualmente una funcionalidad.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** mostrar las imágenes en el orden definido por la persona propietaria (orden de subida).
- **El sistema deberá** asociar cada comentario a su imagen y mostrarlo **junto a ella**, no en una lista separada.
- **Cuando** la pantalla mida **768 px o más**, **el sistema deberá** mostrar cada imagen y su comentario en la misma fila, con la imagen a la izquierda y el comentario a la derecha.
- **Cuando** la pantalla mida **menos de 768 px**, **el sistema deberá** apilar la imagen y su comentario, con el comentario debajo.
- **Cuando** una imagen tenga comentario, **el sistema deberá** mostrarlo completo, conservando los saltos de línea y sin truncarlo.
- **Cuando** una imagen no tenga comentario, **el sistema deberá** mostrarla sin bloque de comentario y sin reservar un hueco vacío.
- **El sistema deberá** conservar la proporción de cada imagen y no deformarla.
- **El sistema deberá** limitar el ancho de visualización de la imagen para que no supere el ancho de lectura del detalle.
- **Cuando** una imagen no se pueda cargar, **el sistema deberá** mostrar un texto alternativo o un marcador que identifique el proyecto, sin romper la maquetación.
- **Cuando** el proyecto no tenga imágenes en la galería pero sí una imagen heredada en `projects.image`, **el sistema deberá** mostrarla como única imagen del detalle, sin comentario.
- **Cuando** el proyecto no tenga ninguna imagen, **el sistema deberá** mostrar el detalle sin galería y sin un bloque vacío.

### RF-4 — Gestión de imágenes y comentarios desde el panel

**QUÉ**: desde el formulario de un proyecto ya guardado, la persona administradora o editora puede añadir imágenes, escribir o editar el comentario de cada una y eliminarlas.

**POR QUÉ**: las imágenes y sus explicaciones son contenido del portfolio y deben poder actualizarse sin tocar código ni la base de datos a mano.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** mostrar la sección **«Imágenes del proyecto»** en el formulario de edición de un proyecto ya existente.
- **Cuando** el proyecto sea nuevo y todavía no esté guardado, **el sistema deberá** indicar que primero hay que guardar el proyecto para poder añadir imágenes.
- **El sistema deberá** permitir seleccionar una imagen, escribir un comentario opcional y subirla.
- **Cuando** la subida termine correctamente, **el sistema deberá** mostrar la imagen en la lista del panel y en la galería pública.
- **El sistema deberá** mostrar para cada imagen una miniatura, su comentario y las acciones de guardar comentario y eliminar.
- **El sistema deberá** permitir editar el comentario de una imagen ya subida y guardarlo sin volver a subir la imagen.
- **El sistema deberá** pedir confirmación antes de eliminar una imagen.
- **Cuando** se elimine una imagen, **el sistema deberá** quitarla de la galería, borrar su archivo almacenado y reordenar la portada si era la primera.
- **Cuando** se elimine un proyecto, **el sistema deberá** eliminar también todas sus imágenes almacenadas.
- **El sistema deberá** marcar visualmente la primera imagen como **«Portada»**.
- **Cuando** se elimine la portada, **el sistema deberá** usar como nueva portada la siguiente imagen disponible.
- **El sistema deberá** mostrar un aviso visible de que las imágenes y los comentarios son **públicos** y de que no deben contener correos, nombres, mensajes, tokens ni datos personales; se usarán capturas redactadas o con datos de ejemplo.
- **Cuando** falle una subida, **el sistema deberá** mostrar un mensaje de error y conservar las imágenes que ya existían.
- **Cuando** falle el guardado de un comentario, **el sistema deberá** mostrar un mensaje de error y mantener el comentario anterior.
- **El sistema deberá** aplicar los mismos permisos que ya protegen la edición de proyectos: solo administradores y editores con permiso sobre Proyectos podrán gestionar imágenes.

### RF-5 — Límites y tratamiento de las imágenes

**QUÉ**: las imágenes se validan, se procesan y se almacenan con unas reglas comunes para que la galería sea ligera, segura y predecible.

**POR QUÉ**: una captura de pantalla completa puede pesar varios megabytes y contener metadatos; sin límites, la galería se vuelve lenta y puede exponer información que no se ve a simple vista.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** aceptar imágenes en formato **JPG, PNG y WebP**.
- **Cuando** se seleccione un formato no admitido, **el sistema deberá** rechazarlo con un mensaje claro.
- **El sistema deberá** limitar cada imagen a **5 MB**.
- **El sistema deberá** limitar la galería a **10 imágenes por proyecto**.
- **Cuando** se intente subir una imagen por encima del límite de tamaño o del número máximo, **el sistema deberá** rechazarla con un mensaje claro y sin alterar la galería.
- **El sistema deberá** conservar la proporción de la imagen y limitar su anchura máxima a **1600 px**, sin recortarla.
- **El sistema deberá** optimizar la imagen para reducir su peso sin pérdida visible de calidad.
- **El sistema deberá** eliminar los metadatos EXIF de las imágenes subidas.
- **El sistema deberá** generar nombres de archivo únicos para evitar colisiones y problemas de caché.
- **El sistema deberá** almacenar las imágenes con la misma infraestructura que las fotos de perfil, sin crear un bucket ni una distribución nuevos.
- **El sistema deberá** limitar el comentario a **500 caracteres**.
- **Cuando** el comentario supere ese límite, **el sistema deberá** rechazarlo con un mensaje claro.

### RF-6 — Enlace compartible y navegación del detalle

**QUÉ**: cada detalle tiene una URL propia dentro del mismo sitio, de modo que se puede compartir y el botón «Atrás» del navegador devuelve a la lista.

**POR QUÉ**: si el detalle solo existiera como estado interno, al recargar o compartir el enlace se perdería y el visitante volvería al inicio.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** usar una URL del tipo `https://rbielsam.es/?proyecto=ID` para identificar el detalle de un proyecto.
- **Cuando** el visitante abra una URL con `?proyecto=ID`, **el sistema deberá** activar la sección Proyectos y mostrar el detalle de ese proyecto.
- **Cuando** el visitante pulse «Ver proyecto», **el sistema deberá** actualizar la URL a `?proyecto=ID` sin recargar la página.
- **Cuando** el visitante pulse «Volver a Proyectos», **el sistema deberá** quitar el parámetro de la URL y mostrar la rejilla.
- **Cuando** el visitante use el botón «Atrás» del navegador desde el detalle, **el sistema deberá** volver a la rejilla de proyectos sin recargar la página.
- **Cuando** el ID de la URL no corresponda a ningún proyecto, **el sistema deberá** mostrar un mensaje de **«Proyecto no encontrado»** con un enlace para volver a la lista.
- **El sistema deberá** mantener el resto de la navegación (Inicio, Formación, Experiencia, Contacto y Login) funcionando como hasta ahora.
- **El sistema deberá** desplazar la vista al inicio del detalle al abrirlo y al inicio de la sección al volver a la lista.

## Requisitos no funcionales

### RNF-1 — Responsive

- El detalle y la galería deberán funcionar sin desbordamiento horizontal desde **320 px** hasta **1440 px**.
- El punto de ruptura principal será **768 px**: por encima, imagen y comentario en fila; por debajo, apilados.
- En móvil, las imágenes ocuparán el ancho disponible y los comentarios mantendrán una lectura cómoda.
- La rejilla de proyectos conservará su comportamiento actual en escritorio y móvil.

### RNF-2 — Legibilidad y diseño

- Se mantendrán la paleta, los tokens y la identidad visual actuales.
- Los comentarios tendrán una anchura de lectura cómoda (aproximadamente **65 caracteres** por línea) y un interlineado de **1.7**.
- Las imágenes tendrán un borde o superficie coherente con las tarjetas actuales, sin sombras grandes ni adornos nuevos.
- No se introducirán dependencias nuevas ni librerías de UI, carrusel o lightbox.

### RNF-3 — Accesibilidad

- Cada imagen con su comentario se marcará como una unidad semántica de figura con su leyenda.
- Todas las imágenes tendrán un texto alternativo que las identifique; cuando no haya un texto específico, se usará el título del proyecto y el número de imagen.
- Los enlaces y botones tendrán un estado de foco visible.
- La información no dependerá solo del color; la portada se identificará también con texto.
- Se respetará `prefers-reduced-motion: reduce`.
- La estructura de encabezados se mantendrá: `h2` para la sección y `h3` para el título del proyecto en el detalle.

### RNF-4 — Idiomas

- Las nuevas etiquetas de interfaz se traducirán a **español, catalán e inglés**.
- Los comentarios y las descripciones se mostrarán en el idioma en que se hayan escrito, como el resto del contenido.

### RNF-5 — Privacidad y seguridad

- Las imágenes y los comentarios son **públicos** por diseño.
- El panel deberá advertir de forma visible que no se suban datos personales, credenciales, correos, mensajes ni información privada del área de administración.
- Las capturas deberán usar datos de ejemplo o zonas redactadas.
- Las operaciones de subida, edición y borrado estarán protegidas por la autenticación y los permisos existentes.
- Las imágenes se servirán desde el almacenamiento público configurado, sin exponer rutas internas del servidor.
- Los metadatos EXIF se eliminarán antes de publicar la imagen.

### RNF-6 — Rendimiento

- La tarjeta no deberá cargar todas las imágenes de la galería: solo la portada.
- Las imágenes de la galería se cargarán de forma diferida cuando el navegador lo permita.
- El detalle deberá seguir siendo usable con una galería de hasta 10 imágenes.

### RNF-7 — Compatibilidad y no regresión

- `projects.image` se conservará como **fallback** para proyectos antiguos o imágenes externas.
- La vista de detalle no deberá romper la navegación por secciones, el login, el panel, el contacto ni el resto de secciones.
- Las suites de pruebas y el build deberán seguir en verde.
- No se modificará el formato de los datos existentes de proyectos.

## Casos límite

- **Proyecto sin imágenes**: el detalle se muestra con título, fecha, tecnologías, descripción y enlace externo, sin galería vacía.
- **Proyecto solo con imagen heredada**: se muestra esa imagen como única imagen del detalle, sin comentario.
- **Proyecto con imágenes nuevas y una imagen heredada**: prevalecen las imágenes nuevas; la heredada no se duplica.
- **Imagen sin comentario**: se muestra sola, sin hueco reservado.
- **Comentario muy largo**: se muestra completo, con saltos de línea y sin truncar; no debe desbordar.
- **Comentario con caracteres especiales o saltos de línea**: se conserva el texto y se muestra de forma segura.
- **Descripción muy larga en la tarjeta**: se resume y no rompe la rejilla.
- **Descripción muy corta**: se muestra completa, sin puntos suspensivos innecesarios.
- **Proyecto sin fecha, sin URL, sin tecnologías o sin descripción**: se omiten los bloques vacíos.
- **Primera imagen eliminada**: la siguiente pasa a ser portada.
- **Última imagen eliminada**: la tarjeta usa la imagen heredada si existe; si no, se queda sin imagen.
- **Proyecto eliminado**: se eliminan también sus imágenes y sus archivos.
- **Fallo al subir una imagen**: se conserva la galería anterior y se muestra el error.
- **Fallo al guardar un comentario**: se conserva el comentario anterior y se muestra el error.
- **Se alcanza el máximo de 10 imágenes**: se impide añadir más y se explica el límite.
- **Imagen de más de 5 MB o formato no admitido**: se rechaza antes de procesarla.
- **Imagen que no carga en la galería**: se muestra el texto alternativo o un marcador, sin romper la maquetación.
- **ID inexistente en la URL**: se muestra «Proyecto no encontrado» y se ofrece volver a la lista.
- **ID de un proyecto eliminado**: mismo comportamiento que un ID inexistente.
- **Pantalla estrecha**: imagen y comentario se apilan; no hay scroll horizontal.
- **Muchas imágenes**: la galería crece verticalmente sin romper el espaciado.

## Fuera de alcance

- Crear un subdominio, una página independiente o un sitio nuevo para el detalle.
- Añadir React Router, cambiar la navegación por secciones o modificar Nginx para rutas nuevas.
- Lightbox, zoom, carrusel, vídeo, comparador antes/después o animaciones de galería.
- Reordenar imágenes manualmente, arrastrar y soltar o elegir una portada distinta de la primera.
- Comentarios escritos por visitantes o cualquier forma de interacción pública.
- Galerías privadas, imágenes visibles solo para usuarios logueados o contenido por rol.
- Edición de la imagen (recorte, rotación, filtros) desde el panel.
- Campo específico de texto alternativo por imagen o traducción automática de comentarios.
- Migrar automáticamente las imágenes heredadas de `projects.image` a la nueva galería.
- Cambiar el diseño de las demás secciones, la cabecera, el pie, el login o el contacto.
- Cambiar la paleta, el fondo o el favicon.
- Nuevas dependencias, buckets, distribuciones de CloudFront o cambios de infraestructura.
- SEO, metadatos sociales o analítica.

## Criterios de finalización

- «Ver proyecto» abre una vista interna de detalle y ya no lleva directamente al sitio externo.
- La tarjeta muestra portada, título, resumen, tecnologías y «Ver proyecto».
- El detalle muestra título, fecha, tecnologías, descripción completa, «Abrir sitio» si hay URL y la galería.
- Cada imagen de la galería se muestra junto a su comentario; si no tiene, se muestra sin bloque de comentario.
- El panel permite añadir imágenes con comentario, editar el comentario y eliminarlas, con confirmación y aviso de contenido público.
- La primera imagen es la portada; al eliminarla, pasa a serlo la siguiente.
- La URL `?proyecto=ID` abre el detalle, se actualiza sin recargar y el botón «Atrás» vuelve a la lista.
- Un ID inexistente muestra «Proyecto no encontrado» con vuelta a la lista.
- Los proyectos sin imágenes y los que solo tienen imagen heredada se muestran correctamente.
- Las imágenes se limitan a 10 por proyecto, 5 MB, JPG/PNG/WebP, ancho máximo 1600 px, sin recorte y sin EXIF.
- No hay desbordamiento horizontal entre 320 px y 1440 px.
- La comprobación visual se ha hecho en escritorio (1440 px) y en móvil (375 px y 320 px), incluido el panel.
- Las suites de pruebas y el build siguen en verde.

## Decisiones de clarificación

1. **Comentario por imagen**: es **opcional**. Se puede subir una imagen sin comentario, pero el panel invita a añadirlo.
2. **URL compartible**: **sí**, pero no como subdominio ni página aparte. Será una vista dentro de la sección Proyectos, con `?proyecto=ID` en la misma URL del portfolio.
3. **Tarjeta y detalle**: la tarjeta muestra un **resumen** y el detalle la **descripción completa**. El enlace externo se mueve al detalle como «Abrir sitio».
4. **Portada y orden**: la **primera imagen** es la portada. En esta versión no hay reordenación manual; al borrar la portada pasa a serlo la siguiente.
5. **Contenido del detalle**: incluye **fecha, tecnologías y botón «Abrir sitio»**, además de título, descripción y galería.
6. **Límites adoptados**: hasta **10 imágenes** por proyecto, **5 MB** por imagen, formatos **JPG, PNG y WebP**, comentario de hasta **500 caracteres** y ancho máximo de **1600 px** sin recorte.

No quedan dudas abiertas.
