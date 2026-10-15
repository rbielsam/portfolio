# Plan — Unificación de la estética y responsive del panel de administración (Spec 009)

## Alcance

Cambio **exclusivamente de presentación y posicionamiento en el frontend**. Sin backend, sin datos, sin dependencias.

- **8 ficheros modificados** (7 de código, 1 test), **1 test nuevo**.
- **Backend intacto**: 0 ficheros → `php artisan test --compact` debe seguir en **105**.
- **Sin dependencias nuevas**: se reutilizan `useMediaQuery`, `BottomSheet` y `FloatingButton` existentes.
- **El panel se ve igual que hoy en escritorio**: los tokens `--admin-*` reproducen los valores actuales al píxel.
- **La web pública queda igual**, salvo un único color (ver D2).

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)
- **Build**: `npm run build`
- **Punto de ruptura**: 768px, el mismo que ya usan `avatar.css` y `navigation.css`

## Decisiones de implementación

### D1 — Los tokens `--admin-*` son un inventario, no un rediseño

Los 20 tokens se añaden a `variables.css` con **exactamente los valores que el panel usa hoy**. No se decide ningún tono nuevo.

| Token | Valor | Sustituye a |
|---|---|---|
| `--admin-bg` | `#f5f5f5` | `.admin` background |
| `--admin-surface` | `#ffffff` | `.admin-list__item`, `.user-list__item`, inputs |
| `--admin-surface-soft` | `#fafafa` | `.photo-uploader` background |
| `--admin-text` | `#333333` | `.admin` color |
| `--admin-text-muted` | `#7f8c8d` | `#888`, `#999`, `#666`, `#95a5a6` (`.user-role--reader`) |
| `--admin-heading` | `#2c3e50` | `.admin-view__title`, `.admin-form__title`, `.photo-uploader__label` |
| `--admin-border` | `#dddddd` | `#ddd`, `#e4e4e4`, `#d0d0d0` |
| `--admin-primary` | `#3498db` | `.admin-btn`, `.admin-form__button`, `.user-role--editor`, `.admin-view__badge`, `.photo-uploader__button`, `.admin-messages__item--unread` |
| `--admin-primary-hover` | `#2980b9` | hovers del primario |
| `--admin-danger` | `#e74c3c` | `.admin-btn--danger`, `.admin__nav-button--logout`, `.photo-uploader__error` |
| `--admin-danger-hover` | `#c0392b` | hover del peligro |
| `--admin-danger-bg` | `#fdecea` | `.admin-error` background |
| `--admin-warning` | `#f39c12` | `.admin-list__item button:first-of-type`, mensajes actions |
| `--admin-nav-bg` | `#2c3e50` | `.admin__nav` background |
| `--admin-nav-text` | `#ecf0f1` | `.admin__nav-button` color |
| `--admin-nav-hover` | `#34495e` | hover de la barra, `.admin__user` border |
| `--admin-nav-muted` | `#95a5a6` | `.admin__user` color |
| `--admin-neutral` | `#bdc3c7` | `.user-role`, `.admin-btn--ghost` color, `.photo-uploader__button--ghost` |
| `--admin-role-admin` | `#e67e22` | `.user-role--admin` |
| `--admin-role-reader` | `#95a5a6` | `.user-role--reader` |

**Verificación obligatoria**: al terminar, `grep -cE '#[0-9a-fA-F]{3,6}'` sobre `admin.css` y `photo-uploader.css` debe dar **0**.

### D2 — `states.css` pasa a tokens del sitio, y `.admin` reescribe los que hereda

`states.css` es **compartido** entre la web pública y el panel. Su contenido actual:

```css
.loading { color: var(--color-text-muted); }        /* #b8c5d3 — claro */
.empty-data { color: var(--color-text-muted); }     /* #b8c5d3 — claro */
.error-message__text { color: #e74c3c; }            /* hex */
.error-message__button { background: #3498db; }     /* hex del panel */
```

Sobre el fondo `#f5f5f5` del panel, `#b8c5d3` da **1,61 : 1** → los estados de carga y vacío son invisibles en las seis vistas.

Se sustituye por:

```css
.loading { color: var(--color-text-muted); }             /* sin cambios */
.empty-data { color: var(--color-text-muted); }          /* sin cambios */
.error-message__text { color: var(--color-danger); }     /* nuevo token */
.error-message__button { background: var(--color-accent); }
```

y en `admin.css` el panel reescribe **dentro de su subárbol** los tokens que esos componentes leen:

```css
.admin {
  --color-text:       var(--admin-text);
  --color-text-muted: var(--admin-text-muted);
  --color-border:     var(--admin-border);
  --color-accent:     var(--admin-primary);
  --color-danger:     var(--admin-danger);
}
```

**Por qué esta vía y no `.admin .loading { ... }`**: `Loading`, `EmptyData` y `ErrorMessage` se usan en los dos temas. Con selectores específicos habría que duplicar **cada regla** y acordarse del par la próxima vez que se añada un estado. Con variables, los mismos componentes se pintan bien en ambos sitios y nadie se entera. Es exactamente el uso para el que existen las variables CSS.

`--color-danger` es **nuevo** y vale `#e74c3c`, que es **el valor que `.error-message__text` ya tiene hoy**.

**Efecto real en la web pública — corregido respecto a lo dicho en la spec**:

| Componente | Hoy | Después | ¿Cambia a la vista? |
|---|---|---|---|
| Texto de `<ErrorMessage />` | `#e74c3c` | `--color-danger` = `#e74c3c` | **No** — mismo valor |
| Botón de `<ErrorMessage />` | `#3498db` | `--color-accent` = `#5ba3d9` | **Sí** |

La spec 009 decía que cambiaban los dos; **al precisarlo aquí, solo cambia el botón**. Es el único cambio de color fuera del panel, y ya ha sido aceptado.

### D3 — El menú se construye una sola vez y se renderiza en un sitio u otro

`AdminLayout.jsx` gana `useMediaQuery('(max-width: 768px)')` y `useState` para la hoja. El menú se extrae a una constante JSX que se pinta en la barra lateral **o** en la hoja:

```jsx
const menuItems = (
  <>
    <p className="admin__user">{user?.email}</p>
    {menu.filter((item) => item.key !== 'usuarios' || can('users')).map((item) => (
      <button key={item.key}
        className={`admin__nav-button ${activeView === item.key ? 'admin__nav-button--active' : ''}`}
        onClick={() => selectView(item.key)}>
        {item.label}
      </button>
    ))}
    <button className="admin__nav-button" onClick={onExit}>Ver portfolio</button>
    <button className="admin__nav-button admin__nav-button--logout" onClick={handleLogout}>Cerrar sesión</button>
  </>
)
```

**Por qué así**: si el menú existiera en dos sitios, el filtrado por `can('users')` y el resaltado de `activeView` podrían desincronizarse. Con una única constante es imposible.

`selectView(key)` hace `setActiveView(key)` **y** `setIsSheetOpen(false)`, de modo que elegir una opción cierra la hoja.

```jsx
<div className="admin">
  {isMobile ? (
    <header className="admin__topbar">
      <span className="admin__topbar-title">Administración</span>
      <button className="admin__menu-button" onClick={() => setIsSheetOpen(true)} aria-label="Abrir menú">☰</button>
    </header>
  ) : (
    <nav className="admin__nav">{menuItems}</nav>
  )}

  <main className="admin__content"><ActiveView /></main>

  {isMobile && (
    <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
      <nav className="admin__nav admin__nav--sheet">{menuItems}</nav>
    </BottomSheet>
  )}
</div>
```

**En escritorio no cambia nada**: `isMobile` es `false`, la barra lateral se renderiza igual que hoy y la hoja ni se monta.

### D4 — `BottomSheet` acepta `children`

```jsx
function BottomSheet({ isOpen, onClose, children }) {
  if (!isOpen) return null
  return (
    <div className="bottom-sheet" onClick={onClose}>
      <div className="bottom-sheet__panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
```

`App.jsx` pasa `<NavButtons />` como hijo. Es el único cambio de comportamiento de un componente compartido.

**Consecuencia en tests**: `T4.5` afirma hoy que `BottomSheet` contiene `NavButtons`. **Modificación aceptada** por la persona usuaria — se documenta en `tareas.md` como en la spec 013:

| Test | Cambio |
|---|---|
| `T4.5` | De exigir `NavButtons` a exigir que el componente renderiza **`children`** |

Los otros dos tests de `T4.5` (existe · export default) **no cambian**.

### D5 — Arreglos a 375px

| Regla | Hoy | Después |
|---|---|---|
| `.admin-list__item` | `flex` sin `flex-wrap` → Editar/Borrar se estrujan | + `flex-wrap: wrap` |
| `.admin-messages__actions` | `flex` sin `flex-wrap` | + `flex-wrap: wrap` |
| `.admin__content` | `padding: 2rem` (64px de 375) | `padding: 1rem` en móvil |

**Sin cambios, ya resuelven**: `.admin-view__header`, `.user-list__item`, `.admin-messages__header` (llevan `flex-wrap: wrap`) · `.admin-form` (`max-width: 500px`) · `.admin-form__actions`.

**`.admin__content` mantiene `overflow-y: auto`**: con altura automática no crea contenedor de scroll, así que no recorta en ningún modo.

### D6 — Mover los estilos de mensajes a `admin.css`

De `contact.css` a `admin.css`, convertidos a tokens:

- `.admin-messages` (99–105) · `.admin-messages__item` (107–112) · `.admin-messages__item--unread` (114–116) · `.admin-messages__header` (118–125) · `.admin-messages__header time` (127–130) · `.admin-messages__body` (132–135) · `.admin-messages__actions` (137–140) · `.admin-messages__actions button` (142–150) · `.admin-messages__actions button:last-child` (152–154) · `.admin-view__badge` (156–164)

`contact.css` queda **solo** con estilos de la web pública.

### D7 — Lo que NO cambia

| Zona | Por qué |
|---|---|
| Valores de color del panel | Los tokens reproducen los actuales: es estructura, no aspecto |
| `login.css` | 26 tokens de la web pública; el login es público y oscuro |
| Permisos, endpoints, lógica | Ningún componente gana lógica, solo posicionamiento |
| `UserManager` (usa `<p>Cargando usuarios...</p>`, no `<Loading />`) | Su color lo hereda de `.admin`; queda correcto con D2 |
| `.admin-view` (clase base sin regla) | No tiene regla hoy y sigue sin necesitarla |
| `.bottom-sheet__panel` | Hereda el aspecto común oscuro; no se le da estilo propio de panel |

## Estructura de ficheros

### Frontend (`React/`) — 9 ficheros (8 modificados, 1 nuevo)

```
src/styles/variables.css                   (+20 tokens --admin-*, +1 --color-danger)
src/styles/admin.css                       (tokenizar · D2 · D3 · D5 · D6)
src/styles/photo-uploader.css              (tokenizar: 14 hex → tokens)
src/styles/states.css                      (hex → tokens del sitio)
src/styles/contact.css                     (-96 líneas de estilos de panel)
src/pages/admin/AdminLayout.jsx            (topbar + hoja + menú único)
src/components/Navigation/BottomSheet.jsx  (prop children)
src/App.jsx                                (pasa <NavButtons /> como hijo)
tests/t19.test.js                          (nuevo)
tests/t4.5.test.js                         (modificado: 1 de sus 3 pruebas)
```

> **Ningún otro test existente se modifica.**

### Backend — sin ficheros

## Tests existentes que leen esta zona

Verificados uno a uno:

| Test | Qué exige | ¿Se cumple? |
|---|---|---|
| `T4.5` (1.ª) | `BottomSheet.jsx` existe | ✅ |
| `T4.5` (2.ª) | Contiene `NavButtons` o `Inicio` | ❌ → **modificado** (D4) |
| `T4.5` (3.ª) | `export default` | ✅ |
| `t12`, `t6`, `t7`, `t8` | Contenido de `AdminLayout.jsx` | ✅ Verificar cada aserción al implementar |
| `t14` | `.user-manager__header`, `.admin-view__header`, `admin-view__header` en cada vista | ✅ Marcado intacto |

## Pasos de implementación

1. **Tests nuevos**: crear `tests/t19.test.js`. Debe fallar todavía.
2. **Tokens**: añadir `--admin-*` y `--color-danger` a `variables.css`.
3. **Tokenizar**: `admin.css` y `photo-uploader.css` sin ningún hex.
4. **`states.css`** a tokens del sitio; bloque de reescritura en `.admin`.
5. **Mover estilos**: de `contact.css` a `admin.css`.
6. **`BottomSheet`** con `children`; `App.jsx` lo pasa.
7. **`AdminLayout.jsx`**: topbar, hoja y menú único.
8. **Arreglos 375px**: `flex-wrap` y padding.
9. **`T4.5`**: adaptar la prueba modificada.
10. **Suites**: `npm test`, `npm run build` y `php artisan test --compact`.
11. **Validación manual** en navegador.

## Verificación

### Automática

- `npm test` → los **190** existentes + los de `t19`. **Solo se modifica una prueba de `T4.5`.**
- `npm run build` → sin errores.
- `php artisan test --compact` → sigue en **105**.

Cobertura que debe añadir `t19` (lectura estática):

- `variables.css` define tokens `--admin-*` y `--color-danger`.
- `admin.css` y `photo-uploader.css` **no contienen ningún hex**.
- `.admin` reescribe los tokens públicos que `states.css` necesita.
- `states.css` no contiene hex sueltos.
- `contact.css` ya **no** contiene `.admin-messages` ni `.admin-view__badge`.
- `admin.css` sí los contiene.
- `AdminLayout.jsx` usa `useMediaQuery`, renderiza `BottomSheet` y define el menú **una sola vez**.
- `BottomSheet.jsx` renderiza `children`.
- `App.jsx` pasa `<NavButtons />` como hijo de `BottomSheet`.
- `admin.css` declara `@media (max-width: 768px)`.
- `.admin-list__item` y `.admin-messages__actions` llevan `flex-wrap: wrap`.

### Manual — en navegador, sin tocar datos

**1 · El panel se ve igual en escritorio** — a 1600×757, recorrer las seis vistas y comparar con el aspecto actual. **Sin cambios**.

**2 · Contraste corregido** — este es el criterio central de RF-2.

- `<EmptyData />`: **Proyectos tiene 0 registros**, así que la vista lo muestra de forma estable. Medir con píxeles (método de la spec 014, guardando captura y leyéndola con PIL) el color del texto y el del fondo → **≥ 4,5 : 1**.
- `<Loading />`: es transitorio, así que **reducir la red a «Slow 3G»** con `emulate`, abrir una vista y medir mientras carga.

**3 · Navegación en tablet y móvil** — `resize` a 768 y a 375:

- Aparece **barra superior** con «Administración» y el botón ☰.
- **Desaparece** la barra lateral.
- ☰ abre la hoja inferior con los **8 accesos**.
- Pulsar una opción **cierra la hoja** y cambia de vista.
- «Ver portfolio» y «Cerrar sesión» **funcionan** desde la hoja.
- Con sesión de **editor**, «Usuarios» **no aparece** ni en la barra lateral ni en la hoja.

**4 · Sin desplazamiento horizontal a 375px** — abrir las **seis** vistas y comprobar `document.documentElement.scrollWidth <= window.innerWidth`.

**5 · Regresiones**

- **Web pública**: idéntica, **salvo** el botón de `<ErrorMessage />`, que pasa de `#3498db` a `#5ba3d9`. Se comprueba forzando un error de contacto o leyendo la regla calculada.
- `<Loading />` y `<EmptyData />` en la web pública: **sin cambios** sobre fondo oscuro.
- Login intacto.
- `npm test` y consola del navegador sin errores.

### Datos

**La spec no escribe nada.** Se entra en el panel en modo lectura; en Usuarios **no se crea, edita ni borra**. Recuento al terminar: **1 formación · 1 experiencia · 0 proyectos · 1 usuario admin**. Sesión cerrada al final.

## Criterios de finalización del plan

- `admin.css` y `photo-uploader.css` sin ningún hex suelto.
- El panel se ve **igual que hoy** en escritorio.
- `<Loading />` y `<EmptyData />` en el panel pasan de **1,61 : 1** a **≥ 4,5 : 1**.
- A 768px o menos: barra superior, **sin** barra lateral, hoja con todos los accesos y los mismos permisos.
- A 375px: las seis vistas **sin desplazamiento horizontal**.
- `contact.css` contiene solo estilos de la web pública.
- La web pública **igual**, salvo el botón de `<ErrorMessage />`.
- `npm test` y `npm run build` en verde; `php artisan test --compact` en **105**.
- Datos sin tocar: **1 · 1 · 0 · 1 usuario**.
