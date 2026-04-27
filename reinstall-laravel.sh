#!/bin/bash

# 1. Validar argumentos
if [ -z "$1" ]; then
    echo "❌ Error: Debes indicar la ruta de la carpeta del proyecto."
    exit 1
fi

TARGET_DIR="$1"

# 2. Validar carpeta y obtener ruta absoluta
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: La carpeta '$TARGET_DIR' no existe."
    exit 1
fi

ABS_PATH=$(cd "$TARGET_DIR" && pwd)

# 3. Validar composer.json
if [ ! -f "$ABS_PATH/composer.json" ]; then
    echo "❌ Error: No se encontró 'composer.json' en '$ABS_PATH'."
    exit 1
fi

echo "🚀 Iniciando instalación en: $ABS_PATH"

IMAGE="laravelsail/php84-composer:latest"

# 4. Ejecutar Docker (Instalar dependencias y crear .env)
docker run --rm \
    --pull=always \
    -u "$(id -u):$(id -g)" \
    -v "$ABS_PATH:/opt" \
    -w /opt \
    $IMAGE \
    bash -c "composer install --ignore-platform-reqs && ([ -f .env ] || cp .env.example .env) && php artisan key:generate"

# --- CORRECCIÓN AQUÍ ---
# 4.1 Configurar WWWGROUP y WWWUSER en el .env
# Esto es necesario para que el Dockerfile de Sail no falle al construir
echo "🔧 Configurando permisos de usuario en .env..."

# Definir IDs actuales
CURRENT_UID=$(id -u)
CURRENT_GID=$(id -g)

# Verificar si ya existen en el .env, si no, agregarlos
if ! grep -q "^WWWGROUP=" "$ABS_PATH/.env"; then
    echo "WWWGROUP=$CURRENT_GID" >> "$ABS_PATH/.env"
else
    # Si existe pero está vacío o diferente, lo actualizamos (opcional, sed en mac/linux varía)
    sed -i "s/^WWWGROUP=.*/WWWGROUP=$CURRENT_GID/" "$ABS_PATH/.env" 2>/dev/null || sed -i "" "s/^WWWGROUP=.*/WWWGROUP=$CURRENT_GID/" "$ABS_PATH/.env"
fi

if ! grep -q "^WWWUSER=" "$ABS_PATH/.env"; then
    echo "WWWUSER=$CURRENT_UID" >> "$ABS_PATH/.env"
else
    sed -i "s/^WWWUSER=.*/WWWUSER=$CURRENT_UID/" "$ABS_PATH/.env" 2>/dev/null || sed -i "" "s/^WWWUSER=.*/WWWUSER=$CURRENT_UID/" "$ABS_PATH/.env"
fi
# -----------------------

# 5. Si todo salió bien, abrir VS Code
if [ $? -eq 0 ]; then
    echo "✅ Todo listo. Abriendo VS Code..."
    
    cd "$ABS_PATH"
    
    if command -v code &> /dev/null; then
        # Reabrir VS Code forzará a DevContainers a leer el nuevo .env
        code .
    else
        echo "⚠️ No se encontró el comando 'code'. ¿Tienes VS Code instalado en el PATH?"
    fi
else
    echo "❌ Hubo un error durante la instalación."
fi
