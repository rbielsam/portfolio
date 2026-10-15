# Plan — Navegación pública fija en la parte superior (Spec 014)

## Alcance

Cambio **estrictamente de estructura y CSS en el frontend**. Es una de las specs más pequeñas del proyecto.

- **3 ficheros modificados** y **1 test nuevo**.
- **Backend intacto**: 0 ficheros, 0 migraciones, 0 endpoints.
- **Sin dependencias nuevas**.
- **Sin cambios de datos ni de esquema**.
- **Sin tocar ningún test existente**: `t3.3`, `t6.1` y `t6.2` son los que leen esta zona y todos siguen cumpliéndose (verificado abajo).
- **No toca la estética ni el responsive del panel de administración** (spec **009**, reservada).
- **No introduce colores nuevos**: se usan tokens que ya existen.

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)
- **Build**: `npm run build`
- **No hay backend en esta spec** → `php artisan test --compact` se ejecuta solo como comprobación de no-regresión (debe seguir en **105**).

## Decisiones de implementación

### D1 — `NavButtons` sale de `layout__content` por una propiedad `nav`

Estructura actual:

```jsx
<div className="layout">
  <Header />
  <main className="layout__content">
    {children}      {/* ← NavButtons Y la sección, centrados juntos */}
  </main>
  <Footer />
</div>
```

Estructura propuesta:

```jsx
function Layout({ nav, children }) {
  return (
    <div className="layout">
      <Header />
      {nav}
      <main className="layout__content">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

Y en `App.jsx`:

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

**Por qué por propiedad y no dentro de `children`**: si la navegación siguiera siendo un hijo más de `children`, volvería a caer dentro de `layout__content` y volvería a centrarse junto con la sección. Con una propiedad el orden queda fijo en el árbol —cabecera → navegación → contenido— y **no depende de qué pase cada sección**.

**Por qué `nav` y no un `useMediaQuery` dentro de `Header`**: así `Header` sigue sin conocer la navegación ni la responsividad, y la pantalla de login —que hoy no lleva navegación— no gana una que no tenía. `nav` es opcional.

Por el mismo motivo, la navegación **ya no es hijo de `.layout__content`**, de modo que `justify-content: center` deja de afectarla: ahora centra **solo la sección**, que es lo que debe centrarse.

### D2 — `position: sticky`, no `fixed`

```css
.nav-buttons {
  position: sticky;
  top: 0;
}
```

Ambas la dejan pegada arriba al desplazarse, pero `fixed` la sace del flujo y obliga a compensar con un `padding-top` igual a su altura. **Esa altura no es constante**: `.nav-buttons` tiene `flex-wrap: wrap`, así que en pantalla estrecha ocupa dos o tres líneas y el valor compensador dejaría de cuadrar —rompiendo justo el requisito de responsive que pide la spec.

`sticky` la mantiene en el flujo: no hay ninguna medida que compensar y se adapta sola al alto que ocupe en cada momento. Resultado visual equivalente, mucho menos que mantener.

### D3 — Fondo opaco con tokens ya existentes

```css
background-color: var(--color-primary);
border-bottom: 1px solid var(--color-border);
```

- **Es obligatorio**: una barra fija sin fondo deja que el contenido se le vea atravesando. Queda escrito como criterio de aceptación en la RF-1.
- `body` pinta un degradado `135deg` de `--color-bg-gradient-start` a `--color-bg-gradient-end`. **`--color-primary` es exactamente `--color-bg-gradient-start`**, así que en reposo, estando la barra en la parte superior, coincide con el fondo.
- Reproducir el degradado dentro de la barra no es posible de forma exacta: el degradado se calcula sobre la caja del `body` y la barra es una caja distinta y muy distinta de proporción. Imitarlo obligaría a calcular posiciones o a añadir un `scroll` listener, que es más complejidad de la justificada.
- **`border-bottom` con `--color-border`** delimita la barra para que la diferencia tonal mínima respecto al degradado se lea como una barra deliberada y no como un defecto.
- **No se introduce ningún color nuevo**: los dos valores son tokens de `variables.css` ya en uso. La paleta sigue intacta y sigue siendo cosa de la **009**.

### D4 — La barra ocupa todo el ancho (`full-bleed`)

`.layout` tiene `padding: var(--spacing-lg)` (2rem) en los cuatro lados. Si la barra se queda dentro de ese margen, al fijarse en `top: 0` **quedarían dos franjas de 2rem a izquierda y derecha por las que el contenido se vería pasar por delante** —el fallo que la spec pide evitar, en otro sitio.

```css
margin-inline: calc(var(--spacing-lg) * -1);
padding-inline: var(--spacing-lg);
```

El margen negativo cancela exactamente el padding del contenedor y `padding-inline` devuelve a los botones su posición original, de modo que **el centrado horizontal no se mueve un píxel**.

Se usa `calc()` sobre la propia variable, así que si cambia el padding del layout, la barra lo sigue sin tocar el CSS.

### D5 — Ritmo vertical de la barra

```css
padding-block: var(--spacing-xs);
```

Con fondo opaco, sin relleno vertical la banda mediría exactamente lo alto de los botones y el contenido se pegaría a ellos por arriba y por abajo. `--spacing-xs` (0.5rem) da aire suficiente.

### D6 — `z-index: 100`

Comprobado con `grep`: en todo el proyecto **solo hay dos `z-index`**, los de `.floating-button` (1000) y `.bottom-sheet` (999), ambos en `navigation.css`. La barra queda **por encima del contenido** (que no tiene ninguno) y **por debajo** de esos dos. En móvil la barra ni se renderiza, así que no llegan a solaparse.

### D7 — Lo que NO cambia

| Zona | Por qué no cambia |
|---|---|
| Botón flotante y hoja inferior | Spec 008. En móvil `nav` recibe `null` y la barra no aparece. |
| Pantalla de login | `Layout` se sigue llamando sin la prop `nav`. |
| Panel de administración | No padece este problema: su barra es lateral y ya no se desplaza. Espec **009**. |
| Orden o funcionamiento de los botones | `NavButtons` no se modifica: sigue con `setActiveSection`. |
| `justify-content: center` de `.layout__content` | Se conserva; ahora centra solo la sección, que es lo deseado. |
| Comportamiento al cambiar de sección | `SectionContext` no hace `scrollTo(0,0)` hoy y **no se añade**: fuera de alcance. |

## Estructura de ficheros

### Frontend (`React/`) — 4 ficheros (3 modificados, 1 nuevo)

```
src/components/Layout/Layout.jsx     (nueva prop `nav`, renderizada entre Header y main)
src/App.jsx                          (pasa la navegación por la prop en vez de por children)
src/styles/navigation.css            (sticky, fondo, full-bleed, ritmo vertical, z-index)
tests/t18.test.js                    (nuevo: tests de la spec 014)
```

> **No se modifica ningún test existente.**

### Backend — sin ficheros

---

## Tests existentes que leen esta zona

Verificado uno a uno que **siguen en verde sin tocarlos**:

| Test | Qué exige | ¿Se cumple? |
|---|---|---|
| `t3.3` | `Layout` importa y renderiza `<Header` y `<Footer`, tiene `content`/`children`, `function Layout` y `export default` | ✅ Los cuatro siguen; se añade `{nav}` sin tocar ninguno |
| `t6.1` | `App.jsx` contiene `NavButtons` o `FloatingButton` o `BottomSheet` | ✅ Contiene los tres |
| `t6.2` | Alguna hoja de estilos contiene `nav-buttons` o `.nav` | ✅ `navigation.css` |
| `t4.3` / `t15` / `t8` | Contenido de `NavButtons.jsx` | ✅ No se modifica |
| `t4.5` | `BottomSheet` renderiza los botones | ✅ No se modifica |

## Pasos de implementación

1. **Tests nuevos**: crear `tests/t18.test.js`. Debe fallar todavía.
2. **`Layout.jsx`**: nueva prop `nav` renderizada entre `<Header />` y `<main>`.
3. **`App.jsx`**: pasar la navegación por `nav` y dejar en `children` solo el botón flotante y la sección.
4. **`navigation.css`**: `sticky`, fondo, `full-bleed`, `padding-block` y `z-index`.
5. **Suites**: `npm test` y `npm run build` en verde; `php artisan test --compact` sigue en **105**.
6. **Validación en navegador** (no destructiva, no toca datos).

## Verificación

### Automática

- `npm test` → los **179** existentes + los de `t18`. **Ningún test previo se modifica.**
- `npm run build` → sin errores.
- `php artisan test --compact` → sigue en **105** (no se toca el backend).

Cobertura que debe añadir `t18` (lectura estática de ficheros):

- `Layout.jsx` renderiza `{nav}` **entre** `<Header` y `layout__content`.
- `Layout.jsx` sigue importando y renderizando `Header` y `Footer`.
- `App.jsx` pasa la navegación por la propiedad `nav`.
- `App.jsx` deja de meter `NavButtons` dentro de `children`.
- `App.jsx` sigue renderizando `FloatingButton` y `BottomSheet` para móvil.
- `navigation.css` declara `position: sticky` y `top: 0` en `.nav-buttons`.
- `navigation.css` da fondo opaco a `.nav-buttons`.
- `navigation.css` sigue conservando el `@media (max-width: 768px)` de `.nav-buttons`.

### Manual — en navegador, sin tocar datos

La spec se apoya en una medida objetiva, no en impresiones.

**1. La altura deja de variar con el contenido (RF-1)**

Con la consola abierta, medir `document.querySelector('.nav-buttons').getBoundingClientRect().top` en cada sección pública. **Antes** el valor cambia de una sección a otra —es el bug—. **Después** debe ser **idéntico en las cinco**: Inicio, Formación, Experiencia, Proyectos y Contacto.

**2. Permanece visible al desplazarse (RF-1)**

Ninguna sección es hoy lo bastante alta como para que la página haga scroll con la ventana normal. Para probarlo **sin crear registros**: reducir la ventana a unos **800×500** y desplazarse. La barra debe quedar pegada arriba con el contenido pasando por debajo.

**3. El contenido no se le atraviesa (RF-1)**

En el paso anterior, comprobar que **no hay franjas a izquierda y derecha** por las que se cuele el contenido (es lo que prevé D4) y que el texto no se ve sobre los botones.

**4. Fondo coherente (RF-1)**

En reposo, en la parte superior, la banda debe integrarse con el degradado sin costura aparente.

**5. Alto variable sin romper nada (RF-1)**

Con la ventana a unos **800px de ancho** la navegación **debe envolverse en varias líneas**. Comprobar que sigue fija, que nada se solapa y que el centrado se conserva.

**6. Móvil intacto (RF-2)**

Con la ventana a **375×667**: no aparece navegación arriba, sigue el botón flotante abajo a la derecha y la hoja inferior abre con los mismos botones.

**7. Regresiones**

- **Login**: pantalla de login **sin navegación**, como ahora.
- **Panel de administración**: idéntico, barra lateral sin cambios.
- **Sección Inicio**, indicador de sesión (spec 010) y foto de perfil (spec 005) intactos.
- **Consola del navegador**: sin errores.

### Datos

**Esta spec no toca ningún dato.** No hay escrituras, por lo que no hace falta crear registros temporales ni comprobar recuentos. Las 1 formación, 1 experiencia y 0 proyectos reales quedan exactamente donde están.

## Criterios de finalización del plan

- La navegación aparece **en la parte superior** en las cinco secciones públicas.
- Su `top` en pantalla es **el mismo valor** en las cinco secciones.
- Al desplazarse con la ventana reducida, la barra **permanece visible** arriba.
- El contenido **no se le ve por los laterales** ni **a través** del texto.
- En 800px de ancho la navegación se envuelve y **sigue funcionando**.
- En móvil se sigue usando el botón flotante y la hoja inferior, **sin** navegación arriba.
- La pantalla de login no muestra navegación.
- El panel de administración queda idéntico.
- `npm test` y `npm run build` en verde **sin modificar ningún test existente**.
- `php artisan test --compact` sigue en **105**.
