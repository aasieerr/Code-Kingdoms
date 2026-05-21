# Code Kingdoms

**Donde la lógica se convierte en poder.** RPG pixel-art en el navegador donde eliges tu bando — **PHP** o **Java** — creas héroes, exploras reinos temáticos, compras equipo, combates en arena por oleadas y compartes tu progreso con la comunidad.

---

## Contenido del juego

| Área | Descripción |
|------|-------------|
| **Reinos** | Dos facciones (Java y PHP) con mapas, NPCs y ambientación propia (JVM Volcano, Laravel Citadel, Array Islands, etc.). |
| **Personajes** | Razas, clases, estadísticas mejorables, inventario, equipo y armas con temática de programación. |
| **Lobby** | Mundo explorable con **WASD**, tiendas, diálogos con NPCs y zona de apariencias. |
| **Arena** | Combate por oleadas contra la facción rival: disparo automático, sprint, consumibles, bosses y progreso entre secciones. |
| **Economía** | Oro en partida, **CodeCoins** para cosméticos y tienda de skins. |
| **Comunidad** | Muro de publicaciones con likes y comentarios (notificaciones en tiempo real vía WebSockets). |
| **Capturas** | Galería de screenshots (`F8` en el juego). |
| **Cuenta** | Registro, login (Sanctum), perfil, avatar y gestión de personajes. |

Tutorial integrado la primera vez que entras al lobby de tu reino.

---

## Stack técnico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Vue 3, Vite 7, Vue Router, Pinia, Tailwind CSS, Axios |
| **Backend** | Laravel 12, Sanctum, API REST |
| **Base de datos** | MariaDB 11 |
| **Infra** | Docker Compose (Laravel Sail + contenedor Node para Vite) |

---

## Estructura del repositorio

```
Code-Kingdoms/
├── backend/          # API Laravel (modelos, controladores, migraciones, seeders)
├── frontend/         # Cliente Vue (vistas, composables, sprites, mapas)
├── docker-compose.yml
└── start.sh          # Arranque automatizado del entorno
```

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Git

> Node.js y Composer **no son obligatorios** en el host: el script y Docker se encargan de las dependencias.

---

## Inicio rápido

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd Code-Kingdoms
```

### 2. Dar permisos y ejecutar el script de arranque

```bash
chmod +x start.sh
./start.sh
```

El script:

1. Instala dependencias PHP (`composer install`) si faltan.
2. Crea `backend/.env` desde el ejemplo y lo configura para MariaDB.
3. Levanta los contenedores con Docker Compose.
4. Genera `APP_KEY`, ejecuta migraciones y enlaza el almacenamiento público.
5. Arranca **Laravel Reverb** (WebSockets) en segundo plano.
6. Pregunta si quieres cargar **datos de prueba** (seeders).

Para forzar seeders sin preguntar:

```bash
RUN_SEED=s ./start.sh
```

### 3. Abrir la aplicación

| Servicio | URL |
|----------|-----|
| **Frontend (juego)** | http://localhost:5173 |
| **API Laravel** | http://localhost |

---

## Cuentas de prueba (con seeders)

Si ejecutaste los seeders, puedes usar:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Jugador demo | `test@example.com` | `password` |
| Admin (todas las secciones, inmortal y mucho daño en arena) | `admin@example.com` | `password` |

También puedes **registrarte** desde la landing (`/register`).

---

## Flujo de juego

1. **Landing** (`/`) — Presentación y acceso a registro o login.
2. **Personajes** (`/personajes`) — Crear o elegir un héroe (reino, clase, etc.).
3. **Lobby** (`/game`) — Explorar tu reino, hablar con NPCs, comprar/vender, equipar objeto y abrir el mapa.
4. **Arena** (`/game/second`) — Entrar por el selector de etapas; oleadas, oro de sesión y progreso guardado en el personaje.
5. **Comunidad** (`/comunidad`) — Publicar, comentar y dar like (accesible sin estar en partida).
6. **Capturas** (`/capturas`) — Ver la galería global de screenshots.

Atajos habituales en el lobby: **I** inventario, **E** interactuar, **F8** captura de pantalla (configurable en ajustes).

---

## Comandos útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Parar el entorno
docker compose down

# Artisan dentro del contenedor Laravel
docker compose exec laravel.test php artisan migrate
docker compose exec laravel.test php artisan db:seed

# Reiniciar solo el frontend (si cambias dependencias npm)
docker compose restart frontend
```

---

## Desarrollo local (sin Docker)

Si prefieres ejecutar servicios en el host:

**Backend**

```bash
cd backend
composer install
cp .env.example .env   # y configura MariaDB
php artisan key:generate
php artisan migrate
php artisan serve
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Configura `VITE_API_PROXY_TARGET` en el frontend para que apunte a tu API (por defecto en Docker: `http://laravel.test:80`).

---

## API

Rutas principales bajo `/api` (prefijo según configuración de Laravel):

- **Públicas:** reinos, razas, clases, items, NPCs, skins, estadísticas globales, posts de comunidad (lectura).
- **Autenticadas (Bearer token Sanctum):** personajes, inventario, tienda, capturas, perfil, micropagos de CodeCoins, engagement en comunidad.

El cliente Vue centraliza las llamadas en `frontend/src/api/`.

---

## Licencia

Proyecto académico / demostración. Consulta el repositorio para detalles de autoría y uso.
