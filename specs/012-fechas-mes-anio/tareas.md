# Tareas — Fechas sin día: solo mes y año (Spec 012)

> Enfoque: tests primero, luego código. Backend: `php artisan test --compact`. Frontend: `node --test tests/*.test.js`.
> **Restricciones**: no se modifica ningún test existente · sin migraciones · sin cambios en la validación · sin CSS nuevo · **los datos reales no se modifican**: la verificación de lectura va sobre el registro real sin guardar, y la de escritura con registros temporales que se borran (plan, D6).
> **Estado: completadas ✅** — 100 pruebas de backend, 174 de frontend y build en verde.

## Fase 1: Tests

### T1.1: Tests del formato de fecha en backend ✅

Crear `Laravel/tests/Feature/DateFormatTest.php`.

**Criterios de aceptación**:
- `GET /api/education` devuelve `start_date` y `end_date` como `YYYY-MM` (RF-1). ✅
- `GET /api/experience` devuelve `start_date` y `end_date` como `YYYY-MM` (RF-1). ✅
- `GET /api/projects` devuelve `date` como `YYYY-MM` (RF-1). ✅
- `end_date` y `date` nulos devuelven `null`, nunca cadena vacía (RF-1). ✅
- `created_at` conserva su formato actual (RF-1, protección contra efectos colaterales). ✅
- No se modifica ningún test existente (`ApiReadTest`, `ApiWriteTest` y el resto quedan intactos). ✅
- Los tests fallan antes de implementar. ✅ (3 de 5 fallaban: `2018-09` esperado frente a `2018-09-01T00:00:00.000000Z`; los otros 2 son guardas)
- **Test de regresión añadido** `test_month_and_year_input_is_stored_as_a_full_date`: comprueba que lo que llega a la base de datos es `2024-09-01`, no `2024-09`. ✅ Fallaba antes del arreglo; es el que detecta el fallo de MySQL aunque los tests corran en SQLite.

---

### T1.2: Tests de las fechas en frontend ✅

Crear `React/tests/t17.test.js`, con el mismo estilo estático que `t16.test.js`.

**Criterios de aceptación**:
- Los tres modelos (`Education`, `Experience`, `Project`) declaran `date:Y-m`. ✅ **Criterio revisado durante la implementación**: `date:Y-m` guarda el valor literal y MySQL rechaza `2024-09`. El criterio final es que usen el cast `date` **sin** formato y publiquen `Y-m` en `toArray()`.
- Los tres modelos conservan el resto de sus casts (`is_current` sigue siendo `boolean`). ✅
- `Formacion.jsx` e `Experiencia.jsx` importan `formatMonthYear` desde `utils/dates.js`. ✅
- `Formacion.jsx` aplica `formatMonthYear` a `start_date` y `end_date` (RF-3). ✅
- `Experiencia.jsx` aplica `formatMonthYear` y muestra «Actualidad» cuando `end_date` está vacío (RF-3). ✅
- Los tres formularios usan `type="month"` y ya no tienen `type="date"` (RF-2). ✅
- Los tres formularios usan `admin-form__label` y `admin-form__input` en todos sus campos (RF-2). ✅
- Los formularios de Formación y Experiencia identifican «Desde» y «Hasta»; el de Proyectos, «Fecha» (RF-2). ✅
- `formatMonthYear()` devuelve cadena vacía ante entradas nulas o no interpretables (caso límite). ✅
- Los tests fallan antes de implementar. ✅ (12 de 15 fallaban; 3 son guardas)

---

## Fase 2: Implementación

### T2.1: Fecha publicada como mes y año en los tres modelos ✅

`Laravel/app/Models/Education.php`, `Experience.php` y `Project.php`.

**Criterios de aceptación**:
- `start_date` y `end_date` pasan de `date` a `date:Y-m` en `Education` y `Experience`. ✅ **Revisado**: el cast se mantiene como `date` y el formato se aplica en `toArray()` (ver «Desviación sobre el plan» más abajo).
- `date` pasa de `date` a `date:Y-m` en `Project`. ✅ **Igual revisión**: cast `date` + `toArray()`.
- `is_current` sigue siendo `boolean` en `Experience`. ✅
- No se añaden ni quitan campos de `$fillable`. ✅
- No se tocan `$table`, rutas, controladores ni validación. ✅
- Sin migraciones y sin actualizar ningún registro de la base de datos. ✅

**Evidencia**: la base de datos guarda fecha completa y la API publica mes y año a la vez — registro temporal: BD `2024-09-01` / API `"2024-09"`; real: BD `2025-07-03` / API `"2025-07"`.

---

### T2.2: Helper `formatMonthYear` en `src/utils/dates.js` ✅

Fichero nuevo, siguiendo el patrón de `src/utils/initials.js`.

**Criterios de aceptación**:
- Exporta `formatMonthYear(value)` y su exportación por defecto. ✅
- Devuelve `julio 2025` a partir de `2025-07`: nombre completo en español y año, sin día (RF-3). ✅
- Devuelve cadena vacía si el valor es `null`, `undefined`, vacío o no interpretable (caso límite). ✅
- Ante un mes fuera de rango no lanza excepción ni devuelve `undefined`. ✅ (`2025-13` → `''`)
- No se importa ninguna dependencia nueva. ✅
- Sin fecha en formato ISO-8601 ni con día: solo acepta `YYYY-MM` (`2025-07-03` → `''`). ✅

---

### T2.3: Secciones públicas `Formacion.jsx` y `Experiencia.jsx` ✅

**Criterios de aceptación**:
- Ambas importan `formatMonthYear` desde `../../utils/dates.js`. ✅
- **Formación**: muestra `{formatMonthYear(start)} - {formatMonthYear(end) || 'Actualidad'}` (RF-3). ✅
- **Experiencia**: muestra `{formatMonthYear(start)} - {is_current || !end ? 'Actualidad' : formatMonthYear(end)}` (RF-3). ✅
- Experiencia muestra «Actualidad» tanto si está marcado «Actual» como si no hay fecha final (RF-3, decisión del usuario). ✅ Verificado: temporal sin fecha final y sin marcar → `marzo 2023 - Actualidad`.
- La «Actualidad» se decide sobre el valor **formateado**, no sobre el crudo: no queda un guion colgando. ✅
- Ninguna fecha puede aparecer con día en la muestra pública. ✅
- No se cambian títulos, subtítulos, descripciones, enlaces ni clases CSS. ✅
- `Proyectos.jsx` no se modifica: la sección no muestra fecha (RF-3). ✅

**Evidencia en navegador**: `julio 2025 - abril 2026` (registro real) · `septiembre 2024 - julio 2025` (temporal) · `marzo 2023 - Actualidad` (sin fecha final).

---

### T2.4: Los tres formularios del panel ✅

`AdminFormacion.jsx`, `AdminExperiencia.jsx` y `AdminProyectos.jsx`.

**Criterios de aceptación**:
- Los cinco campos de fecha pasan de `type="date"` a `type="month"` (RF-2). ✅
- Todos los campos de texto y fecha pasan a `<label className="admin-form__label">` con `<input className="admin-form__input">` (RF-2). ✅
- El `<textarea>` de Proyectos usa `admin-form__textarea`. ✅
- Los `placeholder` sueltos de texto se retiran al pasar a etiqueta. ✅
- Etiquetas de fecha: «Desde» y «Hasta» en Formación y Experiencia, «Fecha» en Proyectos (RF-2). ✅
- El checkbox «Actual» **no se modifica**: ya lleva etiqueta visible, y `admin-form__label` le apilaría el texto y `admin-form__input` le añadiría borde de caja de texto (plan, D5). ✅
- No se cambian colores, tamaños ni distribución (spec 009, reservada). ✅
- No se añaden ni eliminan campos, ni se reordena el formulario. ✅
- Los `onChange`, los `value` y la lógica de `handleSubmit`/`handleCancel`/`handleEdit` no cambian. ✅
- Sin CSS nuevo ni dependencias nuevas. ✅

---

## Fase 3: Validación

### T3.1: Suites automatizadas y build ✅

**Criterios de aceptación**:
- `php artisan test --compact` pasa con los **94** existentes + los nuevos de `DateFormatTest`, sin haber tocado ningún test previo. ✅ **100/100** (94 + 6)
- `npm test` pasa con los **158** existentes + los de `t17`, sin haber tocado ningún test previo. ✅ **174/174** (158 + 16)
- `npm run build` no falla. ✅
- `vendor/bin/pint` sobre los ficheros PHP modificados. ✅

---

### T3.2: Validación manual no destructiva sobre datos reales ✅

La sección Experiencia tiene **1 registro real** (`Acceleralia S.L.`, `2025-07-03 → 2026-04-06`). **Solo se lee, no se guarda.**

**Criterios de aceptación**:
- **Muestra pública de Experiencia**: el registro real se ve `julio 2025 - abril 2026`, sin ningún rastro de día. Hoy se ve `2025-07-03T00:00:00.000000Z - 2026-04-06T00:00:00.000000Z`. ✅ `julio 2025 - abril 2026`
- **Abrir la experiencia real para editar**: el campo «Desde» muestra su mes y año (hoy sale vacío). **Se pulsa Cancelar sin guardar** y el registro queda intacto. ✅ `Desde value="2025-07"`, selector solo con Mes y Año. Cancelado; BD sin cambios (`updated_at` = `2026-10-13 09:22:48`, el original).
- **Formación y Proyectos**: hoy tienen 0 registros → siguen mostrando el estado vacío. ✅ «No hay datos disponibles» en ambas.
- **Proyectos**: la sección pública sigue sin mostrar ninguna fecha. ✅
- **Consola del navegador**: sin errores. ✅ Sin errores; solo los avisos preexistentes de React Router. El aviso «form field sin id/name» **no es de esta spec**: aparece también en `AdminPerfil.jsx`, que esta spec no toca.

---

### T3.3: Escritura con registros temporales y limpieza ✅

Crear registros solo para probar el guardado y **borrarlos al terminar** (plan, D6).

**Criterios de aceptación**:
- Crear un registro temporal en Formación, Experiencia y Proyectos eligiendo mes con el selector → se guarda. ✅ Los tres; POST y PUT probados (en Formación se cambió «Hasta» de `2025-06` a `2025-07`).
- Al reabrir cada uno para editar, el campo muestra el valor guardado (RF-2). ✅ `Desde value="2024-09"`, `Hasta value="2025-06"`.
- La respuesta de la API de cada registro temporal devuelve `YYYY-MM` (RF-1). ✅ `2024-09`/`2025-07`, `2023-03`/`null`, `2022-11`.
- En Experiencia, un temporal **sin fecha final y sin marcar «Actual»** se muestra en la sección pública como `julio 2025 - Actualidad` (RF-3). ✅ `marzo 2023 - Actualidad`, con `is_current=false` y `end=NULL` en base de datos.
- **Los tres temporales se borran.** ✅ Por la interfaz, sin tocar el real (borrado el temporal por posición, tras confirmar cuál era cada botón).
- Recuento de vuelta a la línea base: **1 experiencia, 0 formaciones, 0 proyectos**. ✅ `exp=1 edu=0 prj=0`
- El registro real de Experiencia conserva sus fechas originales (`2025-07-03` → `2026-04-06`). ✅ Sin tocar.

---

### T3.4: Regresiones ✅

**Criterios de aceptación**:
- Sección **Inicio** muestra la foto de perfil (specs 005 y 011). ✅ `Foto de Ramón Bielsa`, `storage/photos/...`
- **Indicador de sesión** de la navegación sigue funcionando (spec 010). ✅
- **Login y acceso al panel** sin cambios (spec 010). ✅ Sesión de admin abierta de principio a fin.
- Los estados de carga, error y vacío de Formación, Experiencia y Proyectos se ven igual. ✅ «Cargando...» y «No hay datos disponibles».
- Un usuario con rol `editor` edita y un `reader` solo consulta (permisos sin cambios). ✅ Ver abajo.
- El resto de campos del formulario se envían igual que antes. ✅ `title`, `institution`, `position`, `company`, `description`, `url` y `is_current` llegaron intactos en las peticiones observadas.

---

## Desviación sobre el plan (aprobada por el usuario)

El plan **D1** sostenía que el cast `date:Y-m` afectaba «solo a la serialización de salida». **No es así**: con ese cast, Laravel guarda el valor que recibe **literalmente**, así que `2024-09` llegaba a una columna `DATE` y MySQL lo rechazaba con `SQLSTATE[22007] Incorrect date value`, devolviendo **500** al guardar desde el panel.

Los tests no lo detectaron porque `phpunit.xml` fija `DB_CONNECTION=sqlite` / `:memory:`, que admite `2024-09` como texto; la base de datos real es MySQL con `STRICT_TRANS_TABLES`.

**Solución aplicada** (elegida por el usuario): los modelos conservan el cast `date` —que normaliza a `2024-09-01 00:00:00`, como siempre hizo— y cada modelo sobrescribe `toArray()` para publicar `Y-m` solo al salir. La escritura vuelve a un comportamiento probado y no depende de que quien escriba recuerde pasar la fecha completa. Se añadió el test de regresión de T1.1 para que vuelva a fallar si alguien reintroduce el cast con formato.

## Cobertura de criterios no verificados en navegador

- **Permisos `editor` / `reader`**: sin sesión de esas cuentas en navegador. Cubierto por `CheckRoleMiddlewareTest` (editor y reader rechazados en rutas de admin; editor pasa en rutas de contenido; reader solo lectura) y `AdminUserTest`, ambos en verde con 100/100. Rutas, controladores y middleware **no se han tocado** en esta spec.

## Criterios de finalización

- `GET /api/education`, `/api/experience` y `/api/projects` devuelven sus fechas como `YYYY-MM` y `null` cuando no hay valor. ✅
- La base de datos no cambia: sin migraciones y sin actualizar ningún registro existente. ✅
- La sección Experiencia muestra `julio 2025 - abril 2026` con el registro real. ✅
- La sección Formación muestra fechas en «mes año» y «Actualidad» cuando no hay fecha final. ✅
- Experiencia muestra «Actualidad» también cuando no hay fecha final sin estar marcado como «Actual». ✅
- La sección Proyectos sigue sin mostrar fecha. ✅
- El panel muestra la fecha existente al editar (antes salía vacío) y solo permite elegir mes y año. ✅
- Los tres formularios identifican «Desde», «Hasta» y «Fecha», y todos sus campos llevan etiqueta visible con `admin-form__label` / `admin-form__input`. ✅
- El checkbox «Actual» y el resto de campos conservan su nombre y comportamiento; estados, permisos y flujos sin cambios. ✅
- `php artisan test --compact`, `npm test` y `npm run build` en verde **sin modificar ningún test existente**. ✅ **100 / 174 / build**
- Se dejan **0 registros temporales**: 1 experiencia real, 0 formaciones, 0 proyectos. ✅

---

# Cambio 1 (13/10/2026) — Selector propio de mes y año

Disparador: la persona usuaria reportó que **en Firefox no salta el calendario**. `type="month"` no está soportado en Firefox (hasta la 160) ni en Safari de escritorio (hasta la 27.2), así que el campo degradaba a texto plano. Detalle y decisión en `spec.md`, apartado *Cambios sobre la versión aprobada*.

### C1.1: Spec enmendada ✅

- RF-2 reescrita: de `type="month"` a selector propio `MonthYearPicker`.
- Retirada la línea de casos límite que autorizaba «sin polyfill para esos navegadores»: era lo que ocultaba el fallo.
- El CSS mínimo del selector entra en alcance; el resto de la estética sigue reservado a la spec 009.
- Corregido un criterio que describía mal el sistema: esos tres formularios **solo se muestran a quien puede editar**, así que el selector no aparece para `reader` (mismo comportamiento que antes).

### C1.2: Lógica de años en `src/utils/dates.js` ✅

`ANIO_MINIMO` (actual − 30), `ANIO_MAXIMO` (actual + 10) y `aniosDisponibles(anio)`, que **añade el año guardado aunque quede fuera del rango y lo devuelve ordenado** — si no, editar un registro antiguo lo perdería. Está en `dates.js` y no dentro del componente a propósito: `dates.js` es JS puro, se puede importar desde `node --test`; el componente, al ser JSX, no.

### C1.3: Componente `src/components/admin/MonthYearPicker.jsx` ✅

Dos `<select>` (año y mes) que componen `YYYY-MM` y emiten `''` si falta alguna parte. Estados parciales en `useEffect` sobre `value`: elegir solo el mes no se pierde, y al editar el registro se reajusta. Meses reutilizados de `MESES`, con `padStart(2)`.

**Accesibilidad — desviación detectada al validar**: la primera versión envolvía los dos `<select>` en un `<label>` del formulario, y un `<label>` solo asocia al primer campo: **el selector de mes quedaba sin nombre accesible**. Se corrigió pasando la etiqueta al componente (`label="Desde"`), que la renderiza y añade `aria-label` a cada lista (`Desde año` / `Desde mes`). Verificado en navegador.

También se quitó el prop `disabled`: **no lo pasaba ningún formulario** (los tres solo se renderizan con `canEdit`), así que era código muerto. Criterio de la spec corregido en consecuencia.

### C1.4: CSS `.admin-form__dates` ✅

`display: flex` con `gap: 0.5rem`; el año `flex: 1` y el mes `flex: 2`, que es más largo («septiembre»).

### C1.5: Los tres formularios ✅

`type="month"` sustituido por `<MonthYearPicker label=… />` en Formación («Desde»/«Hasta»), Experiencia («Desde»/«Hasta») y Proyectos («Fecha»).

### C1.6: Pruebas ✅

- **T17.9** pasa de comprobar `type="month"` a comprobar `MonthYearPicker` y la **ausencia** de `type="month"` y `type="date"`.
- **T17.17** (nuevo): no depende de `type="month"`, compone `YYYY-MM`, emite `''` si falta parte, reutiliza `MESES`.
- **T17.18** (reescrito): de test estático a **prueba real** de `aniosDisponibles` — importa el helper y comprueba rango, año fuera de rango y ordenación.
- **T17.19** (nuevo): valor vacío, etiqueta propia y `aria-label` (regresión de accesibilidad).

### C1.7: Validación ✅

- `npm test` → **177/177**; `npm run build` → ✅; `php artisan test --compact` → **100/100**.
- Consola **sin errores** tras recarga limpia.
- Formación creada desde el panel eligiendo **primero el mes** y luego el año (estado parcial no se pierde): API `2024-07` / `2025-06`, BD `2024-07-01` / `2025-06-01`.
- Reapertura para editar: `2024`/`julio` y `2025`/`junio`. ✅
- Campo opcional: limpiado «Hasta» → API `end_date: null`, BD `NULL`; público: `julio 2024 - Actualidad`. ✅
- Público con datos reales: Experiencia `julio 2025 - abril 2026`. ✅
- **Backend sin cambios** en todo el Cambio 1.
- Limpieza: `edu=0 exp=1 prj=0`; el `updated_at` de la experiencia real sigue en `2026-10-13 09:22:48`. ✅
