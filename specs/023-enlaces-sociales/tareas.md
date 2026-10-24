# Tareas — Enlaces a GitHub y LinkedIn (Spec 023)

Estado: **implementación completada**. Pendiente: confirmación expresa para publicar.

> Spec y plan aprobados por la persona usuaria. La spec manda: si algo no está definido, se para y se pregunta.
>
> Cada tarea se marca al terminar y no se avanza si las pruebas o el build fallan.

---

## Fase 1 — Backend: datos y validación

### T1.1 — Migración

- [x] Crear `Laravel/database/migrations/2026_10_24_120000_add_social_links_to_profile_table.php`.
- [x] Añadir `github_url` y `linkedin_url` como `string(255)` nullable a la tabla `profile`.
- [x] Implementar `down()` para eliminar ambas columnas.
- [x] Verificar que la migración se aplica y se revierte sin errores.

### T1.2 — Modelo

- [x] Añadir `github_url` y `linkedin_url` a `$fillable` de `Profile`.
- [x] Confirmar que `photo_url`, el formato del perfil y el resto de campos no cambian.

### T1.3 — Validación y API

- [x] En `ProfileController@update`, validar `github_url` y `linkedin_url` como `nullable`, `url:http,https` y `max:255`.
- [x] Confirmar que una cadena vacía se guarda como `null`.
- [x] Confirmar que `GET /api/profile` devuelve ambos campos, con `null` si no existen.
- [x] Mantener los permisos actuales de `PUT /api/profile` (`auth:sanctum` + `role:admin,editor`).

### T1.4 — Traducciones de validación

- [x] Añadir `github_url` y `linkedin_url` a los atributos de `Laravel/lang/{es,ca,en}/validation.php` como **GitHub** y **LinkedIn**.
- [x] Verificar que los tres idiomas mantienen las mismas claves.

### T1.5 — Pruebas de backend

- [x] Crear `Laravel/tests/Feature/ProfileSocialLinksTest.php`.
- [x] Cubrir: `GET /api/profile` devuelve ambos campos como `null` por defecto.
- [x] Cubrir: `PUT /api/profile` guarda ambas URL y `GET` las devuelve.
- [x] Cubrir: cadena vacía se guarda como `null`.
- [x] Cubrir: URL sin esquema → `422`.
- [x] Cubrir: esquema no permitido (`javascript:`, `data:`) → `422`.
- [x] Cubrir: URL de más de 255 caracteres → `422`.
- [x] Cubrir: visitante `401`, lector `403`, editor y administrador `200`.
- [x] Cubrir: el resto de campos del perfil se siguen guardando.
- [x] Ejecutar `cd Laravel && php artisan test --compact` y confirmar que todo está en verde.

---

## Fase 2 — Componente compartido

### T2.1 — `SocialLinks.jsx`

- [x] Crear `React/src/components/SocialLinks.jsx`.
- [x] Aceptar las props `profile` y `variant` (`'inicio'` por defecto).
- [x] Construir la lista solo con los enlaces que tengan valor.
- [x] Devolver `null` cuando no haya ningún enlace.
- [x] Renderizar `<ul>` + `<li>` + `<a>` reales.
- [x] Añadir `target="_blank"` y `rel="noopener noreferrer"` a cada enlace.
- [x] En `variant="inicio"`, mostrar icono + nombre visible.
- [x] En `variant="footer"`, mostrar solo el icono y añadir `aria-label` con el nombre accesible.
- [x] Incluir los SVG de GitHub y LinkedIn en línea, con `aria-hidden="true"`, `focusable="false"` y `fill="currentColor"`.
- [x] No añadir dependencias ni librerías de iconos.

---

## Fase 3 — Inicio

### T3.1 — Integración

- [x] Mantener `useFetch('/profile')` en `Inicio.jsx` (test `t4.1`).
- [x] Renderizar `<SocialLinks profile={data} />` después de la biografía.
- [x] Confirmar que si no hay biografía pero sí enlaces, la fila se muestra.
- [x] Confirmar que si no hay enlaces, no se renderiza contenedor ni hueco.

---

## Fase 4 — Pie de página

### T4.1 — Integración

- [x] Añadir `useFetch('/profile')` a `Footer.jsx`.
- [x] Mantener el copyright actual.
- [x] Renderizar `<SocialLinks profile={data} variant="footer" />` junto al copyright.
- [x] Confirmar que si el perfil falla o no hay enlaces, el pie se ve como antes.
- [x] Confirmar que los enlaces del pie abren en pestaña nueva con `rel="noopener noreferrer"`.

---

## Fase 5 — Panel de perfil

### T5.1 — Campos

- [x] Añadir en `AdminPerfil.jsx` un campo `github_url` con etiqueta `t('perfil.github')`.
- [x] Añadir un campo `linkedin_url` con etiqueta `t('perfil.linkedin')`.
- [x] Usar `type="url"`, `className="admin-form__input"` y `disabled={!canEdit}`.
- [x] Colocarlos después de la biografía y antes de la foto.
- [x] Confirmar que se cargan los valores guardados y que se envían al guardar.
- [x] Confirmar que vaciar un campo y guardar elimina el enlace de la web.
- [x] Mantener los permisos `can('profile')` y el manejo de errores actual.

---

## Fase 6 — Traducciones

### T6.1 — Claves nuevas

- [x] Añadir en `React/src/i18n/es.js`, `ca.js` y `en.js`:
  - `social.github`
  - `social.linkedin`
  - `social.github_aria`
  - `social.linkedin_aria`
  - `perfil.github`
  - `perfil.linkedin`
- [x] Verificar que los tres diccionarios tienen exactamente las mismas claves (test `t20.3`).
- [x] Confirmar que no se añaden cadenas duras en los componentes nuevos o modificados (test `t20.18`).

---

## Fase 7 — Estilos y responsive

### T7.1 — Inicio (`sections.css`)

- [x] `.social-links`: lista sin viñetas, `flex`, `flex-wrap`, `gap` y sin márgenes.
- [x] `.social-links__link`: icono + texto, `min-height: 44px`, color de acento, hover y foco visible.
- [x] `.social-links__icon`: 20 px y `flex: 0 0 auto`.
- [x] En escritorio, alineado a la izquierda con la biografía.
- [x] `≤768px`: fila centrada.

### T7.2 — Pie (`layout.css`)

- [x] `.footer`: columna centrada, con el `gap` y el padding actuales.
- [x] `.social-links--footer`: centrado y separación discreta.
- [x] `.social-links--footer .social-links__link`: 44 × 44 px, sin texto, color atenuado.
- [x] Hover y foco del pie en color de acento.
- [x] `.social-links--footer .social-links__icon`: 18 px.
- [x] Sin colores hexadecimales sueltos; usar tokens.

### T7.3 — Puntos de ruptura

- [x] **1440 px**: Inicio con enlaces a la izquierda; pie con iconos centrados.
- [x] **1024 px**: sin desbordamiento.
- [x] **768 px**: Inicio centrado; pie sin saltos raros.
- [x] **480 px**: enlaces envueltos si hace falta.
- [x] **375×812**: iconos del pie en una fila y sin scroll horizontal.
- [x] **320 px**: todo cabe, sin solapamientos.
- [x] Mantener `prefers-reduced-motion: reduce`.

---

## Fase 8 — Pruebas de frontend

### T8.1 — `t29.test.js`

- [x] Crear `React/tests/t29.test.js`.
- [x] Verificar que existe la migración y contiene `github_url` y `linkedin_url`.
- [x] Verificar que `Profile` incluye ambos campos en `$fillable`.
- [x] Verificar que `ProfileController` valida `url:http,https` y `max:255`.
- [x] Verificar que `SocialLinks.jsx` existe, usa `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` en el pie y SVG en línea.
- [x] Verificar que `SocialLinks` devuelve `null` sin enlaces.
- [x] Verificar que `Inicio.jsx` conserva `useFetch('/profile')` y renderiza `SocialLinks` después de la bio.
- [x] Verificar que `Footer.jsx` usa `useFetch('/profile')` y `variant="footer"`.
- [x] Verificar que `AdminPerfil.jsx` tiene los campos `github_url` y `linkedin_url` con `type="url"`.
- [x] Verificar que las claves nuevas existen en los tres idiomas.
- [x] Verificar el CSS: `.social-links`, `.social-links--footer`, 44 px, punto de ruptura de 768 px y foco visible.
- [x] Confirmar que `package.json` no gana dependencias.

### T8.2 — Compatibilidad con tests existentes

- [x] `t4.1`: Inicio sigue usando `useFetch` y `'/profile'`.
- [x] `t3.2`: el pie sigue mostrando el año.
- [x] `t20.3`: diccionarios equivalentes.
- [x] `t20.17`: sin dependencias nuevas.
- [x] `t20.18`: sin cadenas duras.
- [x] `t24`: la foto de Inicio no cambia.
- [x] `ApiReadTest` y `ApiWriteTest`: el perfil mantiene sus campos y su guardado.
- [x] Ejecutar `cd React && npm test` → todo en verde.
- [x] Ejecutar `cd React && npm run build` → sin errores.

---

## Fase 9 — Verificación manual

### T9.1 — Con enlaces

- [x] **1440 px**: Inicio muestra GitHub y LinkedIn debajo de la bio, alineados a la izquierda.
- [x] **1440 px**: el pie muestra los dos iconos junto al copyright.
- [x] Cada enlace abre la URL correcta en pestaña nueva.
- [x] **768, 480, 375 y 320 px**: la fila de Inicio se centra y el pie no desborda.
- [x] El foco con teclado se ve en Inicio y en el pie.
- [x] El pie anuncia «Perfil de GitHub» y «Perfil de LinkedIn» con lector de pantalla.
- [x] Catalán e inglés: cambian los textos accesibles y los nombres propios no.

### T9.2 — Sin enlaces y con uno solo

- [x] Sin enlaces: Inicio y pie se ven como antes, sin hueco.
- [x] Solo GitHub: solo aparece GitHub en Inicio y en el pie.
- [x] Solo LinkedIn: solo aparece LinkedIn en Inicio y en el pie.

### T9.3 — Validación y panel

- [x] `github.com/usuario` → error claro y no se guarda.
- [x] `javascript:alert(1)` → error claro y no se guarda.
- [x] URL de más de 255 caracteres → error claro.
- [x] **Panel → Perfil** muestra los campos con los valores guardados.
- [x] Un lector no puede editar el perfil ni los enlaces.
- [x] **1440, 768, 375 y 320 px**: los campos del panel se apilan sin desbordar.
- [x] Consola del navegador sin errores distintos del `401` esperado de `/api/user`.

---

## Fase 10 — Cierre

### T10.1 — Datos

- [x] Confirmar que no se ha modificado ningún dato real durante la implementación.
- [x] Dejar en local solo los enlaces que la persona usuaria decida.

### T10.2 — Memoria y documentación

- [x] Actualizar `MEMORY.md` con el estado de la spec 023.
- [x] Confirmar que no hace falta cambiar `docs/despliegue.md` (no hay variables ni límites nuevos).

### T10.3 — Publicación (solo con confirmación expresa)

- [ ] Pedir confirmación explícita antes de publicar.
- [ ] Ejecutar `deploy/publicar.sh`.
- [ ] Verificar que la migración se aplica y que la web sigue respondiendo.
- [ ] Guardar los enlaces desde el panel de producción y comprobar Inicio y pie.
- [ ] Revisar los logs de Laravel y de Nginx.
