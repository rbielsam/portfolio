# Plan — Favicon del portfolio (Spec 019)

## Alcance

- **2 ficheros nuevos**: `React/public/favicon.svg` y `React/tests/t22.test.js`.
- **1 fichero modificado**: `deploy/publicar.sh` (sincronizar el favicon).
- **Backend intacto**: 0 cambios.
- **Sin dependencias nuevas**.

## Stack confirmado

- Frontend: React 18 + Vite (en `React/`).
- Build: `npm run build` (copia `public/` a `dist/`).
- Despliegue: `deploy/publicar.sh`.
- Tests frontend: `npm test` → `node --test tests/*.test.js` (lectura estática de ficheros).

## Decisiones de implementación

### D1 — El favicon vive en `React/public/`

Vite copia `public/` a la raíz del `dist`, así que `React/public/favicon.svg` se convierte en `dist/favicon.svg` y se sirve en `/favicon.svg`. **No hay que tocar `index.html`**, que ya enlaza esa ruta.

### D2 — `publicar.sh` sube la raíz del `dist`, no solo `assets/`

El script hoy solo sube `dist/assets/` y `dist/index.html`. Se añade una línea para subir `dist/favicon.svg` a `Laravel/public/favicon.svg`.

### D3 — Estilo del favicon

Elegido por la persona usuaria: **A · Monograma «RB»**. Cuadrado redondeado de 64×64 con degradado `#1a3a5c → #0a1628` e iniciales `RB` en `#5ba3d9` (todos de `variables.css`).

## Estructura de ficheros

```
React/public/favicon.svg        (nuevo: el icono)
React/tests/t22.test.js         (nuevo: tests de la spec 019)
deploy/publicar.sh              (modificado: sincroniza el favicon)
```

> **No se modifica ningún test existente.**

## Tests existentes que leen esta zona

Ninguno lee el favicon hoy (solo `index.html` lo referencia). Se comprueba que las suites siguen en **234**.

## Pasos de implementación

1. Crear `React/public/favicon.svg` con el estilo elegido.
2. Modificar `deploy/publicar.sh` para subir `dist/favicon.svg`.
3. Crear `React/tests/t22.test.js`.
4. `npm test` y `npm run build` en verde; `php artisan test --compact` sigue en 105.
5. Publicar y comprobar en el navegador que `/favicon.svg` carga sin 404.

## Verificación

### Automática

- `npm test` → los 234 existentes + `t22`. Ningún test previo se modifica.
- `npm run build` → sin errores.
- `php artisan test --compact` → 105.

`t22` cubre (lectura estática):

- `React/public/favicon.svg` existe y es un SVG válido.
- `index.html` sigue enlazando `/favicon.svg`.
- `publicar.sh` sincroniza `favicon.svg`.

### Manual — en navegador

1. Abrir `https://rbielsam.es` y comprobar que la pestaña muestra el icono y que la consola no pide `/favicon.svg` con 404.
2. Abrir `https://rbielsam.es/favicon.svg` directamente: debe mostrarse el icono.

### Datos

**Esta spec no toca ningún dato.** No hay escrituras, por lo que no hace falta crear registros temporales ni comprobar recuentos.

## Criterios de finalización del plan

- `/favicon.svg` existe y carga sin 404 en local y en producción.
- El favicon usa la paleta del sitio.
- `publicar.sh` lo sube; las suites siguen en verde.
