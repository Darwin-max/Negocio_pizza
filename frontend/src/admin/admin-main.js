import "./admin.css";
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
      <form id="login-form" class="login-card">
        <h1>🍕 Pizza Negocio</h1>
        <p>Panel de administración</p>

        <label>
          Usuario
          <input id="login-usuario" type="text" required autocomplete="username" />
        </label>

        <label>
          Contraseña
          <input id="login-password" type="password" required autocomplete="current-password" />
        </label>

        <button type="submit">Iniciar sesión</button>
        <div id="login-resultado"></div>
        <p class="login-hint">Usuario: admin · Contraseña: admin123</p>
      </form>
    </main>
  `;

  document
    .querySelector("#login-form")
    .addEventListener("submit", loginAdmin);
} else {
  document.querySelector("#app").innerHTML = `
    <main class="admin">
      <header class="admin-header">
        <div>
          <h1>🍕 Pizza Negocio</h1>
          <p>Panel de administración</p>
        </div>
        <button type="button" id="btn-logout" class="btn-logout">
          Cerrar sesión
        </button>
      </header>

      <section class="admin-content">

        <section class="panel-section">
          <h2>Dashboard</h2>
          <div id="dashboard-stats" class="stats-grid">
            <p>Cargando...</p>
          </div>
        </section>

        <section class="panel-section">
          <h2>Reportes del mes</h2>
          <div class="reporte-filtros">
            <label>
              Año
              <input id="reporte-anio" type="number" value="${ahora.getFullYear()}" />
            </label>
            <label>
              Mes
              <input id="reporte-mes" type="number" min="1" max="12" value="${ahora.getMonth() + 1}" />
            </label>
            <button type="button" id="btn-cargar-reporte">
              Actualizar reporte
            </button>
          </div>
          <div id="reporte-mensual"></div>
        </section>

        <section class="panel-section">
          <h2>Pedidos</h2>
          <div id="pedidos-lista">
            <p>Cargando pedidos...</p>
          </div>
        </section>

        <form id="finalizar-pedido-form" class="pizza-form finalizar-form">
          <h2>Finalizar pedido</h2>
          <p class="form-ayuda">
            Ingresa el ID del pedido y el código que recibió el cliente al pagar.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label>ID del pedido</label>
              <input id="pedido-id" type="number" min="1" required placeholder="Ej: 4" />
            </div>
            <div class="form-group">
              <label>Código de confirmación</label>
              <input id="pedido-codigo" type="text" required placeholder="Ej: PZ-3ZANQA" />
            </div>
          </div>

          <div class="form-buttons">
            <button type="submit" class="success">Confirmar entrega</button>
          </div>
          <div id="finalizar-resultado"></div>
        </form>

        <form id="pizza-form" class="pizza-form">
          <h2 id="form-title">Nueva pizza</h2>
          <input type="hidden" id="pizza-id" />

          <div class="form-grid">
            <div class="form-group">
              <label>Nombre</label>
              <input id="nombre" type="text" required />
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input id="precio" type="number" min="0" required />
            </div>
            <div class="form-group full">
              <label>Descripción</label>
              <textarea id="descripcion" required></textarea>
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input id="stock" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>Imagen URL</label>
              <input id="imagen_url" type="url" />
            </div>
            <div class="form-group">
              <label>
                <input id="activo" type="checkbox" checked />
                Pizza activa
              </label>
            </div>
          </div>

          <div class="form-buttons">
            <button type="submit">Guardar pizza</button>
            <button type="button" class="secondary" id="btn-limpiar">Limpiar</button>
          </div>
        </form>

        <section>
          <h2>🍕 Pizzas registradas</h2>
          <div id="admin-pizzas" class="pizzas-grid">
            <p>Cargando pizzas...</p>
          </div>
        </section>

      </section>
    </main>
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
