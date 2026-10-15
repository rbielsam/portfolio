# Tareas — Página principal (Spec 001)

## Fase 1: Inicialización del proyecto

### T1.1: Crear estructura de carpetas ✅
Crear la estructura de carpetas del proyecto según el plan:
- `src/components/Layout/`
- `src/components/Navigation/`
- `src/components/Sections/`
- `src/hooks/`
- `src/context/`
- `src/styles/`
- `public/`

**Criterios de aceptación**:
- Todas las carpetas existen.
- La estructura coincide con el plan.

---

### T1.2: Inicializar proyecto con Vite + React ✅
Crear el proyecto base con Vite y React.

**Criterios de aceptación**:
- El proyecto compila sin errores.
- El servidor de desarrollo de Vite arranca correctamente.

---

### T1.3: Instalar dependencias ✅
Instalar las dependencias necesarias:
- `react`
- `react-dom`
- `react-router-dom`
- `vite`
- `@vitejs/plugin-react`

**Criterios de aceptación**:
- Todas las dependencias están instaladas.
- El proyecto compila sin errores.

---

### T1.4: Configurar Vite y React Router ✅
Configurar `vite.config.js` y el enrutador en `main.jsx`.

**Criterios de aceptación**:
- Vite está configurado con el plugin de React.
- React Router está configurado con la ruta principal (`/`).

---

## Fase 2: Estilos base

### T2.1: Crear variables CSS ✅
Definir la paleta de colores (azul marino y variantes) en `variables.css`.

**Criterios de aceptación**:
- Las variables de color están definidas.
- Los colores son coherentes con el diseño azul marino.

---

### T2.2: Crear estilos globales ✅
Definir estilos base en `global.css`: reset, tipografía, fondo con degradado.

**Criterios de aceptación**:
- El fondo azul marino con degradado se aplica a toda la página.
- Los estilos base no interfieren con los componentes.

---

## Fase 3: Layout

### T3.1: Crear componente Header ✅
Crear el componente `Header` con el título "Portfolio".

**Criterios de aceptación**:
- El título "Portfolio" es visible en la parte superior.
- El estilo es coherente con el diseño.

---

### T3.2: Crear componente Footer ✅
Crear el componente `Footer` con el título "Portfolio".

**Criterios de aceptación**:
- El título "Portfolio" es visible en la parte inferior.
- El estilo es coherente con el diseño.

---

### T3.3: Crear componente Layout ✅
Crear el componente `Layout` que envuelve Header, Navigation, zona de contenido y Footer.

**Criterios de aceptación**:
- El Layout renderiza todos los componentes en el orden correcto.
- La estructura es responsive.

---

## Fase 4: Estado y navegación

### T4.1: Crear SectionContext ✅
Crear el contexto para gestionar la sección activa.

**Criterios de aceptación**:
- El contexto permite establecer y obtener la sección activa.
- La sección por defecto es "Inicio".

---

### T4.2: Crear hook useMediaQuery ✅
Crear el hook para detectar el tamaño de la pantalla.

**Criterios de aceptación**:
- El hook devuelve `true` en pantallas pequeñas y `false` en pantallas grandes.
- El hook se actualiza cuando cambia el tamaño de la ventana.

---

### T4.3: Crear componente NavButtons ✅
Crear los cinco botones en horizontal con efecto hover.

**Criterios de aceptación**:
- Los cinco botones son visibles en horizontal.
- El efecto hover es un cambio de color o sombra suave.
- Al hacer clic, se actualiza la sección activa.

---

### T4.4: Crear componente FloatingButton ✅
Crear el botón flotante con icono hamburguesa.

**Criterios de aceptación**:
- El botón flotante es visible solo en pantallas pequeñas.
- Al hacer clic, despliega el panel deslizable.

---

### T4.5: Crear componente BottomSheet ✅
Crear el panel deslizable con los cinco botones.

**Criterios de aceptación**:
- El panel se despliega con animación suave.
- Al hacer clic en un botón, se actualiza la sección activa y se cierra el panel.
- Al hacer clic fuera del panel, este se cierra.

---

## Fase 5: Secciones

### T5.1: Crear sección Inicio ✅
Crear la sección Inicio con el título "Portfolio" y el círculo marco.

**Criterios de aceptación**:
- El título "Portfolio" es visible.
- El círculo marco es visible y centrado.
- Si no hay imagen, el círculo se muestra vacío o con placeholder.

---

### T5.2: Crear secciones placeholder ✅
Crear las secciones Formación, Experiencia, Proyectos y Login con el mensaje "en creación".

**Criterios de aceptación**:
- Cada sección muestra su nombre y el mensaje "en creación".
- El estilo es coherente con el diseño.

---

## Fase 6: Integración y pruebas

### T6.1: Integrar todos los componentes en App.jsx ✅
Conectar el Layout, la navegación y las secciones en el componente principal.

**Criterios de aceptación**:
- La página principal renderiza correctamente.
- La navegación entre secciones funciona.

---

### T6.2: Probar responsive ✅
Verificar el comportamiento en escritorio, tablet y móvil.

**Criterios de aceptación**:
- En escritorio, los botones se muestran en horizontal.
- En móvil, el botón flotante y el panel deslizable funcionan correctamente.
- Los títulos superior e inferior son visibles en todos los tamaños.

---

### T6.3: Probar navegación ✅
Verificar que al hacer clic en cada botón, la zona de contenido se actualiza correctamente.

**Criterios de aceptación**:
- Al hacer clic en "Inicio", se muestra la sección Inicio.
- Al hacer clic en cualquier otro botón, se muestra el mensaje "en creación".
- La sección Inicio se muestra por defecto al cargar la página.

---

## Criterios de finalización

- Todas las tareas completadas.
- La página principal funciona correctamente en escritorio y móvil.
- La navegación entre secciones funciona.
- El diseño es coherente con la spec aprobada.
- El código está limpio y sigue las convenciones del proyecto.
