# Tareas — Corrección de bugs en el panel de administración (Spec 008)

> Enfoque: tests primero, luego código. Frontend: `node --test tests/*.test.js`.

## Fase 1: Tests

### ✅ T1.1: Tests de las correcciones del panel
Crear `tests/t14.test.js` con las comprobaciones estáticas.

**Criterios de aceptación**:
- Comprueba que `AdminFormacion`, `AdminExperiencia` y `AdminProyectos` ya no usan el retorno anticipado que ocultaba el formulario.
- Comprueba que las tres vistas muestran el botón de añadir.
- Comprueba que las tres vistas distinguen creación y actualización.
- Comprueba que las tres vistas ofrecen cancelar.
- Comprueba que las clases de `UserManager` existen en `admin.css`.
- Los tests fallan antes de implementar la corrección.

---

## Fase 2: Secciones de contenido

### ✅ T2.1: Corregir `AdminFormacion.jsx`
Título siempre visible, botón "Añadir" y formulario plegable.

**Criterios de aceptación**:
- El título "Formación" se muestra con y sin datos.
- Sin datos se ven el mensaje de vacío y el botón "Añadir".
- El botón "Añadir" muestra el formulario vacío en modo creación.
- "Editar" abre el mismo formulario relleno en modo actualización.
- "Cancelar" descarta lo introducido y oculta el formulario.
- El formulario solo se muestra para quien tenga permisos de edición.

---

### ✅ T2.2: Corregir `AdminExperiencia.jsx`
Mismo patrón que la T2.1.

**Criterios de aceptación**:
- Igual que la T2.1, aplicado a Experiencia.
- Se conservan los campos propios (puesto, empresa, fechas, actual).

---

### ✅ T2.3: Corregir `AdminProyectos.jsx`
Mismo patrón que la T2.1.

**Criterios de aceptación**:
- Igual que la T2.1, aplicado a Proyectos.
- Se conservan los campos propios (título, descripción, URL, fecha).

---

## Fase 3: Vista de Usuarios

### ✅ T3.1: Añadir los estilos que faltan en `admin.css`
Clases de `UserManager`, acciones y mensajes de error.

**Criterios de aceptación**:
- Cada usuario se muestra como una entrada diferenciada, con nombre, email y rol separados.
- "Crear usuario" se ve como un control claramente identificable.
- "Editar" y "Eliminar" se ven como botones separados entre sí.
- El rol se muestra de forma diferenciable.
- Los mensajes de error son visibles y distinguibles del contenido.
- No se modifica la paleta actual del panel.

---

## Fase 4: Validación

### ✅ T4.1: Prueba manual con la base de datos vacía
Comprobar el caso que estaba roto en las tres secciones de contenido.

**Criterios de aceptación**:
- En cada sección se ve el título, el mensaje de vacío y el botón "Añadir".
- Al pulsar "Añadir" aparece el formulario y permite crear el primer registro.
- El registro creado aparece en la lista.
- Un usuario sin permisos de edición no ve el botón "Añadir".

---

### ✅ T4.2: Prueba manual de edición, cancelación y Usuarios
Comprobar el resto de comportamientos afectados.

**Criterios de aceptación**:
- "Editar" abre el formulario relleno y distingue "Actualizar" de "Crear".
- Editar un registro lo actualiza sin duplicarlo.
- "Cancelar" cierra el formulario y no guarda nada.
- La lista de Usuarios es legible y sus acciones se ven como botones.
- No se pierden ni cambian registros existentes.

---

### ✅ T4.3: Tests finales y build
Ejecutar toda la suite y el build.

**Criterios de aceptación**:
- `npm test` pasa (tests existentes + `t14`).
- `npm run build` no falla.

---

## Criterios de finalización

- Todas las tareas completadas.
- Se puede crear el primer registro con la base de datos vacía en Formación, Experiencia y Proyectos.
- El título de sección es visible con y sin datos.
- El formulario de creación y edición se muestra y se oculta con su botón, y se puede cancelar.
- La vista de Usuarios es legible y sus acciones se ven como botones.
- Ningún registro existente se pierde ni cambia.
- Tests y build correctos.
