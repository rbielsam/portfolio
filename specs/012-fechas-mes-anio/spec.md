# Spec — Fechas sin día: solo mes y año en Formación, Experiencia y Proyectos

## Contexto y objetivo

Las fechas de Formación, Experiencia y Proyectos se guardan como fecha completa (columna `date`) y la API las serializa con el formato ISO-8601 por defecto de Laravel. Petición real de `GET /api/experience`:

```json
"start_date": "2025-07-03T00:00:00.000000Z",
"end_date":   "2026-04-06T00:00:00.000000Z"
```

Eso provoca dos problemas visibles hoy:

1. **La muestra pública pinta el literal entero.** `Experiencia.jsx` y `Formacion.jsx` hacen `{item.start_date} - {item.end_date}`, de modo que se ve `2025-07-03T00:00:00.000000Z - 2026-04-06T00:00:00.000000Z`.
2. **El panel muestra el campo vacío al editar.** Los formularios usan `<input type="date">`, que exige exactamente `YYYY-MM-DD`; al recibir ISO-8601 no lo reconoce y queda en blanco. Este era un bug ya conocido y quedó anotado como pendiente.

Además, en un portfolio el día aporta ruido: el trayecto profesional y la formación se argumentan por meses, no por días concretos.

**Objetivo doble**:

1. Que las fechas de Formación, Experiencia y Proyectos se manejen como **mes y año, sin día**, tanto al capturarlos como al servirlos.
2. Que la muestra pública del portfolio muestre el mes completo en español con el año: **«julio 2025»**.

## Usuarios

- **Visitante del portfolio**: ve las secciones Formación y Experiencia.
- **Persona autenticada con permiso de edición**: crea y edita registros desde el panel.
- **Persona autenticada sin permiso de edición** (`reader`): consulta el panel en solo lectura; los campos deben mostrarse correctamente igualmente.

## Requisitos funcionales

### RF-1: La API devuelve las fechas como mes y año (`YYYY-MM`)

**QUÉ**: `start_date` y `end_date` de Formación y Experiencia, y `date` de Proyectos, se serializarán como `YYYY-MM` (por ejemplo `"2025-07"`).
**POR QUÉ**: es el único formato que sirve a la vez a la muestra pública y al campo `type="month"` del panel. El día no se usa en ninguna parte del producto.

**Criterios de aceptación (EARS)**:
- **Cuando** se solicite `GET /api/education`, **el sistema deberá** devolver `start_date` y `end_date` con formato `YYYY-MM`.
- **Cuando** se solicite `GET /api/experience`, **el sistema deberá** devolver `start_date` y `end_date` con formato `YYYY-MM`.
- **Cuando** se solicite `GET /api/projects`, **el sistema deberá** devolver `date` con formato `YYYY-MM`.
- **Cuando** un campo sea nulo (`end_date` o `date`), **el sistema deberá** devolver `null`, nunca una cadena vacía.
- **Cuando** existan datos con un día distinto de 01 (la experiencia real empieza el 03), **el sistema deberá** devolver `"2025-07"` sin intervención manual ni migración.
- **Cuando** se guarde un registro, **el sistema deberá** conservar la fecha completa en la base de datos: el formato nuevo afecta **solo** a la serialización de salida.
- **Cuando** se listen los registros, **el sistema deberá** mantener el orden actual (más reciente primero).
- **Cuando** se devuelvan `created_at` y `updated_at`, **el sistema no deberá** cambiar su formato.
- **Cuando** se soliciten otros endpoints (perfil, contactos, usuarios), **el sistema no deberá** ver alterada su respuesta.

---

### RF-2: El panel permite elegir únicamente mes y año

**QUÉ**: los campos de fecha de los formularios del panel pasan de `type="date"` a un **selector propio de mes y año** (`MonthYearPicker`): dos listas desplegables —año y mes— que componen y emiten `YYYY-MM`. Además, **todos** los campos de los tres formularios (Formación, Experiencia y Proyectos) pasan a llevar etiqueta visible, usando el patrón que ya existen en el panel.
**POR QUÉ**: `type="date"` obliga a elegir un día además de mostrar el campo vacío al editar. Se probó primero `type="month"`, que espera exactamente `YYYY-MM`, pero **no está soportado en Firefox (hasta la 160) ni en Safari de escritorio (hasta la 27.2)** —cobertura del 91,88%—: en esos navegadores el campo degrada a texto normal y **desaparece el calendario**, de modo que este requisito («permitir elegir mes y año») no se cumplía. Un selector propio se comporta igual en todos los navegadores, no añade dependencias y sigue sin ofrecer el día. Y hoy los dos campos de fecha no tienen ningún texto: al editar, dos selectores de mes seguidos no se distinguen cuál es el inicio y cuál el fin. Se aprovecha para poner los formularios al mismo nivel que `AdminPerfil` y `UserManager`, que ya usan etiquetas.

**Decisión de alcance**: la etiqueta se aplica al **formulario completo**, no solo a las fechas. Los campos de texto actuales dejan los `placeholder` sueltos y pasan a etiqueta.

**Decisión de alcance (cambio)**: se sustituye `type="month"` por el selector propio **en todos los navegadores**, sin detección de soporte ni doble código. En Chrome/Edge se pierde el calendario nativo, a cambio de un comportamiento idéntico en todas partes.

**Criterios de aceptación (EARS)**:
- **Cuando** se abra un registro existente para editar, **el sistema deberá** mostrar su mes y año en el campo (hoy el campo sale vacío).
- **Cuando** la persona use el selector, **el sistema deberá** permitir elegir únicamente mes y año, sin opción de día.
- **Cuando** el navegador sea Firefox o Safari de escritorio, **el sistema deberá** mostrar el selector y permitir elegir mes y año, sin degradar a texto normal.
- **Cuando** el valor guardado tenga un año fuera del rango ofrecido por la lista, **el sistema deberá** incluirlo de todos modos, para no perderlo al editar.
- **Cuando** el campo esté vacío (fecha final o fecha de Proyectos), **el sistema deberá** ofrecer una opción vacía y enviar cadena vacía, conservando que son opcionales.
- **Cuando** se muestre el formulario de Formación o Experiencia, **el sistema deberá** identificar los dos campos de fecha con «Desde» y «Hasta».
- **Cuando** se muestre el formulario de Proyectos, **el sistema deberá** identificar su campo de fecha con «Fecha».
- **Cuando** se muestre cualquiera de los tres formularios, **el sistema deberá** dar etiqueta visible a **todos** sus campos, con el patrón ya existente en el panel: `<label className="admin-form__label">` envolviendo el campo.
- **Cuando** se muestre un formulario con etiquetas, **el sistema deberá** conservar la apariencia actual del formulario: no se cambian colores, tamaños ni distribución.
- **Cuando** se envíe el formulario, **el sistema deberá** enviar el valor en formato `YYYY-MM`.
- **Cuando** la fecha final (`end_date`) o la fecha de Proyectos (`date`) estén vacías, **el sistema deberá** seguirlas aceptando: son opcionales.
- **Cuando** falte la fecha de inicio (`start_date`), **el sistema deberá** rechazar el guardado igual que hoy.
- **Cuando** el servidor reciba un valor de fecha no válido, **el sistema deberá** responder con error de validación igual que hoy: **la regla de validación no cambia**, y ya acepta el formato `YYYY-MM`.
- **Cuando** la persona no tenga permiso de edición, **el sistema deberá** tratar el campo de fecha igual que el resto de campos del formulario: hoy esos tres formularios solo se muestran a quien puede editar, así que el selector no aparece (mismo comportamiento que antes de este cambio).
- **Cuando** la persona cancele la edición, **el sistema deberá** descartar los cambios como hasta ahora.

---

### RF-3: La muestra pública muestra el mes completo en español con el año

**QUÉ**: las secciones Formación y Experiencia muestran la fecha como «julio 2025», sin día.
**POR QUÉ**: es el objetivo principal del cambio y lo que percibe el visitante.

**Criterios de aceptación (EARS)**:
- **Cuando** un registro tenga fecha inicial y final, **el sistema deberá** mostrar ambos en formato «mes año» unidos por « - », por ejemplo `julio 2025 - abril 2026`.
- **Cuando** se muestre un mes, **el sistema deberá** usar el nombre completo en español: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre.
- **Cuando** no se muestre ninguna fecha, **el sistema no deberá** mostrar el día en ningún caso.
- **Cuando** en Formación no haya fecha final, **el sistema deberá** mostrar «Actualidad» (comportamiento actual).
- **Cuando** en Experiencia el registro esté marcado como «Actual», **el sistema deberá** mostrar «Actualidad».
- **Cuando** en Experiencia no haya fecha final y no esté marcado como «Actual», **el sistema deberá** mostrar «Actualidad», unificando el criterio con Formación y evitando un guion colgando.
- **Cuando** se muestre la sección de Proyectos, **el sistema no deberá** mostrar ninguna fecha, porque hoy no la muestra: no se añade ningún texto nuevo.

---

### RF-4: El resto de la aplicación no cambia

**QUÉ**: el cambio se limita al formato de las fechas; el resto de comportamientos queda intacto.
**POR QUÉ**: es una corrección de formato, no una redefinición de las secciones ni del panel.

**Criterios de aceptación (EARS)**:
- **Cuando** se visiten las secciones públicas, **el sistema deberá** seguir mostrando título, empresa o institución, descripción y enlaces igual que ahora.
- **Cuando** haya 0 registros, **el sistema deberá** mostrar el estado vacío actual.
- **Cuando** esté cargando o falle la petición, **el sistema deberá** mostrar los estados de carga y de error actuales.
- **Cuando** una persona con rol `editor` o `reader` abra el panel, **el sistema deberá** respetar los permisos actuales.
- **Cuando** se cree, edite o borre un registro, **el sistema deberá** conservar el flujo actual.

## Requisitos no funcionales

- **Sin dependencias nuevas**: el formato se resuelve con la serialización de Laravel y con código propio en el frontend.
- **Sin migraciones ni cambios de esquema**: las columnas siguen siendo de tipo `date`; no se crea ninguna tabla ni columna.
- **Sin migración de datos**: los registros existentes heredan el nuevo formato automáticamente al serializar.
- **Sin API Resources ni versionado**: se mantiene la convención existente del proyecto (los controladores devuelven el modelo directamente).
- **Sin código duplicado en el frontend**: el paso de `YYYY-MM` a «julio 2025» se resuelve en un único helper compartido por las secciones.
- **Zona horaria**: la aplicación trabaja en UTC (confirmado en `app.timezone`), de modo que aplicar el formato no desplaza el mes.
- **Separación de responsabilidades**: el frontend no calcula ni valida fechas por su cuenta más allá de presentarlas; la decisión de formato vive en el backend.

## Casos límite

- **Fecha final vacía en Formación**: se muestra «Actualidad».
- **Fecha final vacía en Experiencia marcada como «Actual»**: se muestra «Actualidad».
- **Fecha final vacía en Experiencia sin marcar «Actual»**: se muestra «Actualidad» (nuevo criterio unificado).
- **Proyecto sin fecha**: el campo queda vacío y la sección pública no muestra nada (no la muestra hoy).
- **Registro almacenado con día distinto de 01** (la experiencia real es 03 y 06): se muestra «julio 2025» y «abril 2026».
- **Inicio y fin en el mismo mes**: se muestra dos veces el mismo mes; no se especializa.
- **Fecha en el futuro**: se muestra igual que cualquier otra.
- **Valor no parseable en la base de datos**: la muestra pública no debe romperse la sección entera.
- **Secciones sin registros** (hoy Formación y Proyectos tienen 0): estado vacío actual.
- **Solo lectura**: el campo muestra el mes y año aunque esté deshabilitado.
- **Navegador sin soporte de `type="month"` (caso sobrevivido)**: en Firefox y Safari de escritorio el campo `type="month"` se quedaba en texto plano y **no había calendario**. Sustituido por el selector propio, que sí funciona en todos. Queda anotado para no repetirlo: **antes de usar un tipo de input nativo, comprobar el soporte real** (`type="month"` está en Firefox y Safari por debajo del 100%).

## Fuera de alcance

- Migraciones, cambios de columna o renombrado de tablas.
- Normalizar los días existentes a 01: se guardan tal cual y simplemente dejan de verse.
- Cambiar la regla de validación de fechas del servidor.
- La fecha de los mensajes de contacto (`created_at`) o de los usuarios.
- Estética, paleta y comportamiento responsive del área de administración (spec **009**, reservada). Las etiquetas de los formularios **sí** entran en esta spec, al igual que el **CSS mínimo del selector de mes/año** (colocar las dos listas en fila); el resto de la estética, no.
- Reordenar, añadir o eliminar campos de los formularios del panel.
- Mostrar la fecha en la sección pública de Proyectos.
- Varios idiomas o localización: el formato es español fijo.
- Cambiar el texto «Actualidad» o la lógica de `is_current`.
- Introducir API Resources, versionado de API ni cambiar la estructura de las respuestas más allá del formato de fecha.

## Criterios de finalización

- `GET /api/education`, `GET /api/experience` y `GET /api/projects` devuelven sus fechas como `YYYY-MM`, y `null` cuando no hay valor.
- La base de datos conserva las fechas completas sin ninguna migración ni actualización manual.
- El panel muestra la fecha existente al editar (antes salía vacío) y solo permite elegir mes y año.
- El selector de mes y año **funciona igual en todos los navegadores**, incluidos Firefox y Safari de escritorio, sin degradar a texto plano y sin añadir dependencias.
- Los tres formularios del panel identifican «Desde», «Hasta» y «Fecha», y **todos** sus campos llevan etiqueta visible con el patrón `admin-form__label` / `admin-form__input`.
- La sección Formación muestra fechas como «julio 2025 - abril 2026», sin día.
- La sección Experiencia hace lo mismo y muestra «Actualidad» cuando no hay fecha final, sea o no «Actual».
- La sección Proyectos sigue sin mostrar fecha.
- Los demás campos conservan su nombre y su comportamiento; estados, permisos y flujos quedan sin cambios.
- Las pruebas definidas en el plan pasan.

## Dudas resueltas

- **Formato mostrado**: mes completo en español con el año («julio 2025»), no abreviado ni numérico.
- **Dónde se hace el cambio**: en la API, que pasa a devolver `YYYY-MM`. Esto además corrige el campo vacío del panel, porque `type="month"` espera exactamente ese formato.
- **Datos existentes**: heredan el nuevo formato; no se toca la base de datos.
- **Alcance**: incluye también Proyectos, además de Formación y Experiencia.
- **Experiencia sin fecha final**: muestra «Actualidad», igual que ya hace Formación.
- **Textos de los campos**: los tres formularios completos pasan a etiquetas visibles (`admin-form__label` / `admin-form__input`), no solo los de fecha. Ya es el patrón de `AdminPerfil` y `UserManager`; además un `placeholder` desaparece al editar, justo cuando más hace falta distinguir «Desde» de «Hasta».
- **Validación del servidor**: sin cambios. La regla `date` actual ya acepta `2025-07`, así que no hay que actualizar los 5 datos de prueba existentes de `ApiWriteTest`, que envían fecha completa.
- **Corrección de dato previo**: estaba anotado que la API devolvía `2018-09-01 00:00:00`; en realidad devuelve ISO-8601 (`2018-09-01T00:00:00.000000Z`). Lo primero era la conversión a cadena de Carbon en tinker, no la serialización JSON.

## Cambios sobre la versión aprobada

### Cambio 1 (13/10/2026): el selector de mes/año pasa a ser propio

**Disparador**: durante la validación, la persona usuaria reportó que **en Firefox no salta el calendario**.

**Diagnóstico**: la versión aprobada usaba `type="month"`, que sí funcionaba en Chrome (verificado: abría una rejilla `2026` + `ene…dic`, sin días). Pero según caniuse, `type="month"` **no está soportado en Firefox (hasta la 160) ni en Safari de escritorio (hasta la 27.2)**, con una cobertura global del 91,88%. En esos navegadores el campo degrada a `type="text"`, desaparece el icono y no hay calendario alguno: hay que teclear `2024-09` a mano.

Eso incumplía el criterio de RF-2 *«Cuando la persona use el selector, el sistema deberá permitir elegir únicamente mes y año»* para una parte de las personas usuarias. La línea de casos límite que lo autorizaba («no se añade soporte ni polyfill») se retira.

**Decisión**: se elimina `type="month"` y se crea un **selector propio** `MonthYearPicker` con dos listas desplegables (año y mes) que emite `YYYY-MM`. Se aplica **en todos los navegadores**, sin detección de soporte ni doble recorrido de código: un solo comportamiento, más fácil de mantener y de probar. No se añade ninguna dependencia.

**Consecuencias**:

- **Backend: ninguno.** El contrato de la API (`YYYY-MM`) y la base de datos (fecha completa) no cambian en absoluto. RF-1 y toda la validación de escritura ya hecha siguen válidas.
- **Frontend**: nuevo componente y su CSS mínimo; los tres formularios dejan de usar `type="month"`.
- **Pruebas**: las pruebas de `t17` que comprobaban `type="month"` pasan a comprobar el selector propio. Las de backend no se tocan.

