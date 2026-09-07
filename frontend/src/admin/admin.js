import { apiUrl } from "../config/api.js";

const API_BASE = apiUrl("/api");
const TOKEN_KEY = "pizza_admin_token";

let pizzas = [];
let pedidos = [];

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function estaAutenticado() {
  return Boolean(getToken());
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearToken();
    throw new Error(data.error || "Sesión expirada. Vuelve a iniciar sesión.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Error en la solicitud");
  }

  return data;
}

function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
}

function formatearFecha(valor) {
  return new Date(valor).toLocaleString("es-CO");
}

export async function loginAdmin(event) {
  event.preventDefault();

  const usuario = document.querySelector("#login-usuario").value.trim();
  const password = document.querySelector("#login-password").value;
  const resultado = document.querySelector("#login-resultado");

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, password }),
    });

    setToken(data.token);
    window.location.reload();
  } catch (error) {
    resultado.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

export function logoutAdmin() {
  clearToken();
  window.location.reload();
}

export async function cargarDashboard() {
  const contenedor = document.querySelector("#dashboard-stats");

  if (!contenedor) return;

  try {
    const data = await apiFetch("/reportes/dashboard");

    contenedor.innerHTML = `
      <article class="stat-card">
        <h3>Ventas hoy</h3>
        <p>${formatearPrecio(data.ventas_hoy)}</p>
      </article>
      <article class="stat-card">
        <h3>Pedidos hoy</h3>
        <p>${data.pedidos_hoy}</p>
      </article>
      <article class="stat-card">
        <h3>Pendientes de pago</h3>
        <p>${data.pedidos_pendientes}</p>
      </article>
      <article class="stat-card">
        <h3>Stock bajo</h3>
        <p>${data.stock_bajo}</p>
      </article>
      <article class="stat-card">
        <h3>Agotadas</h3>
        <p>${data.pizzas_agotadas}</p>
      </article>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

export async function cargarReporteMensual() {
  const contenedor = document.querySelector("#reporte-mensual");
  const anio = Number(document.querySelector("#reporte-anio")?.value);
  const mes = Number(document.querySelector("#reporte-mes")?.value);

  if (!contenedor) return;

  try {
    const data = await apiFetch(
      `/reportes/mensual?anio=${anio}&mes=${mes}`
    );

    contenedor.innerHTML = `
      <div class="reporte-grid">
        <article class="stat-card">
          <h3>Total vendido</h3>
          <p>${formatearPrecio(data.total_vendido)}</p>
        </article>
        <article class="stat-card">
          <h3>Pedidos</h3>
          <p>${data.total_pedidos}</p>
        </article>
        <article class="stat-card">
          <h3>Promedio por pedido</h3>
          <p>${formatearPrecio(data.promedio_pedido)}</p>
        </article>
        <article class="stat-card">
          <h3>Pizza más vendida</h3>
          <p>
            ${
              data.pizza_mas_vendida
                ? `${data.pizza_mas_vendida.nombre} (${data.pizza_mas_vendida.cantidad_vendida})`
                : "Sin datos"
            }
          </p>
        </article>
        <article class="stat-card">
          <h3>Día con más ventas</h3>
          <p>
            ${
              data.dia_mas_ventas
                ? `${new Date(data.dia_mas_ventas.dia).toLocaleDateString("es-CO")} · ${formatearPrecio(data.dia_mas_ventas.total)}`
                : "Sin datos"
            }
          </p>
        </article>
      </div>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

export async function cargarPedidos() {
  const contenedor = document.querySelector("#pedidos-lista");

  if (!contenedor) return;

  try {
    pedidos = await apiFetch("/pedidos");

    if (pedidos.length === 0) {
      contenedor.innerHTML = `<p>No hay pedidos registrados.</p>`;
      return;
    }

    contenedor.innerHTML = `
      <div class="tabla-wrap">
        <table class="tabla-pedidos">
          <thead>
            <tr>
              <th>#</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Código</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${pedidos
              .map(
                (pedido) => `
                  <tr>
                    <td>${pedido.id}</td>
                    <td>
                      <span class="badge-estado ${pedido.estado.toLowerCase()}">
                        ${pedido.estado}
                      </span>
                    </td>
                    <td>${formatearPrecio(pedido.total)}</td>
                    <td>${pedido.codigo_confirmacion || "—"}</td>
                    <td>${formatearFecha(pedido.created_at)}</td>
                    <td class="acciones-pedido">
                      <button type="button" onclick="verPedido(${pedido.id})">
                        Ver
                      </button>
                      ${
                        pedido.estado !== "FINALIZADO" &&
                        pedido.estado !== "CANCELADO"
                          ? `
                            <button
                              type="button"
                              class="danger"
                              onclick="cancelarPedido(${pedido.id})"
                            >
                              Cancelar
                            </button>
                          `
                          : ""
                      }
                    </td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div id="pedido-detalle"></div>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

window.verPedido = async function (id) {
  const detalle = document.querySelector("#pedido-detalle");

  try {
    const pedido = await apiFetch(`/pedidos/${id}`);

    detalle.innerHTML = `
      <div class="pedido-detalle-card">
        <h3>Pedido #${pedido.id}</h3>
        <p><strong>Estado:</strong> ${pedido.estado}</p>
        <p><strong>Total:</strong> ${formatearPrecio(pedido.total)}</p>
        <p><strong>Código:</strong> ${pedido.codigo_confirmacion || "—"}</p>
        <ul>
          ${pedido.detalles
            .map(
              (item) => `
                <li>
                  ${item.pizza_nombre} × ${item.cantidad}
                  — ${formatearPrecio(item.subtotal)}
                </li>
              `
            )
            .join("")}
        </ul>
      </div>
    `;
  } catch (error) {
    detalle.innerHTML = `<p class="error">${error.message}</p>`;
  }
};

window.cancelarPedido = async function (id) {
  const confirmar = confirm(`¿Cancelar el pedido #${id}?`);

  if (!confirmar) return;

  try {
    await apiFetch(`/pedidos/${id}/cancelar`, { method: "POST" });
    await Promise.all([
      cargarPedidos(),
      cargarDashboard(),
      cargarPizzas(),
    ]);
  } catch (error) {
    alert(error.message);
  }
};

export async function finalizarPedido(event) {
  event.preventDefault();

  const pedidoId = document.querySelector("#pedido-id").value.trim();
  const codigo = document.querySelector("#pedido-codigo").value.trim();
  const resultado = document.querySelector("#finalizar-resultado");
  const boton = event.target.querySelector('button[type="submit"]');

  try {
    if (boton) boton.disabled = true;

    const data = await apiFetch(`/pedidos/${pedidoId}/finalizar`, {
      method: "POST",
      body: JSON.stringify({ codigo }),
    });

    document.querySelector("#finalizar-pedido-form").reset();

    resultado.innerHTML = `
      <div class="pedido-exito">
        <strong>Pedido #${data.pedido.id} finalizado</strong>
        <p>Estado: ${data.pedido.estado}</p>
      </div>
    `;

    await Promise.all([cargarPedidos(), cargarDashboard()]);
  } catch (error) {
    resultado.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    if (boton) boton.disabled = false;
  }
}

export async function cargarPizzas() {
  try {
    pizzas = await apiFetch("/pizzas/admin");
    mostrarPizzas();
  } catch (error) {
    console.error(error);

    if (String(error.message).includes("Sesión")) {
      window.location.reload();
      return;
    }

    document.querySelector("#admin-pizzas").innerHTML = `
      <p class="error">${error.message}</p>
    `;
  }
}

function mostrarPizzas() {
  const contenedor = document.querySelector("#admin-pizzas");

  if (!contenedor) return;

  if (pizzas.length === 0) {
    contenedor.innerHTML = `<p>No hay pizzas registradas.</p>`;
    return;
  }

  contenedor.innerHTML = pizzas
    .map(
      (pizza) => `
        <article class="pizza-card ${pizza.activo ? "" : "desactivada"}">
          <div class="pizza-image">
            ${
              pizza.imagen_url
                ? `<img src="${pizza.imagen_url}" alt="${pizza.nombre}" />`
                : `<div class="pizza-placeholder">Sin imagen</div>`
            }
          </div>
          <div class="pizza-info">
            <div class="pizza-header">
              <h3>${pizza.nombre}</h3>
              <span class="estado ${pizza.activo ? "activo" : "inactivo"}">
                ${pizza.activo ? "Activa" : "Inactiva"}
              </span>
            </div>
            <p>${pizza.descripcion}</p>
            <strong>${formatearPrecio(pizza.precio)}</strong>
            <span>Stock: ${pizza.stock}</span>
            <div class="pizza-actions">
              <button onclick="editarPizza(${pizza.id})">Editar</button>
              ${
                pizza.activo
                  ? `<button class="danger" onclick="desactivarPizza(${pizza.id})">Desactivar</button>`
                  : `<button class="success" onclick="activarPizza(${pizza.id})">Activar</button>`
              }
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

window.editarPizza = function (id) {
  const pizza = pizzas.find((p) => p.id === id);
  if (!pizza) return;

  document.querySelector("#pizza-id").value = pizza.id;
  document.querySelector("#nombre").value = pizza.nombre;
  document.querySelector("#descripcion").value = pizza.descripcion;
  document.querySelector("#precio").value = pizza.precio;
  document.querySelector("#stock").value = pizza.stock;
  document.querySelector("#imagen_url").value = pizza.imagen_url || "";
  document.querySelector("#activo").checked = pizza.activo;
  document.querySelector("#form-title").textContent = "Editar pizza";

  document.querySelector("#pizza-form")?.scrollIntoView({
    behavior: "smooth",
  });
};

window.desactivarPizza = async function (id) {
  if (!confirm("¿Seguro que quieres desactivar esta pizza?")) return;

  try {
    await apiFetch(`/pizzas/${id}`, { method: "DELETE" });
    await cargarPizzas();
  } catch (error) {
    alert(error.message);
  }
};

window.activarPizza = async function (id) {
  try {
    await apiFetch(`/pizzas/${id}/activar`, { method: "PATCH" });
    await cargarPizzas();
  } catch (error) {
    alert(error.message);
  }
};

export async function guardarPizza(event) {
  event.preventDefault();

  const id = document.querySelector("#pizza-id").value;

  const datos = {
    nombre: document.querySelector("#nombre").value,
    descripcion: document.querySelector("#descripcion").value,
    precio: Number(document.querySelector("#precio").value),
    stock: Number(document.querySelector("#stock").value),
    imagen_url: document.querySelector("#imagen_url").value,
    activo: document.querySelector("#activo").checked,
  };

  try {
    if (id) {
      await apiFetch(`/pizzas/${id}`, {
        method: "PUT",
        body: JSON.stringify(datos),
      });
    } else {
      await apiFetch("/pizzas", {
        method: "POST",
        body: JSON.stringify(datos),
      });
    }

    limpiarFormulario();
    await Promise.all([cargarPizzas(), cargarDashboard()]);
    alert(id ? "Pizza actualizada correctamente" : "Pizza creada correctamente");
  } catch (error) {
    alert(error.message);
  }
}

export function limpiarFormulario() {
  document.querySelector("#pizza-form").reset();
  document.querySelector("#pizza-id").value = "";
  document.querySelector("#activo").checked = true;
  document.querySelector("#form-title").textContent = "Nueva pizza";
}

window.limpiarFormulario = limpiarFormulario;

export async function iniciarPanelAdmin() {
  await Promise.all([
    cargarDashboard(),
    cargarPedidos(),
    cargarPizzas(),
    cargarReporteMensual(),
  ]);
}
