# Tareas — El menú de idiomas del panel se ve entero (Spec 016)

Estado: **todas completadas** ✅

> Resultado: **234 pruebas frontend** (las 225 previas + las 9 nuevas), **105 backend**, build en verde y **ningún test existente modificado**.
>
> Esta spec no ha tocado el backend, los datos ni ningún test existente.

## Resumen de la validación

| Comprobación | Antes | Después |
|---|---|---|
| Menú en la barra lateral (1600×900) | `x = −106 … 54` — **54 de 160px** | `x = 16 … 176` — **160 de 160px** |
| Centro de las tres opciones | las tres devolvían **`null`** | las tres devuelven **su propio elemento** |
| Cambiar idioma desde el panel | **imposible** | las tres opciones aplican y cierran |
| Foco tras `Escape` desde una opción | **`<body>`** | **el botón** del selector |
| Foco tras elegir una opción | **`<body>`** | **el botón** del selector |
| Foco tras `Escape` desde el botón | el botón | el botón *(sin regresión)* |
| Foco tras un clic fuera | `<body>` | `<body>` *(no se roba, D6)* |
| Cabecera pública (1600×900) | 160 de 160px | 160 de 160px *(sin cambios)* |
| Barra superior móvil (375×667) | 160 de 160px | 160 de 160px *(sin cambios)* |

Además: las seis vistas del panel se abren, el teclado recorre las tres opciones, la consola **no tiene ninguna línea de error** y los datos siguen intactos (**1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**, misma foto de perfil).

## Pendiente

- [x] T1.1
- [x] T2.1
- [x] T2.2
- [x] T3.1
- [x] T3.2
- [x] T3.3
- [x] T3.4

## Desviaciones registradas (validación)

**1 · El RF-4 se añadió durante la validación.** La spec 016 decía a la vez «sin cambios de JavaScript» y que «el foco no debe perderse ni saltar a otra parte del panel»: era una contradicción interna que no se veía hasta ejecutarla. Medido en navegador, el foco se perdía en `<body>` al cerrar con `Escape` desde una opción o con un clic fuera. La persona usuaria decidió **ampliar la 016** con el RF-4 en lugar de abrir una spec aparte.

**2 · El cierre por clic fuera no devuelve el foco.** El RF-4 se acotó a cerrar por teclado y por elección. Devolver el foco al botón tras un clic fuera robaría el foco a quien ha pulsado en otro sitio, que va contra lo esperado en un desplegable. Se documentó como decisión **D6**.

**3 · El RF-4 tocó el alcance.** La 016 pasó de «1 fichero modificado» a **3** (2 modificados y 1 nuevo): `admin.css`, `LangSwitcher.jsx` y `t21.test.js`. La spec, el plan y esta lista se actualizaron en la misma fase de cambio.

## Fase 1: Tests

### T1.1 `React/tests/t21.test.js` — nuevo

Fichero nuevo con pruebas de **lectura estática**, siguiendo la manera de hacer de `t19.test.js`: leer el fichero y comprobar que la regla está donde debe y dice lo que debe.

Debe escribirse **antes** de tocar el CSS y el componente, de modo que **falla** hasta que existan los dos cambios.

**RF-1 a RF-3 — CSS de `src/styles/admin.css`:**

| # | Comprobación | Por qué |
|---|---|---|
| 1 | `admin.css` contiene `.admin__nav .lang-switcher__menu` | La regla existe y va acotada a la barra lateral (D2) |
| 2 | Esa regla declara `left: 0` | Ancla el menú al borde izquierdo del botón (D1) |
| 3 | Esa regla declara `right: auto` | **Sin esto el menú se estira a todo el ancho** (D1) |
| 4 | Esa regla **no** está dentro del bloque `@media (max-width: 768px)` | Dentro estaría muerta: la barra lateral se oculta (D3) |
| 5 | Esa regla **no** declara `position`, `top` ni `min-width` | Solo reposiciona horizontalmente; el posicionamiento base es de la spec 015 (D4) |

**RF-4 — `src/components/Language/LangSwitcher.jsx`:**

| # | Comprobación | Por qué |
|---|---|---|
| 6 | El botón lleva una referencia (`ref`) | Sin ella no se le puede devolver el foco |
| 7 | El cierre por `Escape` llama a `.focus()` sobre el botón | RF-4: el foco no se pierde en `<body>` |
| 8 | El cierre por elección llama a `.focus()` sobre el botón | RF-4: la opción deja de existir al cerrarse |
| 9 | El cierre por clic fuera **no** llama a `.focus()` | D6: el foco debe seguir el sitio donde se ha hecho clic |

**Aserción auxiliar**: extraer el cuerpo de la regla con la misma función `rule()` que usa `t19.test.js` y comprobar las declaraciones sobre ese cuerpo, no sobre todo el fichero, para que una coincidencia de texto en otra regla no haga pasar el test por accidente.

**Nota sobre el RF-4**: estas pruebas comprueban que el **código** hace lo correcto, no el comportamiento real. El comportimiento se mide en el navegador, en la T3.4.

## Fase 2: Estilos y componente

### T2.1 `React/src/styles/admin.css`

Añadir **una sola regla**, junto al resto de reglas de la variante oscura y **fuera** del bloque `@media`:

```css
.admin__nav .lang-switcher__menu {
  left: 0;
  right: auto;
}
```

Acompañarla de un comentario de una línea que explique por qué hace falta `right: auto`. Es el único comentario del fichero y se pone porque sin él un mantenimiento posterior puede borrar la declaración y reintroducir el fallo sin que nada lo delate: los tests son estáticos y no miden posiciones.

**No se toca ninguna otra regla**: ni la base `.lang-switcher__menu` de la spec 015, ni el resto de la variante oscura, ni `.admin__nav`, ni el bloque `@media`.

### T2.2 `React/src/components/Language/LangSwitcher.jsx`

Devolver el foco al botón al cerrarse (RF-4 / D6). **Sin estado nuevo**: una referencia al botón y un `focus()`.

- **`Escape`**: el foco pasa al botón antes de cerrar.
- **`elegir()`**: el foco pasa al botón al cerrar.
- **`cerrarFuera()`**: **sin cambios** — solo cierra, sin mover el foco.

**No se toca** la lógica de apertura, el `aria-*`, el render del menú ni las opciones.

## Fase 3: Validación

### T3.1 Suites automáticas

| Suite | Resultado esperado |
|---|---|
| `npm test` | Los **225** previos + los de `t21`, **ninguno modificado** |
| `npm run build` | ✅ sin errores |
| `php artisan test --compact` | **105/105** — backend intacto |

### T3.2 Comprobación en navegador (sin tocar datos)

Requiere sesión de administración; **las credenciales no se escriben en este documento**.

**1 · El menú cabe entero (RF-1)** — con el panel en escritorio (1600×900), medir `getBoundingClientRect()` del menú desplegado:

| | x | right | Parte visible |
|---|---|---|---|
| Antes | −106 | 54 | 54 de 160px |
| Después | **16** | **176** | **160 de 160px** |

Debe cumplirse `x ≥ 0` y `right ≤ window.innerWidth`.

**2 · Los textos se leen completos (RF-1)** — el árbol de accesibilidad muestra las tres opciones íntegras («Español», «Català», «English») y no hay ningún corte visual.

**3 · Las tres opciones son pulsables (RF-2)** — sobre el centro de cada opción, `document.elementFromPoint()` debe devolver **la propia opción**. **Antes** devolvía `null` en las tres, porque su centro quedaba fuera de la ventana.

**4 · Se puede cambiar el idioma (RF-2)** — pulsar cada una de las tres opciones; en cada caso el panel se muestra en ese idioma de inmediato y el menú se cierra. Volver a la opción original al terminar.

**5 · Teclado (RF-2)** — con el botón enfocado, `Enter` abre y `Tab` recorre las tres opciones.

**6 · La cabecera pública no cambia (RF-3)** — a 1600×900, el selector público sigue desplegando el menú entero en el mismo sitio que hoy.

**7 · La barra superior móvil no cambia (RF-3)** — a **375×667**, el selector del panel sigue desplegando el menú entero en el mismo sitio que hoy.

**8 · Regresiones** — el selector público y el del panel siguen cerrando con `Escape` y con un clic fuera · la opción activa sigue marcada tras cambiar de idioma · las seis vistas del panel se siguen abriendo desde la barra lateral · consola sin errores.

### T3.3 El foco (RF-4)

Sobre `document.activeElement`, en el panel de escritorio. **Antes** de este RF, los dos primeros casos devolvían `<body>`.

| Caso | Comportamiento esperado |
|---|---|
| `Escape` con el foco en una opción | el foco queda en el **botón** del selector |
| Elegir una opción | el foco queda en el **botón** del selector |
| `Escape` con el foco en el botón | el foco sigue en el **botón** |
| Clic fuera | el foco **no** se mueve al botón |

Y comprobar que el selector sigue siendo el punto de entrada: con el foco perdido, `Enter` sobre el botón vuelve a abrir el menú.

### T3.4 Datos

**Sin escrituras**: la validación entra y sale del panel y cambia el idioma de la interfaz, que es una preferencia de cliente (cookie y almacenamiento local), no un dato del servidor. Comprobar al terminar que siguen **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje** y que la foto de perfil no ha cambiado.

**Comprobado**: `education` 1 · `experience` 1 · `projects` 0 · `users` 2 · `contact_messages` 1 · foto `photos/vsbEUqMTiZ3qOqUCbvLo08rz7x3K7xuY.jpg`, la misma que antes de empezar.
