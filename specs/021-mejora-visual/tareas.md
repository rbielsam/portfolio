# Tareas — Mejora visual y presentación del contenido (Spec 021)

Estado: **COMPLETADA y publicada** (commit `3cb8775`).

> Spec, plan y tareas aprobados. Verificación automática y visual realizadas.

### T1.1 — Tokens de diseño

- [x] Añadir a `React/src/styles/variables.css`: `--color-surface`, `--color-accent-soft`, `--font-mono`, `--content-max` y `--reading-max`.

### T1.2 — Estilos base de secciones

- [x] Reescribir `React/src/styles/sections.css` con el ancho máximo común, los títulos con línea de acento, la lista con separación, la ficha con punto y la línea vertical.
- [x] Añadir los estilos de fecha, título, subtítulo, descripción, etiquetas y enlace.
- [x] Añadir los estilos de la rejilla de proyectos y de la tarjeta con imagen.
- [x] Añadir `@media (max-width: 768px)`, `@media (max-width: 480px)` y `prefers-reduced-motion`.

### T1.3 — Ajustes de layout y panel

- [x] En `React/src/styles/layout.css`: `justify-content: safe center` con respaldo y padding reducido en `≤480px`.
- [x] En `React/src/styles/admin.css`: `.admin-list__info`, `.admin-list__label`, `.admin-list__dates` y `.admin-form__hint`.

### T2.1 — Inicio en dos columnas

- [x] Reestructurar `React/src/components/sections/Inicio.jsx` con `inicio__hero`, `inicio__identity`, `inicio__intro`, nombre, título y biografía.
- [x] Colocar la biografía debajo del título, dentro de la columna derecha, con el bloque centrado y las líneas a la izquierda, y renderizarla solo si tiene contenido.
- [x] Conservar `data.photo_url || data.photo`, `photoUrl()` y el respaldo de iniciales.

### T3.1 — Formación con fecha primero

- [x] Reestructurar `Formacion.jsx`: fecha, cuerpo, título, institución y descripción.
- [x] Mantener `formatMonthYear(item.start_date, lang)`, `formatMonthYear(item.end_date, lang)`, `t('fecha.actualidad')` e `item.is_current`.

### T3.2 — Experiencia con fecha primero

- [x] Reestructurar `Experiencia.jsx` con la misma estructura que Formación.
- [x] Mantener las expresiones de fecha y `!item.end_date` que exige `t17`.

### T4.1 — Proyectos en rejilla

- [x] Reestructurar `Proyectos.jsx` con `section__list--grid` y `section__item--card`.
- [x] Calcular las etiquetas separando por comas, recortando espacios, eliminando vacíos y duplicados.
- [x] Renderizar las etiquetas como lista `section__item-tags`.
- [x] Añadir la flecha decorativa al enlace con `aria-hidden="true"`.
- [x] No importar `formatMonthYear` en Proyectos.

### T5.1 — Fechas con el formato existente

- [x] **No tocar** `React/src/utils/dates.js` ni el formato de fecha.
- [x] En el panel, reutilizar `formatMonthYear` y `t('fecha.actualidad')`, igual que la web pública.
- [x] Mostrar el texto resultante solo en los listados de Experiencia y Formación.

### T6.1 — Experiencia en el panel

- [x] Añadir el textarea de descripción al formulario de `AdminExperiencia.jsx`.
- [x] Mostrar el rango de fechas en cada elemento del listado.
- [x] Usar `lang` y `t('fecha.actualidad')`.

### T6.2 — Formación en el panel

- [x] Añadir el textarea de descripción al formulario de `AdminFormacion.jsx`.
- [x] Mostrar el rango de fechas en cada elemento del listado.
- [x] Mantener la casilla «Actual» después del campo «Hasta».

### T7.1 — Tecnologías en el panel

- [x] Añadir el campo de texto de tecnologías a `AdminProyectos.jsx`, con `admin-form__input` y ayuda en `admin-form__hint`.
- [x] No usar `placeholder`.
- [x] Mantener el textarea de descripción y el selector de fecha.

### T8.1 — Traducciones

- [x] Añadir `proyectos.tecnologias` y `proyectos.tecnologias_ayuda` en `es.js`, `ca.js` y `en.js` con las mismas claves.

### T9.1 — Test de comportamiento

- [x] Crear `React/tests/t25.test.js` con:
  - Descripción y fechas en AdminExperiencia y AdminFormacion, usando `formatMonthYear` y `fecha.actualidad`.
  - Campo de tecnologías y ayuda en AdminProyectos.
  - Etiquetas de Proyectos y ausencia de `formatMonthYear`.

### T9.2 — Test de estilos

- [x] Crear `React/tests/t26.test.js` con:
  - Tokens nuevos.
  - Rejilla del hero, ancho de lectura de la biografía y rejilla de proyectos.
  - Separación de listas, ficha con punto y etiquetas.
  - Media queries y `prefers-reduced-motion`.
  - Estilos de fechas y ayuda del panel.

### T10.1 — Suites y build

- [x] `cd React && npm test` → todo en verde.
- [x] `cd React && npm run build` → sin errores.
- [x] `cd Laravel && php artisan test --compact` → sin regresiones.

### T10.2 — Comprobación visual

- [x] Inicio a 1440px y 375×812.
- [x] Formación con dos o más entradas.
- [x] Experiencia con descripción.
- [x] Proyectos con uno y con varios registros.
- [x] Panel: descripción y fechas en Experiencia/Formación; tecnologías en Proyectos.
- [x] Sin desbordamiento horizontal a 320px.
- [x] `prefers-reduced-motion` respetado.

### T10.3 — Cierre

- [x] Actualizar `MEMORY.md` con el resultado.
- [x] Publicación autorizada por la persona usuaria y realizada con `deploy/publicar.sh`.
- [x] Verificado en producción: `https://rbielsam.es` responde 200, con las secciones y el footer correctos, sin desbordamiento a 375 px.
