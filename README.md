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

## Despliegue en Render

El archivo `render.yaml` configura el API de Node, el sitio estático y PostgreSQL como un Blueprint.

1. Sube el repositorio a GitHub y en Render crea un **New + → Blueprint** conectado a ese repositorio.
2. Render detectará `render.yaml`. Al crear los servicios, completa las variables que solicita:
   - `ADMIN_PASSWORD`: contraseña segura para el usuario `admin`; se usa solo al crear la cuenta por primera vez.
   - `ALLOWED_ORIGINS`: URL exacta del sitio estático, por ejemplo `https://pizza-negocio-web.onrender.com` (sin `/` al final).
   - `VITE_API_URL`: URL exacta del servicio `pizza-negocio-api`, por ejemplo `https://pizza-negocio-api.onrender.com` (sin `/` al final).
   - `WHATSAPP_VERIFY_TOKEN`: texto aleatorio que crearás y usarás también en la suscripción de Webhooks de Meta.
   - `META_APP_SECRET`: App Secret de Meta; no lo compartas ni lo pongas en el frontend.
   - `WHATSAPP_ACCESS_TOKEN`: token de acceso de WhatsApp Cloud API.
   - `WHATSAPP_PHONE_NUMBER_ID`: ID del número que aparece en la configuración de WhatsApp de Meta.
   - `WHATSAPP_GRAPH_API_VERSION`: versión Graph API habilitada para tu app, por ejemplo `v25.0`.
   - `GEMINI_API_KEY`: opcional. Si la configuras, Gemini responde preguntas generales usando el menú actual; sin ella, funcionan las respuestas automáticas de menú y disponibilidad.
3. Confirma el despliegue. La API inicializa las tablas y carga pizzas de ejemplo al arrancar.
4. Comprueba `https://<url-del-api>/api/health`; debe responder con `"status": "OK"` y PostgreSQL conectado. El sitio público y el panel estarán en la URL del servicio estático y `.../admin.html`.
5. En Meta Developers, configura el callback de Webhooks como `https://<url-del-api>/api/whatsapp/webhook`, pega el mismo `WHATSAPP_VERIFY_TOKEN` y suscribe el campo `messages`. La dirección debe ser la URL pública HTTPS del backend, no la URL del editor `/workflow/...`.

Meta permite una suscripción de webhook de WhatsApp por aplicación. Si la misma app está conectada al WhatsApp Trigger de n8n, elige un único receptor: desactiva el trigger de n8n antes de registrar el callback de este backend, o usa otra aplicación de Meta para n8n.

Si Render asigna URLs distintas, utiliza las URLs reales de tus servicios. `ADMIN_PASSWORD` solo se aplica al crear el administrador; cambiar la variable después no cambia la contraseña existente. Los planes gratuitos de Render tienen límites y la base de datos gratuita vence después de 30 días; para conservar datos en producción elige un plan de PostgreSQL con persistencia.

El número público de WhatsApp se configura en `frontend/src/config/whatsapp.js` en formato internacional, con código de país y solo dígitos.

El webhook del bot está en `backend/src/routes/whatsapp.routes.js`. Contesta sobre el menú y consulta en tiempo real el stock y estado activo de PostgreSQL; cuando una pizza está agotada o desactivada, ofrece alternativas disponibles. Para preguntas generales puede usar Gemini si `GEMINI_API_KEY` está configurada. En ese caso, el texto entrante del cliente y el menú se envían a la API de Gemini; sin esa variable, no se envían mensajes a un proveedor de IA externo.

En la página pública, el menú permite buscar por nombre o ingredientes, filtrar por tipo y disponibilidad, y ordenar por precio o nombre. El cliente arma el pedido en el carrito y el botón **Enviar pedido por WhatsApp** abre un mensaje con el detalle y el total; no se confirma ni se cobra desde la página.

## Arranque con Docker

```bash
docker compose up -d --build
```

Los scripts de `database/` se cargan automáticamente la primera vez que se crea el volumen de Postgres.

## Publicar en GitHub Pages

La página pública se genera en la carpeta `docs/` (HTML, CSS y JS estáticos).

1. En el repositorio: **Settings → Pages**
2. Source: **GitHub Actions** (recomendado) o **Deploy from a branch** → folder **/docs**
3. Si usas la carpeta `/docs`, primero corre `npm run build` y sube esos archivos

```bash
npm install --prefix frontend
npm run build
```

Sube el repo incluyendo `docs/`. Para GitHub Pages configura `VITE_API_URL` con la URL pública del backend antes de generar el sitio. El menú estático `menu.json` solo sirve como datos de ejemplo si no hay servidor.

Para fotos de las pizzas, pon la URL en `frontend/public/menu.json` (`imagen_url`) y vuelve a ejecutar `npm run build`.

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
- `GET|POST /api/whatsapp/webhook` (verificación y eventos firmados de Meta)
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
  cliente/  → vista pública (cartas 3D + pedido)
  admin/    → panel protegido
docs/       → sitio estático para GitHub Pages
```
