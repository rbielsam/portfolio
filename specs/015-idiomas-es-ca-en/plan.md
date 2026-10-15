# Plan — Multilenguaje es · ca · en (Spec 015)

## Alcance

Cambio de **presentación y de cadenas de texto**, más la capa de mensajes del servidor.

| | |
|---|---|
| Frontend | ~**45 ficheros** (núcleo i18n + traducción de las 27 vistas públicas y del panel) |
| Backend | ~**15 ficheros** (`lang/es`, `lang/ca`, `lang/en`, middleware, `bootstrap/app.php`) |
| Dependencias | **0** — `package.json` no cambia |
| Datos | **0 escrituras** — el contenido de la BD ni se toca ni se traduce |
| Tests nuevos | `tests/t20.test.js` |
| Tests existentes modificados | **3** (T3.1, T17.6, T17.7) — justificados abajo |

## Stack confirmado

- **Frontend**: React 18 + JS + CSS3 puro + Vite (en `React/`)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática + ejecución de utilidades puras)
- **Backend**: Laravel 13 + PHP + MySQL 8.4 (en `Laravel/`), tests en SQLite `:memory:`
- **Punto de ruptura**: ninguno nuevo; el selector de idioma vive en `Header`, que no depende de media queries

---

## Decisiones de implementación

### D1 — Motor a mano: contexto + tres diccionarios planos

```
src/i18n/index.js          SUPPORTED, DEFAULT, resolverIdioma()
src/i18n/es.js             clave → texto (el de referencia)
src/i18n/ca.js
src/i18n/en.js
src/context/LanguageContext.jsx   { lang, setLang, t }
```

- Claves punteadas: `nav.inicio`, `contacto.enviar`, `panel.perfil`.
- `t('clave')` → texto del idioma activo → **es** → la propia clave.
- `t('clave', { n: 3 })` sustituye `{n}`.
- Clave ausente: se devuelve la clave **y** se avisa por consola en desarrollo.

**Encadenamiento de respaldo con `es` y no con `en`**: si falta algo en catalán, cae al idioma por defecto, no a inglés.

### D2 — `formatMonthYear(value, lang = 'es')`

```js
export const MESES = { es: [...], ca: [...], en: [...] };
export function formatMonthYear(value, lang = 'es') { … MESES[lang][i] … }
```

**Por qué un parámetro y no una variable global**: la función sigue siendo pura y comprobable; si alguien olvida pasar el idioma, cae a `es` de forma visible. Una variable de módulo mutada por el contexto fallaría en silencio.

**`lang` opcional con valor por defecto `es`** — es lo que mantiene verdes los tests T17.14, T17.15 y T17.16, que llaman con **un solo argumento** y esperan `'Julio 2025'`.

### D3 — Persistencia: cookie + localStorage

| Almacén | Escritor | Lector |
|---|---|---|
| `localStorage['portfolio.lang']` | `setLang` | React al arrancar |
| Cookie `lang` (1 año, `SameSite=Lax`, `path=/`, **no** `httpOnly`) | `setLang` | **Laravel** en cada petición |

Orden de lectura al inicio: `localStorage` → cookie → `es`, **validando siempre contra `SUPPORTED`**. Cookie manipulada ⇒ se ignora.

Al cambiar se escriben los dos almacenes **y** `document.documentElement.lang`.

### D4 — Selector en la cabecera

- `Header.jsx` **pierde el `<h1>` visible**: queda `<h1 className="sr-only">` + el botón.
- Botón redondo **44px**, SVG de globo en línea (`<GlobeIcon />`) que hereda `currentColor`.
- Desplegable con tres opciones, `aria-haspopup` / `aria-expanded` / `aria-current`, cierra con clic fuera y con `Escape`, operable con teclado.
- Estilos nuevos en `layout.css` (`.lang-switcher`, `.lang-switcher__menu`, `.sr-only`).
- `.header__title` se elimina junto al título.

**El selector no depende de `isMobile`**, porque `Header` está fuera de `layout__content`: en móvil se ve igual, **sin** entrar en el `BottomSheet`.

### D5 — El panel tiene su propio selector

- Escritorio: dentro de `.admin__nav`, bajo el correo (`menuItems` de `AdminLayout.jsx`).
- Móvil: dentro de `.admin__topbar`, junto al botón ☰.

Se reutiliza **el mismo componente** `LangSwitcher`, con una variante de apariencia para fondo oscuro. El menú del panel ya se construye **una sola vez** (spec 009), así que el selector entra ahí y vale para barra lateral y hoja.

### D6 — `LanguageProvider` en `App.jsx`

Envuelve toda la aplicación para que web pública y panel compartan el mismo idioma. `useLanguage()` es el único punto de lectura.

### D7 — Backend: `lang/` + middleware `SetLocale`

```
Laravel/lang/{en,es,ca}/{validation,auth,pagination,passwords}.php
Laravel/app/Middleware/SetLocale.php      lee la cookie → App::setLocale()
```

- Alias `lang` en `bootstrap/app.php` junto al existente `role`.
- `APP_LOCALE=es`, `APP_FALLBACK_LOCALE=es`.
- Claves propias del proyecto: éxito del contacto, regla de rol propio, mensajes de la API, `ContactMessageMail`.

**Laravel solo distribuye `en`** — `es` y `ca` hay que escribirlos.

### D8 — Limpieza de errores (RF-6)

En `bootstrap/app.php`, dentro de `withExceptions`:

- Se responde **solo** `message`, traducido.
- `exception`, `file`, `line`, `trace` **no** salen en la respuesta; van a `laravel.log`.
- Se aplica **también con `APP_DEBUG=true`**: es una API que consume una SPA, nadie «ve» esa respuesta en el navegador.

### D9 — El cliente sí muestra el mensaje (RF-8)

```js
// api/client.js — antes
throw new Error(`HTTP error! status: ${response.status}`);

// después
const data = await response.json().catch(() => null);
const mensaje = data?.message ?? Object.values(data?.errors ?? {}).flat()[0] ?? null;
const error = new Error(mensaje ?? `HTTP ${response.status}`);
error.status = response.status;
throw error;
```

| Fichero | Cambio |
|---|---|
| `api/client.js` | Extraer `message`/`errors`, adjuntar `err.status` |
| `hooks/useContact.js` | `err.status === 429` en lugar de `err.message.includes('429')`; 429 → aviso de espera, resto de estados → mensaje del servidor |
| `hooks/useFetch.js` | `err.message` ya es el del servidor; el texto propio queda como respaldo |

**`err.status` y no texto**: comprobar `includes('429')` sobre un mensaje traducido deja de funcionar en cuanto cambia de idioma.

### D10 — Accesibilidad (RF-7)

- `Header.jsx`: `<h1 className="sr-only">` traducido.
- `Footer.jsx`: `<h1>2026</h1>` → `<p>2026</p>` (aceptado por la persona usuaria). Se conserva la clase `.footer__title` para que **el aspecto no cambie**.
- `document.title` se traduce con el idioma.

---

## Impacto en tests existentes

Analizados uno a uno:

| Test | Exige | ¿Se rompe? |
|---|---|---|
| **T3.1** | `Header.jsx` contiene `'Portfolio'` | ❌ **SÍ** — el `<h1>` visible desaparece |
| **T3.2** | Footer contiene el año actual | ✅ `<p>2026</p>` lo sigue conteniendo |
| **T3.3** | Layout importa y renderiza Header y Footer | ✅ |
| **T18.1 / T18.2** | Header antes de `{nav}`; Header y Footer en Layout | ✅ |
| **T17.5** | `import { formatMonthYear }` | ✅ |
| **T17.6 / T17.7** | `formatMonthYear(item.start_date)` **sin segundo argumento** y literal `'Actualidad'` | ❌ **SÍ** (ambos) |
| **T17.14 / 15 / 16** | `formatMonthYear('2025-07') === 'Julio 2025'` con **un argumento** | ✅ con `lang = 'es'` por defecto |
| **T17.17** | `MonthYearPicker` incluye `MESES` | ✅ si `MESES` sigue exportándose |
| **T7** | Lista `src/api/client.js` | ✅ |
| **T8** | Endpoint y estados de `useContact` | ✅ |

### Los 3 tests que se modifican

| Test | De | A | Justificación |
|---|---|---|---|
| `T3.1` | «Header renderiza el título "Portfolio"» | «Header renderiza el selector de idioma y el h1 oculto» | La desaparición del título es **requisito D4** |
| `T17.6` | `formatMonthYear(item.start_date)` literal | Acepta el segundo argumento `lang` | El idioma **debe** llegar a la función |
| `T17.7` | ídem | ídem | ídem |

**La intención de las tres pruebas se conserva**: `Header` sigue existiendo y renderizando algo, y `Formacion`/`Experiencia` siguen formateando ambas fechas y mostrando «Actualidad».

**Es el mismo patrón ya aceptado** en las specs 013 (4 tests), 014 (0) y 009 (2). Se documenta en `tareas.md` con tabla.

---

## Estructura de ficheros

### Frontend (`React/`) — nuevos

```
src/i18n/index.js          src/i18n/es.js     src/i18n/ca.js     src/i18n/en.js
src/context/LanguageContext.jsx
src/components/Icons/GlobeIcon.jsx
tests/t20.test.js
```

### Frontend — modificados

```
App.jsx                                    LanguageProvider + <html lang>
components/Layout/Header.jsx               sin h1 visible + LangSwitcher + sr-only
components/Layout/Footer.jsx               h1 → p
styles/layout.css                          lang-switcher + sr-only, quita header__title
utils/dates.js                             MESES por idioma, formatMonthYear(value, lang)
api/client.js                              RF-8
hooks/useContact.js  hooks/useFetch.js     RF-8
+ 27 ficheros de la web pública            t()
+ 7 ficheros del panel (AdminLayout, AdminX, UserManager, PhotoUploader, MonthYearPicker…)
+ NavButtons, SessionChip, ErrorMessage, Loading, EmptyData
```

### Backend (`Laravel/`) — nuevos

```
lang/en/  lang/es/  lang/ca/   → validation, auth, pagination, passwords + claves propias
app/Middleware/SetLocale.php
```

### Backend — modificados

```
bootstrap/app.php        alias 'lang' + limpieza de excepciones (D8)
config/app.php / .env    APP_LOCALE=es, APP_FALLBACK_LOCALE=es
app/Mail/ContactMessageMail.php   traducir textos (D11)
```

### Sin cambios

`package.json` · migraciones · modelos · controladores de contenido · datos reales.

---

## Pasos de implementación

1. **Tests nuevos** `t20.test.js` — debe fallar todavía.
2. **Núcleo**: `i18n/` + `LanguageContext` + `LanguageProvider` en `App.jsx`.
3. **Selector**: `GlobeIcon`, `LangSwitcher`, `Header` sin título, `Footer` a `<p>`, `layout.css`.
4. **Persistencia**: cookie + `localStorage` + `document.documentElement.lang`.
5. **Fechas**: `MESES` por idioma y `formatMonthYear(value, lang)`.
6. **Web pública**: los 27 ficheros a `t()`.
7. **Panel**: los 7 ficheros + selector en barra lateral y topbar.
8. **Cliente RF-8**: `client.js`, `useContact`, `useFetch`.
9. **Backend**: `lang/es`, `lang/ca`, `lang/en` + `SetLocale` + `APP_LOCALE`.
10. **Limpieza de errores** en `bootstrap/app.php`.
11. **Correo**: `ContactMessageMail` traducido.
12. **Tests existentes**: adaptar T3.1, T17.6, T17.7.
13. **Suites** y **validación en navegador**.

---

## Verificación

### Automática

- `npm test` → 206 existentes (**3 modificados**) + los de `t20`.
- `npm run build` → sin errores.
- `php artisan test --compact` → sigue en **105**.
- `package.json` → **sin diff**.

Cobertura que debe añadir `t20` (lectura estática + ejecución de utilidades puras):

- Existencia de `i18n/{es,ca,en}.js`, `index.js` y `LanguageContext.jsx`.
- Los tres diccionarios tienen **las mismas claves** (comparación de `Object.keys`).
- `SUPPORTED` contiene exactamente `es`, `ca`, `en` y `DEFAULT` es `es`.
- `t()` con clave ausente cae a `es` y luego a la clave.
- `formatMonthYear('2025-07', 'ca')` devuelve el mes en catalán; sin segundo argumento, en español.
- `MESES` tiene las tres claves y 12 meses cada uno.
- `Header.jsx` ya no contiene el título visible, y sí el `sr-only` y el selector.
- `Footer.jsx` **no** contiene `<h1>`.
- `client.js` lanza `err.status` y **no** `HTTP error! status:`.
- `bootstrap/app.php` registra el middleware `lang`.
- `lang/es/validation.php` y `lang/ca/validation.php` existen.
- Ningún `lang/{es,ca}` devuelve claves sin traducir para los campos del proyecto.

### Manual — en navegador, sin tocar datos

**1 · Los tres idiomas, sin restos**

- Web pública: recorrer **Inicio, Formación, Experiencia, Proyectos, Contacto** en `es`, `ca` y `en`, **pantalla completa**, comprobando que **no queda ningún texto** de otro idioma.
- Panel: las **seis** vistas en los tres idiomas.
- Fecha: el mes debe cambiar de idioma (`Julio` / `juliol` / `July`).

**2 · El selector**

- Botón **redondo** con globo, **sin** el texto «Portfolio».
- Despliega **exactamente tres** opciones y marca la actual.
- Cambia **sin recargar**; cierra con clic fuera y con `Escape`.
- Con teclado: se abre, se recorre y se elige **sin ratón**.
- `document.documentElement.lang` = `es` | `ca` | `en`.

**3 · Persistencia**

- Elegir `ca`, **recargar** → sigue en `ca`.
- Abrir las herramientas: cookie `lang=ca` **y** `localStorage['portfolio.lang']='ca'`.
- Borrar ambos → vuelve a **es**.
- Poner a mano `lang=zz` en la cookie → el sistema **no rompe** y usa `es`.

**4 · Errores del servidor traducidos**

- Con `ca` activo, enviar el formulario de contacto **vacío** → los errores de validación salen **en catalán**.
- Repetir con `es` y `en`.
- Comprobar en la respuesta de red que **no hay** `exception`, `file` ni `line`.
- Provocar un 404 en la API → solo `message`, traducido; el detalle está en `laravel.log`.

**5 · La pantalla sí los muestra**

- Forzar un fallo y comprobar que aparece el **mensaje del servidor**, no `HTTP error! status: 422`.
- Forzar un 429 (supere el límite de 3/5 min) → el aviso de espera sigue saliendo.

**6 · Accesibilidad**

- Un **único `<h1>`**, oculto, y cambia con el idioma.
- «2026» en el pie **se ve igual** que antes.

**7 · Regresiones**

- `Header` y la navegación de la **spec 014** siguen funcionando; la barra fija se sigue pegando arriba al desplazar.
- El panel **responsive de la 009** intacto: barra lateral en escritorio, topbar y hoja a 768/375.
- Login y `SessionChip` (nombre de cuenta, **no** traducido) sin cambios.
- Consola sin errores nuevos.

### Datos

**La spec no escribe nada.** Recuento al terminar: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**, con el contenido **idéntico y sin traducir**. Sesión cerrada al final.

---

## Criterios de finalización del plan

- Web pública **y** panel usables en `es`, `ca` y `en` sin restos de otro idioma.
- Errores de validación en el idioma elegido **y visibles en pantalla**.
- Respuestas de error sin `exception`/`file`/`line`, con detalle en `laravel.log`.
- Idioma persiste tras recargar y lo comparten frontend y backend.
- **Un solo `<h1>`**, oculto.
- Contenido de la BD **intacto y sin traducir**.
- `package.json` **sin cambios**.
- `npm test` y `npm run build` en verde; `php artisan test` en **105**.
- Solo **3** tests existentes modificados, todos justificados.
