# Spec — Favicon del portfolio

## Contexto y objetivo

`React/index.html` enlaza el icono de la pestaña:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

El fichero **no existe**: `React/public/` está vacío y el build no lo genera. Al verificar el despliegue (spec 017) se vio en la consola del navegador:

```
GET https://rbielsam.es/favicon.svg -> 404
```

La pestaña del navegador queda sin icono.

**Objetivo**: dar al portfolio un favicon propio, acorde a su paleta, que se sirva sin errores y que llegue a producción.

## Usuarios

- **Visitante**: quien abre el portfolio; ve el icono en la pestaña del navegador.

## Requisitos funcionales

### RF-1: El favicon existe y se sirve

**QUÉ**: crear `React/public/favicon.svg`. Vite copia `public/` a la raíz del `dist`, de modo que se sirve en `/favicon.svg`.

**POR QUÉ**: sin el fichero, el navegador recibe un 404 y la pestaña no tiene icono.

**Criterios de aceptación (EARS)**:

- **Cuando** el navegador cargue el portfolio, **el sistema deberá** servir `/favicon.svg` con un 200 y sin error en consola.
- **Cuando** se mire la pestaña del navegador, **el sistema deberá** mostrar un icono.

### RF-2: El favicon llega a producción

**QUÉ**: `deploy/publicar.sh` solo sincroniza `dist/assets/` y `dist/index.html`; el favicon vive en la raíz del `dist`. Hay que añadirlo al script.

**POR QUÉ**: aunque el fichero exista en local, sin esta línea no se subiría al servidor.

**Criterios de aceptación (EARS)**:

- **Cuando** se ejecute `publicar.sh`, **el sistema deberá** copiar `favicon.svg` a `Laravel/public/` del servidor.
- **Cuando** se acceda a `https://rbielsam.es/favicon.svg`, **el sistema deberá** servirlo con un 200.

### RF-3: Representa la marca

**QUÉ**: usar la paleta de `variables.css` (sin añadir colores nuevos) y la identidad del portfolio.

**Criterios de aceptación (EARS)**:

- **Cuando** se vea el favicon, **el sistema deberá** usar colores de la paleta existente.

## Opciones de estilo (decidido: A)

Elegido por la persona usuaria: **A · Monograma «RB»** (cuadrado redondeado con el degradado de la paleta y las iniciales en el color de acento).

| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| **A. Monograma «RB»** *(recomendada)* | Cuadrado redondeado con el degradado de la paleta y las iniciales en el acento | Legible a 16px, no depende de la foto, profesional | Genérico |
| **B. Marca geométrica** | Símbolo abstracto (p. ej. `</>`, una ola, un rombo) en los colores de la marca | Original, limpio | Menos personal |
| **C. Foto recortada** | La foto de perfil en cuadrado, con el anillo del avatar | Muy personal | Una cara a 16px se convierte en un borrón |
| **D. Inicial única «R»** | Círculo con la «R» en el acento | Muy simple | Menos identificativo |

## Casos límite

- **Legibilidad**: debe leerse a 16×16 y a 32×32.
- **Navegadores antiguos**: solo entienden `.ico`. Hoy solo se enlaza SVG; añadir `.ico` no es necesario para los navegadores actuales.

## Fuera de alcance

- Cambiar la paleta ni la tipografía del sitio.
- Favicons distintos por sección ni animaciones.
- Cualquier cambio de funcionalidad (solo el icono).

## Dudas abiertas

Ninguna. Estilo elegido: **A · Monograma «RB»**.

## Criterios de finalización

- `/favicon.svg` existe y se sirve sin 404, en local y en `https://rbielsam.es`.
- El favicon usa la paleta del sitio.
- `publicar.sh` lo sube; las suites siguen en verde.
