# Spec 009 — Unificación de la estética y responsive del panel de administración

## Contexto y objetivo

La **spec 008** corrigió los bugs funcionales del panel pero dejó su aspecto y su comportamiento en pantallas estrechas sin resolver. Quedó **reservada** para una spec propia, y esta es ella.

Petición de la persona usuaria (13/10/2026): *«vamos con la spec 009»*, con las decisiones tomadas en clarificación:

1. El panel **sigue siendo claro**, pero deja los colores sueltos y pasa a **tokens propios (`--admin-*`)**.
2. La navegación en móvil pasa a **barra superior + hoja inferior**, reutilizando el `BottomSheet` que ya usa la web pública.
3. Alcance: responsive del layout, revisión de listas y formularios a 375px, arreglo del contraste de `Loading`/`EmptyData` y reorganización de `contact.css`.

---

## Diagnóstico

### 1 · El panel no comparte sistema de color con el resto del proyecto

La web pública usa `var(--color-*)` de forma sistemática. El panel, no:

| Fichero | hex en duro | `var()` |
|---|---|---|
| `styles/admin.css` | **16** | **0** |
| `styles/photo-uploader.css` | **14** | **0** |
| `styles/contact.css` | 5 | 24 |
| `styles/states.css` | 2 | 2 |
| `styles/sections.css` | 0 | 12 |
| `styles/navigation.css` | 0 | 38 |
| `styles/layout.css` | 0 | 7 |

`admin.css` y `photo-uploader.css` son los dos únicos ficheros del proyecto con **cero** tokens. La paleta que usan es una familia distinta de la web (slate `#2c3e50` / azul `#3498db`), coherente en sí misma pero desconectada del sistema.

### 2 · Bug de accesibilidad: estados vacíos y de carga invisibles

`states.css` —fichero **compartido** entre la web pública y el panel— usa `var(--color-text-muted)` en `.loading` y `.empty-data`. Ese token vale `#b8c5d3`, un gris claro pensado para fondo oscuro.

Dentro del panel, que tiene fondo `#f5f5f5`, eso produce:

| | |
|---|---|
| Color de texto | `#b8c5d3` → luminancia relativa **0,548** |
| Fondo | `#f5f5f5` → luminancia relativa **0,913** |
| **Contraste** | **1,61 : 1** — WCAG AA exige **4,5 : 1** |

Afecta a las **seis vistas** del panel, porque todas devuelven `<Loading />` al cargar y `<EmptyData />` cuando no hay registros. En el panel **«Cargando...» y el estado vacío son prácticamente invisibles**.

### 3 · Cero `@media` en todo el panel

El único `@media` del proyecto están en `avatar.css` y `navigation.css`, ambos de la web pública. El panel no tiene ninguno: `.admin__nav` es una barra lateral fija de **200px** y `.admin__content` ocupa el resto.

En un móvil de 375px eso deja **175px de ancho útil para trabajar**, sin posibilidad de ocultar la navegación.

### 4 · Los estilos de mensajes están en el fichero equivocado

Las reglas `.admin-messages*` (líneas 99–154) y `.admin-view__badge` (156–164) viven en **`contact.css`**, un fichero que debería contener solo la sección pública de contacto. Nadie las encuentra ahí buscando por nombre de fichero.

---

## RF-1 — El panel dispone de su propio sistema de tokens

**QUÉ**: añadir a `variables.css` un conjunto de tokens `--admin-*` y reemplazar **todos** los hex sueltos de `admin.css` y `photo-uploader.css` por ellos.

**POR QUÉ**: decisión de la persona usuaria. Separa la paleta del panel de la de la web sin mezclarlas, deja el color en un único punto de mantenimiento y permite que un cambio de tono no exija buscar por todo el CSS.

**Los valores NO cambian**: es un inventario de lo que ya existe, no un rediseño. El panel sigue viéndose igual que hoy.

| Token | Valor | Sustituye a |
|---|---|---|
| `--admin-bg` | `#f5f5f5` | fondo de `.admin` |
| `--admin-surface` | `#ffffff` | tarjetas, listas, inputs |
| `--admin-surface-soft` | `#fafafa` | fondo de `.photo-uploader` |
| `--admin-text` | `#333333` | texto general |
| `--admin-text-muted` | `#7f8c8d` | `#888`, `#999`, `#666`, `#95a5a6` |
| `--admin-heading` | `#2c3e50` | títulos y etiquetas |
| `--admin-border` | `#dddddd` | `#ddd`, `#e4e4e4`, `#d0d0d0` |
| `--admin-primary` | `#3498db` | botón principal, badge, rol editor |
| `--admin-primary-hover` | `#2980b9` | hover del principal |
| `--admin-danger` | `#e74c3c` | eliminar, logout, error |
| `--admin-danger-hover` | `#c0392b` | hover de peligro |
| `--admin-danger-bg` | `#fdecea` | fondo del mensaje de error |
| `--admin-warning` | `#f39c12` | editar, marcar como atendido |
| `--admin-nav-bg` | `#2c3e50` | barra lateral |
| `--admin-nav-text` | `#ecf0f1` | texto de la barra |
| `--admin-nav-hover` | `#34495e` | hover de la barra |
| `--admin-nav-muted` | `#95a5a6` | correo en la barra |
| `--admin-neutral` | `#bdc3c7` | chip de rol neutro, botón fantasma |
| `--admin-role-admin` | `#e67e22` | chip «admin» |
| `--admin-role-reader` | `#95a5a6` | chip «reader» |

**Criterios de aceptación (EARS)**:

- **Cuando** `admin.css` o `photo-uploader.css` declare un color, **el sistema deberá** usar un token `--admin-*` y **no** deberá contener ningún hex suelto.
- **Cuando** se compare el panel antes y después, **el sistema deberá** mostrar **exactamente los mismos colores**: esta RF es de estructura, no de aspecto.
- **Dado** que `variables.css` es la única fuente, **entonces** cambiar un tono exigirá **tocar un único fichero**.

---

## RF-2 — Los componentes compartidos se adaptan al tema en el que se usan

**QUÉ**: `states.css` pasa a usar **tokens semánticos del sitio** (`--color-text-muted`, `--color-accent`, y uno nuevo `--color-danger`), y `.admin` **redefine dentro de su propio subárbol** los tokens públicos que esos componentes leen.

```css
.admin {
  --color-text:        var(--admin-text);
  --color-text-muted:  var(--admin-text-muted);
  --color-border:      var(--admin-border);
  --color-accent:      var(--admin-primary);
  --color-danger:      var(--admin-danger);
}
```

**POR QUÉ**: `Loading`, `EmptyData` y `ErrorMessage` se usan **tanto** en la web pública como en el panel. La alternativa sería duplicar cada regla con un selector `.admin .loading`, que multiplica el CSS y obliga a recordar el par cada vez que se añada un estado. Redefinir las variables dentro del subárbol hace que **los mismos componentes se pinten bien en ambos temas sin que ninguno se entere**.

Es la razón de ser de las variables CSS y evita por completo la duplicación.

**Efecto visible en la web pública** — *este es el único cambio de color fuera del panel*:

| Componente | Hoy | Después |
|---|---|---|
| Botón de `<ErrorMessage />` | `#3498db` (color heredado del panel) | `var(--color-accent)` = `#5ba3d9` |
| Texto de `<ErrorMessage />` | `#e74c3c` | `var(--color-danger)` |

Hoy esos dos colores son **azules y rojos del panel de administración**, colgando de un componente que también se ve en la web pública. Cambiarlos al acento del sitio es coherencia buscada, y queda aquí expuesto para que pueda vetarse.

**Criterios de aceptación (EARS)**:

- **Cuando** se cargue cualquier vista del panel, **el sistema deberá** mostrar `<Loading />` y `<EmptyData />` con un contraste **≥ 4,5 : 1** sobre el fondo del panel.
- **Cuando** el mismo componente se use en la web pública, **el sistema deberá** conservar su aspecto actual sobre fondo oscuro.
- **Cuando** se añada un nuevo estado compartido, **el sistema deberá** poder escribirse **una sola vez** con tokens del sitio, sin regla específica para el panel.

---

## RF-3 — La navegación del panel se adapta a la pantalla

**QUÉ**:

- **Más de 768px**: barra lateral de 200px, **idéntica a hoy**.
- **768px o menos**: la barra lateral **no se renderiza**. Aparece una **barra superior** con el correo y un botón de menú, que abre el **`BottomSheet`** —el mismo componente y el mismo CSS que ya usa la web pública— con los mismos accesos de siempre.

El menú se define **una sola vez** en `AdminLayout.jsx` y se renderiza en la barra lateral o en la hoja, según la pantalla. Nada se duplica.

**POR QUÉ**: decisión de la persona usuaria. Reutilizar el `BottomSheet` existente deja **un único patrón de menú móvil en todo el proyecto** y no exige ni una dependencia ni un componente nuevo. El corte de 768px es el mismo que ya usan `avatar.css` y `navigation.css`.

**Cambio necesario en `BottomSheet`**: hoy renderiza `<NavButtons />` de forma fija. Para poder alojar el menú del panel debe aceptar `children`. Eso **modifica el contrato del componente** y con él el test `T4.5`, que hoy afirma que `BottomSheet` contiene `NavButtons`. El test pasa a comprobar que el componente **renderiza sus hijos**.

**Criterios de aceptación (EARS)**:

- **Cuando** la pantalla mida más de 768px, **el sistema deberá** mostrar la barra lateral de 200px, **idéntica a la actual**.
- **Cuando** la pantalla mida 768px o menos, **el sistema deberá** mostrar una barra superior y **no** deberá mostrar la barra lateral.
- **Cuando** se pulse el botón de menú, **el sistema deberá** abrir la hoja inferior con **todos** los accesos, incluidos «Ver portfolio» y «Cerrar sesión».
- **Cuando** la hoja esté abierta, **el sistema deberá** cerrarla al pulsar fuera del panel o al elegir una opción.
- **Cuando** cambie el `activeView`, **el sistema deberá** cerrar la hoja.
- **Cuando** el rol no permita «Usuarios», **el sistema deberá** seguir ocultando ese acceso **tanto** en la barra lateral **como** en la hoja.
- **Dado** que el menú se define una sola vez, **entonces** no podrá existir **ninguna** diferencia de contenido entre ambos modos.

---

## RF-4 — El panel es usable a 375px de ancho

**QUÉ**: corregir los puntos que se rompen a ese ancho, sin tocar el diseño en escritorio.

| Regla | Problema | Corrección |
|---|---|---|
| `.admin-list__item` | `display: flex` **sin `flex-wrap`**: los botones Editar/Eliminar se estrujan contra el texto | añadir `flex-wrap: wrap` |
| `.admin-messages__actions` | igual, sin `flex-wrap` | añadir `flex-wrap: wrap` |
| `.admin__content` | `padding: 2rem` consume 64px de un ancho ya escaso | reducir el padding en móvil |
| `.admin-form__dates` | dos `<select>` en fila | verificar que no se estrujan; si lo hacen, `flex-wrap` |

Reglas que **ya** lo resuelven y **no** se tocan: `.admin-view__header` y `.user-list__item` llevan `flex-wrap: wrap`; `.admin-form` tiene `max-width: 500px`; `.admin-messages__header` envuelve.

**POR QUÉ**: es lo que hace el panel de verdad usable desde un teléfono, y es parte del alcance decidido.

**Criterios de aceptación (EARS)**:

- **Cuando** el panel se muestre a 375px, **el sistema deberá** poder abrir cada una de las seis vistas **sin** desplazamiento horizontal.
- **Cuando** un elemento de lista tenga botones de acción, **el sistema deberá** envolverlos a una segunda línea en lugar de estrujarlos.
- **Cuando** se cargue un formulario a 375px, **el sistema deberá** poder escribir, guardar y cancelar cómodamente.
- **Cuando** se muestre una lista con acciones en escritorio, **el sistema deberá** conservar el aspecto actual.

---

## RF-5 — Cada fichero de estilos contiene su propia sección

**QUÉ**: mover de `contact.css` a `admin.css` las reglas `.admin-messages*` (líneas 99–154) y `.admin-view__badge` (156–164), y convertirlas a tokens `--admin-*` como el resto del panel.

**POR QUÉ**: son estilos **del panel** viviendo en el fichero de la sección pública de contacto, donde nadie los busca. `contact.css` queda únicamente con la web pública. Requisito de mantenibilidad de la Constitución («código y documentación mantenibles»).

**Criterios de aceptación (EARS)**:

- **Cuando** se busquen los estilos de la bandeja de mensajes, **el sistema deberá** encontrarlos en `admin.css`.
- **Cuando** se abra `contact.css`, **el sistema deberá** encontrar **solo** reglas de la web pública.
- **Cuando** se cambie cualquier regla movida, **el sistema deberá** mostrar la bandeja de mensajes **igual que hoy**.

---

## Casos límite y decisiones tomadas

- **El corte es de 768px**, el mismo que ya usan `avatar.css` y `navigation.css`. Un solo punto de ruptura: no se inventa uno nuevo para el panel.
- **`useMediaQuery('(max-width: 768px)')`** ya existe y se usa en la web pública. Se reutiliza, sin dependencias.
- **La barra lateral se oculta, no se reformatea.** En móvil no tiene sentido una columna de 200px; la hoja inferior es el patrón ya adoptado por el proyecto.
- **El menú se construye una sola vez** y se renderiza en un sitio u otro. Evita que «Ver portfolio» o el filtrado por permisos se desincronicen entre modos.
- **`margin-top: auto` de «Cerrar sesión»** funciona en la barra lateral porque esta se estira a la altura del panel; dentro de la hoja, de altura automática, simplemente queda al final. No hay que condicionarlo.
- **Se conserva el `z-index` existente**: `.bottom-sheet` (999) y `.floating-button` (1000) ya cubren la hoja, y el panel no define ninguno.
- **El token `--color-danger` es nuevo y es del sitio público**, no del panel: lo necesita `states.css`, que es compartido.
- **`PhotoUploader` solo se usa en el panel**, por lo que sus 14 hex pasan íntegramente a tokens `--admin-*` y no requieren adaptación por tema.
- **El login NO se toca**: `login.css` usa 26 tokens del sitio y pertenece a la web pública oscura.
- **La hoja inferior hereda el estilo de `bottom-sheet__panel`** (fondo oscuro, radio superior). Es el mismo componente que usa la web pública y se asume ese aspecto común; no se le da un estilo propio de panel.

---

## Fuera de alcance

- **La paleta de la web pública**: `variables.css` solo **añade** `--admin-*` y el token `--color-danger`; ningún valor existente cambia.
- **El panel de login**.
- **Funcionalidad, permisos, endpoints o datos**: ningún componente gana lógica nueva, solo posicionamiento.
- **Nuevas dependencias**.
- **El flujo de navegación de la web pública**, salvo el efecto sobre el botón de `ErrorMessage` documentado en RF-2.

---

## Criterios de finalización

- `admin.css` y `photo-uploader.css` **no contienen ningún hex suelto**.
- El panel se ve **exactamente igual que hoy en escritorio**.
- `<Loading />` y `<EmptyData />` en el panel pasan de **1,61 : 1** a **≥ 4,5 : 1**.
- A 768px o menos aparece barra superior y **desaparece** la barra lateral; la hoja inferior recibe todos los accesos y los mismos permisos.
- A **375px** las seis vistas se usan **sin desplazamiento horizontal**.
- `contact.css` contiene solo estilos de la web pública.
- `npm test` y `npm run build` en verde.
- **La web pública se ve igual**, salvo el botón y el texto de `<ErrorMessage />`.
- Ningún dato real modificado.
