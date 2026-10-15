# Tareas — Botón de volver en la pantalla de Login (Spec 007)

> Enfoque: tests primero, luego código. Frontend: `node --test tests/*.test.js`.

## Fase 1: Tests

### T1.1: Tests del botón de volver ✅
Crear `tests/t13.test.js` con las comprobaciones estáticas del botón.

**Criterios de aceptación**:
- El test comprueba que `src/pages/Login.jsx` define el botón con la clase `login__back`.
- El test comprueba que el botón tiene el nombre accesible "Volver al inicio".
- El test comprueba que el clic llama a `setActiveSection('Inicio')`.
- El test comprueba que el botón es de tipo `button` (no envía el formulario).
- El test comprueba que `src/styles/login.css` define los estilos de `.login__back`.
- Los tests fallan antes de implementar la funcionalidad.

---

## Fase 2: Implementación

### T2.1: Añadir el botón en `src/pages/Login.jsx` ✅
Primer elemento de la sección, usando `useSection()`.

**Criterios de aceptación**:
- El botón aparece al principio de la sección Login, alineado a la izquierda.
- El clic muestra la sección Inicio.
- El icono de flecha está oculto para lectores de pantalla y el botón tiene nombre accesible.
- El botón no envía el formulario ni altera los campos email/contraseña.
- No se importan dependencias nuevas.

---

### T2.2: Estilos del botón en `src/styles/login.css` ✅
Añadir `.login__back` con los tokens existentes.

**Criterios de aceptación**:
- El botón tiene tamaño táctil de 44×44 px.
- Muestra feedback visual al pasar el ratón y al recibir el foco.
- El icono tiene contraste suficiente sobre el fondo azul marino.
- El botón no se solapa con el título "Iniciar sesión" ni con el formulario.
- Funciona igual en escritorio y móvil (sin scroll horizontal).

---

## Fase 3: Validación

### T3.1: Prueba manual en navegador ✅
Comprobar el comportamiento real en escritorio y móvil.

**Criterios de aceptación**:
- Escritorio (1280px): el botón está arriba a la izquierda y el clic lleva a Inicio.
- Móvil (375px): el botón es cómodo de tocar y no solapa nada.
- Teclado: Tab alcanza el botón, el foco es visible y Enter lleva a Inicio.
- Rellenando el formulario y pulsando el botón, no se envía ni aparece error.

---

### T3.2: Tests finales y build ✅
Ejecutar toda la suite y el build.

**Criterios de aceptación**:
- `npm test` pasa (tests existentes + `t13`).
- `npm run build` no falla.

---

## Criterios de finalización

- Todas las tareas completadas.
- El botón de volver funciona en Login en escritorio, tablet y móvil.
- El formulario de Login no se ve afectado por el botón.
- El área de administración y las secciones públicas quedan sin cambios.
- Tests y build correctos.
