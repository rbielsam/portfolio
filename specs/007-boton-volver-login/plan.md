# Plan — Botón de volver en la pantalla de Login (Spec 007)

## Alcance

Funcionalidad **100% frontend**: un botón con icono de flecha hacia atrás en la esquina superior izquierda de la pantalla de Login que, al hacer clic, muestra la sección Inicio.

- **No toca backend**: sin endpoints, sin base de datos, sin migraciones.
- **No toca la autenticación**: el botón solo cambia la sección visible.
- **No toca el área de administración** (ya tiene "Ver portfolio").

## Stack confirmado

- **Frontend**: React 18 + JavaScript + CSS3 puro + Vite (en `React/`)
- **Navegación entre secciones**: `SectionContext` (`useSection()` → `activeSection` / `setActiveSection`), el mismo mecanismo que usan los botones de navegación
- **Estilos**: tokens de `src/styles/variables.css` (paleta azul marino existente)
- **Tests frontend**: `node --test tests/*.test.js` (lectura estática de ficheros)

## Decisiones de implementación

- **El botón vive en `src/pages/Login.jsx`**, no en un componente nuevo. La spec limita el botón a una sola pantalla; crear un componente reutilizable añadiría complejidad sin uso (Simplicidad primero).
- **Posición**: primer elemento dentro de `.login`, alineado a la izquierda de la columna (`.login` es flex columna). Queda en la esquina superior izquierda del área de contenido **sin posicionamiento absoluto**, con lo que no puede solapar el título ni el formulario en ningún tamaño de pantalla.
- **Icono**: carácter `←` en un `<span aria-hidden="true">` dentro del botón. Sin librerías de iconos ni SVG externos (fuera de alcance: añadir dependencias).
- **Nombre accesible**: `aria-label="Volver al inicio"` en el botón (RF-3).
- **Acción**: `onClick={() => setActiveSection('Inicio')}` con `type="button"` (importante: dentro de un `<form>`, sin `type` enviaría el formulario y rompería el RF-2).
- **Tamaño táctil**: 44×44 px, cómodo para el dedo en móvil.
- **Estética**: círculo con borde `--color-border` y fondo translúcido, coherente con los inputs; hover con borde azul de acento y fondo más claro; foco visible `:focus-visible`.

## Estructura de ficheros

### Frontend (`React/`) — solo 3 ficheros
```
src/
├── pages/Login.jsx          (añadir botón + useSection)
└── styles/login.css         (añadir estilos .login__back)
tests/
└── t13.test.js              (nuevo: tests del botón de volver)
```

> `src/styles/login.css` ya está importado en `App.jsx` (se añadió en el pulido anterior); no hay que tocar `App.jsx`.

## Pasos de implementación

1. **Tests primero**: crear `tests/t13.test.js` (nombre accesible, `setActiveSection('Inicio')`, clase `login__back`, estilos presentes). Deben fallar todavía.
2. **JSX**: añadir el botón de volver al principio de la sección en `src/pages/Login.jsx`, importando `useSection`.
3. **Estilos**: añadir `.login__back` (tamaño táctil, hover, foco visible) a `src/styles/login.css`.
4. **Suite y build**: `npm test` y `npm run build` en verde.
5. **Validación manual**: comprobar en navegador escritorio y móvil (clic → Inicio, teclado Tab+Enter, sin solapes).

## Verificación

- `npm test` → todos los tests pasan (los 116 existentes + los nuevos de `t13`).
- `npm run build` → sin errores.
- Prueba manual en navegador:
  - Escritorio (1280px): botón visible arriba a la izquierda, clic → Inicio.
  - Móvil (375px): botón visible, cómodo de tocar, no solapa título ni formulario, sin scroll horizontal.
  - Teclado: Tab alcanza el botón, foco visible, Enter lleva a Inicio.
  - Rellenar email/contraseña y pulsar el botón → **no** se envía el formulario ni aparece error de credenciales.

## Criterios de finalización del plan

- Botón de flecha visible en Login en escritorio, tablet y móvil.
- Clic y Enter llevan a la sección Inicio.
- El formulario no se envía ni se altera al usar el botón.
- Nombre accesible, foco visual y feedback hover implementados.
- Secciones públicas y área de administración sin cambios.
- Tests y build correctos.
