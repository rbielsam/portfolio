# Tareas — Navegación pública fija en la parte superior (Spec 014)

Estado: **todas completadas** ✅

> Esta spec no ha tocado el backend, los datos ni ningún test existente.

## Fase 1: Tests

### T1.1: `tests/t18.test.js` ✅

Fichero nuevo con **11 pruebas** de lectura estática. Escrito **antes** del código: **7 fallaban** y 4 pasaban (las que solo comprobaban que no se rompía nada ya existente).

Cobertura: `{nav}` entre `Header` y `layout__content` · `Header`/`Footer` intactos · `Layout` destructura `nav` · `App.jsx` pasa la navegación por `nav=` · `NavButtons` se renderiza **una sola vez** · `FloatingButton`/`BottomSheet` conservados · `position: sticky` + `top: 0` · fondo opaco · `margin-inline`/`padding-inline` (full-bleed) · `z-index` entre 0 y 999 · `@media (max-width: 768px)` conservado.

## Fase 2: Estructura

### T2.1: `src/components/Layout/Layout.jsx` ✅

```jsx
function Layout({ nav, children }) {
  return (
    <div className="layout">
      <Header />
      {nav}
      <main className="layout__content">
```

La navegación sale del centrado vertical de `layout__content` —la causa raíz— y su orden en el árbol deja de depender de la sección activa.

### T2.2: `src/App.jsx` ✅

```jsx
<Layout nav={isMobile ? null : <NavButtons />}>
  {isMobile && (
    <>
      <FloatingButton onClick={() => setIsSheetOpen(true)} />
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </>
  )}
  <ActiveSection />
</Layout>
```

`<Layout><Login /></Layout>` no se tocó: sin la prop, el login sigue sin navegación.

## Fase 3: Estilos

### T3.1: `src/styles/navigation.css` ✅

`.nav-buttons` recibe `position: sticky` · `top: 0` · `z-index: 100` · `background-color: var(--color-primary)` · `border-bottom: 1px solid var(--color-border)` · `margin-inline: calc(var(--spacing-lg) * -1)` · `padding-inline: var(--spacing-lg)` · `padding-block: var(--spacing-xs)`.

No se tocaron el `@media` de 768px, `.floating-button`, `.bottom-sheet` ni `.nav-session`.

## Fase 4: Validación

### T4.1: Suites automáticas ✅

| Suite | Resultado |
|---|---|
| `npm test` | **190/190** — 179 previos + 11 nuevos, **ninguno modificado** |
| `npm run build` | ✅ sin errores |
| `php artisan test --compact` | **105/105** — backend intacto |

### T4.2: Comprobación en navegador ✅

**1 · Altura idéntica en las cinco secciones** — `getBoundingClientRect().top` de `.nav-buttons`:

| Inicio | Formación | Experiencia | Proyectos | Contacto |
|---|---|---|---|---|
| 124 | 124 | 124 | 124 | 124 |

**Mismo valor en las cinco.** El árbol de accesibilidad confirma el orden `banner` → `navigation` → `main`.

> **Re-medido tras la spec 015**: el `<h1>` de la cabecera pasó a `sr-only`, así que la barra sube de **131.19px** a **124px** (cabecera de 92px + margen de 2rem). El orden `banner` → `navigation` → `main` no cambia.

**2 · Pegada al desplazarse** — ventana 800×500:

| scrollY | top de la barra |
|---|---|
| 0 | 124 |
| 142 | **0** |
| 284 | **0** |
| 473 | **0** |

**3 · Sin filtraciones laterales** — `clientWidth = 785` y `navRight = 785`; `elementFromPoint` devuelve `nav` en `x=3` y en `x=782`. El contenido pasa por detrás, no al lado.

**4 · Alto variable** — a 1600px la barra mide **69px** (1 línea); a 800px mide **137px** (Login cae a una segunda línea). Confirma por qué `fixed` con `padding-top` fijo habría roto el responsive.

**5 · Móvil** — emulado a 375×667: **no existe `.nav-buttons` arriba**; `.floating-button` sigue en `fixed`; la hoja inferior abre con los **6 botones**.

**6 · Regresiones** — Login **sin navegación** · con sesión, la navegación muestra `SessionChip` y sigue fija (124 → 0) · panel admin idéntico (`.admin__nav` `width: 200px`, `position: static`, 8 botones) · consola sin errores nuevos.

### T4.3: Datos ✅

`SELECT` de recuentos: **1 formación · 1 experiencia · 0 proyectos** = línea base. Sesión cerrada al terminar (`localStorage` y `sessionStorage` vacíos).

## Cierre

La spec está **completa**. Los cuatro requisitos pedidos se cumplen y quedan medidos arriba.

### Decisión: la banda se queda como está

Se midió el tono con píxeles y se detectó que, **en reposo**, la banda no sigue el degradado del `body`:

| x | banda | fondo detrás | Δ (canal azul) |
|---|---|---|---|
| 50 | `#203d5c` | `#1f3a59` | 3 → invisible |
| 800 | `#203d5c` | `#1a304a` | 18 → leve |
| 1550 | `#203d5c` | `#16273c` | **32 → se nota** |

La banda **funde a la izquierda y se ve más clara a la derecha**.

**Causa, no defecto de ejecución**: `body` pinta un degradado `135deg` calculado sobre **todo el documento**, y un color plano no puede seguirlo en ninguna posición del scroll. Imitarlo obligaría a calcular posiciones en JS o a añadir un `scroll` listener.

**Decisión de la persona usuaria (13/10/2026): dejarla como está.** Con `border-bottom` la banda se lee como una barra deliberada y los cuatro requisitos de la petición —posición fija, misma altura en todas las secciones, pegada al desplazarse y responsive— se cumplen.

**Fuera de alcance deliberadamente**: cualquier intento de fundir la barra con el degradado (fondo translúcido con `backdrop-filter`, degradado propio, etc.) introduce una estética nueva, y la estética y la paleta son materia de la **spec 009**, reservada.
