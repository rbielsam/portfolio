# Spec — Opción «Actual» en Formación y nueva forma del selector de fechas

## Contexto y objetivo

Petición directa de la persona usuaria tras cerrar la spec 012, trasladada sin recortes:

> *En formación añade también la opción Actual, invierte el orden, primero el mes (cada mes empieza con letra mayúscula) luego el año (orden descendente).*

Concretamente, tres cosas:

1. **Formación no tiene la opción «Actual» que Experiencia sí tiene.** Hoy se puede marcar una experiencia como en curso, pero una formación en curso hay que dejar la fecha «Hasta» vacía. No hay forma de decirlo de forma explícita.
2. **Los meses se escriben en minúscula** (`julio 2025`), tanto en los desplegables del panel como en la web pública.
3. **El selector de fechas va año primero y ascendente**, cuando lo natural al leer es mes → año, y conviene ver lo más reciente arriba.

### Por qué es una spec nueva y no un cambio de la 012

La spec 012 está cerrada y su *Fuera de alcance* incluía expresamente **no añadir migraciones**. La opción «Actual» necesita una columna nueva `is_current` en la tabla `education`, validación en el servidor y cambios en el modelo: eso es funcionalidad de backend, no de formato de fecha.

Además, 012 dejó tres tests que **prohíben justo lo que aquí se pide** (ver *Pruebas existentes que hay que modificar*). Meter todo eso en 012 habría reescrito una spec ya validada en lugar de abrir una nueva.

Decidido con la persona usuaria en clarificación:

- «Actual» en Formación → **igual que en Experiencia** (columna real, no un alias de fecha vacía).
- Mayúsculas → **también en la web pública**.
- Orden nuevo → **a los tres formularios**, porque es el mismo componente compartido.

---

## RF-1: Formación admite marcar la formación como «Actual»

**QUÉ**: la tabla `education` gana la columna `is_current` (`boolean`, `default false`), el modelo la acepta y publica, el servidor la valida igual que en Experiencia, el formulario de Formación muestra la casilla «Actual» y la web pública muestra «Actualidad» cuando esté marcada. La casilla es **idéntica** a la de Experiencia: mismo texto, mismo marcado y **sin** la clase `admin-form__input`.

**POR QUÉ**: Experiencia ya distingue «en curso» de «terminado» y Formación no. Paridad entre ambos formularios, y además la distinción queda guardada en el dato en vez de deducirse de que la fecha final esté vacía.

**Criterios de aceptación (EARS)**:

- **Cuando** se ejecute la migración, **el sistema deberá** añadir `is_current` a `education` con valor por defecto `false`, sin tocar ninguna fila existente ni ninguna otra tabla.
- **Cuando** se envíe `is_current` al crear o actualizar formación, **el sistema deberá** validarlo con `['nullable', 'boolean']`, exactamente igual que hace `ExperienceController`.
- **Cuando** no se envíe `is_current`, **el sistema deberá** guardarlo como `false`.
- **Cuando** se solicite `GET /api/education`, **el sistema deberá** devolver `is_current` como booleano.
- **Cuando** se abra el formulario de Formación, **el sistema deberá** mostrar la casilla «Actual» vinculada a `is_current`, colocada después del campo «Hasta» y con el mismo marcado que en Experiencia.
- **Cuando** la casilla esté marcada y se guarde, **el sistema deberá** persistir `is_current = true`, **conservando** el valor de `end_date` que tenga (mismo comportamiento que Experiencia: no se borra la fecha final).
- **Cuando** `is_current` sea `true` o `end_date` esté vacío, **el sistema deberá** mostrar «Actualidad» en la sección Formación pública.
- **Cuando** `is_current` sea `false` y `end_date` tenga valor, **el sistema deberá** mostrar la fecha final formateada.
- **Cuando** se añada `is_current` a `Education`, **el sistema deberá** incluirlo en `$fillable` y en `$casts` como `boolean`, y **no** alterar el resto de casts ni el `toArray()` de fechas.
- **Cuando** la persona no tenga permiso de edición, **el sistema deberá** tratar la casilla igual que el resto del formulario: ese formulario solo se muestra a quien puede editar.

---

## RF-2: Los meses se escriben con mayúscula inicial en todo el sitio

**QUÉ**: `MESES` en `src/utils/dates.js` pasa a `Enero, Febrero, … Diciembre`. Como es la única fuente de nombres de mes, el cambio llega **a la vez** a los desplegables del panel y a la web pública: «Julio 2025 - Abril 2026».

**POR QUÉ**: petición explícita de la persona usuaria, que eligió que la web pública también cambie en lugar de mantener una lista para el selector y otra para la muestra.

**Criterios de aceptación (EARS)**:

- **Cuando** se muestre cualquier sección pública con fechas, **el sistema deberá** escribir el mes con la primera en mayúscula: «Julio 2025 - Abril 2026».
- **Cuando** la fecha final esté vacía o marcada como «Actual», **el sistema deberá** mostrar «Actualidad» sin mes delante.
- **Cuando** se abra el selector en el panel, **el sistema deberá** mostrar los doce meses en mayúscula inicial.
- **Cuando** cambie `MESES`, **el sistema deberá** conservar el orden de los doce meses y los nombres en español (incluido «septiembre», con p).
- **Cuando** se cambie el formato público, **el sistema deberá** seguir recibiendo `YYYY-MM` de la API: **el backend no cambia**.

---

## RF-3: El selector muestra primero el mes y el año en orden descendente

**QUÉ**: `MonthYearPicker` renderiza la lista de **mes antes que la de año**, y `aniosDisponibles()` devuelve los años de **mayor a menor**. El valor que emite sigue siendo `YYYY-MM` y la lógica de estado parcial no cambia.

**POR QUÉ**: al rellenar el campo se piensa primero en el mes, y al elegir año conviene tener lo más reciente arriba sin recorrer la lista.

**Criterios de aceptación (EARS)**:

- **Cuando** se abra cualquier formulario de fechas, **el sistema deberá** mostrar la lista de meses a la izquierda y la de años a la derecha.
- **Cuando** se despliegue la lista de años, **el sistema deberá** ofrecerlos en orden descendente, empezando por el mayor.
- **Cuando** se despliegue la lista de años, **el sistema no deberá** ofrecer ninguno por encima del **año en curso**: el tope es el año actual. Lo que siga en curso se expresa con la opción «Actual» (RF-1), no eligiendo un año futuro.
- **Cuando** exista una fecha final futura ya guardada, **el sistema deberá** seguir ofreciendo su año en la lista, para que el registro siga siendo editable aunque quede fuera del rango.
- **Cuando** el valor guardado tenga un año fuera del rango ofrecido, **el sistema deberá** seguir incluyéndolo **y colocándolo en su sitio del orden descendente**, sin perderlo al editar.
- **Cuando** se cambie el orden visual, **el sistema deberá** mantener cada lista con su nombre accesible correcto (`Desde año` / `Desde mes`): la etiqueta no depende de la posición.
- **Cuando** se cambie el orden, **el sistema deberá** ajustar el CSS para que la columna más ancha siga siendo la de los meses.
- **Cuando** se cambie el orden o el sentido, **el sistema deberá** seguir emitiendo `YYYY-MM` y `''` si falta alguna parte.
- **Cuando** se aplique el cambio, **el sistema deberá** afectar a Formación, Experiencia y Proyectos por igual, al ser el mismo componente.

---

## Casos límite y decisiones tomadas

- **Filas existentes con la migración**: `education` no tiene filas en este momento, y la columna lleva `default false`, así que no hace falta `UPDATE` de respaldo ni paso intermedio. La migración se revierte con `down()` que elimina la columna.
- **`is_current = true` y `end_date` a la vez**: posible y permitido, igual que en Experiencia. La web pública muestra «Actualidad» porque manda `is_current`.
- **Año fuera de rango**: se mantiene la protección de 012; solo cambia el criterio de ordenación, de ascendente a descendente.
- **Tope del año**: la lista termina en el año en curso. Alcanza el techo la misma hora que se redactó esta spec, así que `ANIO_MAXIMO` se define a partir del sistema (`new Date().getFullYear()`), no con un literal: en 2027 el tope pasa a ser 2027 solo por actualizar esa constante. **Consecuencia asumida**: una formación o experiencia que termine en un año futuro ya no puede elegirse por fecha; hay que marcar «Actual». Si una fecha futura llegara a estar guardada de otro modo, el año se añade a la lista igualmente y no se pierde.
- **Estado parcial del selector** (elegir mes sin año): se conserva igual que ahora; el orden de renderizado no toca ese estado.
- **Permisos**: sin cambios. Los tres formularios y su casilla solo se muestran con `canEdit`.
- **El backend no cambia de contrato** en lo que respecta a fechas: `start_date`, `end_date` y `date` siguen siendo `YYYY-MM`.

---

## Pruebas existentes que hay que modificar

Esta spec **sí** modifica tests de la spec 012, porque afirman hoy lo contrario de lo pedido. Se lista cada uno para que la aprobación sea explícita:

| Test | Afirma hoy | Pasa a afirmar |
|---|---|---|
| `T17.4` | `!education.includes("'is_current'")` — *Education no debe ganar campos* | `Education` **sí** tiene `'is_current' => 'boolean'` |
| `T17.14` | `formatMonthYear('2025-07') === 'julio 2025'` | `=== 'Julio 2025'` (y resto de casos) |
| `T17.18` | `aniosDisponibles` devuelve **ascendente** | devuelve **descendente** |
| `T17.6` | Formación muestra «Actualidad» sin fecha final | **añade** que también la muestra con `item.is_current` |

Los tests de backend **no se modifican**: ninguno afirma que `education` carezca de `is_current`. Se **añaden** los nuevos.

---

## Fuera de alcance

- No se modifica el comportamiento de «Actual» en Experiencia: solo se usa como referencia.
- No se cambia Proyectos (no tiene «Actual» ni muestra fecha).
- No se tocan permisos, autenticación ni rutas.
- No se añaden dependencias: sigue siendo React + JS + CSS3 puro en el frontend, y Laravel en el backend.
- No se cambia la validación de fechas (`start_date` sigue `required|date`, `end_date` sigue `nullable|date`).
- No se cambia el contrato de fechas de la API (`YYYY-MM`).
- No se toca la estética general del panel: la casilla copia el marcado existente y el único CSS que se ajusta es el ya propio del selector (`.admin-form__dates`). La paleta y el responsive siguen reservados para la spec **009**.
- No se migran ni se editan a mano datos reales: la única fila real es la experiencia `Acceleralia S.L.`, que queda intacta.

---

## Criterios de finalización

- `education` tiene `is_current` con `false` por defecto y la migración se puede aplicar y deshacer.
- `POST` / `PUT /api/education` aceptan `is_current` y `GET /api/education` lo devuelve como booleano.
- El formulario de Formación muestra la casilla «Actual» idéntica a la de Experiencia.
- La web pública escribe los meses con mayúscula: «Julio 2025 - Abril 2026».
- La sección Formación muestra «Actualidad» cuando `is_current` está marcado, aunque tenga fecha final.
- Los tres formularios muestran mes antes que año y la lista de años en orden descendente.
- Los tres formularios siguen emitiendo `YYYY-MM` y distinguiendo `Desde` / `Hasta` / `Fecha`.
- Las pruebas definidas en el plan pasan, con las modificaciones de la tabla anterior listadas y justificadas.
- Sin registros temporales al terminar y con la experiencia real sin tocar.
