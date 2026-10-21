# Tareas — Favicon del portfolio (Spec 019)

Estado: **COMPLETADA**.

### T0.1 Elegir el estilo del favicon

✅ Opción **A · Monograma «RB»**, elegida por la persona usuaria.

### T1.1 Crear `React/public/favicon.svg`

✅ SVG de 64×64 con degradado `#1a3a5c → #0a1628` e iniciales `RB` en `#5ba3d9`.

### T1.2 Modificar `deploy/publicar.sh`

✅ Comprueba que existe `dist/favicon.svg` y lo sube a `Laravel/public/favicon.svg`.

### T1.3 Crear `React/tests/t22.test.js`

✅ 4 tests: SVG válido y cuadrado, paleta, enlace en `index.html`, sincronización en `publicar.sh`.

## Verificación

- `npm test`: **243/243** (234 previos + 5 de la spec 020 + 4 de esta).
- `npm run build`: genera `dist/favicon.svg`.
- `php artisan test --compact`: **105/105**.
- Navegador: comparativa revisada a 64, 32 y 16 px antes de elegir.

## Pendiente de despliegue

- [ ] Ejecutar `deploy/publicar.sh` y comprobar `https://rbielsam.es/favicon.svg`.
