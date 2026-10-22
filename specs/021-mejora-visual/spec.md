# Spec 021 — Mejora visual y presentación del contenido

## Contexto y objetivo

El portfolio ya funciona y tiene su identidad visual (azul marino, degradado, acento azul claro), pero las secciones que muestran contenido —Inicio, Formación, Experiencia y Proyectos— se ven sin acabar:

- Las listas de Formación, Experiencia y Proyectos **no tienen estilos propios**: `.section__list` y `.section__item` se usan en los componentes pero no existe ninguna regla CSS para ellas. Por eso las entradas aparecen pegadas unas a otras, sin separación ni jerarquía.
- **Inicio** es una columna centrada con la foto, el nombre, el cargo y la biografía, todos del mismo peso y sin una composición pensada para leer.
- La biografía y las descripciones ocupan todo el ancho disponible, así que en pantalla grande se leen en **líneas muy largas**.
- **Proyectos** no tiene una rejilla: con varios proyectos se apilarían en una lista vertical sin reparto.
- En el **panel de administración**, los listados de Experiencia y Formación muestran solo el título y la entidad, **sin las fechas**.

Además, la persona usuaria pide poder **describir cada puesto de trabajo y cada estudio** desde el panel, y **mostrar las tecnologías de los proyectos**. Los campos `experience.description`, `education.description` y `projects.technologies` **ya existen** en la base de datos, en los modelos y en la API; lo que falta es exponerlos en los formularios del panel y, en el caso de las tecnologías, mostrarlas en la web. No hace falta ninguna migración.

**Objetivo**: dar a las secciones de contenido una presentación cuidada, legible y responsive, coherente con la identidad actual, y completar la información que falta en el panel (descripciones, tecnologías y fechas en los listados).

## Usuarios

- **Visitante** del portfolio: quiere entender en pocos segundos quién es la persona, qué ha estudiado, dónde ha trabajado y qué ha construido.
- **Persona propietaria** del portfolio: gestiona el contenido desde el panel y necesita ver y editar los datos completos (incluidas fechas, descripciones y tecnologías).

## Diagnóstico técnico

| Zona | Situación actual |
|---|---|
| `sections.css` | Solo define `.inicio`, `.inicio__title`, `.inicio__circle`, `.section`, `.section__title` y `.section__message`. **No hay reglas para `.section__list`, `.section__item`, `.section__item-title`, `.section__item-subtitle`, `.section__item-date`, `.section__item-desc`, `.section__item-image` ni `.section__item-link`.** |
| `Inicio.jsx` | `<section className="inicio">` en columna: avatar, nombre, título y biografía. |
| `Formacion.jsx` / `Experiencia.jsx` | `<ul className="section__list">` con `<li className="section__item">`; sin estilos, sin separación. |
| `Proyectos.jsx` | La misma lista; la imagen se muestra si existe, pero no hay rejilla ni tratamiento de tarjeta. **No muestra `technologies`.** |
| `AdminExperiencia.jsx` | El listado muestra `position - company`. El formulario **no incluye** `description`, aunque la API ya la acepta. |
| `AdminFormacion.jsx` | El listado muestra `title - institution`. El formulario **no incluye** `description` (la columna existe y la web ya la muestra si tiene valor). |
| `AdminProyectos.jsx` | El formulario edita título, descripción, URL y fecha, pero **no incluye** `technologies` (la columna existe y la API ya la acepta). |
| Backend | `experience.description`, `education.description` y `projects.technologies` existen en migración, modelo y controladores. **No se requiere cambio de API ni migración.** |

## Dirección visual

La identidad se mantiene: fondo degradado azul marino, texto claro y acento azul (`#5ba3d9`). No se introduce una paleta nueva ni una librería de componentes. La mejora se apoya en **composición, jerarquía tipográfica, espaciado y contraste**, no en añadir adornos.

**Concepto**: *ficha técnica*. Un portfolio de desarrollador con base de sistemas se presenta como un cuaderno de bitácora ordenado: metadatos en monoespaciada, líneas finas de acento, fichas con borde sutil y una línea de tiempo para la trayectoria. Sobrio, preciso y con personalidad, sin caer en el estilo genérico de tarjetas blancas con sombras.

### Paleta

Se reutilizan los tokens existentes de `variables.css`. Se añaden solo los necesarios para las superficies:

- **Fondo**: degradado actual `--color-bg-gradient-start` → `--color-bg-gradient-end`.
- **Superficie de ficha**: azul marino translúcido, más oscuro que el fondo, con borde `--color-border`.
- **Acento**: `--color-accent` para la línea lateral, las fechas activas, los enlaces y el foco.
- **Texto**: `--color-text` para títulos y `--color-text-muted` para metadatos y descripciones.
- **Sin sombras grandes**: como máximo una sombra suave al pasar el ratón. La separación se consigue con borde y espacio, no con `box-shadow` en reposo.

### Tipografía

- **Cuerpo**: la familia actual (`Segoe UI` y alternativas del sistema).
- **Metadatos** (fechas, etiquetas de sección): pila monoespaciada del sistema (`ui-monospace`, `Cascadia Code`, `Consolas`), tamaño pequeño, mayúsculas y `letter-spacing` amplio.
- **Titulares**: peso 600–700, `letter-spacing` ligeramente negativo en tamaños grandes (el `0.05em` positivo actual se reserva para las etiquetas pequeñas).
- **Texto de lectura**: entre 60 y 70 caracteres por línea (`65ch` como referencia), `line-height` 1.7 y `text-wrap: pretty` cuando el navegador lo soporte.

### Composición

- **Ancho de contenido**: un máximo común para todas las secciones (aprox. `1080px`), con márgenes laterales fluidos. Ninguna sección ocupa todo el ancho del monitor.
- **Escala de espacio**: se usan los tokens `--spacing-*` existentes; el ritmo vertical entre fichas será de `--spacing-md` como mínimo.
- **Inicio**: composición en dos columnas. A la izquierda, la foto y el nombre; a la derecha, el título profesional y, debajo, el bloque de la biografía centrado, con las líneas alineadas a la izquierda y una anchura de lectura cómoda. En móvil, todo se apila y el bloque de la biografía se centra.
- **Formación y Experiencia**: línea de tiempo vertical. Cada entrada es una ficha con una línea de acento a la izquierda, un punto en la línea y los metadatos (fechas) en monoespaciada. El título manda, la entidad va debajo y la descripción, si existe, cierra la ficha.
- **Proyectos**: rejilla responsive de tarjetas. Cada tarjeta tiene imagen (si existe) con proporción fija, título, descripción, etiquetas de tecnologías (si existen) y enlace. Con pocos proyectos la rejilla no estira una tarjeta hasta ocupar toda la pantalla; con muchos, reparte en columnas. Las etiquetas son pequeñas, en monoespaciada, con fondo translúcido y borde de acento, y se envuelven en varias líneas.
- **Títulos de sección**: etiqueta pequeña en mayúsculas sobre el título, con una línea de acento corta. Refuerza la jerarquía sin añadir ruido.

### Movimiento

- Transiciones de `0.2s` en hover y foco (borde, elevación mínima, zoom suave de la imagen).
- Se respeta `prefers-reduced-motion: reduce`: sin transformaciones ni zoom.

## Requisitos funcionales

### RF-1 — Inicio: composición en dos columnas y biografía legible

**QUÉ**: la portada muestra la foto y el nombre a la izquierda; a la derecha, el título profesional y, debajo, el bloque de la biografía centrado, con las líneas alineadas a la izquierda y una anchura de lectura limitada.

**POR QUÉ**: hoy todos los elementos tienen el mismo peso y la biografía se extiende en líneas largas; una composición en dos columnas presenta el perfil de un vistazo y hace la lectura cómoda.

**Criterios de aceptación (EARS)**:

- **Cuando** la pantalla mida **768 px o más**, **el sistema deberá** mostrar en la misma fila la foto con el nombre a la izquierda y el título profesional a la derecha.
- **Cuando** la pantalla mida **menos de 768 px**, **el sistema deberá** apilar foto, nombre, título y biografía en ese orden, con el bloque de la biografía centrado.
- **El sistema deberá** mostrar la biografía debajo del título profesional, dentro de la columna derecha, con el bloque centrado horizontalmente y las líneas alineadas a la izquierda, a la derecha de la foto y el nombre.
- **El sistema deberá** limitar la biografía a una anchura máxima de lectura de aproximadamente **65 caracteres** y permitir que el texto fluya en varias líneas.
- **Cuando** no haya foto, **el sistema deberá** seguir mostrando el avatar con las iniciales en el mismo espacio reservado, sin romper la composición.
- **Cuando** la biografía esté vacía, **el sistema deberá** no dejar un hueco vacío visible.

### RF-2 — Formación: separación y jerarquía entre entradas

**QUÉ**: las entradas de Formación se presentan como fichas separadas, con espacio vertical, fechas visibles y una jerarquía clara entre título, institución, fechas y descripción.

**POR QUÉ**: hoy las entradas se pegan unas a otras porque las clases de lista no tienen estilos; con dos o más estudios no se distingue dónde empieza cada uno.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** separar entradas consecutivas con un espacio vertical mínimo de `--spacing-md` (1.5 rem).
- **El sistema deberá** mostrar en cada entrada, en este orden visual: título, institución, rango de fechas y descripción (si existe).
- **El sistema deberá** mostrar las fechas en formato «Mes Año – Mes Año» y usar «Actualidad» cuando la formación siga en curso o no tenga fecha de fin.
- **El sistema deberá** limitar la descripción de cada entrada a una anchura de lectura cómoda (aprox. 65 caracteres) y no deberá cortar su contenido.
- **Cuando** solo haya una entrada, **el sistema deberá** mostrarla con el mismo tratamiento de ficha, sin estilos especiales por ser única.

### RF-3 — Experiencia: descripción editable y presentación en línea de tiempo

**QUÉ**: el formulario de Experiencia del panel incorpora un campo de descripción, y la web muestra cada puesto como una ficha de línea de tiempo con su descripción.

**POR QUÉ**: la persona usuaria quiere explicar qué hacía en cada puesto; el dato ya existe en la base de datos y en la API, pero hoy no se puede introducir desde el panel. La presentación actual tampoco distingue los puestos.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** incluir en el formulario de Experiencia del panel un campo multilínea «Descripción», opcional, asociado al campo `description`.
- **Cuando** se guarde una experiencia con descripción, **el sistema deberá** persistirla mediante la API existente y volver a mostrarla al editar la experiencia.
- **Cuando** una experiencia tenga descripción, **el sistema deberá** mostrarla en la web debajo de las fechas.
- **Cuando** una experiencia no tenga descripción, **el sistema deberá** mostrar la ficha sin ese bloque y sin huecos reservados.
- **El sistema deberá** presentar las experiencias con el mismo tratamiento de línea de tiempo y separación que Formación (RF-2).
- **El sistema deberá** mostrar las fechas con el mismo formato y la misma regla de «Actualidad» que Formación.

### RF-4 — Formación: descripción editable

**QUÉ**: el formulario de Formación del panel incorpora un campo de descripción, y la web muestra esa descripción en la ficha del estudio.

**POR QUÉ**: la persona usuaria quiere poder añadir información a cada estudio (especialidad, módulos, proyectos o cualquier detalle relevante). El dato ya existe en la base de datos y en la API, pero hoy no se puede introducir desde el panel.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** incluir en el formulario de Formación del panel un campo multilínea «Descripción», opcional, asociado al campo `description`.
- **Cuando** se guarde una formación con descripción, **el sistema deberá** persistirla mediante la API existente y volver a mostrarla al editar la formación.
- **Cuando** una formación tenga descripción, **el sistema deberá** mostrarla en la web debajo de las fechas.
- **Cuando** una formación no tenga descripción, **el sistema deberá** mostrar la ficha sin ese bloque y sin huecos reservados.

### RF-5 — Proyectos: rejilla responsive, lectura cómoda y tecnologías

**QUÉ**: los proyectos se muestran en una rejilla de tarjetas que se adapta al número de proyectos y al ancho de pantalla, con descripciones que no forman líneas largas y con las tecnologías visibles como etiquetas.

**POR QUÉ**: hoy los proyectos se apilarían sin reparto y con descripciones a todo el ancho; con varios proyectos la sección sería una lista larga y difícil de escanear. Además, el dato de las tecnologías existe pero no se puede introducir ni se ve, y es una de las primeras cosas que se mira en un portfolio de desarrollo.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** mostrar los proyectos en una rejilla con separación uniforme entre tarjetas.
- **Cuando** la pantalla sea ancha y haya varios proyectos, **el sistema deberá** repartirlos en varias columnas.
- **Cuando** la pantalla mida menos de 768 px, **el sistema deberá** mostrar una sola columna.
- **Cuando** solo haya un proyecto, **el sistema deberá** mostrarlo como una tarjeta de anchura contenida, sin estirarla hasta ocupar todo el ancho de la sección.
- **El sistema deberá** limitar la descripción de cada proyecto a una anchura de lectura cómoda y no deberá cortar su contenido.
- **El sistema deberá** incluir en el formulario de Proyectos del panel un campo «Tecnologías», opcional, asociado al campo `technologies`, con los valores **separados por comas**.
- **Cuando** se guarde un proyecto con tecnologías, **el sistema deberá** persistirlas mediante la API existente y volver a mostrarlas al editar el proyecto.
- **Cuando** un proyecto tenga tecnologías, **el sistema deberá** mostrarlas en la web como **etiquetas**, separando el contenido por comas y descartando los valores vacíos.
- **Cuando** un proyecto no tenga tecnologías, **el sistema deberá** mostrar la tarjeta sin ese bloque.
- **Cuando** la lista de tecnologías sea larga, **el sistema deberá** permitir que las etiquetas se envuelvan en varias líneas sin desbordar.
- **Cuando** un proyecto tenga imagen, **el sistema deberá** mostrarla con una proporción fija y recorte uniforme, sin deformarla.
- **Cuando** un proyecto tenga URL, **el sistema deberá** mostrarla como enlace claramente identificable y abrirla en una pestaña nueva.
- **Cuando** un proyecto no tenga imagen, **el sistema deberá** mostrar la tarjeta sin ese bloque y sin romper la alineación de la rejilla.

### RF-6 — Fechas visibles en los listados del panel

**QUÉ**: los listados de Experiencia y Formación del panel muestran el rango de fechas de cada entrada.

**POR QUÉ**: al revisar o editar el contenido, la persona propietaria necesita distinguir entradas con el mismo cargo o titulación sin abrir cada formulario.

**Criterios de aceptación (EARS)**:

- **El sistema deberá** mostrar en cada elemento del listado de Experiencia el rango de fechas, además del puesto y la empresa.
- **El sistema deberá** mostrar en cada elemento del listado de Formación el rango de fechas, además del título y la institución.
- **El sistema deberá** usar el mismo formato de fecha y la misma regla de «Actualidad» que la web pública.
- **Cuando** una entrada no tenga fecha de fin y no esté marcada como actual, **el sistema deberá** mostrar «Actualidad».
- **El sistema deberá** mantener los botones de editar y borrar y su comportamiento actual.
- **Cuando** la pantalla sea estrecha, **el sistema deberá** permitir que las fechas y los botones se envuelvan sin provocar desbordamiento horizontal.

## Requisitos no funcionales

### RNF-1 — Responsive

- La web deberá funcionar sin desbordamiento horizontal desde **320 px** hasta **1440 px**.
- Los puntos de ruptura principales serán **768 px** (apilado de Inicio y una columna en Proyectos) y **1024 px** (rejilla de proyectos a varias columnas).
- En móvil, los títulos y el espaciado se reducirán de forma proporcional sin perder legibilidad.

### RNF-2 — Legibilidad

- Ningún párrafo de lectura (biografía, descripciones) superará aproximadamente **65 caracteres** por línea.
- El interlineado del texto de lectura será de **1.7**.
- No se usarán tamaños de fuente inferiores a **0.875 rem** para texto de contenido.

### RNF-3 — Accesibilidad

- El contraste de texto sobre fondo cumplirá **WCAG AA (4.5:1)**.
- Todos los enlaces y botones tendrán un estado de foco visible (contorno de acento).
- La información no dependerá solo del color: las fechas y etiquetas llevarán texto.
- Se respetará `prefers-reduced-motion: reduce`.
- La estructura de encabezados se mantendrá (`h2` de sección, `h3` de entrada).

### RNF-4 — Coherencia e idiomas

- Se mantendrán los tokens y la paleta existentes; no se introducirán colores fuera de `variables.css`.
- Las nuevas etiquetas de interfaz se traducirán a **español, catalán e inglés**.
- Los datos (títulos, descripciones, fechas y tecnologías) se mostrarán en el idioma en que estén guardados, como hasta ahora.

### RNF-5 — Simplicidad y no regresión

- No se añadirán dependencias nuevas ni librerías de UI/iconos.
- No se modificará el backend ni el esquema de datos: `description` y `technologies` ya existen y la API ya los acepta.
- La navegación, el login, el panel, el contacto y las funcionalidades existentes seguirán funcionando igual.
- Las suites de pruebas deberán seguir en verde y el build deberá compilar sin errores.

## Casos límite

- **Biografía muy larga**: debe fluir en varias líneas sin superar la anchura máxima y sin generar scroll horizontal.
- **Biografía vacía o nula**: no debe dejar un bloque vacío.
- **Sin foto**: se mantiene el avatar con iniciales y la composición no se desplaza.
- **Nombre muy largo**: debe poder partirse o reducirse sin solaparse con el título.
- **Título profesional muy largo**: debe envolver correctamente en su columna.
- **Una sola experiencia / una sola formación**: mismo tratamiento de ficha, sin estilos especiales.
- **Muchas entradas**: la línea de tiempo debe crecer verticalmente sin romper el espaciado.
- **Descripción con saltos de línea**: se deben conservar como párrafos o saltos visibles, sin colapsarlos.
- **Descripción muy larga**: se muestra completa; no se trunca.
- **Proyecto sin imagen, sin URL, sin descripción o sin tecnologías**: la tarjeta se muestra con los bloques disponibles y mantiene la alineación.
- **Tecnologías con comas de más, espacios o duplicados**: se descartan los valores vacíos y se muestran solo las etiquetas con contenido; los duplicados no deben romper la vista.
- **Un solo proyecto**: tarjeta de anchura contenida, no a todo el ancho.
- **Muchos proyectos**: la rejilla reparte columnas y mantiene la separación.
- **Fechas incompletas**: si falta la fecha de inicio, no se muestra un guion suelto; si falta la de fin, se usa «Actualidad».
- **Pantalla estrecha en el panel**: las fechas y los botones se envuelven sin desbordar.

## Fuera de alcance

- Añadir al panel la **subida o edición de la imagen** de un proyecto, y el tratamiento de esa imagen más allá de mostrarla si ya existe.
- Cambiar el formato de `technologies` a una tabla relacional o a un gestor de etiquetas aparte: se guarda como texto separado por comas.
- Cambiar el contenido real (biografía, proyectos, formación) o los datos de la base de datos.
- Rediseñar la cabecera, la navegación, el menú móvil, el login, el contacto o el panel más allá de las fechas de los listados.
- Cambiar la paleta, el fondo degradado o el favicon.
- SEO, metadatos sociales o analítica.
- Nuevas funcionalidades de backend, migraciones o cambios en la API.

## Criterios de finalización

- Inicio muestra foto y nombre a la izquierda y título a la derecha en escritorio; apilado y centrado en móvil.
- La biografía queda debajo del título, en la columna derecha, con el bloque centrado, las líneas alineadas a la izquierda, anchura de lectura limitada y sin líneas largas.
- Formación y Experiencia muestran fichas separadas, con fechas y descripción cuando existe.
- Los formularios de Experiencia y Formación del panel permiten escribir y guardar una descripción.
- Proyectos se muestra en rejilla responsive, con tarjetas separadas y descripciones legibles.
- El formulario de Proyectos permite guardar tecnologías separadas por comas y la web las muestra como etiquetas.
- Los listados de Experiencia y Formación del panel muestran las fechas.
- No hay desbordamiento horizontal entre 320 px y 1440 px.
- Las suites de pruebas y el build siguen en verde.
- La comprobación visual se ha hecho en escritorio y en móvil (375×812).

## Decisiones de clarificación

Las cuatro dudas de la primera redacción quedaron resueltas con la persona usuaria:

1. **Fechas en el panel**: se muestran en el **listado** de Experiencia y Formación, junto al título y la entidad, para que la información esté visible sin abrir el formulario.
2. **Descripción en Formación**: sí. Se añade el campo al formulario, igual que en Experiencia.
3. **Tecnologías en Proyectos**: sí. Se editan en un **campo de texto con los valores separados por comas** y se muestran en la web como etiquetas. Es la opción más sencilla y encaja con la columna `text` que ya existe.
4. **Inicio en escritorio**: el nombre va **debajo de la foto**, formando un bloque compacto en la columna izquierda; el título profesional queda a la derecha.

No quedan dudas abiertas.
