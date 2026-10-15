# Spec 015 — Multilenguaje (es · ca · en)

## Contexto y objetivo

El sitio está **enteramente en español**, escrito a mano en el código, y los mensajes del servidor salen **en inglés** (`APP_LOCALE=en` y no existe `lang/`). El resultado es una interfaz en dos idiomas a la vez.

Petición de la persona usuaria (14/10/2026): *«vamos a hacer una nueva spec para agregar idiomas. El idioma por defecto es el Español, pero se debe poder cambiar a Catalán e Inglés. Todo debe quedar traducido, incluso los errores de servidor si es posible»*.

### Decisiones tomadas en clarificación

| # | Decisión |
|---|---|
| D1 | El **contenido de la base de datos no se traduce**: títulos, biografía y proyectos se escriben en un idioma y se muestran igual en los tres |
| D2 | Se traduce **toda la interfaz**: web pública **y** panel de administración |
| D3 | El idioma se recuerda con **cookie + localStorage**; la cookie es la que lee el backend |
| D4 | El selector va **en la cabecera**. **Desaparece el título visible** y en su lugar hay un botón **redondo** de tamaño estándar con **una imagen de globo terráqueo** |
| D5 | Al pulsarlo se abre un **desplegable** con Español · Català · English, con el actual marcado |
| D6 | El panel de administración **también tiene selector**: barra lateral en escritorio y barra superior en móvil |
| D7 | Sin título visible, la página conserva un **`<h1>` oculto** para lectores de pantalla |
| D8 | Los mensajes de Laravel (`es`, `ca`) se **escriben a mano**; no se instala `laravel-lang` |
| D9 | Los errores del servidor se **traducen y se limpian**: sin `exception`, `file` ni `line` |
| D10 | El motor de traducción se hace **a mano**, sin dependencias |
| D11 | El correo de notificación (`ContactMessageMail`) se envía **en el idioma del visitante** |
| D12 | El frontend **sí muestra** el mensaje del servidor: `api/client.js` lo extrae y lo lanza traducido (RF-8) |

---

## Diagnóstico

### 1 · El texto vive dentro del código

| | |
|---|---|
| Ficheros con texto español | **27** |
| Líneas con texto visible | **89** |
| Sistema i18n existente | **ninguno** |
| Dependencias del proyecto | `react`, `react-dom`, `react-router-dom` |

### 2 · El servidor responde en inglés

```json
{"errors":{"name":["The name field is required."]}}
```

`APP_LOCALE=en`, no existe `lang/`, y el framework **solo distribuye `en`**: `es` y `ca` no vienen con Laravel.

### 3 · Las excepciones filtran el servidor

```json
{"message":"…", "exception":"Symfony\\…MethodNotAllowedHttpException",
 "file":"/home/rbielsam/Projects/portfolio/Laravel/vendor/…", "line": 16}
```

Además del idioma, la respuesta expone **la ruta absoluta del servidor y el árbol de llamadas**.

### 4 · Lo que ya está preparado

- El backend **solo devuelve `YYYY-MM`** (`toArray()`), y las fechas las formatea el frontend. Así que **solo hay que traducir `MESES`** en `utils/dates.js`.
- `is_current` llega como booleano; el texto «Actual» / «Actualidad» se compone en el frontend.
- Los títulos de sección del panel están en `AdminLayout.jsx`, en un único array `menu`.

### 5 · Hallazgo lateral

`components/Sections/` (con mayúscula) existe **junto a** `components/sections/` con 5 ficheros casi duplicados. `App.jsx` importa solo la minúscula: **`Sections/` es código muerto**. No se traduce (ver *Fuera de alcance*).

---

## RF-1 — El proyecto dispone de un sistema de traducción propio

**QUÉ**: un contexto de React con tres diccionarios planos y una función `t()`.

- `src/i18n/es.js`, `src/i18n/ca.js`, `src/i18n/en.js` — objetos planos `clave → texto`, con claves punteadas (`nav.inicio`, `contacto.enviar`).
- `src/i18n/index.js` — `SUPPORTED = ['es', 'ca', 'en']`, `DEFAULT = 'es'`.
- `src/context/LanguageContext.jsx` — `LanguageProvider`, `useLanguage()` → `{ lang, setLang, t }`.
- `t('clave')` devuelve el texto; `t('clave', { n: 3 })` sustituye `{n}`.

**Encadenamiento de respaldo**: idioma elegido → **`es`** → la propia clave. Si una clave no existe, se devuelve la clave y se avisa por consola en desarrollo, para que **una traducción que falte se vea, no se esconda**.

**POR QUÉ**: decisión D10. Un portfolio con tres idiomas no necesita plurales complejos ni *namespaces*: español, catalán e inglés coinciden en singular y plural salvo contados casos. Añadir `i18next` + `react-i18next` duplicaría las dependencias del proyecto (hoy tres) por funcionalidad que no se va a usar, contra el principio de simplicidad de la Constitución.

**Criterios de aceptación (EARS)**:

- **Cuando** se llame a `t()` con una clave inexistente en el idioma activo, **el sistema deberá** devolver el texto en español, y **no deberá** mostrar una cadena vacía.
- **Cuando** se añada una cadena nueva, **bastará con** añadirla a los **tres** diccionarios; **no** será necesario tocar ningún componente.
- **Dado** que no hay dependencias, **el `package.json` no deberá cambiar**.
- **Cuando** exista la misma clave en los tres idiomas, **el sistema deberá** mostrar el texto del idioma elegido **sin** recargar la página.

---

## RF-2 — El usuario puede cambiar de idioma desde la cabecera

**QUÉ**:

- `Header.jsx` **pierde el `<h1>` visible** y queda reducido al botón de idioma.
- Botón **redondo de 44px** con **imagen de globo terráqueo en SVG** centrada.
- Al pulsarlo se abre un **desplegable** debajo con `Español` · `Català` · `English`, con el actual marcado.
- Al elegir uno: se cierra el desplegable, se aplica el idioma y **se recuerda**.
- Se cierra pulsando fuera o con `Escape`.

**POR QUÉ**: decisiones D4 y D5. La cabecera es el único sitio que está siempre visible en todos los tamaños de pantalla — la navegación, en cambio, en móvil es un botón flotante con hoja inferior.

**Sobre la imagen**: el globo se incorpora como **SVG en línea** (`<GlobeIcon />`). Sigue siendo una imagen, es la apropiada para elegir idioma, **hereda el color** del botón y no añade una petición de red. Si se prefiere un fichero en `public/`, la decisión es reversible.

**Accesibilidad**: `aria-label` traducido, `aria-haspopup`, `aria-expanded` y `aria-current` sobre la opción activa; el desplegable es operable con teclado.

**Criterios de aceptación (EARS)**:

- **Cuando** la pantalla muestre la cabecera, **el sistema deberá** mostrar **un único botón redondo** con una imagen de globo, y **no** deberá mostrar el texto «Portfolio».
- **Cuando** se pulse el botón, **el sistema deberá** abrir un desplegable con **exactamente tres** opciones, **no** pudiendo ser el idioma actual.
- **Cuando** se elija un idioma, **la página entera** deberá cambiar **sin** recargarse.
- **Cuando** se pulse fuera o se pulse `Escape`, **el sistema deberá** cerrar el desplegable.
- **Cuando** se navegue con teclado, **el sistema deberá** poder abrir, recorrer y elegir una opción **sin** ratón.
- **Dado** que `Header` sigue renderizándose, **el sistema deberá** conservar verde el test `T18.2`.

---

## RF-3 — El idioma elegido persiste y lo comparten frontend y backend

**QUÉ**:

| Almacén | Quién lo usa |
|---|---|
| `localStorage['portfolio.lang']` | React, en el arranque |
| Cookie `lang` (`SameSite=Lax`, `path=/`, 1 año) | **El backend**, en cada petición |

Al iniciar: `localStorage` → cookie → `es`. Se valida contra `SUPPORTED` antes de usarlo: **una cookie manipulada no puede sacar al sistema de sus tres idiomas**.

Al cambiar: se escriben los dos almacenes, la cookie y `document.documentElement.lang`.

**POR QUÉ**: decisión D3. La cookie es la única vía para que Laravel traduzca los errores de validación — `localStorage` no llega nunca al servidor. `lang` **no** es `httpOnly`: el frontend también la necesita.

**Criterios de aceptación (EARS)**:

- **Cuando** se cambie el idioma y se recargue la página, **el sistema deberá** conservar el idioma elegido.
- **Cuando** el backend reciba una petición con la cookie, **deberá** responder en **ese** idioma.
- **Cuando** no haya ni cookie ni `localStorage`, **el sistema deberá** usar **español**.
- **Cuando** la cookie contenga un idioma no soportado, **el sistema deberá** ignorarla y usar español **sin** romper.
- **Cuando** cambie el idioma, **`document.documentElement.lang`** deberá ser `es`, `ca` o `en`.

---

## RF-4 — Toda la interfaz se traduce

**QUÉ**: sustituir los **89+ líneas** de texto suelto de los 27 ficheros públicos **y** todo el panel por llamadas a `t()`.

Casos que requieren atención específica:

| Caso | Cómo |
|---|---|
| `MESES` (`utils/dates.js`) | Pasa a los diccionarios; `formatMonthYear(value, lang)` recibe el idioma |
| «Actual» / «Actualidad» | Clave de diccionario |
| `menu` de `AdminLayout` | Etiquetas por clave |
| `aria-label`, `<title>` del documento | Se traducen también |
| `ErrorMessage` / `Loading` / `EmptyData` | Ya son componentes compartidos: una sola clave sirve para web y panel |

**Lo que NO cambia**: el contenido que llega de la API — `CFGS Desarrollo de Aplicaciones Web`, `Acceleralia S.L.`, la biografía, los proyectos. **Se muestra tal cual**, en el idioma en que se escribió (D1).

**POR QUÉ**: decisión D2. El panel se traduce porque es toda la interfaz del producto; el selector aparece también allí (D6).

**Criterios de aceptación (EARS)**:

- **Cuando** se recorra la web pública en cada uno de los tres idiomas, **no deberá** aparecer **ningún** texto del otro idioma.
- **Cuando** se abra el panel en cada uno de los tres idiomas, **tampoco**.
- **Cuando** se cambie el idioma estando en el panel, **las seis vistas** deberán cambiar **sin** perder la vista activa.
- **Cuando** se muestre una fecha, **el mes** deberá aparecer en el idioma activo.
- **Cuando** se cambie de idioma, **los datos de la base de datos** deberán permanecer **idénticos**, sin modificación alguna.

---

## RF-5 — El servidor responde en el idioma del visitante

**QUÉ**:

- Crear `lang/en/`, `lang/es/` y `lang/ca/` con `validation.php`, `auth.php`, `pagination.php`, `passwords.php`.
- Añadir las claves propias del proyecto: el mensaje de éxito del contacto, la regla de rol propio de `UserController`, los mensajes de la API.
- **Middleware `SetLocale`** que lee la cookie `lang` y hace `App::setLocale()`.
- `APP_LOCALE=es` y `APP_FALLBACK_LOCALE=es`.

**El respaldo es `es`, no `en`**: así una clave que falte en catalán cae a español —el idioma por defecto— y no a inglés.

**POR QUÉ**: decisiones D8 y «incluso los errores de servidor si es posible». Laravel 11+ solo distribuye `en`, de modo que `es` y `ca` no existen hasta que se crean.

**Criterios de aceptación (EARS)**:

- **Cuando** se envíe el formulario de contacto sin campos con la cookie `es`, `ca` o `en`, **el servidor deberá** devolver los errores de validación en **ese** idioma.
- **Cuando** una clave **no exista** en catalán, **el sistema deberá** devolver la versión en español y **no** el nombre de la clave.
- **Cuando** no haya cookie, **el servidor deberá** responder en español.
- **Cuando** se cambie el idioma, **no** será necesario reiniciar el servidor.

---

## RF-6 — Las respuestas de error no filtran el servidor

**QUÉ**: la API devuelve **solo** `message` —traducido al idioma activo— y registra el resto en `laravel.log`.

Se eliminan de la respuesta: `exception`, `file`, `line`, `trace`.

**POR QUÉ**: decisión D9. Hoy la respuesta expone la ruta absoluta del servidor (`/home/rbielsam/Projects/portfolio/Laravel/vendor/…`) y el árbol de llamadas. Se aplica **también con `APP_DEBUG=true`**, porque esto es una API que consume una SPA, no una página de navegador que alguien ve en local: el detalle ya se escribe en el log, que es donde debe estar.

**Criterios de aceptación (EARS)**:

- **Cuando** la API responda 404, 405, 422 o 500, **la respuesta** contendrá **únicamente** un campo `message`, traducido.
- **Cuando** se consulte el log, **allí** sí deberán estar la excepción, el fichero y la línea.
- **Dado** que se elimina información del error, **el sistema deberá** poder seguir diagnosticando fallos **por el log**.
- **Cuando** la respuesta se muestre en el navegador, **no** aparecerá **ninguna** ruta del servidor.

---

## RF-7 — La página conserva un encabezado correcto

**QUÉ**:

- `Header.jsx` incluye un **`<h1>` oculto** (`sr-only`) con el nombre del sitio.
- El `<h1>2026</h1>` del `Footer` **pasa a `<p>`**, para que la página no quede con dos `<h1>`.

**POR QUÉ**: decisión D7. Hoy hay **dos** `<h1>` («Portfolio» y «2026»). Si se añade el oculto de la cabecera y se deja el del pie, se siguen siendo dos. El cambio en el `Footer` es la **consecuencia obligada** de la opción elegida; queda aquí expuesto para poder vetarse.

**Criterios de aceptación (EARS)**:

- **Cuando** se analice la página, **deberá** existir **exactamente un** `<h1>`, y **no** deberá ser visible.
- **Cuando** se cambie el idioma, **el `<h1>` oculto** deberá cambiar también.
- **Cuando** se muestre el pie, **«2026»** deberá seguir viéndose **igual**, solo que ya no será un `<h1>`.

---

## RF-8 — Los errores del servidor llegan a la pantalla

**QUÉ**: la capa de cliente pasa a leer lo que el backend responde.

| Fichero | Cambio |
|---|---|
| `api/client.js` | Extraer `message` y `errors` del cuerpo de la respuesta y lanzar **el mensaje traducido**; adjuntar **`err.status`** al error |
| `hooks/useContact.js` | Detectar el límite de envíos por **`err.status === 429`** en lugar de `err.message.includes('429')`, y mostrar el aviso de espera `contacto.error_limite`; **en el resto de estados sí se prefiere el mensaje del servidor** (ver criterio de aceptación) |
| `hooks/useFetch.js` | Mostrar el mensaje del servidor si lo hay; solo recurrir al texto propio si no viene |

**POR QUÉ**: decisión de la persona usuaria tras ver el diagnóstico. Hoy `client.js` hace `throw new Error(\`HTTP error! status: ${status}\`)` y **tira el mensaje del backend**. El servidor ya traduciría los errores (RF-5), pero **nadie los vería**: la pantalla mostraría `HTTP error! status: 422`. Sin este requisito, RF-5 no se cumple de verdad.

**Criterios de aceptación (EARS)**:

- **Cuando** el backend devuelva un 422 con errores de validación, **la pantalla** deberá mostrar **el mensaje del servidor traducido**, no `HTTP error! status: 422`.
- **Cuando** se supere el límite de envíos (429), **el formulario** deberá mostrar el aviso de espera **sin** depender del texto del error.
- **Cuando** el servidor no devuelva mensaje, **el sistema deberá** recurrir al texto propio del idioma activo **sin** mostrar `undefined`.
- **Cuando** haya un error de red sin respuesta, **el sistema deberá** mostrar un mensaje comprensible en el idioma activo.

---

- **Idioma por defecto: español.** Tres soportados; añadir un cuarto exige tocar `SUPPORTED` y los tres diccionarios.
- **La cookie es la fuente de verdad para el backend**, `localStorage` la del frontend. Se escriben **los dos siempre** para que no se desincronicen.
- **`lang` no es `httpOnly`**: el frontend la necesita leer. No guarda nada sensible.
- **`formatMonthYear` recibe el idioma como parámetro**, en lugar de leer una variable global: sigue siendo una función pura y se puede probar.
- **`Sections/` con mayúscula no se traduce** porque es código muerto (ver *Fuera de alcance*).
- **El correo de contacto va al idioma del visitante**: el texto de la notificación cambia, el mensaje que escribe la persona se muestra tal cual lo escribió.
- **El selector de idioma vive en `Header`**, que está fuera de `layout__content` y de la navegación: **no interfiere con la spec 014** ni con el `BottomSheet` de móvil.
- **Las fechas del backend no se tocan**: siguen llegando como `YYYY-MM`.
- **Los datos reales no se traducen ni se modifican** en ningún punto de esta spec.

---

## Impacto en specs anteriores

| Spec | Efecto |
|---|---|
| **014** (navegación fija) | Su texto dice *«bajo el título»* y midió `top: 131.19px` en reposo. **Sin título, la barra sube**: hay que actualizar `spec.md` y `plan.md`. **Los tests `t18` no se rompen**, porque solo exigen que `Header` exista y que `{nav}` vaya después |
| **009** (panel responsive) | Sin efecto. El selector del panel se añade a `.admin__nav` y a `.admin__topbar`, que es lo que ya existe |
| **010** (indicador de sesión) | `SessionChip` muestra `user.name`, que **no** se traduce (es el nombre de la cuenta) |

---

## Fuera de alcance

- **El contenido de la base de datos**: títulos, biografía, proyectos, experiencia y mensajes (D1).
- **`components/Sections/`** con mayúscula: es código muerto. **Se propone eliminarlo en una tarea aparte**, no traducir cinco ficheros que nadie importa.
- **URLs por idioma** (`/ca/...`) y etiquetas `hreflang` de SEO: no aplica, el idioma se cambia en la misma URL.
- **Nuevos idiomas** más allá de `es`, `ca` y `en`.
- **La plantilla del correo**: solo se traducen sus textos, no cambia su diseño.
- **Nuevas dependencias.**

---

## Criterios de finalización

- La web pública **y** el panel se pueden usar en **es**, **ca** y **en**, **sin restos** de otro idioma en pantalla.
- Los mensajes de validación del servidor llegan en el idioma elegido.
- Las respuestas de error **no contienen** `exception`, `file` ni `line`.
- El idioma **persiste** tras recargar y **lo comparten** frontend y backend.
- **Un solo `<h1>`**, oculto.
- El contenido de la base de datos **intacto** y **sin traducir**.
- `package.json` **sin cambios**.
- `npm test`, `npm run build` y `php artisan test` **en verde**.
- Sin dependencias nuevas y sin datos modificados.
