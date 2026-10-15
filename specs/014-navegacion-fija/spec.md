# Spec — Navegación pública fija en la parte superior

## Contexto y objetivo

Petición directa de la persona usuaria:

> *La sección de navegación por los botones ha de tener una posición fija, sin importar el contenido que tenga. Se debe mantener arriba a la misma altura en todas las secciones. Debe seguir manteniéndose todo responsive para cualquier pantalla.*

Aclarado en clarificación: se refiere a la navegación **pública** —los botones Inicio, Formación, Experiencia, Proyectos y Contacto—, que debe quedar **en la parte superior, justo después de la cabecera**, y **pegada arriba al desplazarse**. El botón flotante de móvil se mantiene tal cual está.

> **Actualización por la spec 015**: el `<h1>` de la cabecera pasó a `sr-only`, así que la barra ya no queda bajo ningún título visible y **sube** hasta el borde inferior de la cabecera: `top` pasa de **131.19px** a **124px** (medido a 1600×900). El orden en el árbol sigue siendo cabecera → navegación → contenido, por lo que «después de la cabecera» sigue siendo cierto.

### La causa

No es un fallo de posicionamiento: es un fallo de estructura.

```css
.layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;   /* ← centra verticalmente */
  gap: var(--spacing-lg);
}
```

`NavButtons` **y** la sección activa son hijos de `layout__content`, así que se centran verticalmente **como grupo**. La altura a la que queda la navegación depende por tanto del alto de la sección: con una sección corta baja, con una alta sube. Es exactamente lo que se reporta.

```jsx
<Layout>
  {isMobile ? <FloatingButton /> + <BottomSheet /> : <NavButtons />}
  <ActiveSection />
</Layout>
```

Los dos hijos llegan juntos por `children` y `Layout` los mete dentro de `layout__content`.

---

## RF-1: La navegación pública ocupa siempre el mismo sitio, en la parte superior

**QUÉ**: `NavButtons` sale de `layout__content` y pasa a ser hijo directo de `.layout`, colocado **justo después del `Header`**. `Layout` recibe ese bloque por una propiedad nueva (`nav`) en lugar de por `children`, de modo que el orden quede fijo en el árbol y no dependa de la sección activa.

Para que además quede pegada al desplazarse, `.nav-buttons` pasa a `position: sticky; top: 0`, con fondo opaco y un `z-index` que la mantenga por encima del contenido.

**POR QUÉ**: al sacarla de `layout__content`, el centrado vertical deja de afectarla: solo queda la sección como hijo, que es la que debe centrarse. Y con `sticky` se consigue que permanezca visible al desplazarse.

**Decisión técnica: `sticky` en lugar de `fixed`.** Ambas la dejan pegada arriba, pero `fixed` la saca del flujo y obliga a compensar con un `padding-top` igual a su altura. Esa altura **no es constante**: `.nav-buttons` tiene `flex-wrap: wrap`, así que en pantallas estrechas ocupa dos o tres líneas y el valor compensador dejaría de cuadrar. `sticky` la mantiene en el flujo, no requiere compensación y se adapta solo al alto que ocupe en cada momento. Resultado visual equivalente, menos que mantener.

**Criterios de aceptación (EARS)**:

- **Cuando** se muestre cualquier sección pública, **el sistema deberá** colocar la navegación **en la parte superior, antes** del contenido de la sección.
- **Cuando** cambie la sección activa, **el sistema deberá** mantener la navegación a **la misma altura**: el alto de la sección no debe influir para nada en su posición.
- **Cuando** el contenido supere la altura de la ventana, **el sistema deberá** mantener la navegación visible pegada a la parte superior.
- **Cuando** el contenido no supere la altura de la ventana, **el sistema deberá** dejar la navegación en su sitio, sin desplazamientos ni saltos.
- **Cuando** la navegación pase por debajo de ella contenido que se desplace, **el sistema deberá** mostrarla sobre un fondo opaco, para que el texto no se le atraviese.
- **Cuando** la navegación ocupe más de una línea por ser la pantalla estrecha, **el sistema deberá** seguir funcionando sin que se solape con el contenido.
- **Cuando** la sección tenga poco contenido, **el sistema deberá** seguir centrando **solo la sección**, no la navegación junto con ella.

---

## RF-2: Se conserva el comportamiento responsive actual

**QUÉ**: nada de lo que ya funciona en pantallas estrechas cambia.

**POR QUÉ**: la petición pide explícitamente que el responsive **se siga manteniendo**. La spec 008 estableció el botón flotante con la hoja inferior para móvil, y esa decisión no se toca.

**Criterios de aceptación (EARS)**:

- **Cuando** la pantalla mida 768px o menos, **el sistema deberá** seguir mostrando el botón flotante y la hoja inferior, y **no** deberá mostrar la navegación en la parte superior.
- **Cuando** la pantalla mida más de 768px, **el sistema deberá** mostrar la navegación fija en la parte superior.
- **Cuando** se muestre la hoja inferior en móvil, **el sistema deberá** seguir mostrando dentro los mismos botones de siempre.
- **Cuando** se cargue la pantalla de login, **el sistema deberá** seguir sin mostrar la navegación, como ahora.

---

## Casos límite y decisiones tomadas

- **Fondo de la navegación**: `body` pinta un degradado `135deg` de `--color-bg-gradient-start` a `--color-bg-gradient-end`. Una navegación fija debe ser opaca o el contenido se le vería por detrás. Se usa **`--color-primary`**, que es el color del extremo inicial del degradado, con **un color ya existente de la paleta y sin introducir ninguno nuevo**. Al estar en la parte superior, en reposo coincide exactamente con el fondo; al desplazarse queda como banda sólida, que es el comportamiento habitual de una barra fija.
- **`z-index`**: se le asigna un valor por encima del contenido y **por debajo** de `.floating-button` (1000) y `.bottom-sheet` (999), que no se solapan con ella.
- **Alto variable**: al ser `sticky`, no hay ninguna medida fija que mantener. Si la navegación ocupa una o tres líneas, todo sigue cuadrando.
- **Centrado de la sección**: `.layout__content` conserva `justify-content: center`, pero ahora solo centra la sección activa. Es el comportamiento deseado.
- **La pantalla de login** no lleva navegación hoy y **no la gana**: `Layout` recibe `nav` como propiedad opcional.
- **El panel de administración no se toca en absoluto.** Su navegación es una barra lateral y no padece este problema.

---

## Fuera de alcance

- La barra lateral del panel de administración: queda para la spec **009**, reservada.
- La paleta de colores y la estética general: spec **009**. Los colores que se usan aquí son tokens ya existentes.
- El botón flotante y la hoja inferior de móvil: sin cambios.
- El contenido, el orden o el funcionamiento de las secciones.
- Navegación por URL o enlaces: los botones siguen cambiando de sección con `setActiveSection`, igual que ahora.

---

## Criterios de finalización

- La navegación aparece **en la parte superior** en todas las secciones públicas.
- Su altura en pantalla **no varía** con el alto del contenido de la sección.
- Al desplazarse por una sección larga, la navegación **permanece visible** arriba.
- El contenido no se le atraviesa: tiene fondo opaco.
- En móvil se sigue usando el botón flotante y la hoja inferior, sin navegación arriba.
- La pantalla de login no muestra navegación.
- El panel de administración queda idéntico.
- `npm test` y `npm run build` en verde y **sin tocar ningún test existente**, porque no cambia ninguna funcionalidad ya probada.
