# Pizza Negocio

Sistema de inventario, pedidos y administración para una pizzería.

## Qué incluye

- Catálogo de pizzas para el cliente (disponible / agotada)
- Carrito, creación de pedido, confirmación de pago y código de entrega
- Panel admin con login JWT: dashboard, pedidos, reportes, CRUD de pizzas y finalización por código
- PostgreSQL + Docker
- Descuento de stock al confirmar pago (transacciones + `FOR UPDATE`)
- Cancelación de pedidos (restaura stock si ya estaba pagado)

## Tecnologías

- Frontend: Vite + JavaScript
- Backend: Node.js + Express
- Base de datos: PostgreSQL 16
- Contenedores: Docker Compose

## Requisitos

- Node.js 20+
- Docker Desktop

## Variables de entorno

Archivo `backend/.env`:

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=inventario
DB_USER=inventario_user
DB_PASSWORD=inventario_password
PORT=3000
JWT_SECRET=pizza_negocio_jwt_secreto_cambiar_en_produccion
JWT_EXPIRES_IN=8h
```

Si corres el backend fuera de Docker, usa `DB_HOST=localhost`.

## Arranque con Docker

```bash
docker compose up -d --build
```

Los scripts de `database/` se cargan automáticamente la primera vez que se crea el volumen de Postgres.

## Arranque local (desarrollo)

**Opción rápida** (backend en Docker + frontend local):

```bash
docker compose up -d
npm install --prefix frontend
npm run dev
```

**Opción manual** (carpetas separadas):

```bash
# Postgres (Docker)
docker compose up -d postgres

# Backend
cd backend
npm install
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

> `npm run dev` solo funciona en la raíz del proyecto o dentro de `frontend/` / `backend/`. No uses la carpeta padre del repo.

- API: http://localhost:3000
- Cliente: http://localhost:5173
- Admin: http://localhost:5173/admin.html

### Credenciales admin

- Usuario: `admin`
- Contraseña: `admin123`

## Flujo de pedidos

```
Cliente crea pedido → PENDIENTE_PAGO
Cliente confirma pago → PAGO_CONFIRMADO + código + descuento de stock
Admin finaliza con código → FINALIZADO
Admin puede cancelar (antes de finalizar) → CANCELADO
```

## Endpoints principales

### Público

- `GET /api/pizzas`
- `POST /api/pedidos`
- `POST /api/pedidos/:id/confirmar-pago`
- `POST /api/auth/login`

### Admin (Bearer token)

- `GET /api/pizzas/admin`
- `POST|PUT|DELETE|PATCH /api/pizzas...`
- `GET /api/pedidos`
- `GET /api/pedidos/:id`
- `POST /api/pedidos/:id/finalizar`
- `POST /api/pedidos/:id/cancelar`
- `GET /api/reportes/dashboard`
- `GET /api/reportes/mensual?anio=2026&mes=8`

## Estructura

```
backend/src
  routes | controllers | services | models | middleware | config
database/
  01-create-pizzas.sql
  02-create-pedidos.sql
  03-create-detalle-pedidos.sql
  04-create-administradores.sql
frontend/src
  cliente/  → vista pública
  admin/    → panel protegido
```
