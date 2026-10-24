# Plan — Enlaces a GitHub y LinkedIn (Spec 023)

## Alcance

- **Full-stack pequeño**: migración, modelo, validación, API, componente compartido, Inicio, pie, panel, traducciones, estilos y tests.
- **Sin dependencias nuevas**: los iconos son SVG en línea; no se añade ninguna librería.
- **Sin infraestructura nueva**: solo dos columnas nullable en `profile`.
- **Sin cambios en la navegación**: no se toca el menú, ni Contacto, ni la cabecera.
- **No se modifica ningún dato real** durante la implementación.
- **No se publica** en producción sin confirmación expresa.

## Stack confirmado

- Backend: Laravel 13 + PHP 8.5 + MySQL.
- Frontend: React 18 + JavaScript + CSS3 + Vite.
- Tests backend: `cd Laravel && php artisan test --compact`.
- Tests frontend: `cd React && npm test` → `node --test tests/*.test.js`.
- Build: `cd React && npm run build`.
- Producción: `deploy/publicar.sh` (tests, build, `rsync`, migraciones y cachés).

## Decisiones de implementación

### D1 — Datos: dos columnas opcionales en `profile`

Migración `2026_10_24_120000_add_social_links_to_profile_table.php`:

```text
github_url    string(255) nullable
linkedin_url  string(255) nullable
```

- Se añaden con `Schema::table('profile', ...)` y se eliminan en `down()`.
- `Profile::$fillable` pasa a incluir `github_url` y `linkedin_url`.
- No se toca ningún campo existente ni el formato de `photo_url`.
- Los valores vacíos se guardan como `null` (Laravel ya convierte cadenas vacías con `ConvertEmptyStringsToNull`).

### D2 — API: lectura pública y escritura validada

**Lectura**

`GET /api/profile` devuelve los dos campos nuevos automáticamente, con `null` cuando no estén definidos. No se crea ningún endpoint nuevo.

**Escritura**

`ProfileController@update` añade a la validación actual:

```php
'github_url'   => ['nullable', 'url:http,https', 'max:255'],
'linkedin_url' => ['nullable', 'url:http,https', 'max:255'],
```

- Solo se aceptan URL absolutas con esquema `http` o `https`.
- No se añade el esquema automáticamente: `github.com/usuario` se rechaza.
- `javascript:`, `data:` y cualquier otro esquema se rechazan.
- Se mantienen el `name` obligatorio y el resto de reglas actuales.
- Los permisos no cambian: `PUT /api/profile` sigue dentro de `auth:sanctum` + `role:admin,editor`.

**Traducciones de validación**

Se añaden los atributos `github_url` y `linkedin_url` en `Laravel/lang/{es,ca,en}/validation.php` para que el mensaje de error nombre los campos como **GitHub** y **LinkedIn**.

### D3 — Componente compartido `SocialLinks`

Nuevo `React/src/components/SocialLinks.jsx`:

- Recibe `profile` y `variant` (`'inicio'` por defecto, `'footer'`).
- Construye una lista solo con los enlaces que tengan valor:

```js
[
  { key: 'github', label: t('social.github'), aria: t('social.github_aria'), href: profile.github_url, icon: <GitHubIcon /> },
  { key: 'linkedin', label: t('social.linkedin'), aria: t('social.linkedin_aria'), href: profile.linkedin_url, icon: <LinkedInIcon /> },
].filter((enlace) => enlace.href)
```

- Si la lista queda vacía, devuelve `null`: no se renderiza contenedor ni espacio.
- Renderiza:

```jsx
<ul className={`social-links social-links--${variant}`}>
  <li className="social-links__item">
    <a
      className="social-links__link"
      href={enlace.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={variant === 'footer' ? enlace.aria : undefined}
    >
      {enlace.icon}
      {variant === 'inicio' && <span>{enlace.label}</span>}
    </a>
  </li>
</ul>
```

- **Inicio**: icono + nombre visible.
- **Pie**: solo icono; el nombre accesible va en `aria-label`.
- Los SVG son componentes locales con `aria-hidden="true"`, `focusable="false"`, `fill="currentColor"` y tamaño 20 px en Inicio / 18 px en el pie.
- Se usan los logotipos de GitHub y LinkedIn como trazados SVG en línea; **no se añade ninguna dependencia**.
- No se interpreta ningún contenido como HTML: React escapa las URL.

### D4 — Inicio

`Inicio.jsx`:

- Mantiene `useFetch('/profile')` (test `t4.1`).
- Después de la biografía añade:

```jsx
<SocialLinks profile={data} />
```

- Si no hay biografía pero sí enlaces, la fila se muestra igualmente.
- Si no hay enlaces, `SocialLinks` devuelve `null` y el bloque queda como hoy.

### D5 — Pie

`Footer.jsx`:

- Pasa a obtener el perfil con `useFetch('/profile')`.
- Renderiza el copyright y los enlaces:

```jsx
<footer className="footer">
  <p className="footer__title">© 2026 rbielsam</p>
  <SocialLinks profile={data} variant="footer" />
</footer>
```

- Si el perfil falla o no hay enlaces, solo se ve el copyright.
- **Compromiso**: el pie hace una petición propia a `/api/profile`, además de la de Inicio. Es un GET público y pequeño; se acepta para no introducir un contexto nuevo ni cambiar el patrón de `useFetch` de Inicio.

### D6 — Panel de perfil

`AdminPerfil.jsx`:

- Añade dos campos después de la biografía y antes de la foto:

```jsx
<label className="admin-form__label">
  {t('perfil.github')}
  <input
    className="admin-form__input"
    type="url"
    value={data?.github_url || ''}
    onChange={(e) => setData({ ...data, github_url: e.target.value })}
    disabled={!canEdit}
  />
</label>
```

- Lo mismo para `linkedin_url` con `t('perfil.linkedin')`.
- Se mantienen el botón de guardar, los permisos `can('profile')` y el manejo de errores actual.
- No se añade `placeholder` (no hay restricción técnica, pero se mantiene el estilo del panel).

### D7 — Traducciones

Se añaden las mismas claves en `es.js`, `ca.js` y `en.js`:

```text
social.github        → GitHub
social.linkedin      → LinkedIn
social.github_aria   → Perfil de GitHub / Perfil de GitHub / GitHub profile
social.linkedin_aria → Perfil de LinkedIn / Perfil de LinkedIn / LinkedIn profile
perfil.github        → GitHub
perfil.linkedin      → LinkedIn
```

- Los nombres propios no se traducen.
- Los textos accesibles del pie sí se traducen.
- Todos los textos de interfaz nuevos usan `t()`; no se añaden cadenas duras.

### D8 — Estilos y responsive

**`sections.css` — Inicio**

- `.social-links`: lista sin viñetas, `display: flex`, `flex-wrap: wrap`, `gap: var(--spacing-sm)`, sin márgenes.
- `.social-links__link`: `inline-flex`, icono + texto, `min-height: 44px`, padding horizontal, color de acento, borde inferior o subrayado al pasar el ratón, foco visible.
- `.social-links__icon`: tamaño 20 px, `flex: 0 0 auto`.
- En escritorio, alineados a la izquierda con la biografía.
- `≤768px`: `.inicio .social-links { justify-content: center; }` para acompañar el bloque centrado de Inicio.

**`layout.css` — Pie**

- `.footer`: `display: flex`, `flex-direction: column`, `align-items: center`, `gap: var(--spacing-xs)`, manteniendo el padding actual.
- `.social-links--footer`: `justify-content: center`, `gap: var(--spacing-xs)`.
- `.social-links--footer .social-links__link`: cuadrado de **44 × 44 px**, sin texto, color `--color-text-muted`; al pasar el ratón y al enfocar, color de acento.
- `.social-links--footer .social-links__icon`: 18 px.
- El pie mantiene el copyright con su estilo actual.

**Común**

- Se reutilizan los tokens existentes de color, espaciado y foco.
- No se añaden colores hexadecimales sueltos.
- `prefers-reduced-motion: reduce`: sin animaciones nuevas.
- Sin `overflow-x` horizontal entre 320 px y 1440 px.

### D9 — Tests

**Backend — `ProfileSocialLinksTest`**

- `GET /api/profile` devuelve `github_url` y `linkedin_url` como `null` por defecto.
- `PUT /api/profile` guarda ambas URL y `GET` las devuelve.
- Cadena vacía se guarda como `null`.
- URL sin esquema (`github.com/usuario`) → `422`.
- Esquema no permitido (`javascript:alert(1)`) → `422`.
- URL de más de 255 caracteres → `422`.
- Visitante sin sesión → `401`; lector → `403`; editor y administrador → `200`.
- El resto de campos del perfil sigue guardándose igual.

**Frontend — `t29.test.js`**

- Existe la migración y contiene `github_url` y `linkedin_url`.
- `Profile` incluye ambos campos en `$fillable`.
- `ProfileController` valida `url:http,https` y `max:255`.
- `SocialLinks.jsx` existe, usa `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` para el pie y SVG en línea.
- `SocialLinks` devuelve `null` cuando no hay enlaces.
- `Inicio.jsx` renderiza `SocialLinks` después de la biografía y conserva `useFetch('/profile')`.
- `Footer.jsx` usa `useFetch('/profile')` y `SocialLinks` con `variant="footer"`.
- `AdminPerfil.jsx` tiene los campos `github_url` y `linkedin_url` con `type="url"`.
- Las claves nuevas existen en los tres diccionarios.
- El CSS define `.social-links`, `.social-links--footer`, el área táctil de 44 px, el punto de ruptura de 768 px y el foco visible.
- `package.json` no gana dependencias (lo cubre también `t20.17`).

### D10 — Privacidad y seguridad

- Solo se publican las URL que se guarden; los campos son opcionales.
- Se rechazan esquemas no web antes de persistir.
- Los enlaces se abren con `noopener noreferrer`.
- No se añaden correos, teléfonos ni otros datos personales.
- No se exponen datos del panel: la lectura pública solo devuelve el perfil que ya era público.

## Estructura de ficheros

### Nuevos

```text
Laravel/database/migrations/2026_10_24_120000_add_social_links_to_profile_table.php
Laravel/tests/Feature/ProfileSocialLinksTest.php
React/src/components/SocialLinks.jsx
React/tests/t29.test.js
```

### Modificados

```text
Laravel/app/Models/Profile.php
Laravel/app/Http/Controllers/Api/ProfileController.php
Laravel/lang/es/validation.php
Laravel/lang/ca/validation.php
Laravel/lang/en/validation.php
React/src/components/sections/Inicio.jsx
React/src/components/Layout/Footer.jsx
React/src/pages/admin/AdminPerfil.jsx
React/src/styles/sections.css
React/src/styles/layout.css
React/src/i18n/es.js
React/src/i18n/ca.js
React/src/i18n/en.js
```

> **No se modifican** `React/src/main.jsx`, `vite.config.js`, `composer.json`, `package.json`, la navegación, Contacto, la cabecera ni `deploy/publicar.sh`.

## Compatibilidad con tests existentes

| Test | Qué exige | Cómo se cumple |
|---|---|---|
| `t4.1` | `Inicio.jsx` usa `useFetch` y `'/profile'` | Se mantiene y se añade `SocialLinks` debajo de la bio |
| `t3.2` | El pie muestra el año | Se conserva el copyright y se añade el componente |
| `t20.3` | Los tres diccionarios tienen las mismas claves | Las seis claves nuevas se añaden en es/ca/en |
| `t20.17` | Sin dependencias nuevas | Los iconos son SVG en línea |
| `t20.18` | Sin cadenas duras conocidas | Todos los textos nuevos usan `t()` |
| `t24` | Inicio sigue prefiriendo `photo_url` | No se toca la foto |
| `t14` | El panel conserva añadir/editar/borrar | Solo se añaden dos campos al perfil |
| `ApiReadTest` | `GET /api/profile` mantiene nombre, título y bio | Se añaden campos, no se eliminan |
| `ApiWriteTest` | `PUT /api/profile` guarda el perfil | Se añaden dos reglas opcionales |

## Pasos de implementación

1. Crear la migración de `github_url` y `linkedin_url` y actualizar `Profile::$fillable`.
2. Añadir la validación en `ProfileController` y los atributos en los tres `validation.php`.
3. Escribir `ProfileSocialLinksTest` y ejecutarlo.
4. Crear `SocialLinks.jsx` con los dos iconos SVG y la lógica de variantes.
5. Integrar `SocialLinks` en `Inicio.jsx` después de la biografía.
6. Integrar `SocialLinks` en `Footer.jsx` con `variant="footer"` y `useFetch('/profile')`.
7. Añadir los dos campos a `AdminPerfil.jsx`.
8. Añadir las claves de i18n en es/ca/en.
9. Completar `sections.css` y `layout.css`.
10. Crear `t29.test.js`.
11. Ejecutar suites, build y comprobación visual.
12. Actualizar `MEMORY.md`.
13. Publicar solo con confirmación expresa.

## Verificación

### Automática

- `cd Laravel && php artisan test --compact` → todos los tests actuales y `ProfileSocialLinksTest` en verde.
- `cd React && npm test` → todos los tests actuales + `t29` en verde.
- `cd React && npm run build` → sin errores.
- Comprobar que no se ha modificado `package.json` ni `composer.json`.
- Comprobar que `AdminPerfil` mantiene los permisos y el guardado actuales.

### Manual — navegador

**Con enlaces**

1. **1440 px**: Inicio muestra GitHub y LinkedIn debajo de la bio, alineados a la izquierda; el pie muestra los dos iconos junto al copyright.
2. Pulsar cada enlace: abre la URL correcta en pestaña nueva.
3. **768, 480, 375×812 y 320 px**: la fila de Inicio se centra, los iconos del pie no desbordan y no hay scroll horizontal.
4. El foco con teclado se ve en los enlaces de Inicio y del pie.
5. En el pie, un lector de pantalla anuncia «Perfil de GitHub» y «Perfil de LinkedIn».
6. Cambiar a catalán e inglés: los textos accesibles cambian y los nombres propios no.

**Sin enlaces**

7. Vaciar ambos campos en el panel y guardar: Inicio y pie se ven como antes, sin hueco ni contenedor vacío.

**Con un solo enlace**

8. Rellenar solo GitHub: aparece únicamente GitHub en Inicio y en el pie.
9. Rellenar solo LinkedIn: mismo comportamiento.

**Validación**

10. Guardar `github.com/usuario` → error claro y no se guarda.
11. Guardar `javascript:alert(1)` → error claro y no se guarda.
12. Guardar una URL de más de 255 caracteres → error claro.

**Panel**

13. **Panel → Perfil** muestra los campos GitHub y LinkedIn con los valores guardados.
14. Un usuario lector no puede editar el perfil ni los enlaces.
15. **1440, 768, 375 y 320 px**: los campos y el botón se apilan sin desbordar.

### Datos

- No se modifica ningún dato real durante la implementación.
- Las comprobaciones manuales se hacen con la base local; al terminar, se dejan los enlaces que la persona usuaria decida.
- No se ejecutan migraciones ni cambios en producción sin confirmación.

### Despliegue (solo tras aprobación)

1. Ejecutar `deploy/publicar.sh` (aplica la migración y publica el build).
2. Verificar que la migración aparece como `Ran` y que la web responde.
3. Guardar los enlaces desde el panel de producción y comprobar Inicio y pie.
4. Revisar los logs de Laravel y de Nginx.

## Limitaciones conocidas

- El pie hace una petición propia a `/api/profile`; no se introduce un contexto de perfil compartido en esta spec.
- No se añaden otras redes sociales ni un enlace de repositorio por proyecto.
- No hay analítica ni seguimiento de clics.
- Los iconos son trazados SVG propios; no se actualizan automáticamente si las marcas cambian.

## Criterios de finalización del plan

- `profile` guarda `github_url` y `linkedin_url` como campos opcionales y la API los devuelve.
- El panel permite editar, guardar y vaciar ambos enlaces.
- Inicio muestra icono + nombre debajo de la bio, alineado a la izquierda en escritorio y centrado en móvil.
- El pie muestra solo los iconos, con nombre accesible y área táctil de 44 px.
- Los enlaces se abren en pestaña nueva con `rel="noopener noreferrer"`.
- Las URL inválidas o con esquema no permitido se rechazan con un mensaje claro.
- Sin enlaces, Inicio y pie se ven exactamente como antes.
- No hay desbordamiento horizontal entre 320 px y 1440 px.
- Las suites de pruebas y el build están en verde.
