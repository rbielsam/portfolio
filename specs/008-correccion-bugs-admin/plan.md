# Plan — Corrección de bugs en el panel de administración (Spec 008)

## Alcance

Corrección de dos fallos en el área de administración:

1. **Estado vacío bloqueante** en `AdminFormacion.jsx`, `AdminExperiencia.jsx` y `AdminProyectos.jsx`: el `return <EmptyData />` se ejecuta antes del formulario, por lo que sin registros no se puede crear el primero.
2. **Vista de Usuarios sin estilos**: `UserManager.jsx` usa clases que no existen en ningún CSS.

- **No toca backend**: no hay cambios en endpoints, permisos ni base de datos.
- **No toca autenticación** ni el área pública.
- **No unifica la estética** del panel con el resto del sitio (paleta, responsive): queda para la spec 009. Los estilos que se añaden usan la paleta actual del panel para no mezclar alcances.

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Permisos**: hook existente `usePermissions()` → `can(...)`, sin cambios
- **Estilos**: `src/styles/admin.css` (paleta actual del panel)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)

## Restricciones de los tests existentes (a no romper)

- `t6.test.js`: `AdminFormacion/Experiencia/Proyectos` deben seguir conteniendo `api`, `post`, `put` y `delete`.
- `t8.test.js`: `AdminMensajes` debe seguir usando `EmptyData`. **No se toca `AdminMensajes`** (no tiene formulario de creación; su estado vacío es correcto).
- `t3.test.js`: `EmptyData.jsx` debe seguir mostrando "No hay datos disponibles". **No se modifica `EmptyData`** (lo usan también las secciones públicas).

## Decisiones de implementación

### RF-1 a RF-4 · Secciones de contenido (Formación, Experiencia, Proyectos)

Las tres vistas comparten ya estructura idéntica, así que se aplica el mismo patrón en las tres, sin refactorizar a un componente compartido (los cambios se mantienen pequeños y acotados; unificarlas en un componente queda fuera de alcance).

- **Nuevo estado** `showForm` (booleano) en cada vista.
- **`handleAdd()`**: `setEditing({})` + `setShowForm(true)` → formulario vacío en modo creación.
- **`handleEdit(item)`**: `setEditing(item)` + `setShowForm(true)` → formulario relleno en modo edición.
- **`handleCancel()`**: `setEditing(null)` + `setShowForm(false)` → descarta datos y cierra.
- **Estructura JSX nueva**: título y botón "Añadir" en una fila (`.admin-view__header`); la lista se renderiza si hay datos y, si no, `EmptyData` **dentro** del mismo contenedor, nunca como retorno anticipado; el formulario se renderiza solo si `canEdit && showForm`.
- El botón "Añadir" se muestra con `canEdit`, con datos o sin ellos (RF-1 y RF-3).
- El texto del botón de envío sigue distinguiendo crear/actualizar: `editing?.id ? 'Actualizar' : 'Crear'` (RF-4).
- `handleSubmit` no cambia: en creación hace `POST`, en edición `PUT` sobre el id existente (sin duplicar).

### RF-5 · Vista de Usuarios

- Se añaden a `src/styles/admin.css` **solo las clases que faltan**, con la paleta actual del panel:
  - Estructura: `.user-manager`, `.user-manager__header`, `.user-list`, `.user-list__item`, `.user-list__info`, `.user-list__actions`.
  - Acciones: `.admin-btn` (base), `.admin-btn--small`, `.admin-btn--danger`, `.admin-btn--ghost`.
  - Rol: `.user-role` y los modificadores `--admin`, `--editor`, `--reader`.
  - Formulario y errores: `.admin-form__title`, `.admin-form__actions`, `.admin-error` (con contraste legible, exige el RF-5).
- **No se modifica `UserManager.jsx`**: sus clases ya son correctas; el fallo es que no tenían CSS.

## Estructura de ficheros

### Frontend (`React/`) — 5 ficheros
```
src/pages/admin/
├── AdminFormacion.jsx     (título + botón Añadir + formulario plegable)
├── AdminExperiencia.jsx   (idem)
└── AdminProyectos.jsx     (idem)
src/styles/
└── admin.css              (añadir clases faltantes de UserManager + admin-view__header)
tests/
└── t14.test.js            (nuevo: tests de las correcciones)
```

> `UserManager.jsx`, `EmptyData.jsx` y `AdminMensajes.jsx` **no se tocan**.

## Pasos de implementación

1. **Tests primero**: crear `tests/t14.test.js`. Deben fallar todavía.
2. **`AdminFormacion.jsx`**: patrón completo (estado, handlers, JSX).
3. **`AdminExperiencia.jsx`**: mismo patrón.
4. **`AdminProyectos.jsx`**: mismo patrón.
5. **`admin.css`**: añadir las clases que faltan.
6. **Suite y build**: `npm test` y `npm run build` en verde.
7. **Validación manual**: con la BD vacía en cada sección de contenido, crear el primer registro; y revisar la vista Usuarios.

## Verificación

- `npm test` → todos pasan (los 122 existentes + los nuevos de `t14`).
- `npm run build` → sin errores.
- Prueba manual en navegador (usuario con permisos de administrador):
  - **BD vacía**: en Formación, Experiencia y Proyectos se ve el título, el mensaje de vacío y el botón "Añadir"; al pulsarlo aparece el formulario; crear un registro lo muestra en la lista.
  - **Con datos**: la lista se ve con sus botones Editar/Borrar; "Añadir" sigue visible.
  - **Editar**: el formulario se abre relleno y distingue "Actualizar" de "Crear"; cancelar no guarda nada.
  - **Cancelar**: los datos introducidos se descartan y el formulario se oculta.
  - **Usuarios**: nombre, email y rol separados; Editar/Eliminar como botones identificables; error visible si la carga falla.
  - **Solo lectura**: un usuario `reader` ve las listas sin botón "Añadir" ni "Editar".

## Criterios de finalización del plan

- Con la BD vacía se puede crear el primer registro en las tres secciones de contenido.
- El título de sección es visible con y sin datos.
- El botón "Añadir" alterna el formulario y "Cancelar" descarta lo introducido.
- Editar actualiza sin duplicar.
- La vista de Usuarios es legible y sus acciones se ven como botones.
- Ningún registro existente se pierde ni cambia.
- Tests y build correctos.
