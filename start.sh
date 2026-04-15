#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Code Kingdoms - Docker Setup     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Instalar dependencias PHP si no existe vendor ──────────────────────────
if [ ! -d "backend/vendor" ]; then
  echo -e "${YELLOW}📦 Instalando dependencias PHP (composer install)...${NC}"
  docker run --rm \
    -v "$(pwd)/backend:/app" \
    -w /app \
    composer:latest \
    composer install --no-interaction --no-progress
  echo -e "${GREEN}✓ Vendor listo${NC}"
fi

# ── 2. Crear backend/.env si no existe ───────────────────────────────────────
if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}⚙  Creando backend/.env...${NC}"
  cp backend/.env.example backend/.env

  # Cambiar SQLite → MySQL y apuntar al contenedor mariadb
  sed -i 's/^DB_CONNECTION=sqlite/DB_CONNECTION=mariadb/' backend/.env
  sed -i 's/^# DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/'     backend/.env
  sed -i 's/^# DB_PORT=3306/DB_PORT=3306/'             backend/.env
  sed -i 's/^# DB_DATABASE=laravel/DB_DATABASE=codekingdomsdb/' backend/.env
  sed -i 's/^# DB_USERNAME=root/DB_USERNAME=sail/'      backend/.env
  sed -i 's/^# DB_PASSWORD=/DB_PASSWORD=password/'        backend/.env
  sed -i 's/^# FORWARD_DB_PORT=33060'             backend/.env

  echo -e "${GREEN}✓ backend/.env creado${NC}"
fi

# ── 3. Arrancar contenedores ──────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}🐳 Arrancando contenedores...${NC}"
docker compose up -d

# ── 4. Esperar a que Laravel esté listo ──────────────────────────────────────
echo -e "${YELLOW}⏳ Esperando a que Laravel arranque...${NC}"
sleep 10

# ── 5. Generar APP_KEY ────────────────────────────────────────────────────────
echo -e "${YELLOW}🔑 Generando APP_KEY...${NC}"
docker compose exec laravel.test php artisan key:generate --force

# ── 6. Migraciones ────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}🗄  Ejecutando migraciones...${NC}"
docker compose exec laravel.test php artisan migrate --force

# ── 7. (Opcional) Seeders ─────────────────────────────────────────────────────
read -p "¿Ejecutar seeders con datos de prueba? (s/N): " run_seed
if [[ "$run_seed" =~ ^[sS]$ ]]; then
  docker compose exec laravel.test php artisan db:seed --force
  echo -e "${GREEN}✓ Seeders ejecutados${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Proyecto levantado. Servicios:${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "  🌐 Frontend   → ${YELLOW}http://localhost:5173${NC}"
echo -e "  ⚙  Backend    → ${YELLOW}http://localhost${NC}"
echo -e "  🔑 Keycloak   → ${YELLOW}http://localhost:8080${NC}  (admin / admin)"
echo -e ""
echo -e "  📋 Logs:       ${YELLOW}docker compose logs -f${NC}"
echo -e "  🛑 Parar:      ${YELLOW}docker compose down${NC}"
echo -e "  🐚 Artisan:    ${YELLOW}docker compose exec laravel.test php artisan <cmd>${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
