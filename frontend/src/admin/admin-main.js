import {
  estaAutenticado,
  loginAdmin,
  logoutAdmin,
  guardarPizza,
  limpiarFormulario,
  finalizarPedido,
  iniciarPanelAdmin,
  cargarReporteMensual,
} from "./admin.js";

const ahora = new Date();

if (!estaAutenticado()) {
  document.querySelector("#app").innerHTML = `
    <main class="login-page">
      <section class="login-showcase" aria-label="El Callejón">
        <div class="login-showcase-top">
          <span class="login-logo" aria-hidden="true">🍕</span>
          <div>
            <p class="login-kicker">Pizzería artesanal</p>
            <h1>El Callejón</h1>
          </div>
        </div>

        <div class="login-showcase-copy">
          <h2>Todo tu negocio,<br />en un solo lugar.</h2>
          <p>
            Controla pedidos, pagos, inventario y ventas del mes desde un panel
            claro, rápido y pensado para el día a día.
          </p>
        </div>

        <ul class="login-benefits">
          <li><span aria-hidden="true">✓</span> Pedidos y pagos en tiempo real</li>
          <li><span aria-hidden="true">✓</span> Stock que se descuenta automáticamente</li>
          <li><span aria-hidden="true">✓</span> Reportes de ventas por día y por mes</li>
        </ul>
      </section>

      <form id="login-form" class="login-card">
        <p class="login-eyebrow">Panel de administración</p>
        <h2>Bienvenido de nuevo</h2>
        <p class="login-lead">Ingresa tus credenciales para continuar.</p>

        <label class="login-field">
          <span>Usuario</span>
          <input id="login-usuario" type="text" required autocomplete="username" placeholder="admin" />
        </label>

        <label class="login-field">
          <span>Contraseña</span>
          <input id="login-password" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </label>

        <button type="submit" class="btn-admin btn-admin-primary btn-block">
          Iniciar sesión
        </button>
        <div id="login-resultado" aria-live="polite"></div>

        <p class="login-footnote">
          Acceso exclusivo para el equipo de El Callejón.
        </p>
      </form>
    </main>
  `;

  document
    .querySelector("#login-form")
    .addEventListener("submit", loginAdmin);
} else {
  document.querySelector("#app").innerHTML = `
    <main class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-brand">
          <span class="admin-brand-mark" aria-hidden="true">🍕</span>
          <div>
            <strong>El Callejón</strong>
            <small>Administración</small>
          </div>
        </div>

        <nav class="admin-nav" aria-label="Secciones del panel">
          <button type="button" class="admin-nav-item activo" data-section="dashboard" aria-current="page">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            </span>
            <span>Dashboard</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="pedidos">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></svg>
            </span>
            <span>Pedidos</span>
            <span id="nav-pendientes" class="nav-badge" hidden>0</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="productos">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>
            </span>
            <span>Productos</span>
          </button>

          <button type="button" class="admin-nav-item" data-section="reportes">
            <span class="admin-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
            </span>
            <span>Reportes</span>
          </button>
        </nav>

        <div class="admin-sidebar-footer">
          <div class="admin-session">
            <span class="admin-avatar" aria-hidden="true">A</span>
            <div>
              <strong>admin</strong>
              <small>Sesión activa</small>
            </div>
          </div>
          <button type="button" id="btn-logout" class="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div class="admin-main">
        <header class="admin-topbar">
          <div class="admin-topbar-copy">
            <p class="admin-eyebrow">El Callejón · Administración</p>
            <h1 id="admin-page-title">Dashboard</h1>
            <p id="admin-page-subtitle">Resumen de ventas, pedidos y stock de tu negocio.</p>
          </div>
          <div class="admin-topbar-actions">
            <button type="button" id="btn-refresh" class="btn-admin btn-admin-ghost">
              <span class="btn-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 0-2.3 6.7"/><path d="M20 4v7h-7"/></svg>
              </span>
              Actualizar
            </button>
          </div>
        </header>

        <div class="admin-sections">
          <section class="admin-section activo" id="section-dashboard" aria-label="Dashboard">
            <div id="dashboard-stats" class="stats-grid">
              <p class="loading-text">Cargando resumen...</p>
            </div>

            <div class="dashboard-grid">
              <article class="panel-card">
                <div class="panel-card-head">
                  <div>
                    <h2>Últimos pedidos</h2>
                    <p>Los movimientos más recientes de tu negocio.</p>
                  </div>
                  <button type="button" class="btn-link" data-goto="pedidos">Ver todos</button>
                </div>
                <div id="dashboard-pedidos" class="mini-pedidos">
                  <p class="loading-text">Cargando pedidos...</p>
                </div>
              </article>

              <article class="panel-card">
                <div class="panel-card-head">
                  <div>
                    <h2>Stock en alerta</h2>
                    <p>Productos que necesitan tu atención.</p>
                  </div>
                  <button type="button" class="btn-link" data-goto="productos">Gestionar</button>
                </div>
                <div id="dashboard-stock" class="stock-alertas">
                  <p class="loading-text">Cargando inventario...</p>
                </div>
              </article>
            </div>
          </section>

          <section class="admin-section" id="section-pedidos" aria-label="Pedidos" hidden>
            <div class="section-toolbar">
              <label class="toolbar-search">
                <span class="sr-only">Buscar pedidos</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
                <input id="pedidos-busqueda" type="search" placeholder="Buscar por #, teléfono o código..." autocomplete="off" />
              </label>

              <label class="toolbar-select">
                <span class="sr-only">Filtrar por estado</span>
                <select id="pedidos-filtro-estado">
                  <option value="todos">Todos los estados</option>
                  <option value="PENDIENTE_PAGO">Pendientes de pago</option>
                  <option value="PAGO_CONFIRMADO">Pagos confirmados</option>
                  <option value="FINALIZADO">Finalizados</option>
                  <option value="CANCELADO">Cancelados</option>
                </select>
              </label>

              <button type="button" id="btn-refresh-pedidos" class="btn-admin btn-admin-ghost">
                Actualizar
              </button>
            </div>

            <p class="section-hint">
              El stock se reserva al registrar el pedido. Si un pedido no se paga,
              cancélalo para devolver el stock al inventario.
            </p>

            <div id="pedidos-lista" class="panel-card panel-card-flush">
              <p class="loading-text">Cargando pedidos...</p>
            </div>
          </section>

          <section class="admin-section" id="section-productos" aria-label="Productos" hidden>
            <div class="products-layout">
              <article class="panel-card product-form-card">
                <div class="panel-card-head">
                  <div>
                    <h2 id="form-title">Nuevo producto</h2>
                    <p>Agrega productos o actualiza precios y stock.</p>
                  </div>
                </div>

                <form id="pizza-form" class="pizza-form">
                  <input type="hidden" id="pizza-id" />

                  <div class="form-grid">
                    <div class="form-group full">
                      <label for="nombre">Nombre</label>
                      <input id="nombre" type="text" required maxlength="150" />
                    </div>

                    <div class="form-group">
                      <label for="precio">Precio</label>
                      <input id="precio" type="number" min="0" step="100" required />
                    </div>

                    <div class="form-group">
                      <label for="categoria">Categoría</label>
                      <input id="categoria" type="text" list="categorias-producto" maxlength="80" required value="Pizzas" />
                      <datalist id="categorias-producto">
                        <option value="Pizzas"></option>
                        <option value="Hamburguesas"></option>
                        <option value="Bebidas"></option>
                        <option value="Granizados"></option>
                        <option value="Acompañamientos"></option>
                        <option value="Postres"></option>
                        <option value="Combos"></option>
                        <option value="Otros"></option>
                      </datalist>
                    </div>

                    <div class="form-group full">
                      <label for="descripcion">Descripción</label>
                      <textarea id="descripcion" required></textarea>
                    </div>

                    <div class="form-group">
                      <label for="stock">Stock</label>
                      <input id="stock" type="number" min="0" step="1" required />
                    </div>

                    <div class="form-group">
                      <label for="imagen_url">Imagen URL</label>
                      <input id="imagen_url" type="url" placeholder="https://..." />
                    </div>

                    <div class="form-group full">
                      <label class="checkbox-label">
                        <input id="activo" type="checkbox" checked />
                        <span>Producto activo en el catálogo</span>
                      </label>
                    </div>
                  </div>

                  <div class="form-buttons">
                    <button type="submit" class="btn-admin btn-admin-primary">
                      Guardar producto
                    </button>
                    <button type="button" class="btn-admin btn-admin-ghost" id="btn-limpiar">
                      Limpiar
                    </button>
                  </div>
                </form>
              </article>

              <div class="products-list-wrap">
                <div class="section-toolbar">
                  <label class="toolbar-search">
                    <span class="sr-only">Buscar productos</span>
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
                    <input id="productos-busqueda" type="search" placeholder="Buscar producto..." autocomplete="off" />
                  </label>

                  <label class="toolbar-select">
                    <span class="sr-only">Filtrar por categoría</span>
                    <select id="productos-filtro-categoria">
                      <option value="todas">Todas las categorías</option>
                    </select>
                  </label>
                </div>

                <div id="admin-pizzas" class="pizzas-grid">
                  <p class="loading-text">Cargando productos...</p>
                </div>
              </div>
            </div>
          </section>

          <section class="admin-section" id="section-reportes" aria-label="Reportes" hidden>
            <article class="panel-card reporte-filtros-card">
              <div class="reporte-filtros">
                <label>
                  <span>Año</span>
                  <input id="reporte-anio" type="number" min="2000" value="${ahora.getFullYear()}" />
                </label>
                <label>
                  <span>Mes</span>
                  <input id="reporte-mes" type="number" min="1" max="12" value="${ahora.getMonth() + 1}" />
                </label>
                <button type="button" id="btn-cargar-reporte" class="btn-admin btn-admin-primary">
                  Actualizar reporte
                </button>
              </div>
            </article>

            <div id="reporte-mensual">
              <p class="loading-text">Cargando reporte...</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <dialog id="modal-pedido" class="admin-modal" aria-labelledby="modal-pedido-titulo">
      <div id="modal-pedido-contenido"></div>
    </dialog>

    <dialog id="modal-finalizar" class="admin-modal" aria-labelledby="modal-finalizar-titulo">
      <div class="modal-header">
        <div>
          <p class="modal-eyebrow">Entrega</p>
          <h2 id="modal-finalizar-titulo">Finalizar pedido</h2>
        </div>
        <button type="button" class="modal-close" data-cerrar-modal="modal-finalizar" aria-label="Cerrar">×</button>
      </div>

      <form id="finalizar-pedido-form" class="modal-form">
        <p class="form-ayuda">
          Confirma la entrega con el código de confirmación del pedido. Puedes
          copiarlo desde la lista de pedidos o desde el detalle.
        </p>

        <div class="form-grid">
          <div class="form-group">
            <label for="pedido-id">ID del pedido</label>
            <input id="pedido-id" type="number" min="1" required placeholder="Ej: 4" />
          </div>
          <div class="form-group">
            <label for="pedido-codigo">Código de confirmación</label>
            <input id="pedido-codigo" type="text" required placeholder="Ej: PZ-3ZANQA" />
          </div>
        </div>

        <div class="form-buttons">
          <button type="submit" class="btn-admin btn-admin-success">
            Confirmar entrega
          </button>
          <button type="button" class="btn-admin btn-admin-ghost" data-cerrar-modal="modal-finalizar">
            Cancelar
          </button>
        </div>
      </form>
    </dialog>

    <div id="admin-toasts" class="toast-stack" aria-live="polite" aria-atomic="true"></div>
  `;

  document
    .querySelector("#btn-logout")
    .addEventListener("click", logoutAdmin);

  document
    .querySelector("#finalizar-pedido-form")
    .addEventListener("submit", finalizarPedido);

  document
    .querySelector("#pizza-form")
    .addEventListener("submit", guardarPizza);

  document
    .querySelector("#btn-limpiar")
    .addEventListener("click", limpiarFormulario);

  document
    .querySelector("#btn-cargar-reporte")
    .addEventListener("click", cargarReporteMensual);

  iniciarPanelAdmin();
}
