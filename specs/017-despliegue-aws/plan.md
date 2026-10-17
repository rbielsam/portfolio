# Plan — Puesta en línea del portfolio en AWS (Spec 017)

## Alcance

**No cambia el código de la aplicación.** Esta spec crea infraestructura, configura un servidor y documenta cómo publicar. Es la primera spec del proyecto que no escribe casi ningún fichero de la app.

- **3 ficheros nuevos** en el repositorio: una guía y dos scripts.
- **Repositorio git inicializado** (monorepo, commit `ede9a0a`): se tomó como prerrequisito del RF-7, porque sin historial no hay versión anterior a la que volver al publicar. *El historial se reescribió después para eliminar el correo personal de la persona usuaria: los hashes cambiaron (ver tareas.md).*
- **Ampliación de la decisión**: además del historial local, el repositorio se publicó en **`github.com/rbielsam/portfolio` (público)**, a petición de la persona usuaria, para servir de vitrina. Se purgaron del historial `MEMORY.md`, `documentacion.odt` y `skills-lock.json`, y se añadió un `README.md`. Verificado desde fuera sin credenciales que no se expone nada: ver **T0.2** en `tareas.md`.
- **Backend intacto**: 0 cambios en `app/`, `routes/`, `config/` ni migraciones.
- **Frontend intacto**: 0 cambios en `src/`. El build de producción ya funciona.
- **Tests existentes intactos**: no se toca ningún test; las suites deben seguir igual (**234** frontend, **105** backend).
- **Sin dependencias nuevas** en el proyecto: las herramientas del servidor (Apache, PHP, MySQL, Certbot) se instalan en el servidor, no en el repositorio.
- **Sin integración continua**: el despliegue es manual y documentado, como pide la simplicidad de la constitución.
- **No se mueven las fotos a S3**: eso es la spec 018.
- **No se edita nada en el servidor para arreglar la aplicación**: si hiciera falta un cambio de código, se hace aquí, se prueba y se publica. Cambiar solo en el servidor desincroniza los entornos y la siguiente publicación lo revierte sin avisar.

## Stack confirmado

- **Servidor**: Ubuntu 24.04 LTS + Apache + PHP 8.3 (FPM) sobre EC2 `t2.micro`.
- **Base de datos**: MySQL sobre RDS `db.t3.micro`.
- **Copias**: un bucket de S3 **solo** para la base de datos.
- **Correo**: Resend, que ya está funcionando.
- **Certificados**: Let's Encrypt con Certbot.
- **Verificación**: comprobaciones de navegador contra el sitio publicado, más las suites existentes como comprobación de no-regresión.

## Diagnóstico de partida

Lo que hay hoy y condiciona el plan:

| Hecho | Consecuencia |
|---|---|
| `APP_ENV=local`, `APP_DEBUG=true` | En producción hay que apagar la depuración: filtraría una traza con todo lo configurado |
| `APP_URL=http://localhost:8000` | Debe ser `https://rbielsam.com` |
| `DB_HOST=127.0.0.1` | Debe ser el punto final de RDS |
| `SESSION_DRIVER=database`, `SESSION_DOMAIN=null` | **No se tocan**: con un solo dominio funcionan tal cual |
| `FILESYSTEM_DISK=local` | **No se toca**: las fotos siguen en disco hasta la spec 018 |
| `MAIL_MAILER=resend` con `onboarding@resend.dev` | Funciona, pero solo llega a la cuenta de Resend; hay que verificar el dominio |
| `Route::get('/')` devuelve la página de bienvenida de Laravel | Hay que comprobar que `/` entrega la app React |
| React Router se importa pero **no se usa** | No hace falta enrutado de respaldo para rutas profundas |
| `public/storage` es un enlace a ruta absoluta de esta máquina | En el servidor hay que crearlo de nuevo |
| La foto vive en `storage/app/public/photos/` | Hay que subirla al servidor |
| No hay `Dockerfile`, CI ni fichero de despliegue | Se crea todo desde cero |

## Decisiones de implementación

### D1 — Región europea, cerca de España

Elige una región de Europa con `t2.micro` disponible. La de **Milán (`eu-south-1`)** es la más cercana a España; **París (`eu-west-3`)** y **Fráncfort (`eu-central-1`)** también sirven. Lo importante es **no cambiarla después**: mover la infraestructura de región cuesta dinero y tiempo.

### D2 — `t2.micro` y suficiente disco

`db.t3.micro` y `t2.micro` son los que incluye la cuenta gratuita. El disco del EC2 debe ser de **al menos 8 GB** (hasta 30 GB están incluidos). Con MySQL fuera de la máquina, `t2.micro` tiene memoria de sobra: solo carga Apache y PHP.

### D3 — La base de datos no se expone

RDS en la **misma VPC** que el EC2, con reglas de seguridad que **solo permiten el puerto 3306 desde el propio EC2**. Nunca desde internet. El EC2 sí recibe 80 y 443, y el 22 **restringido a la IP de quien administra**, no a todo internet.

### D4 — El acceso a S3 se da con un rol, no con claves

El EC2 lleva un **rol de IAM** con permisos de escritura sobre el bucket de copias. Es mejor que las claves de acceso, que si se cuelan en el servidor quedan expuestas. El bucket bloquea el acceso público.

### D5 — El build de React se hace fuera del servidor

El servidor **no instala Node**. Se compila en local (`npm run build`) y se sube el resultado. Gana en dos cosas: el `t2.micro` no gasta memoria compilando, y lo que hay en producción es exactamente lo que ya se ha probado aquí.

### D6 — La app React se publica dentro de `Laravel/public`

El resultado del build (`index.html` y `assets/`) se coloca en `public/` del backend. Así **un solo dominio** sirve la app, la API y las fotos, que es lo que exige el RF-2.

**Riesgo a comprobar**: `routes/web.php` tiene una ruta que devuelve la página de bienvenida de Laravel, y Apache entrega `index.html` antes que `index.php` si ambos existen. **Hay que verificar en el servidor que `/` entrega la app y no esa página.** Si no fuera así, se retira esa ruta, que la aplicación no usa.

### D7 — El `.env` de producción se genera aparte

Nunca se copia el `.env` de desarrollo. Se escribe uno nuevo con los valores de producción:

| Variable | Valor |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | **`false`** |
| `APP_URL` | `https://rbielsam.com` |
| `APP_LOCALE` | `es` |
| `DB_HOST` | punto final de RDS |
| `SESSION_DOMAIN` | se deja en `null` (un solo dominio) |
| `MAIL_FROM_ADDRESS` | dirección del dominio propio, tras verificarlo |

### D8 — HTTPS con Let's Encrypt

Certbot con el plugin de Apache, que añade el certificado y programa su renovación. Redirección de HTTP a HTTPS.

### D9 — Copias automáticas de la base de datos hacia S3

Un script que hace `mysqldump`, comprime y sube al bucket, ejecutado por **cron**. El bucket aplica una regla de ciclo de vida para no acumular copias indefinidamente. El mismo script incluye cómo **restaurar**, y esa restauración **se prueba una vez** en el momento de la puesta en marcha: una copia que nunca se ha probado no es una copia.

### D10 — Publicar es un procedimiento escrito

Se documenta en `docs/despliegue.md` el paso a paso de: crear la infraestructura, configurar el servidor, publicar la primera versión, **publicar una versión posterior** y **restaurar una copia**. El RF-7 se cumple con ese documento.

### D11 — La infraestructura se crea a mano, no con código

No se usa Terraform ni CloudFormation. Para una instalación única y un proyecto de este tamaño, añadir una herramienta de infraestructura es complejidad que no compensa. **A cambio, el paso a paso queda escrito con exactitud**, que es lo que protege el RF-7.

> La persona usuaria tendrá que ejecutar los pasos: no se puede entrar en una cuenta de AWS ni en un servidor desde aquí. La guía está pensada para seguirse sin interpretación.

## Estructura de ficheros

### Repositorio — 3 ficheros nuevos, ninguno modificado

```
docs/despliegue.md      (nuevo: guía de puesta en marcha, actualización y restauración)
deploy/publicar.sh      (nuevo: compila, sube y aplica una versión)
deploy/respaldo.sh      (nuevo: copia la base de datos a S3; corre por cron en el servidor)
```

> **No se modifica ningún fichero de la aplicación** (`React/src/…`, `Laravel/app/…`, `routes/…`, `config/…`) **ni ningún test.**
>
> Si al publicar se descubre que la ruta de bienvenida de Laravel se interpone en `/`, esa modificación se registra aquí en su momento; hasta entonces no se toca.

### Infraestructura — fuera del repositorio

| Recurso | Detalle |
|---|---|
| EC2 | Ubuntu 24.04, `t2.micro`, ≥ 8 GB, con rol de IAM para S3 |
| RDS | MySQL `db.t3.micro`, en la misma VPC, solo accesible desde el EC2 |
| S3 | Un bucket privado para copias, con ciclo de vida |
| Reglas de seguridad | 80 y 443 abiertos, 22 solo desde la IP de administración, 3306 solo desde el EC2 |
| Dominio | `rbielsam.com` registrado fuera de AWS, apuntando al EC2 |

## Tests existentes que leen esta zona

Como esta spec no modifica código, **ningún test puede fallar por ella**. Se comprueba igualmente que las suites siguen igual, como red de seguridad:

| Suite | Resultado esperado |
|---|---|
| `npm test` | **234/234**, sin modificar ninguno |
| `php artisan test --compact` | **105/105** |
| `npm run build` | sin errores |

## Pasos de implementación

1. **Contratar el dominio** `rbielsam.com` en un registrador al costo.
2. **Crear la infraestructura** en AWS siguiendo `docs/despliegue.md`: EC2, RDS, bucket de S3, reglas de seguridad.
3. **Configurar el servidor**: Apache, PHP y sus extensiones, MySQL, Composer, Certbot y HTTPS.
4. **Preparar la aplicación en el servidor**: código, `.env` de producción, dependencias, migraciones y enlace de almacenamiento.
5. **Migrar los datos**: base de datos y foto de perfil.
6. **Publicar la primera versión**: compilar React en local, subir el build, comprobar que `/` entrega la app.
7. **Dejar las copias automáticas** funcionando y **probar una restauración**.
8. **Verificar el correo**: verificar el dominio y cambiar el remitente.
9. **Documentar la actualización**: comprobar que el procedimiento escrito permite publicar un cambio.

## Verificación

### Automática

- `npm test`, `npm run build` y `php artisan test --compact` igual que antes: **234, en verde, 105**.
- **Ningún test modificado.**

### Manual — contra el sitio publicado

**1 · El sitio responde (RF-1)**
Acceder a `https://rbielsam.com` desde otra red (datos móviles, no la misma que el servidor) y comprobar que se carga la página pública **sin ningún aviso de sitio inseguro**. Acceder por `http://rbielsam.com` y comprobar que redirige a HTTPS.

**2 · Es la aplicación, no la página de bienvenida de Laravel (RF-1, D6)**
En la raíz debe aparecer el portfolio —foto, nombre y navegación— y **no** la página azul de Laravel. Es el punto que más riesgo tiene de fallar.

**3 · El panel funciona en el dominio (RF-2)**
Iniciar sesión con las credenciales de origen. Comprobar que las seis vistas abren con sus datos, que el cambio de idioma funciona y que la preferencia persiste al recargar.

**4 · Los datos coinciden (RF-3)**
Comparar los recuentos con los de origen: **1 formación · 1 experiencia · 0 proyectos · 2 usuarios · 1 mensaje**. Y comprobar que **no** hay usuarios de prueba ni mensajes inventados.

**5 · La foto se ve (RF-4)**
La foto de perfil debe aparecer en la página pública y en el panel, sin aviso de imagen no disponible.

**6 · El correo llega (RF-5)**
Enviar el formulario de contacto desde el sitio publicado y comprobar que el mensaje **llega al correo de la persona responsable**, con el remitente del dominio propio.

**7 · Las copias existen y se pueden restaurar (RF-6)**
Comprobar que la copia automática aparece en el bucket. Y **probar una restauración** en una base de datos de prueba, no en la real.

**8 · Sin secretos (RF-8)**
Intentar provocar un error y comprobar que la respuesta **no** muestra trazas ni valores de entorno. Revisar que el repositorio publicado no contiene claves.

**9 · La actualización funciona (RF-7)**
Seguir el procedimiento escrito para publicar un cambio real menor y comprobar que aparece en el sitio.

### Datos

**No se crean ni se borran datos**: se **migra** el contenido existente. Antes de migrar se comprueba que nadie esté editando el panel. Después de migrar se comparan los recuentos y la foto, tal como describe el RF-3.

### Coste

Al terminar queda escrito en `docs/despliegue.md` **qué cuesta el despliegue** y **qué empezará a costar cuando termine el periodo gratuito**, para que no haya sorpresas a los doce meses.

## Criterios de finalización del plan

- `https://rbielsam.com` sirve la página pública sin avisos de inseguridad.
- El panel permite iniciar sesión y gestionar las seis vistas en el dominio.
- Los datos publicados coinciden con los de origen y no hay registros de prueba.
- La foto de perfil se ve en la página pública y en el panel.
- Un mensaje del formulario llega al correo de la persona responsable desde el dominio propio.
- Existe una copia automática de la base de datos fuera de la máquina, **y se ha probado restaurarla**.
- `docs/despliegue.md` permite publicar una modificación y restaurar una copia siguiendo sus pasos.
- La depuración está desactivada, no hay secretos en el repositorio y la base de datos no se expone a internet.
- Las suites siguen en **234** y **105**, sin ningún test modificado.
