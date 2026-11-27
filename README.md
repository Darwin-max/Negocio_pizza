# Pizza Negocio

Sistema de inventario, pedidos y administración para una pizzería.

## Qué incluye

- Catálogo de productos por categoría (pizzas, hamburguesas, bebidas, granizados y otras), con filtros de disponibilidad
- Carrito que registra el pedido en el backend y abre WhatsApp con el resumen
- Panel admin con login JWT: dashboard, pedidos, reportes, CRUD de productos y finalización por código
- PostgreSQL + Docker
- Reserva y descuento de stock al registrar el pedido (transacciones + `FOR UPDATE`)
- Cancelación de pedidos (devuelve el stock reservado al inventario)

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
   - `WHATSAPP_MENU_URL`: enlace público del catálogo, opcional; por defecto se usa `https://darwin-max.github.io/Negocio_pizza/`.
   - `GEMINI_API_KEY`: opcional. Si la configuras, Gemini responde preguntas generales usando el menú actual; sin ella, funcionan las respuestas automáticas de menú y disponibilidad.
3. Confirma el despliegue. La API inicializa las tablas y carga pizzas de ejemplo al arrancar.
4. Comprueba `https://<url-del-api>/api/health`; debe responder con `"status": "OK"` y PostgreSQL conectado. El sitio público y el panel estarán en la URL del servicio estático y `.../admin.html`.
5. En Meta Developers, configura el callback de Webhooks como `https://<url-del-api>/api/whatsapp/webhook`, pega el mismo `WHATSAPP_VERIFY_TOKEN` y suscribe el campo `messages`. La dirección debe ser la URL pública HTTPS del backend, no la URL del editor `/workflow/...`.

Meta permite una suscripción de webhook de WhatsApp por aplicación. Si la misma app está conectada al WhatsApp Trigger de n8n, elige un único receptor: desactiva el trigger de n8n antes de registrar el callback de este backend, o usa otra aplicación de Meta para n8n.

Si Render asigna URLs distintas, utiliza las URLs reales de tus servicios. `ADMIN_PASSWORD` solo se aplica al crear el administrador; cambiar la variable después no cambia la contraseña existente. Los planes gratuitos de Render tienen límites y la base de datos gratuita vence después de 30 días; para conservar datos en producción elige un plan de PostgreSQL con persistencia.

El número público de WhatsApp se configura en `frontend/src/config/whatsapp.js` en formato internacional, con código de país y solo dígitos.

La política de privacidad pública está en `frontend/privacy.html`; después de desplegar el sitio estático se publica en `https://<url-del-sitio>/privacy.html`. Usa la URL real del servicio `pizza-negocio-web` en Meta. La política informa sobre el tratamiento de mensajes por Meta, el alojamiento en Render y el uso opcional de Gemini.

El webhook del bot está en `backend/src/routes/whatsapp.routes.js`. Sus mensajes usan formato compatible con WhatsApp: menú agrupado por categoría, precios destacados, emojis y un resumen claro del pedido. Cada producto disponible recibe un número único en todo el menú; el cliente puede pedir con mensajes como `1 x 2, 3 x 1` o escribiendo el nombre del producto. Antes de registrar el pedido, el bot solicita elegir efectivo, transferencia o Nequi (312 406 0135) y requiere que el cliente escriba `CONFIRMAR PEDIDO`. Consulta en tiempo real el stock y estado activo de PostgreSQL; cuando un producto está agotado o desactivado, ofrece alternativas disponibles. También responde sobre domicilio, salsas adicionales y las redes oficiales (Instagram: `https://www.instagram.com/elcallejon_n4496?psln=MXVsbGRteXI3MW51Mg==`; Facebook: `https://www.facebook.com/profile.php?id=61595493282153`). Los borradores de pedidos se conservan por 24 horas; el cliente puede agregar productos en varios mensajes, consultar el resumen y registrarlo al confirmar. Los pedidos de WhatsApp quedan pendientes de pago en el panel y guardan el teléfono, el método de pago preferido, la dirección indicada y las solicitudes. El subtotal se calcula con los precios de todos los productos; como la tarifa de domicilio y el precio de salsa adicional aún no están definidos, el bot los marca como pendientes y no inventa un total final.

Para preguntas generales puede usar Gemini si `GEMINI_API_KEY` está configurada. En ese caso, el texto entrante del cliente y el menú se envían a la API de Gemini; sin esa variable, no se envían mensajes a un proveedor de IA externo.

En el panel de administración, cada producto tiene una categoría editable (por ejemplo, `Hamburguesas`, `Bebidas`, `Granizados` o `Combos`); las categorías se crean al escribirlas y guardar el producto. Los productos de categoría `Combos` aparecen en una sección destacada independiente, con nombre, descripción, precio fijo, disponibilidad e imagen opcional; también se agregan al carrito como cualquier producto. Las demás categorías aparecen automáticamente como filtros del menú. También se puede buscar por nombre o ingredientes, filtrar por disponibilidad y ordenar por precio o nombre.

El cliente arma el pedido en el carrito y pulsa **Registrar pedido y enviar**: la web crea el pedido en el panel, reserva el stock y luego abre WhatsApp con el número de pedido y el detalle. El campo de WhatsApp es opcional. Si el backend no responde, queda disponible **Enviar solo por WhatsApp**, que no registra el pedido ni reserva stock. Los pedidos registrados quedan en `PENDIENTE_PAGO`; el pago se registra desde el panel y el stock solo se devuelve si el admin cancela el pedido antes de finalizarlo. En iPhone y iPad, Safari puede bloquear la apertura automática de WhatsApp después de una petición asíncrona; por eso, tras registrar el pedido, la web muestra y enfoca el botón **Enviar pedido #… solo por WhatsApp** para que el cliente lo abra con un toque.

## Arranque con Docker

```bash
docker compose up -d --build
```

Los scripts de `database/` se cargan automáticamente la primera vez que se crea el volumen de Postgres.

## Publicar en GitHub Pages

La página pública se genera en la carpeta `docs/` (HTML, CSS y JS estáticos).

1. En el repositorio: **Settings → Secrets and variables → Actions → Variables** y crea `VITE_API_URL` con la URL pública del backend, por ejemplo `https://pizza-negocio-api.onrender.com` (sin `/` al final).
2. En **Settings → Pages**, elige Source: **GitHub Actions** (recomendado) o **Deploy from a branch** → folder **/docs**.
3. Si usas la carpeta `/docs`, primero corre el build con la variable y sube esos archivos:

```bash
cd frontend
VITE_API_URL=https://tu-api.onrender.com npm run build
```

Sube el repo incluyendo `docs/`. Sin `VITE_API_URL`, el sitio público puede abrir WhatsApp, pero no podrá registrar pedidos ni reservar stock en el panel. El menú estático `menu.json` solo sirve como datos de ejemplo si no hay servidor.

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
Cliente registra pedido en la web o por WhatsApp → PENDIENTE_PAGO + stock reservado
Admin registra el pago → PAGO_CONFIRMADO + código de entrega (el stock ya estaba reservado)
Admin finaliza con el código → FINALIZADO
Admin cancela antes de finalizar → CANCELADO + stock devuelto
```

Si un pedido queda sin pagar, el admin debe cancelarlo para liberar el stock reservado.

## Endpoints principales

### Público

- `GET /api/pizzas`
- `GET|POST /api/whatsapp/webhook` (verificación y eventos firmados de Meta)
- `POST /api/pedidos`
- `POST /api/auth/login`

### Admin (Bearer token)

- `GET /api/pizzas/admin`
- `POST|PUT|DELETE|PATCH /api/pizzas...`
- `GET /api/pedidos`
- `GET /api/pedidos/:id`
- `POST /api/pedidos/:id/confirmar-pago`
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
