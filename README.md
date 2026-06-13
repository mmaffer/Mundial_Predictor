# Mundial Predictor 2026

Plataforma web de predicciones para el Mundial FIFA 2026. Los usuarios registran sus predicciones de resultados antes de cada partido y acumulan puntos según la precisión de sus pronósticos. Incluye salas privadas para competir con amigos y un ranking global.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 |
| Backend | NestJS + Prisma ORM |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (Bearer token) |
| Infraestructura | Docker + Docker Compose |

## Estructura del proyecto

```
GRUPO/
├── BACKEND/          # API REST — NestJS
├── FRONTEND/         # Aplicación web — Next.js
└── docker-compose.yml
```

## Funcionalidades

- **Autenticación** — Registro e inicio de sesión con JWT
- **Partidos** — Listado de partidos por estado (próximos, en vivo, finalizados)
- **Predicciones** — Predice el marcador exacto antes del partido; edita mientras esté abierto
- **Sistema de puntos**
  - Marcador exacto → 5 pts
  - Ganador correcto → 3 pts
  - Diferencia de goles correcta → 2 pts
  - Bonus por predicción anticipada (+24h) → +1 pt
  - Bonus de racha (3+ aciertos seguidos) → +2 pts
- **Salas privadas** — Crea una sala con código de invitación o únete a la de otro
- **Ranking global** — Tabla con posición, puntos y racha de cada usuario
- **Estadísticas personales** — KPIs, desglose de predicciones y equipos mejor predichos
- **Panel de administración** — Gestión de partidos, usuarios y estadísticas de plataforma

## Levantar con Docker (recomendado)

Requiere Docker Desktop instalado.

```bash
# Desde la carpeta GRUPO/
docker compose up --build
```

La primera vez el backend ejecuta automáticamente las migraciones de base de datos.

Para cargar datos de prueba (equipos, partidos y usuario admin):

```bash
docker compose exec backend npx prisma db seed
```

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| pgAdmin (opcional) | http://localhost:5050 |

Para levantar pgAdmin:
```bash
docker compose --profile dev up --build
```

## Desarrollo local (sin Docker)

### Requisitos

- Node.js 20+
- PostgreSQL corriendo en `localhost:5433` (o ajustar `DATABASE_URL` en `BACKEND/.env`)

### Instalación

```bash
# Desde GRUPO/
npm install          # instala concurrently en raíz
npm run install:all  # instala dependencias de BACKEND y FRONTEND
```

### Variables de entorno

```bash
cp BACKEND/.env.example BACKEND/.env
```

Edita `BACKEND/.env` con tus valores reales. El archivo `.env.example` incluye todas las variables necesarias con valores de referencia.

Para el frontend, crea `FRONTEND/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Base de datos

```bash
cd BACKEND

# Levantar PostgreSQL con Docker (solo la BD)
docker compose up postgres -d

# Aplicar migraciones
npx prisma migrate dev

# Cargar datos de prueba
npx prisma db seed
```

### Iniciar servidores

```bash
# Desde GRUPO/ — levanta backend y frontend en paralelo
npm run dev
```

O por separado:

```bash
npm run dev:backend    # NestJS en http://localhost:3001
npm run dev:frontend   # Next.js en http://localhost:3000
```

## Endpoints principales de la API

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/matches
GET    /api/matches/upcoming
GET    /api/matches/:id

GET    /api/predictions
POST   /api/predictions
PATCH  /api/predictions/:matchId

GET    /api/rooms
GET    /api/rooms/my
POST   /api/rooms
POST   /api/rooms/join
GET    /api/rooms/:id
GET    /api/rooms/:id/members

GET    /api/rankings/global
GET    /api/rankings/me

GET    /api/statistics/me
GET    /api/statistics/platform
```
