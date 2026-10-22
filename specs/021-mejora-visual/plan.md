# Plan — Mejora visual y presentación del contenido (Spec 021)

## Alcance

- **Solo frontend**: componentes de secciones, formularios del panel y CSS.
- **Backend intacto**: 0 cambios de API, 0 migraciones. `description` y `technologies` ya existen y la API ya los valida.
- **Sin dependencias nuevas**.
- **Ficheros modificados**: 4 componentes de sección, 3 vistas del panel, `sections.css`, `variables.css`, `admin.css`, `layout.css` y 3 diccionarios de idioma. **`utils/dates.js` no se toca.**
- **Ficheros nuevos**: 2 tests (`t25`, `t26`).
- **No se publica** en producción sin confirmación expresa.

## Stack confirmado

- Frontend: React 18 + JavaScript + CSS3 + Vite (en `React/`).
- Tests frontend: `npm test` → `node --test tests/*.test.js`.
- Tests backend: `php artisan test --compact` (solo como no-regresión).
- Build: `npm run build`.

## Decisiones de implementación

### D1 — Inicio: dos columnas y bloque de biografía centrado

`Inicio.jsx` pasa de una columna única a:

```jsx
<section className="inicio">
  <div className="inicio__hero">
    <div className="inicio__identity">
      <div className="avatar">…</div>
      <h2 className="inicio__name">{data.name}</h2>
    </div>
    <div className="inicio__intro">
      <p className="inicio__title">{data.title}</p>
      {data.bio && <p className="inicio__bio">{data.bio}</p>}
    </div>
  </div>
</section>
```

- La foto y el nombre forman el bloque izquierdo; el título va a la derecha, con una línea de acento vertical y `max-width` para que envuelva.
- La biografía va **debajo del título**, dentro de la columna derecha, se renderiza **solo si tiene contenido** y se limita con `--reading-max` (65ch). El bloque se centra, pero las líneas quedan alineadas a la izquierda.
- En móvil (`≤768px`) el `hero` pasa a una columna; el título se centra y el bloque de la biografía también, con las líneas a la izquierda.
- Se conserva `data.photo_url || data.photo`, `photoUrl()` y el respaldo de iniciales (test `t24`).

### D2 — Formación y Experiencia: ficha con fecha primero

La estructura de cada entrada pasa a:

```jsx
<li className="section__item">
  <p className="section__item-date">…</p>
  <div className="section__item-body">
    <h3 className="section__item-title">…</h3>
    <p className="section__item-subtitle">…</p>
    {item.description && <p className="section__item-desc">…</p>}
  </div>
</li>
```

- La fecha va primero en el DOM y se pinta como metadato monoespaciado en mayúsculas.
- El cuerpo agrupa título, entidad y descripción.
- **No se extrae un componente compartido**: los tests `t17.5`, `t17.6` y `t17.7` leen el código fuente de `Formacion.jsx` y `Experiencia.jsx` y exigen las expresiones `formatMonthYear(item.start_date, lang)`, `formatMonthYear(item.end_date, lang)`, `t('fecha.actualidad')` e `item.is_current` / `!item.end_date`. Se mantienen tal cual.

### D3 — Fechas en el panel con el formato existente

**No se toca el formato de fecha ni `utils/dates.js`.** El panel reutiliza exactamente la misma expresión que la web pública:

```jsx
{formatMonthYear(item.start_date, lang)} - {item.is_current || !item.end_date ? t('fecha.actualidad') : formatMonthYear(item.end_date, lang)}
```

- Mismo formato (`Mes Año`), mismo separador y misma regla de «Actualidad».
- Las secciones públicas conservan sus expresiones actuales por compatibilidad con `t17`.
- El único cambio es que el listado del panel pasa a mostrar ese texto, que antes no aparecía.

### D4 — Proyectos: rejilla y etiquetas

`Proyectos.jsx`:

```jsx
<ul className="section__list section__list--grid">
  <li className="section__item section__item--card">
    {item.image && <img className="section__item-image" … />}
    <div className="section__item-body">
      <h3 className="section__item-title">{item.title}</h3>
      {item.description && <p className="section__item-desc">{item.description}</p>}
      {tags.length > 0 && (
        <ul className="section__item-tags">
          {tags.map((tag) => <li key={tag} className="section__item-tag">{tag}</li>)}
        </ul>
      )}
      {item.url && <a className="section__item-link">…</a>}
    </div>
  </li>
</ul>
```

- `tags` se calcula una vez por proyecto:

  ```js
  const tags = item.technologies
    ? [...new Set(item.technologies.split(',').map((t) => t.trim()).filter(Boolean))]
    : [];
  ```

- Se eliminan duplicados y valores vacíos.
- La rejilla usa `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` con `justify-content: center`; las tarjetas tienen `max-width: 420px` y `justify-self: center`. Así un solo proyecto queda contenido y centrado, y varios se reparten sin dejar columnas vacías.
- El enlace lleva una flecha decorativa `↗` con `aria-hidden="true"`.
- `Proyectos.jsx` **sigue sin importar `formatMonthYear`** (test `t17.8`).

### D5 — Panel: descripción en Experiencia y Formación

En `AdminExperiencia.jsx` y `AdminFormacion.jsx`:

- `const { t, lang } = useLanguage();`
- Importar `formatMonthYear` desde `utils/dates.js` (sin helper nuevo).
- Añadir después de la entidad un `<textarea className="admin-form__textarea">` con `value={editing?.description || ''}` y `onChange` sobre `description`, etiquetado con `t('common.descripcion')`.
- La API ya devuelve `description` al editar y ya la acepta al guardar.

### D6 — Panel: fechas en los listados

Cada elemento de la lista pasa a:

```jsx
<div className="admin-list__info">
  <span className="admin-list__label">{item.position} - {item.company}</span>
  <span className="admin-list__dates">
    {formatMonthYear(item.start_date, lang)} - {item.is_current || !item.end_date ? t('fecha.actualidad') : formatMonthYear(item.end_date, lang)}
  </span>
</div>
```

- Lo mismo en Formación con `title - institution`.
- `admin.css` añade `.admin-list__info`, `.admin-list__label` y `.admin-list__dates` (monoespaciada, pequeña, color atenuado).
- No se tocan los botones de editar/borrar ni la lógica de permisos.

### D7 — Panel: tecnologías en Proyectos

`AdminProyectos.jsx` añade, después de la URL y antes de la fecha:

```jsx
<label className="admin-form__label">
  {t('proyectos.tecnologias')}
  <input
    className="admin-form__input"
    value={editing?.technologies || ''}
    onChange={(e) => setEditing({ ...editing, technologies: e.target.value })}
  />
  <small className="admin-form__hint">{t('proyectos.tecnologias_ayuda')}</small>
</label>
```

- **Sin `placeholder`**: el test `t17.10` prohíbe placeholders sueltos en los tres formularios del panel. La ayuda va en un `<small>` con etiqueta propia.
- La API ya acepta y devuelve `technologies`.

### D8 — Estilos: tokens, composición y responsive

`variables.css` añade:

```css
--color-surface: rgba(15, 39, 64, 0.72);
--color-accent-soft: rgba(91, 163, 217, 0.12);
--font-mono: ui-monospace, 'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
--content-max: 1080px;
--reading-max: 65ch;
```

`sections.css` se reescribe con:

- `.inicio`: ancho máximo común y padding vertical.
- `.inicio__hero`: `grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr)`, `align-items: center`.
- `.inicio__identity`: columna centrada para avatar + nombre.
- `.inicio__name`: `clamp(1.8rem, 4vw, 2.6rem)`, peso 700, `letter-spacing` negativo.
- `.inicio__intro`: columna derecha con `display: flex`, título y biografía separados por `--spacing-md`.
- `.inicio__title`: color de acento, `clamp(1.15rem, 2.4vw, 1.6rem)`, borde izquierdo de acento y `max-width: 24ch`.
- `.inicio__bio`: `max-width: var(--reading-max)`, bloque centrado con `align-self: center` y texto `text-align: left`, `line-height: 1.7`, `white-space: pre-line`.
- `.formacion`, `.experiencia`, `.proyectos`: `width: 100%`, `max-width: var(--content-max)`, `margin-inline: auto`.
- `.section__title`: tamaño `clamp(1.75rem, 3vw, 2.25rem)`, centrado y línea corta de acento con `::after`.
- `.section__list`: columna con `gap: var(--spacing-md)`, `padding-left: var(--spacing-lg)`, línea vertical con `::before`.
- `.section__item`: ficha con superficie translúcida, borde, radio, punto en la línea y hover con elevación mínima.
- `.section__item-date`: monoespaciada, mayúsculas, pequeña, color de acento.
- `.section__item-title`, `.section__item-subtitle`, `.section__item-desc`: jerarquía y `max-width: var(--reading-max)` para la descripción.
- `.section__list--grid`: rejilla responsive, sin línea vertical ni punto, `padding-left: 0`.
- `.section__item--card`: tarjeta en columna, `overflow: hidden`, `max-width: 420px`, `justify-self: center`, imagen `aspect-ratio: 16 / 9` y `object-fit: cover`.
- `.section__item-tags` / `.section__item-tag`: etiquetas pequeñas, monoespaciadas, con borde y fondo de acento suave, `flex-wrap`.
- `.section__item-link`: enlace de acento con separación y hover.
- `@media (max-width: 768px)`: hero en una columna, título centrado, bloque de biografía centrado con líneas a la izquierda, rejilla de proyectos a una columna, menos padding.
- `@media (max-width: 480px)`: ajustes de tamaño y padding.
- `@media (prefers-reduced-motion: reduce)`: sin transformaciones ni zoom.

`layout.css`:

- `.layout__content` pasa a `justify-content: safe center` (con `center` como respaldo) para que una lista larga no recorte el inicio al centrar verticalmente.
- En `≤480px`, el padding del layout baja a `--spacing-sm` para no comer ancho útil.

`admin.css`:

- `.admin-list__info`, `.admin-list__label`, `.admin-list__dates`.
- `.admin-form__hint`.

## Estructura de ficheros

```
React/src/components/sections/Inicio.jsx            (modificado)
React/src/components/sections/Formacion.jsx         (modificado)
React/src/components/sections/Experiencia.jsx       (modificado)
React/src/components/sections/Proyectos.jsx         (modificado)
React/src/pages/admin/AdminExperiencia.jsx          (modificado)
React/src/pages/admin/AdminFormacion.jsx            (modificado)
React/src/pages/admin/AdminProyectos.jsx            (modificado)
React/src/styles/variables.css                      (modificado: tokens)
React/src/styles/sections.css                       (modificado)
React/src/styles/layout.css                         (modificado)
React/src/styles/admin.css                          (modificado)
React/src/i18n/es.js                                (modificado: 2 claves)
React/src/i18n/ca.js                                (modificado: 2 claves)
React/src/i18n/en.js                                (modificado: 2 claves)
React/tests/t25.test.js                             (nuevo)
React/tests/t26.test.js                             (nuevo)
```

> **No se modifica ningún test existente.** Los nuevos tests se suman a los actuales.

## Compatibilidad con tests existentes

| Test | Qué exige | Cómo se cumple |
|---|---|---|
| `t17.5` | Formación y Experiencia importan `formatMonthYear` | Se mantiene el import y las expresiones |
| `t17.6` | Formación formatea `start_date`, `end_date`, `Actualidad`, `is_current` | Se conservan literalmente en el nuevo marcado |
| `t17.7` | Experiencia formatea fechas, `!item.end_date` y `Actualidad` | Se conservan literalmente |
| `t17.8` | Proyectos no usa `formatMonthYear` | No se importa ni se usa |
| `t17.10` | Los formularios del panel no usan `placeholder=` | La ayuda de tecnologías va en `<small>` |
| `t17.12` | AdminProyectos usa `admin-form__textarea` | Se mantiene |
| `t17.20` | La casilla Actual de Formación va después de «Hasta» | El campo de descripción se añade antes de las fechas |
| `t20.3` | Los tres diccionarios tienen las mismas claves | Se añaden las 2 claves en es/ca/en |
| `t20.18` | Sin cadenas duras en los componentes | Todos los textos nuevos usan `t()` |
| `t24` | Inicio prefiere `photo_url` y usa `photoUrl()` | Se conserva la lógica de imagen |
| `t4` | Las secciones usan `useFetch` y su endpoint | No se toca la carga de datos |
| `t14` | Las vistas del panel conservan añadir/editar/borrar | No se toca la lógica CRUD |

## Pasos de implementación

1. Añadir tokens a `variables.css`.
2. Reestructurar `Inicio.jsx` y estilar el hero y la biografía.
3. Reestructurar `Formacion.jsx` y `Experiencia.jsx` con fecha primero y cuerpo.
4. Reestructurar `Proyectos.jsx` con rejilla, imagen y etiquetas de tecnologías.
5. Añadir descripción y fechas a `AdminExperiencia.jsx` y `AdminFormacion.jsx`, reutilizando `formatMonthYear`.
6. Añadir el campo de tecnologías a `AdminProyectos.jsx`.
7. Añadir las claves de i18n en es/ca/en.
8. Completar `sections.css`, `layout.css` y `admin.css`.
9. Crear `t25.test.js` y `t26.test.js`.
10. Ejecutar suites, build y comprobación visual.

## Verificación

### Automática

- `npm test` → todos los tests actuales + `t25` + `t26`.
- `npm run build` → sin errores.
- `php artisan test --compact` → sin regresiones (backend no tocado).

`t25` cubre:

- `AdminExperiencia` y `AdminFormacion`: textarea de descripción, fechas en el listado y uso de `formatMonthYear` con el formato existente (sin helper nuevo).
- `AdminProyectos`: campo de tecnologías y ayuda sin `placeholder`.
- `Proyectos`: separación por comas, eliminación de vacíos/duplicados y renderizado de etiquetas.

`t26` cubre (lectura estática de CSS):

- Tokens nuevos en `variables.css`.
- `.inicio__hero` en rejilla, `.inicio__bio` con `--reading-max`.
- `.section__list` con `gap` y `.section__list--grid` con rejilla.
- `.section__item::before` y ficha de proyecto.
- `@media (max-width: 768px)` y `prefers-reduced-motion`.
- `.admin-list__dates` y `.admin-form__hint`.

### Manual — navegador

Con datos reales o de prueba:

1. **Inicio, 1440px**: foto y nombre a la izquierda; título y biografía a la derecha, con el bloque de la biografía centrado bajo el título, líneas a la izquierda y sin líneas largas.
2. **Inicio, 375×812**: todo apilado, con el bloque de la biografía centrado al final y las líneas a la izquierda; sin scroll horizontal.
3. **Formación**: dos o más entradas separadas, con fechas y descripción.
4. **Experiencia**: descripción visible si existe; fechas y «Actualidad» correctas.
5. **Proyectos**: un solo proyecto no ocupa todo el ancho; con varios, la rejilla reparte columnas; las etiquetas se envuelven.
6. **Panel → Experiencia**: crear/editar con descripción; el listado muestra el rango de fechas.
7. **Panel → Formación**: crear/editar con descripción; el listado muestra el rango de fechas.
8. **Panel → Proyectos**: guardar `React, Laravel, MySQL` y comprobar que la web muestra tres etiquetas.
9. **320px**: sin desbordamiento horizontal en web y panel.
10. **`prefers-reduced-motion`**: sin zoom ni elevación al pasar el ratón.

### Datos

- **No se modifica ningún dato real** durante la implementación.
- Para la comprobación manual se pueden usar los registros existentes; no se crearán proyectos ni experiencias de prueba en la base de datos de producción.

## Criterios de finalización del plan

- Inicio, Formación, Experiencia y Proyectos tienen la presentación descrita en la spec.
- Los formularios de Experiencia y Formación permiten guardar descripciones.
- El formulario de Proyectos permite guardar tecnologías y la web las muestra como etiquetas.
- Los listados del panel muestran las fechas.
- No hay desbordamiento horizontal entre 320px y 1440px.
- Suites y build en verde.
- Sin cambios de backend, sin migraciones y sin dependencias nuevas.
