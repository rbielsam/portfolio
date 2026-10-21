# Spec — La hoja inferior móvil se cierra al navegar y al conmutar

## Contexto y objetivo

Reporte de la persona usuaria al revisar la vista móvil:

> El menú que despliega las opciones no se cierra al escoger una opción, ni tampoco al volver a tocar en el botón de menú.

En móvil la navegación se muestra como un **botón flotante** (☰) que abre una **hoja inferior** con las opciones. Hoy:

- Al **elegir una opción**, la hoja se queda abierta.
- Al **pulsar el botón otra vez**, la hoja tampoco se cierra.

**Objetivo**: que la hoja se cierre al elegir una opción y que el botón actúe como conmutador (abrir/cerrar).

## La causa

En `React/src/App.jsx`:

```jsx
<FloatingButton onClick={() => setIsSheetOpen(true)} />          // ← siempre abre, nunca cierra
<BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
  <NavButtons />                                                 // ← no cierra la hoja
</BottomSheet>
```

1. El botón fija `isSheetOpen` a `true` siempre, así que repetirlo no cierra la hoja.
2. Los botones de `NavButtons` llaman a `setActiveSection`, pero nadie llama a `setIsSheetOpen(false)`. Además, el panel de `BottomSheet` hace `stopPropagation`, así que el `onClose` del fondo no se dispara al pulsar dentro.

## RF-1: Elegir una opción cierra la hoja

**QUÉ**: al pulsar cualquier opción de la hoja inferior, esta se cierra.

**POR QUÉ**: es lo que espera quien usa el menú móvil; quedarse abierta tapa la sección recién elegida.

**Criterios de aceptación (EARS)**:

- **Cuando** se pulse una opción de la hoja inferior, **el sistema deberá** cerrarla.

## RF-2: El botón conmuta la hoja

**QUÉ**: pulsar el botón flotante alterna entre abrir y cerrar.

**Criterios de aceptación (EARS)**:

- **Cuando** la hoja esté cerrada y se pulse el botón, **el sistema deberá** abrirla.
- **Cuando** la hoja esté abierta y se pulse el botón, **el sistema deberá** cerrarla.

## RF-3: Se conserva lo que ya funciona

**QUÉ**: nada más cambia.

**Criterios de aceptación (EARS)**:

- **Cuando** se pulse el fondo de la hoja, **el sistema deberá** cerrarla (como hoy).
- **Cuando** se pulse dentro del panel sin ser una opción, **el sistema deberá** no cerrarla.
- **Cuando** la pantalla mida más de 768px, **el sistema deberá** seguir mostrando la navegación superior y no el botón flotante.
- **Cuando** se elija la opción Login, **el sistema deberá** seguir llevando a la pantalla de login.

## Fuera de alcance

- El estilo visual de la hoja ni del botón flotante.
- La navegación de escritorio.
- El panel de administración.
- La hoja del menú de idioma (spec aparte).

## Criterios de finalización

- Al elegir una opción, la hoja se cierra.
- El botón abre y cierra (conmuta).
- El fondo sigue cerrando la hoja; el interior no.
- En pantalla ancha no hay botón flotante.
- Las suites siguen en verde.
