# Tareas — Puesta en línea del portfolio en AWS (Spec 017)

Estado: **fase 1 completada — pendiente la ejecución de las fases 2 a 8 (persona usuaria)**

> Esta spec **no modifica la aplicación ni ningún test**. Toca tres ficheros del repositorio y, sobre todo, infraestructura y servidor.
>
> **Quién ejecuta**: la infraestructura y los comandos del servidor se hacen en la cuenta de AWS y en la máquina; el agente no puede entrar en ninguna de las dos. Las fases 0, 1 y 9 las hace el agente; las 2 a 8 las ejecuta la persona usuaria siguiendo `docs/despliegue.md`.

## Fase 0: Control de versiones ✅

### T0.1 Inicializar el repositorio

**Completada.** Repositorio git en la raíz —**un único monorepo** con `Laravel/`, `React/`, `specs/`, `docs/` y la documentación—, con commit inicial `ede9a0a` (361 ficheros).

Se tomó como prerrequisito del RF-7: sin historial no hay versión anterior a la que volver, y publicar sería copiar ficheros a mano sin control.

**Revisión de secretos antes del commit**: se comprobaron uno a uno todos los ficheros que entrarían. Dos hallazgos:

- **`.otrosDatos`** (en la raíz) contiene **dos claves de API** y no estaba en el `.gitignore`. Se añadió. ⚠️ La clave de Context7 quedó visible en el historial de la conversación antes de detectarse: **debe revocarse y generarse otra**.
- **`database-setup.sql`** contiene una credencial en texto plano. Ya estaba excluido, y el propio fichero lo advertía.

Se añadieron además `.otrosDatos` y `Laravel/.phpunit.result.cache` al `.gitignore`. Verificado con `git check-ignore` que quedan fuera `.env` de ambos proyectos, `.env.backup`, `database-setup.sql` y las vistas compiladas.

**La foto de perfil no se versiona**: la configuración propia de Laravel excluye todo `storage/app/`, así que se sube al servidor por separado (T5.3).

### T0.2 Repositorio remoto en GitHub ✅

**Ampliación sobre lo previsto.** La decisión D de `plan.md` asumía un repositorio **sin remoto**. La persona usuaria pidió publicar el proyecto en GitHub como vitrina para procesos de selección, así que la decisión se amplió: **`rbielsam/portfolio`, público**.

Trabajo realizado:

- **Reescritura del historial** para retirar el correo personal (autoría y `ADMIN_EMAIL`) y la IP literal.
- **`MEMORY.md`** (notas internas de trabajo), **`documentacion.odt`** (documentación obsoleta en binario que duplicaba las specs) y **`skills-lock.json`** (metadato de herramientas) **fuera del historial** y añadidos al `.gitignore`.
  - ⚠️ **Aprendizaje**: `.gitignore` **no des-trackea** un fichero ya versionado; hizo falta `git rm --cached` y una segunda reescritura. Ambos llegaron a subirse (en privado) antes de detectarlo.
- **`README.md` nuevo**: presentación, stack, estructura, arranque local, pruebas y metodología. Los comandos y recuentos se verificaron antes de escribirlos.
- **Push por SSH** con `~/.ssh/gitKey`, fijada en `~/.ssh/config` para que siga funcionando tras un reinicio.

**Verificación desde fuera, sin credenciales** (lo que ve un visitante):

| Comprobación | Resultado |
| --- | --- |
| Correo de los 7 commits | `289629399+rbielsam@users.noreply.github.com` ✅ |
| Correo en el perfil | no expuesto ✅ |
| `MEMORY.md`, `.otrosDatos`, `Laravel/.env`, `documentacion.odt`, `skills-lock.json` | 404 ✅ |
| `README.md` como portada | renderizado ✅ |
| `deploy/publicar.sh` vivo | 0 IPs, 0 credenciales ✅ |

**RF-8 cumplido.** Repositorio: `github.com/rbielsam/portfolio` · HEAD `69bee62` · 365 ficheros · clon de 736K.

## Fase 1: Documentación y scripts

### T1.1 `docs/despliegue.md` — nuevo ✅

La guía que sostiene el RF-7. Debe permitir seguir cada paso **sin interpretación**: qué se pincha, qué se teclea y qué se comprueba después.

Contenido mínimo:

1. **Contratar el dominio** y a qué registrador.
2. **Crear la infraestructura** en AWS: EC2, RDS, bucket de S3, rol de IAM, reglas de seguridad.
3. **Configurar el servidor**: Apache, PHP 8.3 y sus extensiones, MySQL, Composer, Certbot.
4. **Preparar la aplicación**: código, `.env` de producción, dependencias, migraciones, enlace de almacenamiento.
5. **Migrar los datos**.
6. **Publicar** la primera versión y una posterior.
7. **Restaurar una copia** de seguridad.
8. **Verificar el correo**.
9. **Revisar el coste** y qué empieza a costar al terminar el periodo gratuito.

Incluye el `.env` de producción con **los valores que hay que poner**, sin credenciales reales.

**Completada.** Doce secciones (0 a 11), de la contratación a las comprobaciones finales.

**Errores corregidos durante la redacción**, todos verificados contra el proyecto:

| Error | Comprobación |
|---|---|
| Decía `git clone` en el servidor | **No hay remoto**: se eligió el monorepo local. Cambiado a rsync. |
| Faltaba `php8.3-cli` | `php8.3-fpm` no trae el binario `php`: sin él no hay `artisan` ni Composer. |
| Instalaba `bcmath` e `intl` | `composer check-platform-reqs` no los pide y el código no los usa (grep sin resultados). |
| Certbot en el paso 3.6 | `DocumentRoot` no existía todavía: **movido a 4.6**, tras instalar la aplicación. |
| Faltaba configurar el DNS | Certbot necesita que el dominio resuelva: añadido el paso 2.3 con los registros A. |
| Referencia a «paso 3.1» inexistente | La IP fija estaba en 2.3. |
| No se creaba `storage/` en el servidor | `storage/` está excluido a propósito del rsync: añadida la creación de la estructura. |
| Las fotos no se respaldaban | Dejado constado: RF-6 cubre la base de datos; las fotos son la spec 018. |

### T1.2 `deploy/publicar.sh` — nuevo ✅

Compila en local, sube el build y aplica una versión en el servidor. Reutilizable para publicar cambios posteriores (RF-7).

**Completada.** Cinco pasos: pruebas del frontend → pruebas del backend → compilación → sincronización de código → sincronización del build → aplicación en el servidor.

**Dos fallos detectados y corregidos durante la validación:**

1. **`rsync --delete React/dist/ → Laravel/public/` borraba la entrada de Laravel.** Se comprobó ejecutándolo contra una copia: desaparecían `index.php`, `.htaccess`, `favicon.ico`, `robots.txt` y `storage/`. El servidor habría quedado muerto en la primera publicación. Corregido sincolonizando solo `public/assets/` y `public/index.html`, con salvaguarda en el servidor que verifica que `public/index.php` y `public/.htaccess` existen antes de seguir.
2. **La sincronización de `Laravel/` con `--delete` borraba `public/index.html` y `public/assets/`**, que solo existen en el servidor. Funcionaba solo por el orden de los pasos; ahora están excluidos y cada ruta tiene un único dueño.

**Validado** con `bash -n`, con ejecución completa usando `ssh`/`rsync`/`npm`/`php` simulados, con ejecución real del comando remoto contra una copia local, y con las tres salidas tempranas (sin servidor, fuera de la raíz, y la que verifica el `index.php` remoto).

### T1.3 `deploy/respaldo.sh` — nuevo ✅

Copia comprimida de la base de datos hacia el bucket de S3, con retención, y con la instrucción de **restauración** incluida en el propio script (RF-6).

**Completada.** Lee la base de datos del `.env` del servidor —**no guarda credenciales**—, volcado con `--single-transaction`, subida a S3, limpieza de copias fuera de plazo, y **verificación de que el tamaño subido coincide con el local**, fallando si no coincide.

Validado con `bash -n` y con la salida temprana (sin la aplicación instalada).

## Fase 2: Contratación

### T2.1 Dominio `rbielsam.com`

Registrado en un registrador al costo, con el DNS incluido. **Se comprueba al contratar** el precio real del primer año y de la renovación, porque la guía no debe fijar cifras que cambian.

### T2.2 Cuenta de AWS

Revisar en **Billing → Free Tier** hasta cuándo llega la gratuidad y qué servicios cubre, para que la guía refleje la situación real de la cuenta.

## Fase 3: Infraestructura AWS

### T3.1 EC2

Ubuntu 24.04, `t2.micro`, al menos 8 GB de disco, en una región europea cercana (**Milán `eu-south-1`**; válidas París o Fráncfort). Con **rol de IAM** con permisos de escritura sobre el bucket de copias (D4).

### T3.2 RDS

MySQL `db.t3.micro` en la **misma VPC**, sin alta disponibilidad (cuesta el doble), con almacenamiento mínimo suficiente.

### T3.3 Bucket de S3

Privado, con acceso público bloqueado y **regla de ciclo de vida** para no acumular copias indefinidamente.

### T3.4 Reglas de seguridad

| Puerto | Quién |
|---|---|
| 80 y 443 | Abiertos a internet |
| 22 | **Solo** desde la IP de administración |
| 3306 | **Solo** desde el EC2 — **nunca** desde internet |

**Comprobación**: la base de datos no debe responder desde fuera del servidor.

## Fase 4: Servidor

### T4.1 Base del servidor

Apache, PHP 8.3 con las extensiones que necesita Laravel (`mysql`, `mbstring`, `xml`, `curl`, `gd`, `zip`, `bcmath`), cliente de MySQL y Certbot.

### T4.2 Composer y HTTPS

Instalar Composer. Emitir el certificado con Certbot, comprobar la **renovación automática** y que HTTP redirige a HTTPS (RF-1).

## Fase 5: Aplicación y datos

### T5.1 Código y configuración

Código en el servidor y `.env` de producción generado **desde cero**, nunca copiado del de desarrollo.

| Variable | Valor |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | **`false`** (RF-8) |
| `APP_URL` | `https://rbielsam.com` |
| `DB_HOST` | punto final de RDS |
| `SESSION_DOMAIN` | se **deja** en `null` — un solo dominio |
| `FILESYSTEM_DISK` | se **deja** en `local` — las fotos van a S3 en la spec 018 |

### T5.2 Dependencias, migraciones y enlace

Dependencias sin desarrollo, migraciones, caché de configuración y rutas, y `storage:link` — el enlace actual apunta a esta máquina por ruta absoluta, así que hay que crearlo de nuevo en el servidor (T3.2 de la estructura).

### T5.3 Migrar los datos

Base de datos y foto de perfil. **Antes** se comprueba que nadie esté editando el panel; **después**, que los recuentos coincidan y que **no** haya registros de prueba.

Recuentos esperados: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**, y la foto `photos/vsbEUqMTiZ3qOqUCbvLo08rz7x3K7xuY.jpg`.

## Fase 6: Publicación

### T6.1 Build de React

`npm run build` en local. **No se instala Node en el servidor** (D5).

### T6.2 Publicar y comprobar la raíz

Colocar `index.html` y `assets/` en `public/` del backend.

**Punto de más riesgo del plan**: en la raíz debe aparecer **el portfolio y no la página de bienvenida de Laravel**. `routes/web.php` tiene una ruta que la devuelve, y Apache entrega `index.html` antes que `index.php` si ambos existen. Se comprueba en el navegador y se deja escrito el resultado.

### T6.3 Resolver la interposición, si la hay

**Solo si** la raíz no entrega la app, se retira esa ruta —que la aplicación no usa— y se vuelve a comprobar. Es el único cambio de código que contempla esta spec, y solo si hace falta.

## Fase 7: Copias de seguridad

### T7.1 Copia automática

`respaldo.sh` instalado y programado en cron, apuntando al bucket de S3.

### T7.2 Probar la restauración

Restaurar una copia en **una base de datos de prueba**, nunca en la real. **Una copia que nunca se ha probado no es una copia** (RF-6).

## Fase 8: Correo

### T8.1 Verificar el dominio

Añadir los registros DNS que pida el servicio de correo para superar DKIM y SPF (RF-5).

### T8.2 Remitente propio

Cambiar `MAIL_FROM_ADDRESS` a una dirección del dominio propio y comprobar que los mensajes dejan de acabar en la carpeta de correo no deseado.

## Fase 9: Verificación

### T9.1 Comprobaciones de navegador

Contra `https://rbielsam.com`, **desde otra red que la del servidor** (datos móviles, no el mismo wifi):

- La página pública carga **sin aviso de sitio inseguro**; por HTTP redirige a HTTPS.
- La raíz muestra **el portfolio**, no la página de bienvenida de Laravel.
- El panel permite iniciar sesión y abrir **las seis vistas** con sus datos.
- El cambio de idioma funciona y la preferencia persiste.
- La foto de perfil se ve en la pública y en el panel.
- Un mensaje del formulario **llega al correo** de la persona responsable.

### T9.2 Datos

Recuentos: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**. Sin usuarios ni mensajes de prueba.

### T9.3 Seguridad

Provocar un error y comprobar que la respuesta **no** muestra trazas ni valores de entorno. Revisar que el repositorio no contiene claves. Comprobar que la base de datos **no responde** desde internet.

### T9.4 Sin regresiones

| Suite | Resultado esperado |
|---|---|
| `npm test` | **234/234**, ningún test modificado |
| `npm run build` | sin errores |
| `php artisan test --compact` | **105/105** |

### T9.5 Coste

Dejar escrito en `docs/despliegue.md` **lo que cuesta hoy** y **lo que empezará a costar** cuando termine el periodo gratuito.

## Pendiente

- [x] T0.1
- [x] T1.1
- [x] T1.2
- [x] T1.3
- [ ] T2.1
- [ ] T2.2
- [ ] T3.1
- [ ] T3.2
- [ ] T3.3
- [ ] T3.4
- [ ] T4.1
- [ ] T4.2
- [ ] T5.1
- [ ] T5.2
- [ ] T5.3
- [ ] T6.1
- [ ] T6.2
- [ ] T6.3
- [ ] T7.1
- [ ] T7.2
- [ ] T8.1
- [ ] T8.2
- [ ] T9.1
- [ ] T9.2
- [ ] T9.3
- [ ] T9.4
- [ ] T9.5
