# Plan — Fechas sin día: solo mes y año (Spec 012)

## Alcance

Cambio de formato de fecha en **3 modelos del backend** y **5 ficheros del frontend**, más un helper nuevo y dos juegos de tests.

- **Sin migraciones ni cambios de esquema**: las columnas siguen siendo de tipo `date`.
- **Sin cambio en la validación**: la regla `date` actual ya acepta `2025-07` (verificado empíricamente).
- **Sin cambios en la estructura de las respuestas**: solo cambia el formato de cuatro campos.
- **Sin CSS nuevo**: `admin-form__label`, `admin-form__input` y `admin-form__textarea` ya existen.
- **Sin dependencias nuevas**.
- **No toca la estética general del panel** (spec **009**, reservada).
- **No toca la fecha de los mensajes** ni ningún otro endpoint.

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Backend**: Laravel 13 + PHP + MySQL 8.4 + Sanctum (en `Laravel/`)
- **Zona horaria**: `app.timezone = UTC` (verificado) → aplicar el formato no desplaza el mes.
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)
- **Tests backend**: `php artisan test --compact`
- **Convención de etiquetas**: ya usada por `AdminPerfil.jsx` y `UserManager.jsx`

## Decisiones de implementación

### D1 — El formato se aplica por atributo en los casts

```php
protected $casts = [
    'start_date' => 'date:Y-m',   // Education y Experience
    'end_date'   => 'date:Y-m',
    'date'       => 'date:Y-m',   // Project
];
```

Verificado con una clase anónima antes de escribir el plan:

| Comprobación | Resultado |
|---|---|
| JSON del campo con `date:Y-m` | `"2025-07"` ✅ |
| JSON de otro campo con `date` sin formato | `"2026-04-06T00:00:00.000000Z"` (intacto) |
| JSON de `created_at` | `"2026-10-13T09:22:48.000000Z"` (intacto) |
| Tipo de `$model->start_date` | `object` (Carbon) ✅ |
| `null` en un campo | `null` ✅ |

Por qué importa cada punto:

- Solo cambia el campo indicado → `created_at` y `updated_at` siguen igual y no se toca nada fuera de alcance.
- La propiedad **sigue siendo Carbon**, no cadena → `orderByDesc('start_date')`, los `create()`/`update()` y cualquier uso interno siguen funcionando sin cambios.
- La serialización es distinta del almacenamiento → **no hay migración y los datos existentes heredan el formato** (decisión del usuario).

### D2 — La validación no se toca

La regla `date` actual acepta `2025-07`, que es exactamente lo que enviará `<input type="month">`:

| Valor | `date` (actual) | `date_format:Y-m` |
|---|---|---|
| `2025-07` | ✅ | ✅ |
| `2010-01-01` | ✅ | ❌ rompería 5 fixtures |
| `not-a-date` | ❌ | ❌ |

Como no se cambia, **ningún test existente se modifica**: los 5 fixtures de `ApiWriteTest` que envían fecha completa y los de `ApiReadTest` siguen valiendo tal cual.

### D3 — Helper único en `src/utils/dates.js`

```js
export function formatMonthYear(value) { /* → "julio 2025" | "" */ }
```

- Array de los 12 meses en español, nombre completo.
- Devuelve `''` ante cualquier entrada nula o no interpretable: la sección no se rompe (caso límite de la spec).
- Un único punto de formateo compartido por las secciones, sin código duplicado (requisito no funcional de la spec).
- Sigue el patrón de `src/utils/initials.js`, que ya agrupa `getInitials()` y `photoUrl()`.

### D4 — La «Actualidad» se decide sobre el valor YA formateado

**Formación** (comportamiento actual conservado):

```jsx
{formatMonthYear(item.start_date)} - {formatMonthYear(item.end_date) || 'Actualidad'}
```

**Experiencia** (criterio unificado con Formación, decisión del usuario):

```jsx
{formatMonthYear(item.start_date)} - {item.is_current || !item.end_date ? 'Actualidad' : formatMonthYear(item.end_date)}
```

El operador `||` y el ternario trabajan sobre el **resultado formateado**, no sobre el valor crudo: `end_date` nulo produce `''`, que activa «Actualidad» en vez de dejar un guion colgando.

Queda cubierto el cambio de criterio que pidió el usuario: hoy Experiencia solo muestra «Actualidad» si `is_current` está marcado; con el cambio, también cuando no hay fecha final.

### D5 — Los formularios: `type="month"` + etiquetas en todos los campos

```jsx
<label className="admin-form__label">
  Desde
  <input className="admin-form__input" type="month" value={...} onChange={...} />
</label>
```

- Todos los campos de texto y fecha de los **tres** formularios pasan a este patrón, retirando los `placeholder` sueltos (decisión del usuario: formulario completo, no solo fechas).
- El `<textarea>` de Proyectos usa `admin-form__textarea`, que ya está definido en `admin.css`.
- **El checkbox «Actual» no se modifica**: ya lleva etiqueta visible, y `admin-form__label` (flex columna) apilaría el texto, mientras que `admin-form__input` le añadiría relleno y borde de caja de texto. El requisito de «etiqueta visible» ya se cumple en él.
- No se cambian colores, tamaños ni distribución (spec 009).

### D6 — Los datos reales no se tocan

Existe **1 experiencia real** (`Acceleralia S.L.`, `2025-07-03 → 2026-04-06`) y **0 formaciones y 0 proyectos**.

- La verificación de **lectura** se hace sobre el registro real: ver la sección pública y abrir el formulario para editar, **pulsando Cancelar sin guardar**. Son operaciones no destructivas.
- La verificación de **escritura** se hace con registros temporales creados para la ocasión y **borrados después**.
- Antes de dar la validación por terminada se comprueba que el recuento vuelve a la línea base: **1 experiencia, 0 formaciones, 0 proyectos**.

## Estructura de ficheros

### Backend (`Laravel/`) — 4 ficheros (3 modificados, 1 nuevo)

```
app/Models/Education.php                (cast start_date/end_date → date:Y-m)
app/Models/Experience.php               (cast start_date/end_date → date:Y-m)
app/Models/Project.php                  (cast date → date:Y-m)
tests/Feature/DateFormatTest.php        (nuevo: tests de la spec 012)
```

> No se modifica ningún test existente. `ApiReadTest`, `ApiWriteTest` y los anteriores quedan intactos.

### Frontend (`React/`) — 7 ficheros (6 modificados, 2 nuevos)

```
src/utils/dates.js                              (nuevo: formatMonthYear)
src/components/sections/Formacion.jsx           (formatear ambas fechas)
src/components/sections/Experiencia.jsx         (formatear + «Actualidad» sin fecha final)
src/pages/admin/AdminFormacion.jsx              (type="month" + etiquetas)
src/pages/admin/AdminExperiencia.jsx            (type="month" + etiquetas)
src/pages/admin/AdminProyectos.jsx              (type="month" + etiquetas)
tests/t17.test.js                               (nuevo: tests de la spec 012)
```

> No se modifica ningún test existente. `t16` (spec 011), `t15` (spec 010) y los anteriores quedan intactos.

## Pasos de implementación

1. **Tests backend primero**: crear `tests/Feature/DateFormatTest.php`. Debe fallar todavía.
2. **Casts**: cambiar a `date:Y-m` en `Education`, `Experience` y `Project`. Backend en verde.
3. **Helper**: crear `src/utils/dates.js` con `formatMonthYear()`.
4. **Tests frontend**: crear `tests/t17.test.js`. Debe fallar todavía.
5. **Secciones públicas**: `Formacion.jsx` y `Experiencia.jsx` con el helper y la lógica de D4.
6. **Formularios**: `type="month"` y etiquetas en los tres formularios.
7. **Suites completas**: `npm test`, `npm run build` y `php artisan test --compact`, los tres en verde.
8. **Validación manual** (lectura sobre datos reales + escritura con temporales borrados).

## Verificación

### Automática

- `php artisan test --compact` → los **94** existentes + los nuevos de `DateFormatTest`. **Ningún test previo se modifica.**
- `npm test` → los **158** existentes + los de `t17`. **Ningún test previo se modifica.**
- `npm run build` → sin errores.

Cobertura que debe añadir `DateFormatTest`:

- `GET /api/education` devuelve `start_date` y `end_date` como `YYYY-MM`.
- `GET /api/experience` devuelve `start_date` y `end_date` como `YYYY-MM`.
- `GET /api/projects` devuelve `date` como `YYYY-MM`.
- `end_date` y `date` nulos siguen devolviendo `null`, no cadena vacía.
- `created_at` conserva su formato (protección de RF-1 contra efectos colaterales).

Cobertura que debe añadir `t17` (lectura estática de ficheros):

- Los tres modelos declaran `date:Y-m`.
- Los tres modelos siguen declarando sus campos como antes (no se pierde `is_current`).
- `Formacion.jsx` y `Experiencia.jsx` importan y usan `formatMonthYear`.
- `Experiencia.jsx` muestra «Actualidad» cuando `end_date` está vacío.
- Los tres formularios usan `type="month"` y ya no tienen `type="date"`.
- Los tres formularios usan `admin-form__label` y `admin-form__input`.
- `formatMonthYear()` devuelve cadena vacía ante entradas nulas o inválidas.

### Manual — no destructiva sobre datos reales

- **Sección Experiencia**: el registro real muestra `julio 2025 - abril 2026`. Hoy muestra `2025-07-03T00:00:00.000000Z - 2026-04-06T00:00:00.000000Z`. **Solo lectura.**
- **Abrir la experiencia real para editar**: el campo «Desde» muestra el mes y año (hoy sale vacío). **Pulsar Cancelar sin guardar.**
- **Sección Formación**: hoy tiene 0 registros → estado vacío, sin cambios.
- **Sección Proyectos**: hoy tiene 0 registros → estado vacío y sigue sin mostrar fecha.
- **Regresiones**: sección Inicio, indicador de sesión (spec 010) y foto de perfil (spec 005) intactos.
- **Consola del navegador**: sin errores.

### Manual — con registros temporales (se borran al terminar)

- Crear un registro temporal en Formación, Experiencia y Proyectos con el selector de mes → se guarda y al reabrirlo el campo muestra el valor.
- Comprobar en la respuesta de la API que el valor guardado sale como `YYYY-MM`.
- En Experiencia, crear uno **sin fecha final y sin marcar «Actual»** → la sección pública muestra «Actualidad».
- **Borrar los tres temporales** y verificar el recuento de vuelta a línea base: **1 experiencia, 0 formaciones, 0 proyectos**.

## Criterios de finalización del plan

- `GET /api/education`, `/api/experience` y `/api/projects` devuelven sus fechas como `YYYY-MM` y `null` cuando no hay valor.
- La base de datos no cambia: sin migraciones y sin actualizar ningún registro existente.
- La sección Experiencia muestra `julio 2025 - abril 2026` con el registro real.
- La sección Formación muestra fechas en «mes año» y «Actualidad» cuando no hay fecha final.
- Experiencia muestra «Actualidad» también cuando no hay fecha final sin estar marcado como «Actual».
- La sección Proyectos sigue sin mostrar fecha.
- El panel muestra la fecha existente al editar (antes salía vacío) y solo permite elegir mes y año.
- Los tres formularios identifican «Desde», «Hasta» y «Fecha», y todos sus campos llevan etiqueta visible con `admin-form__label` / `admin-form__input`.
- El checkbox «Actual» y el resto de campos conservan su nombre y comportamiento; estados, permisos y flujos sin cambios.
- `php artisan test --compact`, `npm test` y `npm run build` en verde **sin modificar ningún test existente**.
- Se dejan **0 registros temporales**: 1 experiencia real, 0 formaciones, 0 proyectos.
