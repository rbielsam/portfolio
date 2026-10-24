# Spec 023 — Enlaces a GitHub y LinkedIn

## Contexto y objetivo

El portfolio muestra la trayectoria, la formación y los proyectos, pero **no ofrece ninguna vía directa para ver el código o el perfil profesional** de la persona propietaria. Quien quiere comprobar cómo trabaja tiene que buscar su nombre en GitHub o LinkedIn por su cuenta.

El perfil público (`profile`) guarda hoy `name`, `title`, `bio` y `photo`. **No existe ningún campo para redes o enlaces personales**, y el panel no permite editarlos.

**Objetivo**: añadir los enlaces a **GitHub** y **LinkedIn** como contenido editable desde el panel, mostrarlos en **Inicio** (debajo de la biografía) y en el **pie de página**, sin añadir dependencias ni infraestructura nueva.

## Usuarios

- **Visitante** del portfolio: tras leer la biografía quiere ver el código o el perfil profesional sin buscarlo; también quiere encontrarlos cuando está al final de cualquier sección.
- **Persona propietaria** del portfolio (administrador o editor): escribe o actualiza las dos URL desde **Panel → Perfil**, sin tocar código.

## Diagnóstico técnico

| Zona | Situación actual |
|---|---|
| `profile` | Columnas `name`, `title`, `bio` y `photo`. No hay campos de redes sociales. |
| `Profile` | `$fillable` con esos cuatro campos y `photo_url` añadido. |
| `ProfileController@update` | Valida `name`, `title`, `bio` y `photo`. |
| `AdminPerfil.jsx` | Formulario con nombre, título, biografía y foto. |
| `Inicio.jsx` | Hero con foto y nombre a la izquierda; título y biografía a la derecha. |
| `Footer.jsx` | Solo el copyright (`© 2026 rbielsam`). |
| Navegación | Secciones por estado; no hay menú de enlaces externos. |
| Dependencias | Sin librería de iconos. |

Los enlaces se guardarán en el perfil y se mostrarán desde la misma fuente en los dos sitios, para no duplicar contenido ni escribirlos en el código.

## Requisitos funcionales

### RF-1 — Datos de los enlaces en el perfil

**QUÉ**: el perfil guarda dos URL opcionales, una de GitHub y otra de LinkedIn, y la API pública las devuelve.

**POR QUÉ**: son contenido del portfolio y deben poder actualizarse desde el panel, igual que la biografía o la foto, sin desplegar código.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** añadir al perfil dos campos opcionales: `github_url` y `linkedin_url`.
- **El sistema deberá** devolver ambos campos en `GET /api/profile`, con `null` cuando no estén definidos.
- **El sistema deberá** permitir guardarlos mediante `PUT /api/profile` junto con el resto del perfil.
- **Cuando** un campo esté vacío, **el sistema deberá** guardarlo como `null`.
- **El sistema deberá** conservar el formato actual del resto de campos del perfil.

### RF-2 — Enlaces en Inicio, debajo de la biografía

**QUÉ**: en la sección Inicio, debajo del texto de la biografía, aparece una fila con los enlaces disponibles.

**POR QUÉ**: es el momento en que el visitante acaba de leer quién es la persona y tiene el contexto para decidir si quiere ver su código o su trayectoria profesional.

**Criterios de aceptación (EARS)**:

- **Cuando** exista al menos un enlace, **el sistema deberá** mostrar debajo de la biografía una fila con los enlaces disponibles.
- **El sistema deberá** mostrar cada enlace con su icono y su nombre visible: **GitHub** y **LinkedIn**.
- **Cuando** solo exista uno de los dos, **el sistema deberá** mostrar únicamente ese, sin huecos ni elementos vacíos.
- **Cuando** no exista ninguno, **el sistema deberá** omitir la fila completa y no dejar espacio reservado.
- **El sistema deberá** abrir cada enlace en una pestaña nueva con `rel="noopener noreferrer"`.
- **Cuando** la pantalla mida **768 px o más**, **el sistema deberá** alinear la fila a la izquierda, con la biografía.
- **Cuando** la pantalla mida **menos de 768 px**, **el sistema deberá** centrar la fila, igual que el resto del bloque de Inicio en móvil.

### RF-3 — Enlaces en el pie de página

**QUÉ**: el pie muestra los mismos enlaces junto al copyright, **solo con el icono**, de forma discreta y persistente en todas las secciones.

**POR QUÉ**: el visitante puede decidir buscar el perfil cuando ya está al final de la página o después de recorrer Proyectos o Formación, sin tener que volver a Inicio.

**Criterios de aceptación (EARS)**:

- **Cuando** exista al menos un enlace, **el sistema deberá** mostrarlo en el pie junto al copyright.
- **El sistema deberá** mostrar en el pie **únicamente el icono**, sin texto visible.
- **El sistema deberá** dar a cada enlace del pie un **nombre accesible** («Perfil de GitHub» / «Perfil de LinkedIn»), de modo que se entienda sin ver el icono.
- **El sistema deberá** usar la misma información y las mismas URL que en Inicio.
- **Cuando** no exista ninguno, **el sistema deberá** mostrar el pie como hasta ahora, solo con el copyright.
- **El sistema deberá** abrir cada enlace en una pestaña nueva con `rel="noopener noreferrer"`.
- **Cuando** la pantalla sea estrecha, **el sistema deberá** permitir que el copyright y los enlaces se apilen o se envuelvan sin desbordar.

### RF-4 — Edición desde el panel

**QUÉ**: el formulario de **Panel → Perfil** incorpora dos campos para las URL, con las mismas reglas de permisos y guardado que el resto del perfil.

**POR QUÉ**: la persona propietaria debe poder cambiar o retirar un enlace sin tocar la base de datos ni el código.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** mostrar en **Panel → Perfil** dos campos etiquetados **GitHub** y **LinkedIn**.
- **El sistema deberá** cargar en ellos los valores guardados.
- **Cuando** se guarde el perfil, **el sistema deberá** persistir ambos valores y reflejarlos en la web pública.
- **Cuando** se vacíe un campo y se guarde, **el sistema deberá** dejar de mostrar ese enlace en la web.
- **El sistema deberá** respetar los permisos actuales: solo quien pueda editar el perfil podrá modificar los enlaces.
- **Cuando** el guardado falle, **el sistema deberá** mostrar el mensaje de error existente y conservar los valores anteriores.

### RF-5 — Validación y seguridad de las URL

**QUÉ**: las URL se validan antes de guardarse y se renderizan como enlaces seguros.

**POR QUÉ**: un valor mal formado rompería el enlace, y un esquema no web (`javascript:`, `data:`) podría introducir un riesgo al abrirlo.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** aceptar únicamente URL absolutas con esquema **`http` o `https`**.
- **El sistema deberá** limitar cada URL a **255 caracteres**.
- **Cuando** una URL no sea válida, **el sistema deberá** rechazarla con un mensaje claro y no guardar el perfil.
- **Cuando** una URL no empiece por `http://` o `https://`, **el sistema deberá** rechazarla; no se añadirá el esquema automáticamente.
- **El sistema deberá** mostrar las URL como enlaces, sin interpretar su contenido como HTML.

## Requisitos no funcionales

### RNF-1 — Responsive

- Inicio y pie deberán funcionar sin desbordamiento horizontal desde **320 px** hasta **1440 px**.
- En Inicio, la fila de enlaces se alineará con la biografía en escritorio y se centrará en móvil.
- Las URL largas no deberán romper la maquetación: en Inicio el texto visible siempre será «GitHub» o «LinkedIn»; en el pie solo se verá el icono.

### RNF-2 — Diseño

- Se mantendrán la paleta, los tokens, la tipografía y el espaciado actuales.
- Los enlaces usarán el color de acento y un subrayado o cambio de color al pasar el ratón.
- Los iconos serán **SVG en línea** con `currentColor`; **no se añadirá ninguna librería de iconos**.
- En Inicio mostrarán icono y nombre, con tamaño de enlace normal; en el pie, **solo el icono**, con un tamaño discreto coherente con el copyright.

### RNF-3 — Accesibilidad

- Los enlaces serán elementos `<a>` reales, navegables con teclado.
- Tendrán un estado de foco visible.
- El área táctil será de al menos **44 × 44 px** en móvil.
- En Inicio los iconos serán decorativos (`aria-hidden="true"`) porque el nombre del enlace es visible.
- En el pie, al ser solo icono, el enlace llevará `aria-label` con el nombre del perfil; el SVG seguirá siendo decorativo.
- Se respetará `prefers-reduced-motion: reduce`.
- El orden de lectura será: biografía → GitHub → LinkedIn, y copyright → GitHub → LinkedIn.

### RNF-4 — Idiomas

- Los nombres «GitHub» y «LinkedIn» no se traducen.
- Las etiquetas del panel y los textos accesibles nuevos se traducirán a **español, catalán e inglés**.
- Los tres diccionarios mantendrán exactamente las mismas claves.

### RNF-5 — Privacidad

- Solo se publican las URL que la persona propietaria decida guardar.
- No se añadirán correos, teléfonos ni otros datos personales.
- Los campos son opcionales y pueden quedarse vacíos.

### RNF-6 — Compatibilidad y no regresión

- No se modificará el formato de los campos existentes del perfil.
- Inicio, el pie, el panel, el login, el contacto y las demás secciones seguirán funcionando igual.
- No se añadirán dependencias nuevas.
- Las suites de pruebas y el build deberán seguir en verde.

## Casos límite

- **Solo GitHub**: se muestra únicamente GitHub en Inicio y en el pie.
- **Solo LinkedIn**: se muestra únicamente LinkedIn en Inicio y en el pie.
- **Ninguno de los dos**: Inicio y pie se muestran como hasta ahora, sin fila ni huecos.
- **URL vacía o con espacios**: se guarda como `null` y el enlace desaparece de la web.
- **URL sin esquema** (`github.com/usuario`): se rechaza con un mensaje claro.
- **URL con esquema no permitido** (`javascript:`, `data:`): se rechaza.
- **URL con más de 255 caracteres**: se rechaza.
- **URL larga**: en Inicio el texto visible sigue siendo «GitHub» o «LinkedIn»; en el pie solo se ve el icono. Ninguno de los dos desborda.
- **Perfil sin biografía pero con enlaces**: la fila se muestra igualmente bajo el título.
- **Fallo al guardar el perfil**: se conservan los valores anteriores y se muestra el error.
- **Pantalla de 320 px**: los enlaces caben y se envuelven si hace falta.

## Fuera de alcance

- Añadir otros enlaces (Twitter/X, web personal, correo, teléfono).
- Un enlace de repositorio por proyecto (`repo_url`); se valorará en otra spec.
- Iconos en el menú de navegación o en la cabecera.
- Repetir los enlaces en la sección Contacto.
- Cambiar el diseño general de Inicio, del pie o del panel.
- Añadir analítica, seguimiento de clics o metadatos sociales.
- Traducir el contenido de los perfiles externos.
- Nuevas dependencias, librerías de iconos o cambios de infraestructura.

## Criterios de finalización

- `profile` guarda `github_url` y `linkedin_url` como campos opcionales y la API los devuelve.
- El panel permite editar ambas URL y vaciarlas.
- Inicio muestra los enlaces disponibles debajo de la biografía, alineados a la izquierda en escritorio y centrados en móvil.
- El pie muestra los mismos enlaces junto al copyright, **solo con el icono** y con nombre accesible.
- Los enlaces se abren en pestaña nueva con `rel="noopener noreferrer"`.
- Las URL inválidas o con esquema no permitido se rechazan con un mensaje claro.
- Sin enlaces, Inicio y pie se ven exactamente como antes.
- No hay desbordamiento horizontal entre 320 px y 1440 px.
- La comprobación visual se ha hecho en escritorio (1440 px), tableta (768 px) y móvil (375 px y 320 px), incluido el panel.
- Las suites de pruebas y el build siguen en verde.

## Decisiones de clarificación

1. **Dónde se guardan**: en el **perfil**, como dos columnas nuevas (`github_url`, `linkedin_url`), editables desde el panel. No se escriben en el código.
2. **Dónde se muestran**: en **Inicio, debajo de la biografía** (principal) y en el **pie** (persistente). No se añaden al menú de navegación ni a Contacto.
3. **Presentación**: en Inicio, icono SVG en línea + nombre visible; en el pie, **solo el icono**, con nombre accesible para lectores de pantalla. Sin librería de iconos.
4. **Enlaces opcionales e independientes**: cada uno se muestra solo si tiene valor; si no hay ninguno, no se reserva espacio.
5. **Validación**: URL absoluta `http` o `https`, máximo 255 caracteres, sin añadir el esquema automáticamente.
6. **Apertura**: en pestaña nueva con `rel="noopener noreferrer"`.
7. **Alcance mínimo**: no se añaden otras redes ni un enlace de repositorio por proyecto en esta spec.

No quedan dudas abiertas.
