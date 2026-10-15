# Plan — Página principal (Spec 001)

## Stack confirmado

- **Frontend**: React 18 + JavaScript
- **Bundler**: Vite
- **Enrutador**: React Router
- **Estilos**: CSS3 puro (sin librerías de componentes)
- **Backend** (futuro, fuera de esta spec): Laravel + PHP

## Estructura del proyecto

```
portfolio/
├── React/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── Navigation/
│   │   │   │   ├── NavButtons.jsx
│   │   │   │   ├── FloatingButton.jsx
│   │   │   │   └── BottomSheet.jsx
│   │   │   └── Sections/
│   │   │       ├── Inicio.jsx
│   │   │       ├── Formacion.jsx
│   │   │       ├── Experiencia.jsx
│   │   │       ├── Proyectos.jsx
│   │   │       └── Login.jsx
│   │   ├── hooks/
│   │   │   └── useMediaQuery.js
│   │   ├── context/
│   │   │   └── SectionContext.jsx
│   │   └── styles/
│   │       ├── global.css
│   │       ├── variables.css
│   │       ├── layout.css
│   │       ├── navigation.css
│   │       └── sections.css
│   ├── public/
│   │   └── favicon.svg
│   └── tests/
├── Laravel/
├── docs/
├── specs/
├── AGENTS.md
└── MEMORY.md
```

## Decisiones de arquitectura

### Enrutamiento

Se usará React Router con una ruta principal (`/`) que renderice el `Layout` con la navegación y un área de contenido dinámica. Las secciones se mostrarán según el estado de la sección activa, no como rutas independientes (ya que el contenido se carga en la misma página).

### Estado de la sección activa

Se usará React Context (`SectionContext`) para gestionar qué sección está activa. Esto permite que los botones de navegación actualicen la zona de contenido sin necesidad de pasar props manualmente.

### Navegación responsive

Se usará un hook `useMediaQuery` para detectar el tamaño de la pantalla. En pantallas grandes se muestran los botones en horizontal; en pantallas pequeñas se muestra el botón flotante con panel deslizable.

### Estilos

Se usará CSS3 puro con variables CSS para gestionar la paleta de colores (azul marino y variantes). Los efectos hover se implementarán con transiciones CSS suaves.

## Componentes principales

### Layout

- `Header`: título "Portfolio" en la parte superior.
- `Footer`: título "Portfolio" en la parte inferior.
- `Layout`: envuelve Header, Navigation, zona de contenido y Footer.

### Navigation

- `NavButtons`: cinco botones en horizontal (Inicio, Formación, Experiencia, Proyectos, Login) con efecto hover.
- `FloatingButton`: botón flotante con icono hamburguesa, visible solo en pantallas pequeñas.
- `BottomSheet`: panel deslizable con los cinco botones, visible solo en pantallas pequeñas.

### Sections

- `Inicio`: título "Portfolio" y círculo marco para la foto.
- `Formacion`, `Experiencia`, `Proyectos`, `Login`: muestran un mensaje "en creación".

## Pasos de implementación

1. **Inicializar proyecto**: crear estructura de carpetas y archivos base con Vite + React.
2. **Configurar Vite y React Router**: instalar dependencias y configurar el enrutador.
3. **Crear variables CSS y estilos base**: definir la paleta de colores y estilos globales.
4. **Implementar Layout**: Header, Footer y estructura principal.
5. **Implementar SectionContext**: gestionar el estado de la sección activa.
6. **Implementar NavButtons**: botones en horizontal con efecto hover.
7. **Implementar FloatingButton y BottomSheet**: navegación responsive para móvil.
8. **Implementar sección Inicio**: título y círculo marco.
9. **Implementar secciones placeholder**: Formación, Experiencia, Proyectos, Login con mensaje "en creación".
10. **Probar responsive**: verificar comportamiento en escritorio, tablet y móvil.

## Dependencias

- `react`
- `react-dom`
- `react-router-dom`
- `vite`
- `@vitejs/plugin-react`

## Criterios de finalización del plan

- Estructura del proyecto creada y funcional.
- Navegación entre secciones funciona correctamente.
- Diseño responsive verificado en múltiples tamaños de pantalla.
- Efectos hover y transiciones suaves.
- Código limpio y mantenible, siguiendo las convenciones del proyecto.
