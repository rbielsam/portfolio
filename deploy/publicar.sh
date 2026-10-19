#!/usr/bin/env bash
# =============================================================================
# deploy/publicar.sh — publica una versión del portfolio en el servidor
#
# Uso:
#   ./deploy/publicar.sh
#
# Compila el frontend aquí (el servidor no instala Node), sincroniza el código
# y el build con el servidor y aplica la caché. Se ejecuta desde la raíz del
# proyecto, en la máquina de desarrollo.
#
# Requisito: acceso SSH al servidor configurado (clave y dirección).
# La configuración se ajusta en el apartado CONFIGURACIÓN de abajo, o con
# variables de entorno, por ejemplo:
#   PORTFOLIO_SERVIDOR=ubuntu@<IP> ./deploy/publicar.sh
# =============================================================================

set -euo pipefail

# --- CONFIGURACIÓN -----------------------------------------------------------
# Dirección SSH del servidor y ruta de la aplicación en el servidor.
SERVIDOR="${PORTFOLIO_SERVIDOR:-}"
CLAVE="${PORTFOLIO_CLAVE:-}"          # ruta al fichero .pem; vacío si ya está en el agente SSH
RAIZ_REMOTA="${PORTFOLIO_RAIZ:-/var/www/portfolio}"
# -----------------------------------------------------------------------------

if [[ -z "$SERVIDOR" ]]; then
    echo "✗ Falta la dirección del servidor."
    echo "  Ejecuta:  PORTFOLIO_SERVIDOR=ubuntu@<IP> $0"
    echo "  O edita el apartado CONFIGURACIÓN de este fichero."
    exit 1
fi

if [[ ! -d .git || ! -f React/package.json || ! -f Laravel/artisan ]]; then
    echo "✗ No se reconoce la raíz del proyecto."
    echo "  Ejecuta el script desde el directorio que contiene .git, React/ y Laravel/."
    exit 1
fi

SSH=(ssh)
if [[ -n "$CLAVE" ]]; then
    SSH=(ssh -i "$CLAVE")
fi

DESTINO="$SERVIDOR:$RAIZ_REMOTA"
EXCLUSIONES=(
    --exclude '.env'
    --exclude '.env.*'
    --exclude 'vendor/'
    --exclude 'node_modules/'
    --exclude 'storage/'
    --exclude 'public/storage'     # enlace de storage: lo crea el servidor con storage:link
    --exclude 'public/index.html'  # estos dos son del build de React y los
    --exclude 'public/assets/'     # sincroniza el paso 4; aquí no se tocan
    --exclude '.git/'
    --exclude 'tests/'
    --exclude '*.sql'
)

echo "════════════════════════════════════════════════════════════════════════"
echo " Publicar en $SERVIDOR:$RAIZ_REMOTA"
echo "════════════════════════════════════════════════════════════════════════"

# 1 · Comprobaciones locales antes de tocar el servidor -----------------------
echo
echo "→ 1/5  Comprobando que el proyecto está en verde"

echo "      pruebas del frontend"
(cd React && npm test)

echo "      pruebas del backend"
(cd Laravel && php artisan test --compact)

# 2 · Compilar el frontend ----------------------------------------------------
echo
echo "→ 2/5  Compilando el frontend"
(cd React && npm run build --silent)

if [[ ! -f React/dist/index.html ]]; then
    echo "✗ No se ha generado React/dist/index.html; la compilación ha fallado."
    exit 1
fi

# 3 · Sincronizar el código ---------------------------------------------------
echo
echo "→ 3/5  Sincronizando el código de Laravel"
rsync -az -e "${SSH[*]}" --delete "${EXCLUSIONES[@]}" Laravel/ "$DESTINO/Laravel/"

# 4 · Sincronizar el build ----------------------------------------------------
# ⚠️ NUNCA sincizar React/dist/ entero con --delete contra Laravel/public/:
#     borraría index.php, .htaccess, favicon.ico, robots.txt y storage/,
#     dejando el servidor sin forma de atender peticiones. Solo se sincronizan
#     las rutas propias del frontend: assets/ (con --delete para limpiar los
#     bundles anteriores) y index.html.
echo
echo "→ 4/5  Sincronizando el build del frontend"
rsync -az -e "${SSH[*]}" --delete React/dist/assets/ "$DESTINO/Laravel/public/assets/"
rsync -az -e "${SSH[*]}" React/dist/index.html "$DESTINO/Laravel/public/index.html"

# 5 · Aplicar en el servidor --------------------------------------------------
echo
echo "→ 5/5  Aplicando la versión en el servidor"

"${SSH[@]}" "$SERVIDOR" "set -euo pipefail
cd '$RAIZ_REMOTA/Laravel'

# Salvaguarda: si hubiera faltado la entrada de Laravel, se para aquí y no se
# sigue aplicando sobre un servidor roto.
for f in public/index.php public/.htaccess; do
    if [[ ! -f \$f ]]; then
        echo \"✗ Falta \$f en el servidor: no se puede publicar.\"
        echo \"  Revisar el paso 6 de docs/despliegue.md\"
        exit 1
    fi
done

if [[ -f composer.json ]]; then
    echo '      dependencias de producción'
    composer install --no-dev --optimize-autoloader --quiet
fi

if [[ -f artisan ]]; then
    # storage/ no se sincroniza desde aquí: si se hiciera con --delete, se
    # borrarían las fotos subidas desde el panel en producción. Solo se crean
    # las carpetas que Laravel necesita para funcionar.
    echo '      estructura de storage'
    mkdir -p storage/app/public
    mkdir -p storage/framework/cache/data
    mkdir -p storage/framework/sessions
    mkdir -p storage/framework/views
    mkdir -p storage/logs

    echo '      migraciones'
    php artisan migrate --force
    echo '      enlace de almacenamiento'
    php artisan storage:link --force 2>/dev/null || true
    echo '      caché'
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi
"

echo
echo "════════════════════════════════════════════════════════════════════════"
echo " ✅ Publicado."
echo
echo " Comprobar en el navegador:"
echo "   · la raíz muestra el portfolio y NO la página de bienvenida de Laravel"
echo "   · el panel inicia sesión y abre las seis vistas"
echo "════════════════════════════════════════════════════════════════════════"
