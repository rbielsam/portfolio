# Tareas — Unificación de la estética y responsive del panel de administración (Spec 009)

Estado: **completadas y validadas**

> Esta spec no toca el backend, los datos ni la lógica de ningún componente. Solo presentación y posicionamiento.

## Fase 1: Tests

### T1.1 `tests/t19.test.js` — completada

Fichero nuevo, **16 pruebas** escritas antes del código. Estaban **15 en rojo** al crearse (T19.16 se añadió después, por el bug de la fase 5).

Cubre RF-1 a RF-5: tokens `--admin-*`, ausencia de hex, reescritura de tokens en `.admin`, reorganización de `contact.css`, `useMediaQuery`, `BottomSheet` con `children`, `@media` de 768px, `flex-wrap` de las listas.

### T1.2 `tests/t4.5.test.js` — completada (modificación aceptada)

| Prueba | Cambio |
|---|---|
| `T4.5` «BottomSheet renderiza los botones de navegación» | → «BottomSheet renderiza sus hijos»: de exigir `NavButtons` a exigir `children` |

Las otras dos pruebas del fichero (existe · `export default`) no se tocaron.

### T1.3 `tests/t18.test.js` — completada (modificación no prevista)

| Prueba | Cambio |
|---|---|
| `T18.5` (spec 014) | Su asunción era contar las apariciones de `<NavButtons` en `App.jsx` e igualar a 1. Tras 009 hay **dos**: la prop `nav` de `Layout` y el hijo de `BottomSheet` |

**Desviación del plan**, que decía «ningún otro test existente se modifica». La prueba se afina para que diga lo que de verdad importa: `NavButtons` aparece **una sola vez fuera de la hoja**, y esa vez es la prop `nav`. El contrato de la spec 014 se mantiene intacto.

## Fase 2: Tokens

### T2.1 `src/styles/variables.css` — completada

- **23 tokens `--admin-*`** (la tabla del plan preveía 20).
- `--color-danger: #e74c3c`, con el valor que `.error-message__text` ya usaba.
- Ningún token existente modificado.

**Tres tokens añadidos sobre el plan**, porque la suya no enumeraba tres valores que solo aparecen en `photo-uploader.css` y en el hover fantasma:

| Token | Valor | Dónde |
|---|---|---|
| `--admin-surface-sunk` | `#e8e8e8` | fondo del `__preview` circular |
| `--admin-surface-hover` | `#ecf0f1` | hover de `.admin-btn--ghost` |
| `--admin-neutral-hover` | `#95a5a6` | hover del botón fantasma del uploader |

### T2.2 `src/styles/admin.css` — completada · 16 hex → 0

### T2.3 `src/styles/photo-uploader.css` — completada · 14 hex → 0

`color: #fff` pasó a la palabra clave `white`, igual que ya hacía `admin.css`.

## Fase 3: Componentes compartidos entre temas

### T3.1 `src/styles/states.css` — completada

`.error-message__text` → `var(--color-danger)` · `.error-message__button` → `var(--color-accent)`.
`.loading` y `.empty-data` no se tocaron: ya leían `var(--color-text-muted)`.

**Efecto real en la web pública**: solo cambia el **botón** (`#3498db` → `#5ba3d9`). El texto `#e74c3c` conserva su valor exacto. Aceptado por la persona usuaria.

### T3.2 `src/styles/admin.css` — completada

Bloque de reescritura al inicio de `.admin`: `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`, `--color-danger`. Sin duplicar ninguna regla.

## Fase 4: Reorganización

### T4.1 `contact.css` → `admin.css` — completada

Diez reglas movidas (líneas 99–164) y tokenizadas. `contact.css` pasa de 164 a **97 líneas** y contiene **cero** referencias al panel.

## Fase 5: Navegación responsive

### T5.1 `BottomSheet.jsx` · T5.2 `App.jsx` · T5.3 `AdminLayout.jsx` — completadas

Menú único en la constante `menuItems`; `selectView` cambia de vista y cierra la hoja.

### T5.4 · T5.5 `admin.css` — completadas

`.admin__topbar` con `display: none` en escritorio, `.admin__topbar-title`, `.admin__menu-button`, `.admin__nav--sheet` y el `@media (max-width: 768px)`.

### 🔴 Bug encontrado en la validación (no previsto)

Mi primera versión ocultaba `.admin__nav` a secas dentro del `@media`. Como la hoja inferior **reutiliza esa misma clase**, el menú desaparecía también allí: el panel abría con **64px de alto y los 8 botones a altura 0**.

Lo destapó **medir**, no mirar: la captura parecía un panel oscuro liso.

Corregido acotando el selector a **`.admin > .admin__nav`** (solo el hijo directo, que es la barra lateral). Prueba de regresión **`T19.16`**.

## Fase 6: Arreglos a 375px

### T6.1 `admin.css` — completada

`flex-wrap: wrap` en `.admin-list__item` y `.admin-messages__actions`; `.admin__content` a `padding: 1rem` en móvil.

## Fase 7: Validación

### T7.1 Suites automáticas — completada

| Suite | Resultado |
|---|---|
| `npm test` | **206 / 206** (190 previos + 16 nuevos) |
| `npm run build` | ✅ |
| `php artisan test --compact` | **105 / 105** |
| Hex en `admin.css` / `photo-uploader.css` | **0 / 0** |

**Tests existentes modificados: 2** — `T4.5` (previsto y aceptado) y `T18.5` (no previsto, documentado arriba).

### T7.2 Comprobación en navegador — completada

**1 · Escritorio 1600×900** — barra lateral `display: flex` · `200px` · `rgb(44,62,80)` · fondo `rgb(245,245,245)`. **Idéntico al original.**

**2 · Contraste ≥ 4,5 : 1** — medido con `getComputedStyle` sobre el valor real devuelto por el navegador:

| | Color | Contraste |
|---|---|---|
| Antes | `#b8c5d3` sobre `#f5f5f5` | **1,61 : 1** |
| Intermedio | `#7f8c8d` | 3,19 : 1 ❌ |
| **Ahora** | `rgb(95,107,112)` | **5,04 : 1** ✅ |
| Sobre tarjeta blanca | | 5,49 : 1 ✅ |

**3 · Tablet y móvil** — a 768px: barra lateral **ausente**, `.admin__topbar` en `flex` con `rgb(44,62,80)`. La hoja abre con los **8 accesos**; al pulsar «Mensajes» **se cierra y cambia de vista** a la vez (badge «1 sin leer» visible). Tras el arreglo del bug: panel de **521px**, `display: flex`, **8 botones visibles**, cabe en pantalla.

**4 · Sin desplazamiento horizontal a 375px** — las **seis** vistas: `scrollWidth` = `innerWidth` = **375**. Captura de Formación: la tarjeta con «CFGS Desarrollo de Aplicaciones Web · IES Manuel Vázquez Montalbán» convive con **Editar** y **Borrar** sin estrujarse.

**5 · Permisos** — **no se hizo en vivo**: habría exigido crear o reescribir un usuario. Verificado por construcción: `T19.11` comprueba que los botones base son **exactamente 3**, es decir, `menuItems` existe **una sola vez** y el `filter` de `can('users')` se aplica a la misma constante que se pinta en la barra lateral y en la hoja. No puede desincronizarse. El lado del servidor lo cubren `CheckRoleMiddlewareTest` y `AdminUserTest`.

**6 · Web pública** — sin cambios **por construcción**: `states.css` sigue leyendo `var(--color-text-muted)`, cuyo valor `#b8c5d3` no se tocó; el fondo tampoco. Comprobado en vivo: `empty-data` → `rgb(184,197,211)`. La regla `.error-message__button` apunta ya a `var(--color-accent)`.

**7 · Login** intacto · consola sin errores nuevos.

### T7.3 Datos — completada

**Sin escrituras.** Recuento por lectura de la API: **1 formación** («CFGS Desarrollo de Aplicaciones Web») · **1 experiencia** («Acceleralia S.L.») · **0 proyectos** · **2 usuarios** (admin + editor) · **1 mensaje**. Sesión cerrada; `localStorage` y `sessionStorage` en **0** claves.

## Cambios sobre lo aprobado

| # | Cambio | Motivo | ¿Aceptado? |
|---|---|---|---|
| 1 | `--admin-text-muted`: `#7f8c8d` → **`#5f6b70`** | El plan prometía «sin cambios visuales» y la spec exigía «≥ 4,5 : 1». Medido: `#7f8c8d` daba **3,19**. Imposible cumplir las dos | ✅ **Opción A** elegida explícitamente |
| 2 | Tres tokens añadidos (`surface-sunk`, `surface-hover`, `neutral-hover`) | La tabla del plan no enumeraba tres valores reales | ✅ Implícito en la aprobación |
| 3 | `T18.5` de la 014 afinado | Su asunción de «exactamente 1 `<NavButtons`» se rompía legítimamente | Documentado en T1.3 |

**Consecuencia del cambio 1**: el texto secundario del panel (timestamps, correo de listas, placeholders, fantasma) se oscurece ligeramente. Es la única alteración visual del panel, y es precisamente lo que pedía la spec.

## Pendiente

- [x] T1.1
- [x] T1.2
- [x] T1.3
- [x] T2.1
- [x] T2.2
- [x] T2.3
- [x] T3.1
- [x] T3.2
- [x] T4.1
- [x] T5.1
- [x] T5.2
- [x] T5.3
- [x] T5.4
- [x] T5.5
- [x] T6.1
- [x] T7.1
- [x] T7.2
- [x] T7.3

## Cierre

**Decisión pendiente resuelta**: el tono del texto secundario. El plan decía que el panel se vería idéntico; la spec exigía 4,5 : 1; medido daba 3,19. Se eligió **oscurecer `--admin-text-muted` a `#5f6b70`** → **5,04 : 1**. La paleta conserva su carácter pizarra.

**Observación fuera de alcance**: `.contact__error` (web pública) aún usa `#e74c3c`, valor idéntico al recién creado `--color-danger`. No se ha tocado: RF-1 solo cubre `admin.css` y `photo-uploader.css`. Candidata para una spec futura.
