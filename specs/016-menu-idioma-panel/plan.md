# Plan — El menú de idiomas del panel se ve entero (Spec 016)

## Alcance

Cambio **de CSS y de un componente en el frontend**. Sigue siendo la spec más pequeña del proyecto.

- **2 ficheros modificados** y **1 test nuevo**.
- **Backend intacto**: 0 ficheros, 0 migraciones, 0 endpoints.
- **Sin dependencias nuevas**.
- **Sin cambios de datos ni de esquema**.
- **Sin tocar ningún test existente** (verificado uno a uno abajo).
- **Sin añadir estado**: el RF-4 solo mueve el foco, no introduce datos nuevos en el componente.
- **No cambia la estética de la cabecera pública ni la de la barra superior del panel en móvil** (RF-3).
- **No cambia cuándo ni cómo se cierra el menú** (RF-4): solo dónde queda el foco al cerrarse.

> El RF-4 se añadió en la fase de validación. La spec decía a la vez que no se tocaba JavaScript y que el foco no debía perderse, que era una contradicción interna; se resolvió ampliando la 016, no abriendo otra spec.

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)
- **Build**: `npm run build`
- **Backend sin cambios** → `php artisan test --compact` se ejecuta solo como comprobación de no-regresión (debe seguir en **105**).

## Diagnóstico medido

`.lang-switcher__menu`, creado en la spec 015, es `position: absolute; top: calc(100% + 8px); right: 0`. Al llevar `right: 0`, el menú crece **hacia la izquierda** desde el borde derecho del botón. Eso es inocuo donde el botón tiene aire a su izquierda y catastrófico donde no:

| Emplazamiento | Botón | Menú desplegado | ¿Cabe? |
|---|---|---|---|
| Cabecera pública (1600×900) | `x ≈ 750` | `x ≈ 634 … 794` | ✅ entero |
| **Barra lateral del panel (200px)** | `x = 16` | **`x = −106 … 54`** | ❌ **solo 54 de 160px** |
| Barra superior del panel (375px) | `x = 188` | `x = 66 … 226` | ✅ entero |

Comprobado con `document.elementFromPoint()` sobre el centro de cada opción: las tres devuelven **`null`** en la barra lateral, porque su centro queda fuera de la ventana. Por eso en escritorio el idioma no se puede cambiar desde el panel.

## Decisiones de implementación

### D1 — Anclar el menú al borde izquierdo del botón

```css
.admin__nav .lang-switcher__menu {
  left: 0;
  right: auto;
}
```

- `left: 0` sitúa el borde izquierdo del menú en el borde izquierdo del botón: pasa de `x = −106` a `x = 16`.
- **`right: auto` es obligatorio**, no decorativo: la regla base de la spec 015 ya declara `right: 0`, y si quedan `left` y `right` a la vez el navegador los interpreta como un anclaje a los dos bordes y **estira el menú a todo el ancho disponible**. Sin `right: auto` el arreglo empeora el fallo en vez de arreglarlo.
- Resultado: el menú ocupa `16 … 176` dentro de la barra lateral de `200px`, con `24px` de aire a la derecha.

### D2 — El alcance es la barra lateral, no la variante oscura

La variante oscura del selector se usa en **dos** sitios y solo uno está roto:

| Sitio | ¿Roto? | ¿Conviene tocarlo? |
|---|---|---|
| Barra lateral del panel (escritorio) | Sí | **Sí** |
| Barra superior del panel (móvil) | No: `66 … 226` cabe en 375px | **No** |

Por eso la regla se acota a `.admin__nav` y no a la variante oscura. Es lo que exige la RF-3: mover también el menú de la barra superior sería un cambio visual no pedido en un sitio que funciona.

`.admin__nav` se reutiliza en la hoja inferior móvil (`.admin__nav.admin__nav--sheet`), pero **dentro de la hoja no hay selector**: en móvil el selector vive en la barra superior y en `menuItems` solo se monta cuando no hay móvil. La regla, por tanto, no llega a aplicarse allí; si en el futuro se montara dentro de la hoja, la corregiría automáticamente, que es el comportamiento deseado.

### D3 — La regla va fuera del bloque `@media`

- La barra lateral solo existe **por encima** de 768px. Dentro del bloque `@media (max-width: 768px)` esa barra se oculta, así que la regla quedaría **muerta**.
- Además, `T19.16` de `t19.test.js` extrae los selectores del bloque `@media` y exige que no aparezca `.admin__nav` a secas. Al ir fuera, la regla queda fuera de esa inspección.

Se coloca junto al resto de reglas de la variante oscura, al final de `admin.css`.

### D4 — Sin estado nuevo en el componente

`LangSwitcher.jsx` funciona bien: abre, cierra con `Escape` y con clic fuera, se recorre con teclado y marca la opción activa. El único fallo que tiene es el del RF-4 (el foco), y ese se arregla **sin añadir datos al estado**: basta con mover el foco al botón al cerrarse. Introducir estado donde no hace falta iría en contra del principio de simplicidad de la constitución.

### D6 — El foco vuelve al botón solo al cerrarse por teclado o por elección (RF-4)

Comprobado en navegador, el comportamiento actual es:

| Situación | ¿Cierra? | ¿Dónde queda el foco? | ¿Se corrige? |
|---|---|---|---|
| `Escape` con el foco en el **botón** | Sí | en el botón | No hace falta |
| `Escape` con el foco en una **opción** | Sí | **`<body>`** | **Sí** |
| Elegir una opción | Sí | **`<body>`** | **Sí** |
| Clic fuera | Sí | **`<body>`** | **No** |

Se corrigen las dos líneas marcadas con **una sola referencia al botón** y una llamada a `.focus()`:

- **`Escape`**: el foco pasa al botón antes de cerrar. Al ser el botón el que recibe el foco de nuevo, una persona con teclado queda lista para volver a abrir con `Enter`.
- **Elegir una opción**: el foco pasa al botón después de cerrar, porque la opción deja de existir al desmontarse el menú.
- **Clic fuera: no se toca**. Quien hace clic en otro sitio espera que el foco siga su clic; devolvérselo al botón sería robarle el foco y va contra lo esperado en un desplegable.

El cambio es de **dos líneas** en el componente: una referencia al botón y un `focus()`. Sin estado, sin dependencias y sin tocar la lógica de apertura ni la de cierre.

> **Dónde se prueba esto**: las pruebas del proyecto son de lectura estática, así que cubren que el código hace `focus()` en los dos casos correctos y **no** lo hace al cerrar por clic fuera. El comportamiento real se comprueba en navegador (T3.4).

### D5 — Comentario breve junto a la regla

La regla se acompaña de un comentario de una línea que explique *por qué* `right: auto`. Sin él, un mantenimiento posterior puede «limpiar» la declaración y reintroducir el fallo sin que nada lo delate: los tests son estáticos y no miden posiciones.

## Estructura de ficheros

### Frontend (`React/`) — 3 ficheros (2 modificados, 1 nuevo)

```
src/styles/admin.css                      (modificado: una regla de posición en la variante oscura)
src/components/Language/LangSwitcher.jsx  (modificado: devuelve el foco al botón al cerrarse)
tests/t21.test.js                         (nuevo: tests de la spec 016)
```

> **No se modifica ningún test existente ni ningún otro componente.**

### Backend — sin ficheros

---

## Tests existentes que leen esta zona

Verificado uno a uno que **siguen en verde sin tocarlos**:

| Test | Qué exige | ¿Se cumple? |
|---|---|---|
| `T7.1` | `admin.css` no está vacío | ✅ Se añade una regla |
| `T14.6` | `admin.css` contiene doce clases de la vista de Usuarios | ✅ Ninguna se elimina |
| `T17.21` | `admin-form__dates select:first-child` presente y `:last-child` ausente | ✅ No se toca |
| `T19.3` | `admin.css` sin hex sueltos | ✅ La regla nueva no usa colores |
| `T19.16` | Dentro del `@media` aparece `.admin > .admin__nav` y **no** `.admin__nav` a secas | ✅ La regla va fuera del `@media` y su selector es `.admin__nav .lang-switcher__menu`, que **no** coincide exactamente con `.admin__nav` |
| `T12` / `T19.9` | `AdminLayout` monta `menuItems` y el selector | ✅ No se modifica el componente |
| `T20.2` / `T20.6` | La cabecera pública y el panel **montan** `LangSwitcher` | ✅ Solo se comprueba que lo importan, no su interior |

**Verificado además** que ninguna prueba lee `LangSwitcher.jsx`: las tres menciones del fichero anterior están en `t20.test.js` y comparan el contenido de `Header.jsx` y `AdminLayout.jsx`, no el del selector. El RF-4 se puede implementar sin tocar ningún test existente.

## Pasos de implementación

1. **Test nuevo**: crear `tests/t21.test.js` con las seis comprobaciones de CSS y las cuatro del RF-4. Debe fallar todavía.
2. **`admin.css`**: añadir la regla de D1 con su comentario, junto a las reglas de la variante oscura y fuera del bloque `@media`.
3. **`LangSwitcher.jsx`**: añadir la referencia al botón y devolverle el foco al cerrar por `Escape` y al elegir una opción (D6). **No se toca el cierre por clic fuera.**
4. **Suites**: `npm test` y `npm run build` en verde; `php artisan test --compact` sigue en **105**.
5. **Validación en navegador** (no destructiva, no toca datos), incluida la del RF-4.

## Verificación

### Automática

- `npm test` → los **225** existentes + los de `t21`. **Ningún test previo se modifica.**
- `npm run build` → sin errores.
- `php artisan test --compact` → sigue en **105** (no se toca el backend).

Cobertura que debe añadir `t21` (lectura estática de ficheros):

**RF-1 a RF-3 — CSS:**

- `admin.css` contiene una regla para `.admin__nav .lang-switcher__menu`.
- Esa regla declara `left: 0`.
- Esa regla declara `right: auto` (D1: sin esto el menú se estira).
- Esa regla **no** está dentro del bloque `@media (max-width: 768px)` (D3).
- Esa regla **no** cambia `position` ni `top`: solo reposiciona horizontalmente.

**RF-4 — `LangSwitcher.jsx`** (comprueba el código, no el comportamiento; eso es T3.4):

- El botón lleva una referencia (`ref`) para poder recibir el foco.
- El cierre por `Escape` devuelve el foco al botón.
- El cierre por elección devuelve el foco al botón.
- El cierre por clic fuera **no** devuelve el foco: solo cierra.

### Manual — en navegador, sin tocar datos

La spec se apoya en medidas objetivas, no en impresiones. Requiere una cuenta de administración (las credenciales no se escriben en este documento).

**1. El menú cabe entero (RF-1)**

Con el panel en escritorio (1600×900), desplegar el selector y medir `getBoundingClientRect()` del menú. **Antes** `x = −106`, `right = 54`. **Después**: `x ≥ 0` y `right ≤ window.innerWidth`, es decir, el menú entero dentro de la ventana.

**2. Los textos se leen completos (RF-1)**

Comprobar en el árbol de accesibilidad que aparecen las tres opciones con su texto íntegro —«Español», «Català», «English»— y que visualmente no hay ningún corte.

**3. Las tres opciones son pulsables (RF-2)**

Sobre el centro de cada opción, `document.elementFromPoint()` debe devolver **la propia opción**, no `null` ni otro elemento. **Antes** devolvía `null` en las tres.

**4. Se puede cambiar el idioma (RF-2)**

Pulsar cada una de las tres opciones, una por una. En cada caso el panel debe mostrarse en ese idioma de inmediato y el menú debe cerrarse. Volver a la opción original al final para dejar el idioma como estaba.

**5. Teclado (RF-2)**

Con el botón enfocado, `Enter` abre el menú y `Tab` recorre las tres opciones.

**6. El foco no se pierde (RF-4)**

Sobre `document.activeElement` en cada caso:

| Caso | Comportamiento esperado |
|---|---|
| `Escape` con el foco en una opción | el foco queda en el **botón** del selector |
| Elegir una opción | el foco queda en el **botón** del selector |
| `Escape` con el foco en el botón | el foco sigue en el **botón** |
| Clic fuera | el foco **no** se mueve al botón |

**Antes** de este RF, los dos primeros casos dejaban el foco en `<body>`.

**7. La cabecera pública no cambia (RF-3)**

Con la ventana a 1600×900, salir del panel y desplegar el selector público. El menú debe seguir en el mismo sitio que hoy, enteramente visible.

**8. La barra superior móvil no cambia (RF-3)**

Con la ventana a **375×667**, entrar en el panel y desplegar el selector de la barra superior. Debe seguir en el mismo sitio que hoy, enteramente visible.

**9. Regresiones**

- El selector público y el del panel siguen cerrando con `Escape` y con un clic fuera.
- El menú activo sigue marcado tras cambiar de idioma.
- Las seis vistas del panel se siguen abriendo desde la barra lateral.
- **Consola del navegador**: sin errores.

### Datos

**Esta spec no toca ningún dato.** No hay escrituras, así que no hacen falta registros temporales ni comprobación de recuentos. La validación se hace entrando y saliendo del panel y cambiando el idioma de la interfaz, que es una preferencia de cliente (cookie y almacenamiento local) y no un dato del servidor.

## Criterios de finalización del plan

- Con el panel en escritorio, el menú desplegado queda **entero dentro de la ventana**.
- Las tres opciones muestran su **texto completo** y se pueden pulsar.
- El cambio de idioma funciona desde la barra lateral del panel.
- Tras cerrar con `Escape` desde una opción o al elegir una, el foco queda en el **botón** del selector.
- La cabecera pública y la barra superior del panel en móvil quedan **visualmente sin cambios**.
- `npm test` y `npm run build` en verde **sin modificar ningún test existente**.
- `php artisan test --compact` sigue en **105**.
