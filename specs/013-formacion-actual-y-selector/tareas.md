# Tareas — Opción «Actual» en Formación y nueva forma del selector (Spec 013)

Estado: **todas completadas** ✅

## Fase 1: Backend

### T1.1: Migración `is_current` en `education` ✅

- Creada con `php artisan make:migration add_is_current_to_education_table --table=education`.
- Añade `$table->boolean('is_current')->default(false)`; `down()` la elimina con `dropColumn`.
- Aplicada sobre la BD real (`php artisan migrate`, 85.50ms).
- **La tabla tenía 1 fila real** —«CFGS Desarrollo de Aplicaciones Web», creada a las 13:53— y la migración le puso `is_current = 0` **sin tocar el resto de la fila**: `created_at` y `updated_at` siguen en `2026-10-13 13:53:34`.

### T1.2: Modelo y controlador ✅

- `Education`: `'is_current'` añadido a `$fillable` y `'is_current' => 'boolean'` a `$casts`. El `toArray()` de fechas no se toca.
- `EducationController`: `'is_current' => ['nullable', 'boolean']` en `store()` y en `update()`, calquado de `ExperienceController`.

### T1.3: Pruebas de backend ✅

Fichero nuevo `tests/Feature/EducationIsCurrentTest.php` (5 pruebas): se almacena · por defecto `false` · el `GET` lo devuelve como booleano · se conmuta en actualización · valor no válido rechazado con `422` y sin guardar.

**Los 100 tests previos no se modifican.**

## Fase 2: Frontend

### T2.1: `src/utils/dates.js` ✅

- `MESES` en mayúscula inicial (`Enero … Diciembre`), única fuente → cambia selector y web pública a la vez.
- `aniosDisponibles()` itera de `ANIO_MAXIMO` a `ANIO_MINIMO` y ordena el año fuera de rango con `b - a` (descendente).

### T2.2: `MonthYearPicker.jsx` ✅

Los dos `<select>` se intercambian: **mes primero, año después**. No se toca el estado parcial ni la composición de `YYYY-MM`; los `aria-label` (`Mes` / `Año`) se mantienen, que es lo que importa porque la etiqueta no depende de la posición.

### T2.3: `styles/admin.css` ✅

`.admin-form__dates select:last-child { flex: 2 }` → **`:first-child`**. Sin este cambio, al invertir el orden el ancho habría pasado al año en vez de al mes.

### T2.4: `AdminFormacion.jsx` ✅

Casilla «Actual» calquada de Experiencia: `<label>` plano con `type="checkbox"`, **sin** `admin-form__input`, colocada después del campo «Hasta» y antes de las acciones.

### T2.5: `Formacion.jsx` ✅

`{formatMonthYear(item.end_date) || 'Actualidad'}` → `{item.is_current || !item.end_date ? 'Actualidad' : formatMonthYear(item.end_date)}`, la misma expresión que ya usaba `Experiencia`.

## Fase 3: Pruebas de frontend

### T3.1: Tests modificados ✅

| Test | Cambio |
|---|---|
| `T17.4` | De prohibir `is_current` en `Education` a **exigirlo** como `'boolean'` |
| `T17.6` | Añade que Formación mira `item.is_current` |
| `T17.14` | `julio 2025` → `Julio 2025` (y los otros tres casos) |
| `T17.17` | Añade que el mes se renderiza antes que el año |
| `T17.18` | Orden descendente: `sort((a, b) => b - a)` |

### T3.2: Tests nuevos ✅

- `T17.20`: la casilla «Actual» de Formación está vinculada a `is_current`, sin clase de caja de texto y después de «Hasta».
- `T17.21`: el CSS usa `first-child` y ya no `last-child`.

## Fase 4: Validación

### T4.1: Suites y build ✅

`php artisan test --compact` → **105/105** · `npm test` → **179/179** · `npm run build` ✅ · `pint` ✅.

### T4.2: Comprobación en navegador ✅

- Web pública: `Septiembre 2024 - Junio 2026` (tu formación real) y `Julio 2025 - Abril 2026` (experiencia real) — meses en mayúscula.
- Formulario de Formación: `Desde mes` antes de `Desde año`; meses `Enero … Diciembre`; años **2036 → 1996**; `checkbox "Actual"` después de «Hasta».
- Formulario de Experiencia: mismo orden (`Julio`/`2025`, `Abril`/`2026`), se abrió y se canceló sin guardar.
- Flujo completo con registro temporal: creado con «Actual» marcado y `Marzo 2023` → API `is_current: true`, BD `actual=true` → público **`Marzo 2023 - Actualidad`** → borrado.
- Consola **sin errores**.

### T4.3: Limpieza ✅

`edu=1 exp=1 prj=0`. La única formación es **la real**, con `is_current=false`, `created_at` y `updated_at` sin moverse (`13:53:34`). La experiencia real conserva su `updated_at` de `09:22:48`. **0 registros temporales.**

## Retoque final: el año no supera el año actual

Petición: *«en el año dejas poner más de 2026, pero eso no puede ser, ha de llegar hasta 2026, año actual»*.

### Cambios ✅

- `dates.js`: `ANIO_MAXIMO` pasa de `ANIO_ACTUAL + 10` a **`ANIO_ACTUAL`**, con comentario que explica por qué (lo que siga en curso se expresa con «Actual»). Se calcula del sistema, no con literal, así que el tope sube solo cada año.
- `T17.18`: se añade que `ANIO_MAXIMO === new Date().getFullYear()`, que no se ofrece ningún año por encima, y que **una fecha futura ya guardada sí aparece** (el escape de «año fuera del rango» que ya existía).
- `spec.md`: dos criterios nuevos en RF-3 (tope en el año en curso · fecha futura ya guardada sigue editable) y el caso límite *«Tope del año»*, donde queda asumida la consecuencia.

### Validación ✅

- `npm test` → **179/179**; `npm run build` ✅.
- Formación, Experiencia y Proyectos: 31 opciones, **2026 → 1996**, sin 2027. Consola sin errores en los tres.
- Registros reales siguen cargando: Formación `Septiembre/2024` + `Junio/2026` con la casilla «Actual» desmarcada; Experiencia `Julio/2025` + `Abril/2026`. Ambos se abrieron y se cancelaron sin guardar.

### Nota de alcance

El caso de una fecha **futura ya guardada** no se pudo recorrer en navegador porque ningún registro la tiene, y crearla exigiría un `POST` contra la API real. Queda cubierto por `T17.18`, que comprueba `aniosDisponibles(ANIO_MAXIMO + 1)` tanto en el extremo alto como en el bajo (1985).

## Decisión tomada durante la implementación

Los dos primeros intentos del test de `is_current` fallaron porque exigían que el **POST** devolviera `is_current` cuando no se envía. No lo hace: tras `create()`, el modelo en memoria no recarga el `default` de la columna, así que la clave no aparece. **`Experience` se comporta igual**, y es el patrón que se pidió replicar, así que la comprobación se movió a donde la spec sí lo exige: el valor en BD (`Education::first()`) y el booleano en el `GET`. La web pública y el panel toleran la ausencia porque tratan el campo como falso.
