# Plan — La hoja inferior móvil se cierra al navegar (Spec 020)

## Alcance

- **2 ficheros modificados**: `React/src/App.jsx` y `React/src/components/Navigation/NavButtons.jsx`.
- **1 test nuevo**: `React/tests/t23.test.js`.
- **Backend intacto**: 0 cambios.
- **Sin dependencias nuevas**.

## Stack confirmado

- Frontend: React 18 + JavaScript + CSS3 + Vite (en `React/`).
- Tests frontend: `npm test` → `node --test tests/*.test.js` (lectura estática de ficheros).
- `php artisan test --compact` solo como comprobación de no-regresión (debe seguir en **105**).

## Decisiones de implementación

### D1 — El botón conmuta

```jsx
<FloatingButton onClick={() => setIsSheetOpen((open) => !open)} />
```

Hoy fija `true` siempre; con el callback de estado alterna entre abrir y cerrar.

### D2 — Cerrar al navegar

`NavButtons` acepta una propiedad opcional `onNavigate` que se ejecuta **después** de `setActiveSection`:

```jsx
const go = (id) => {
  setActiveSection(id)
  onNavigate?.()
}
```

Y en la hoja:

```jsx
<BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
  <NavButtons onNavigate={() => setIsSheetOpen(false)} />
</BottomSheet>
```

La navegación de escritorio no pasa `onNavigate`, así que **no cambia**.

## Estructura de ficheros

```
src/App.jsx                                (modificado: botón conmutador + onNavigate en la hoja)
src/components/Navigation/NavButtons.jsx  (modificado: prop onNavigate opcional)
tests/t23.test.js                          (nuevo)
```

> **No se modifica ningún test existente.**

## Tests existentes que leen esta zona

Verificado que **siguen en verde sin tocarlos**:

| Test | Qué exige | ¿Se cumple? |
|---|---|---|
| `t6.1` / `t18.6` | `App.jsx` contiene `FloatingButton`, `BottomSheet` e `isMobile` | ✅ Se mantienen |
| `t18.5` | `NavButtons` va dentro de `BottomSheet` | ✅ Se mantiene |
| `t4.3` / `t4.5` / `t18.4` | Contenido de `NavButtons.jsx` | ✅ Se añade una prop, no se toca lo existente |
| `t6.2` | Algún CSS tiene `nav-buttons` | ✅ `navigation.css` |

## Pasos de implementación

1. `NavButtons.jsx`: prop `onNavigate` opcional.
2. `App.jsx`: botón conmutador y `onNavigate` en la hoja.
3. `tests/t23.test.js`.
4. Suites en verde.

## Verificación

### Automática

- `npm test` → los 234 existentes + `t23`. Ningún test previo se modifica.
- `npm run build` → sin errores.
- `php artisan test --compact` → 105.

`t23` cubre (lectura estática):

- `App.jsx`: el botón usa `setIsSheetOpen` con conmutación (`!` o equivalente).
- `App.jsx`: la hoja pasa `onNavigate` a `NavButtons`.
- `NavButtons`: acepta `onNavigate` y lo ejecuta tras `setActiveSection`.

### Manual — en navegador, móvil

Con la ventana a **375×812**:

1. Pulsar el botón flotante → la hoja **abre**.
2. Elegir una opción → la hoja **se cierra** y cambia la sección.
3. Pulsar el botón otra vez → la hoja **abre**.
4. Pulsar el fondo → la hoja **se cierra**.
5. Pulsar dentro del panel (sin ser una opción) → la hoja **no se cierra**.
6. Pasar a pantalla ancha (>768px) → aparece la navegación superior y **desaparece** el botón flotante.

### Datos

**Esta spec no toca ningún dato.**

## Criterios de finalización del plan

- Elegir una opción cierra la hoja.
- El botón abre y cierra (conmuta).
- El fondo sigue cerrando la hoja; el interior no.
- En pantalla ancha no hay botón flotante.
- Las suites siguen en verde.
