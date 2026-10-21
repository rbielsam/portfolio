# Tareas — La hoja inferior móvil se cierra al navegar (Spec 020)

Estado: **COMPLETADA**.

### T1.1 `NavButtons` acepta `onNavigate`

✅ Propiedad opcional `onNavigate`; los botones llaman a `go(id)`, que ejecuta `setActiveSection(id)` y después `onNavigate()`.

### T1.2 `App.jsx`: botón conmutador y cierre al navegar

✅ `onClick={() => setIsSheetOpen((open) => !open)}` y `<NavButtons onNavigate={() => setIsSheetOpen(false)} />` dentro de la hoja.

### T1.3 Crear `React/tests/t23.test.js`

✅ 5 tests estáticos del comportamiento.

## Verificación

- `npm test`: **243/243** (234 previos + 5 de esta + 4 del favicon).
- `php artisan test --compact`: **105/105**.
- `npm run build`: correcto.
- Navegador a 375×812:
  - abrir → abierta; elegir «Formación» → se cierra;
  - abrir otra vez → abierta; pulsar el botón → se cierra;
  - clic en el panel → no se cierra; clic en el fondo → se cierra.

## Pendiente

- [ ] Publicar (se hace junto con la spec 019).
