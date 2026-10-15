# Tareas — Multilenguaje es · ca · en (Spec 015)

Estado: **pendientes**

> Esta spec no cambia datos, ni migraciones, ni dependencias. Sustituye cadenas de texto, monta el mecanismo de idioma y arregla la cadena del error de servidor.

## Fase 1: Tests

### T1.1 `React/tests/t20.test.js` — nuevo

Se escribe **antes** del código y debe fallar todavía.

| Prueba | Comprueba |
|---|---|
| T20.1 | Existen `i18n/es.js`, `ca.js`, `en.js`, `index.js` |
| T20.2 | Existe `context/LanguageContext.jsx` con `useLanguage` |
| T20.3 | Los **tres diccionarios tienen exactamente las mismas claves** |
| T20.4 | `SUPPORTED` = `['es','ca','en']` y `DEFAULT` = `'es'` |
| T20.5 | `t()` con clave ausente cae a `es` y luego a la propia clave |
| T20.6 | `MESES` tiene las tres claves y **12 meses** cada una |
| T20.7 | `formatMonthYear('2025-07','ca')` devuelve el mes en catalán |
| T20.8 | `formatMonthYear('2025-07')` sin argumento devuelve **español** (`Julio 2025`) |
| T20.9 | `Header.jsx` ya no tiene el título visible y sí el `sr-only` |
| T20.10 | `Header.jsx` y el panel montan el selector de idioma |
| T20.11 | `Footer.jsx` **no** contiene `<h1>` |
| T20.12 | `client.js` lanza `err.status` y no `HTTP error! status:` |
| T20.13 | `useContact.js` detecta el límite por `err.status === 429` |
| T20.14 | `bootstrap/app.php` registra el middleware de idioma |
| T20.15 | Existen `lang/es/validation.php` y `lang/ca/validation.php` |
| T20.16 | `bootstrap/app.php` no deja pasar `exception`/`file`/`line` |
| T20.17 | `package.json` **no ha cambiado** (cero dependencias nuevas) |
| T20.18 | Los tres idiomas cubren los textos del panel y de la web pública |

### T1.2 Tests existentes modificados — **24** (aprobado por la persona usuaria)

El plan preveía **3**. Al ejecutar `t()` en los 34 ficheros, **24 aserciones** pasaban a fallar porque comprobaban literales en español que ahora salen de los diccionarios. Aprobado cambiarlas por claves de `t()` antes de seguir.

| Test | De | A | Por qué |
|---|---|---|---|
| **T3.1** | «Header renderiza el título "Portfolio"» — `content.includes('Portfolio')` | «Header renderiza el selector de idioma y el `h1` oculto» | El título visible **desaparece por requisito D4** |
| **T17.6** | `formatMonthYear(item.start_date)` literal, sin 2.º argumento | Acepta el argumento `lang` | El idioma **debe** llegar a la función |
| **T17.7** | ídem en Experiencia | ídem | ídem |
| **restantes 21** | literales en español (`'Inicio'`, `'No hay datos disponibles'`, `'Añadir'`, `'Administrador'`…) | la clave de `t()` equivalente | El texto ya no vive en el componente, sino en `i18n/{es,ca,en}.js` |

**La intención se conserva en todos**: `Header` sigue existiendo y renderizando; `Formacion` y `Experiencia` siguen formateando ambas fechas y mostrando «Actualidad»; `AdminExperiencia` sigue montando el `MonthYearPicker`; `AdminUsuarios` sigue resolviendo los roles. **T12** («AdminLayout incluye la entrada Usuarios») pasa ahora por la declaración de `menuItems`, no por el `<nav>`: se deja tal cual y se anota como comprobación latente.

**No se modifican**: T3.2 (el año sigue en el pie) · T3.3 · T18.1/T18.2 (Header antes de `{nav}`) · T17.5 · **T17.14/T17.15/T17.16** (llaman con un argumento y `lang` tendrá valor por defecto `es`) · **T17.17** (`MESES` sigue exportándose) · T7 · T8.

## Fase 2: Núcleo

### T2.1 `src/i18n/index.js`
`SUPPORTED`, `DEFAULT = 'es'`, `resolverIdioma()`, utilidades de interpolación y consulta.

### T2.2 `src/i18n/es.js` · `ca.js` · `en.js`
Tres diccionarios planos con **las mismas claves**. `es` es el de referencia; los otros se traducen a partir de él.

### T2.3 `src/context/LanguageContext.jsx`
`LanguageProvider` con `{ lang, setLang, t }`. `setLang` valida contra `SUPPORTED`, escribe cookie y `localStorage`, y actualiza `document.documentElement.lang`.

### T2.4 `src/App.jsx`
Montar `<LanguageProvider>` alrededor de la aplicación.

## Fase 3: Selector de idioma

### T3.1 `src/components/Icons/GlobeIcon.jsx`
SVG en línea del globo, hereda `currentColor`.

### T3.2 `src/components/Language/LangSwitcher.jsx`
Botón redondo **44px** + desplegable con tres opciones.
- `aria-label` traducido, `aria-haspopup`, `aria-expanded`, `aria-current`.
- Cierra con clic fuera y con `Escape`.
- Propiedad de variante para uso sobre fondo oscuro (panel).

### T3.3 `src/components/Layout/Header.jsx`
- **Fuera** el `<h1 className="header__title">Portfolio</h1>`.
- **Dentro** `<h1 className="sr-only">` traducido + `<LangSwitcher />`.

### T3.4 `src/components/Layout/Footer.jsx`
`<h1 className="footer__title">2026</h1>` → `<p className="footer__title">2026</p>`. **Se conserva la clase**: el pie **no cambia de aspecto**.

### T3.5 `src/styles/layout.css`
- Quitar `.header__title`.
- Añadir `.lang-switcher`, `.lang-switcher__button`, `.lang-switcher__menu`, `.lang-switcher__option`.
- Añadir `.sr-only` (clase oculta para lectores de pantalla).

## Fase 4: Fechas

### T4.1 `src/utils/dates.js`
- `MESES` pasa de array a objeto `{ es: [...], ca: [...], en: [...] }`.
- `formatMonthYear(value, lang = 'es')`.
- **El valor por defecto `es` es lo que mantiene verdes T17.14/15/16.**

### T4.2 Llamadores
`sections/Formacion.jsx` y `sections/Experiencia.jsx` pasan el idioma. `MonthYearPicker` usa `MESES[lang]` (sigue incluyendo el literal `MESES` → **T17.17 verde**).

## Fase 5: Web pública

### T5.1 Los 27 ficheros → `t()`

`App.jsx` · `NavButtons` · `SessionChip` · `BottomSheet` · `ErrorMessage` · `Loading` · `EmptyData` · `useAuth` · `useFetch` · `useContact` · `SectionContext` · `api/client` · `Sections/{Inicio,Formacion,Experiencia,Proyectos,Login}` · `sections/{Inicio,Formacion,Experiencia,Proyectos,Contacto}` · `pages/Login` · `utils/dates`.

**Comprobación**: recorrer las cinco secciones en los tres idiomas y no quedar **ningún** texto del otro.

## Fase 6: Panel

### T6.1 Los 7 ficheros del panel → `t()`

`AdminLayout` (incluye `menu`) · `AdminPerfil` · `AdminFormacion` · `AdminExperiencia` · `AdminProyectos` · `AdminMensajes` · `AdminUsuarios` · `UserManager` · `PhotoUploader` · `MonthYearPicker`.

### T6.2 Selector dentro del panel

- **Escritorio**: dentro de `menuItems`, bajo el correo.
- **Móvil**: dentro de `.admin__topbar`, junto a ☰.

Al ser `menuItems` **una sola constante** (spec 009), el selector entra una vez y aparece en los dos modos.

### T6.3 `src/styles/admin.css`
Apariencia del selector sobre fondo oscuro.

## Fase 7: El cliente muestra el error (RF-8)

### T7.1 `src/api/client.js`
- Extraer `message` y `errors` del cuerpo.
- Lanzar **el mensaje del servidor**; si no hay, `HTTP ${status}`.
- Adjuntar **`err.status`**.

### T7.2 `src/hooks/useContact.js`
- Detectar el límite por **`err.status === 429`**, no por el texto.
- Preferir el mensaje del servidor; los textos propios quedan como respaldo.

### T7.3 `src/hooks/useFetch.js`
Mostrar `err.message` (ya traducido); texto propio solo de respaldo.

## Fase 8: Backend

### T8.1 `Laravel/lang/en/` · `lang/es/` · `lang/ca/`
`validation.php`, `auth.php`, `pagination.php`, `passwords.php` + claves propias (éxito del contacto, regla de rol propio, mensajes de la API).

**Laravel solo distribuye `en`**: `es` y `ca` se escriben a mano.

### T8.2 `Laravel/app/Middleware/SetLocale.php`
Lee la cookie `lang`, valida contra los tres soportados, `App::setLocale()`.

### T8.3 `Laravel/bootstrap/app.php`
- Alias `lang` junto al existente `role`.
- **RF-6**: la respuesta de error lleva **solo** `message`; `exception`/`file`/`line` van a `laravel.log`.

### T8.4 `config/app.php` y `.env`
`APP_LOCALE=es`, `APP_FALLBACK_LOCALE=es`.

### T8.5 `Laravel/app/Mail/ContactMessageMail.php`
Textos traducidos al idioma de la cookie del visitante (D11).

## Fase 9: Actualizar la spec 014

### T9.1 `specs/014-navegacion-fija/spec.md` y `plan.md`

Dicen *«bajo el título»* y registran `top: 131.19px`. **Sin título, la barra sube**: actualizar el texto para que describa la nueva posición. **Los tests `t18` no cambian.**

## Fase 10: Validación

### T10.1 Suites automáticas
- `npm test` → 206 (**3 modificados**) + `t20`.
- `npm run build` → sin errores.
- `php artisan test --compact` → **105**.
- `git diff package.json` → **vacío**.

### T10.2 Comprobación en navegador (sin tocar datos)
1. Web pública en `es`/`ca`/`en`, **cinco secciones**, **sin restos** de otro idioma.
2. Panel en los tres idiomas, **seis vistas**.
3. Meses traducidos (`Julio` / `juliol` / `July`).
4. Selector: redondo, globo, sin «Portfolio», tres opciones, marca la actual, cierra con clic fuera y `Escape`, operable con teclado, `document.documentElement.lang` correcto.
5. **Persistencia**: elegir `ca` → recargar → sigue en `ca`; cookie **y** `localStorage` presentes; borrados ⇒ vuelve a `es`; cookie `lang=zz` ⇒ **no rompe**, usa `es`.
6. **Errores traducidos**: contacto vacío con cada idioma ⇒ validación en ese idioma; respuesta **sin** `exception`/`file`/`line`; 404 ⇒ solo `message`.
7. **Visibles**: el fallo muestra el mensaje del servidor, **no** `HTTP error! status: 422`; un 429 sigue avisando.
8. **Accesibilidad**: exactamente **un `<h1>`**, oculto, y cambia con el idioma; «2026» se ve igual.
9. **Regresiones**: barra fija de la 014 y panel responsive de la 009 intactos; `SessionChip` muestra el nombre de cuenta **sin** traducir; consola limpia.

### T10.3 Datos
Sin escrituras. Recuento por lectura: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**, contenido **idéntico y sin traducir**. Sesión cerrada al final.

## Pendiente

- [x] T1.1
- [x] T1.2
- [x] T2.1
- [x] T2.2
- [x] T2.3
- [x] T2.4
- [x] T3.1
- [x] T3.2
- [x] T3.3
- [x] T3.4
- [x] T3.5
- [x] T4.1
- [x] T4.2
- [x] T5.1
- [x] T6.1
- [x] T6.2
- [x] T6.3
- [x] T7.1
- [x] T7.2
- [x] T7.3
- [x] T8.1
- [x] T8.2
- [x] T8.3
- [x] T8.4
- [x] T8.5
- [x] T9.1
- [x] T10.1
- [x] T10.2
- [x] T10.3

## Desviaciones registradas (validación)

Además de las 24 aserciones de T1.2, la implementación tocó **más ficheros de backend de los que estimaba el plan**. Todos por la RF-5 («sin restos de español»); ninguno añade dependencias ni cambia datos:

| Fichero | Por qué |
|---|---|
| `app/Http/Middleware/CheckRole.php` | Tenía cuatro respuestas 403 en español escritas a mano → pasan por `__()`. |
| `app/Http/Requests/UploadProfilePhotoRequest.php` | El `messages()` en español se sustituye por claves `custom.image.*` en los tres `validation.php`. |
| `lang/{es,ca,en}.json` | Las cadenas del propio framework (`ValidationException::summarize()`, el resumen «(y :count errores más)», los mensajes de rutas 404/405) usan **literales ingleses como clave**, así que no caben en `validation.php`. |

Decisiones tomadas durante la validación y aprobadas:

- **`SetLocale` como middleware global** en vez del alias `lang`: el alias no se usaba y el global permite traducir también el 404 de rutas inexistentes.
- **El nombre del sitio se localiza** —`Portfolio de Ramón Bielsa` / `Portafoli de Ramón Bielsa` / `Ramón Bielsa's Portfolio`— porque la RF-7 exige que el `<h1>` oculto y el `<title>` cambien al cambiar de idioma.
- **Un 429 muestra `contacto.error_limite`** («Has enviado demasiados mensajes. Espera unos minutos…»), no el mensaje del servidor: es lo que pide el criterio de aceptación de la RF-8. La frase de la tabla de requisitos se corrigió para dejar de contradecirse.
- **El menú del selector lleva `z-index: 110`**: con 30 quedaba pintado **por debajo** de `.nav-buttons { position: sticky; z-index: 100 }`, y el clic en «Català» caía en el botón de la navegación que había debajo. Regla a conservar: desplegable por encima de la navegación (110) y por debajo del modal (999).
