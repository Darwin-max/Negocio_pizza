import { apiUrl, resolverImagen } from "../config/api.js";

const API_BASE = apiUrl("/api");
const TOKEN_KEY = "pizza_admin_token";

const SECCIONES = {
  dashboard: {
    titulo: "Dashboard",
    subtitulo: "Resumen de ventas, pedidos y stock de tu negocio.",
  },
  pedidos: {
    titulo: "Pedidos",
    subtitulo: "Gestiona pagos, entregas y cancelaciones.",
  },
  productos: {
    titulo: "Productos",
    subtitulo: "Administra el catálogo, los precios y el inventario.",
  },
  negocio: {
    titulo: "Negocio",
    subtitulo: "Personaliza la imagen y la identidad de tu negocio.",
  },
  reportes: {
    titulo: "Reportes",
    subtitulo: "Analiza las ventas y el rendimiento del mes.",
  },
};

const ESTADOS = {
  PENDIENTE_PAGO: { label: "Pendiente de pago", clase: "pendiente" },
  PAGO_CONFIRMADO: { label: "Pago confirmado", clase: "pagado" },
  PAGADO: { label: "Pagado", clase: "pagado" },
  FINALIZADO: { label: "Finalizado", clase: "finalizado" },
  CANCELADO: { label: "Cancelado", clase: "cancelado" },
};

const ICONOS = {
  dinero: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.6-.6-1.7-1-2.9-1-1.7 0-3 .8-3 2s1.1 1.8 3 2.2 3 1 3 2.3-1.3 2-3 2c-1.2 0-2.3-.4-2.9-1"/></svg>`,
  bolsa: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
  reloj: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  alerta: `<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v5M12 17.5v.1"/></svg>`,
  agotado: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4.5 4.5L19 7"/></svg>`,
  telefono: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 3h3l1.5 4.5-2 1.5a14 14 0 0 0 5.5 5.5l1.5-2L21 14v3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 2-2Z"/></svg>`,
  codigo: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v16H8z"/><path d="M10 8h4M10 12h4M10 16h2"/></svg>`,
  editar: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14 6 4 4"/></svg>`,
  ojo: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  usuario: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>`,
  ubicacion: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  notas: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`,
  calendario: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>`,
  estrella: `<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>`,
  tendencia: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 17 9 11l4 4 7-8"/><path d="M15 7h5v5"/></svg>`,
};

let pizzas = [];
let pedidos = [];
let pizzasCargadas = false;
let pedidosCargados = false;
let busquedaPedidos = "";
let filtroPedidos = "todos";
let busquedaProductos = "";
let filtroCategoria = "todas";
let archivoImagenProducto = null;
let imagenProductoAnterior = "";
let previewImagenProductoUrl = "";
let logoNegocio = null;

const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
const TIPOS_IMAGEN = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function tokenVencido(token) {
  try {
    const parte = token.split(".")[1];
    if (!parte) return true;
    const base64 = parte
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parte.length / 4) * 4, "=");
    const payload = JSON.parse(atob(base64));
    return Boolean(payload.exp && payload.exp * 1000 <= Date.now());
  } catch {
    return true;
  }
}

export function estaAutenticado() {
  const token = getToken();

  if (!token) return false;

  if (tokenVencido(token)) {
    clearToken();
    return false;
  }

  return true;
}

async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

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
    if (getToken()) {
      clearToken();
      window.location.reload();
    }

    throw new Error(data.error || "Tu sesión expiró. Vuelve a iniciar sesión.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Error en la solicitud");
  }

  return data;
}

function escaparHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
    const entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entidades[caracter];
  });
}

function textoNormalizado(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatearPrecio(valor) {
  const numero = Number(valor);
  return `$${(Number.isFinite(numero) ? numero : 0).toLocaleString("es-CO")}`;
}

function formatearFecha(valor) {
  if (!valor) return "—";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";

  return fecha.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function partesDia(valor) {
  if (typeof valor === "string") {
    const coincidencia = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (coincidencia) {
      return {
        anio: Number(coincidencia[1]),
        mes: Number(coincidencia[2]),
        dia: Number(coincidencia[3]),
      };
    }
  }

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  return {
    anio: fecha.getFullYear(),
    mes: fecha.getMonth() + 1,
    dia: fecha.getDate(),
  };
}

function formatearDia(valor) {
  const partes = partesDia(valor);
  if (!partes) return "—";

  return new Date(partes.anio, partes.mes - 1, partes.dia).toLocaleDateString(
    "es-CO",
    { day: "2-digit", month: "short", year: "numeric" }
  );
}

function formatearDiaCorto(valor) {
  const partes = partesDia(valor);
  return partes ? String(partes.dia) : "—";
}

function estadoInfo(estado) {
  return ESTADOS[estado] || { label: estado || "Sin estado", clase: "neutro" };
}

function iconoSvg(nombre) {
  return ICONOS[nombre] || ICONOS.bolsa;
}

function validarArchivoImagen(archivo) {
  if (!archivo) return "Selecciona una imagen.";
  if (!TIPOS_IMAGEN.includes(archivo.type)) {
    return "Usa una imagen JPG, PNG, WebP, GIF o AVIF.";
  }
  if (archivo.size > MAX_IMAGEN_BYTES) {
    return "La imagen no puede superar los 5 MB.";
  }
  return "";
}

async function subirArchivoImagen(archivo) {
  const formulario = new FormData();
  formulario.append("imagen", archivo);

  return apiFetch("/imagenes", {
    method: "POST",
    body: formulario,
  });
}

function idImagenLocal(url) {
  const coincidencia = String(url || "").match(/^\/api\/imagenes\/(\d+)$/);
  return coincidencia ? Number(coincidencia[1]) : null;
}

async function eliminarImagenLocal(url) {
  const id = idImagenLocal(url);
  if (!id) return;

  try {
    await apiFetch(`/imagenes/${id}`, { method: "DELETE" });
  } catch {
    // La imagen pudo ser compartida o ya no existir.
  }
}

function renderizarPreviewProducto(url = "", archivo = null) {
  const contenedor = document.querySelector("#imagen-preview");
  if (!contenedor) return;

  if (previewImagenProductoUrl) {
    URL.revokeObjectURL(previewImagenProductoUrl);
    previewImagenProductoUrl = "";
  }

  let src = "";

  if (archivo) {
    previewImagenProductoUrl = URL.createObjectURL(archivo);
    src = previewImagenProductoUrl;
  } else if (url) {
    src = resolverImagen(url);
  }

  contenedor.innerHTML = src
    ? `<img src="${escaparHtml(src)}" alt="Vista previa de la imagen del producto" />`
    : `<div class="imagen-preview-placeholder"><span aria-hidden="true">🍕</span><small>Sin imagen</small></div>`;

  const boton = document.querySelector("#btn-quitar-imagen");
  if (boton) boton.hidden = !src;
}

function renderizarLogoNegocio() {
  const contenedor = document.querySelector("#logo-preview");
  if (!contenedor) return;

  const src = logoNegocio
    ? resolverImagen(logoNegocio)
    : "./el-callejon-logo.png";

  contenedor.innerHTML = `<img src="${escaparHtml(src)}" alt="Logo actual del negocio" />`;

  const boton = document.querySelector("#btn-quitar-logo");
  if (boton) boton.hidden = !logoNegocio;
}

function toast(mensaje, tipo = "success") {
  const stack = document.querySelector("#admin-toasts");
  if (!stack) return;

  const elemento = document.createElement("div");
  elemento.className = `admin-toast ${tipo}`;
  elemento.setAttribute("role", tipo === "error" ? "alert" : "status");

  const punto = document.createElement("span");
  punto.className = "toast-dot";
  punto.setAttribute("aria-hidden", "true");

  const texto = document.createElement("p");
  texto.textContent = mensaje;

  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.setAttribute("aria-label", "Cerrar notificación");
  cerrar.textContent = "×";

  elemento.append(punto, texto, cerrar);
  stack.appendChild(elemento);

  const quitar = () => {
    elemento.classList.add("saliendo");
    window.setTimeout(() => elemento.remove(), 180);
  };

  cerrar.addEventListener("click", quitar);
  window.setTimeout(quitar, 4800);
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
}

function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }
}

function mostrarSeccion(seccion) {
  const info = SECCIONES[seccion] || SECCIONES.dashboard;

  document.querySelectorAll(".admin-nav-item").forEach((boton) => {
    const activo = boton.dataset.section === seccion;
    boton.classList.toggle("activo", activo);
    if (activo) {
      boton.setAttribute("aria-current", "page");
    } else {
      boton.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll(".admin-section").forEach((section) => {
    const activa = section.id === `section-${seccion}`;
    section.hidden = !activa;
    section.classList.toggle("activo", activa);
  });

  const titulo = document.querySelector("#admin-page-title");
  const subtitulo = document.querySelector("#admin-page-subtitle");

  if (titulo) titulo.textContent = info.titulo;
  if (subtitulo) subtitulo.textContent = info.subtitulo;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

export async function loginAdmin(event) {
  event.preventDefault();

  const usuario = document.querySelector("#login-usuario").value.trim();
  const password = document.querySelector("#login-password").value;
  const resultado = document.querySelector("#login-resultado");
  const boton = event.currentTarget.querySelector('button[type="submit"]');

  resultado.innerHTML = "";

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Ingresando...";
    }

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, password }),
    });

    setToken(data.token);
    window.location.reload();
  } catch (error) {
    resultado.innerHTML = `<p class="error">${escaparHtml(error.message)}</p>`;
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Iniciar sesión";
    }
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
      <article class="stat-card tone-success">
        <div class="stat-top">
          <span class="stat-label">Ventas hoy</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("dinero")}</span>
        </div>
        <p class="stat-value">${formatearPrecio(data.ventas_hoy)}</p>
        <p class="stat-hint">Pagos confirmados de hoy</p>
      </article>

      <article class="stat-card tone-info">
        <div class="stat-top">
          <span class="stat-label">Pedidos hoy</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("bolsa")}</span>
        </div>
        <p class="stat-value">${Number(data.pedidos_hoy) || 0}</p>
        <p class="stat-hint">Registrados en el día</p>
      </article>

      <article class="stat-card tone-warning">
        <div class="stat-top">
          <span class="stat-label">Pendientes de pago</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("reloj")}</span>
        </div>
        <p class="stat-value">${Number(data.pedidos_pendientes) || 0}</p>
        <p class="stat-hint">Requieren seguimiento</p>
      </article>

      <article class="stat-card tone-warning">
        <div class="stat-top">
          <span class="stat-label">Stock bajo</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("alerta")}</span>
        </div>
        <p class="stat-value">${Number(data.stock_bajo) || 0}</p>
        <p class="stat-hint">Productos con 5 unidades o menos</p>
      </article>

      <article class="stat-card tone-danger">
        <div class="stat-top">
          <span class="stat-label">Agotados</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("agotado")}</span>
        </div>
        <p class="stat-value">${Number(data.pizzas_agotadas) || 0}</p>
        <p class="stat-hint">Sin stock disponible</p>
      </article>
    `;
  } catch (error) {
    contenedor.innerHTML = `<p class="error">${escaparHtml(error.message)}</p>`;
  }
}

function renderDashboardPedidos() {
  const contenedor = document.querySelector("#dashboard-pedidos");
  if (!contenedor) return;

  if (!pedidosCargados) {
    contenedor.innerHTML = `<p class="loading-text">Cargando pedidos...</p>`;
    return;
  }

  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state compact">
        <span aria-hidden="true">🧾</span>
        <p>Todavía no hay pedidos registrados.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = pedidos
    .slice(0, 5)
    .map((pedido) => {
      const estado = estadoInfo(pedido.estado);
      const cliente =
        pedido.telefono_whatsapp || pedido.direccion || "Pedido web";

      return `
        <button type="button" class="mini-pedido" data-ver-pedido="${pedido.id}">
          <span class="mini-pedido-id">#${pedido.id}</span>
          <span class="mini-pedido-info">
            <strong>${escaparHtml(cliente)}</strong>
            <small>${formatearFecha(pedido.created_at)}</small>
          </span>
          <span class="badge-estado ${estado.clase}">${escaparHtml(estado.label)}</span>
          <strong class="mini-pedido-total">${formatearPrecio(pedido.total)}</strong>
        </button>
      `;
    })
    .join("");
}

function renderDashboardStock() {
  const contenedor = document.querySelector("#dashboard-stock");
  if (!contenedor) return;

  if (!pizzasCargadas) {
    contenedor.innerHTML = `<p class="loading-text">Cargando inventario...</p>`;
    return;
  }

  const alertas = (Array.isArray(pizzas) ? pizzas : [])
    .filter((pizza) => pizza.activo && Number(pizza.stock) <= 5)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 6);

  if (alertas.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state compact">
        <span aria-hidden="true">✅</span>
        <p>Todo el inventario está en orden.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = alertas
    .map((pizza) => {
      const stock = Number(pizza.stock) || 0;
      const clase = stock === 0 ? "stock-cero" : "stock-bajo";

      return `
        <div class="stock-alerta">
          <div class="stock-alerta-info">
            <strong>${escaparHtml(pizza.nombre)}</strong>
            <small>${escaparHtml(pizza.categoria || "Sin categoría")}</small>
          </div>
          <span class="stock-chip ${clase}">${stock} uds.</span>
          <button
            type="button"
            class="btn-admin btn-admin-sm btn-admin-ghost"
            data-editar-producto="${pizza.id}"
          >
            Editar
          </button>
        </div>
      `;
    })
    .join("");
}

export async function cargarPedidos() {
  const contenedor = document.querySelector("#pedidos-lista");
  if (!contenedor) return;

  try {
    const data = await apiFetch("/pedidos");
    pedidos = Array.isArray(data) ? data : [];
    pedidosCargados = true;
    renderPedidos();
    renderDashboardPedidos();
    actualizarBadgePendientes();
  } catch (error) {
    pedidosCargados = false;
    contenedor.innerHTML = `<p class="error">${escaparHtml(error.message)}</p>`;
  }
}

function pedidosFiltrados() {
  const busqueda = textoNormalizado(busquedaPedidos);

  return (Array.isArray(pedidos) ? pedidos : []).filter((pedido) => {
    const estadoNormalizado =
      pedido.estado === "PAGADO" ? "PAGO_CONFIRMADO" : pedido.estado;
    const coincideEstado =
      filtroPedidos === "todos" || estadoNormalizado === filtroPedidos;
    const texto = textoNormalizado(
      `${pedido.id} ${pedido.telefono_whatsapp || ""} ${
        pedido.codigo_confirmacion || ""
      } ${pedido.estado} ${pedido.metodo_pago || ""} ${pedido.notas || ""}`
    );

    return coincideEstado && (!busqueda || texto.includes(busqueda));
  });
}

function renderPedidos() {
  const contenedor = document.querySelector("#pedidos-lista");
  if (!contenedor) return;

  if (!pedidosCargados) {
    contenedor.innerHTML = `<p class="loading-text">Cargando pedidos...</p>`;
    return;
  }

  const filtrados = pedidosFiltrados();

  if (filtrados.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <span aria-hidden="true">🔎</span>
        <p>No hay pedidos que coincidan con los filtros.</p>
        <button type="button" class="btn-admin btn-admin-ghost" id="btn-limpiar-filtros-pedidos">
          Limpiar filtros
        </button>
      </div>
    `;

    contenedor
      .querySelector("#btn-limpiar-filtros-pedidos")
      ?.addEventListener("click", () => {
        busquedaPedidos = "";
        filtroPedidos = "todos";
        const busqueda = document.querySelector("#pedidos-busqueda");
        const filtro = document.querySelector("#pedidos-filtro-estado");
        if (busqueda) busqueda.value = "";
        if (filtro) filtro.value = "todos";
        renderPedidos();
      });

    return;
  }

  contenedor.innerHTML = `
    <div class="tabla-wrap">
      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Código</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filtrados
            .map((pedido) => {
              const estado = estadoInfo(pedido.estado);
              const pendiente = !pedido.pago_confirmado && pedido.estado !== "CANCELADO";
              const puedeFinalizar =
                pedido.pago_confirmado &&
                !pedido.codigo_usado &&
                pedido.estado !== "FINALIZADO" &&
                pedido.estado !== "CANCELADO";
              const puedeCancelar =
                pedido.estado !== "FINALIZADO" &&
                pedido.estado !== "CANCELADO";
              const cliente =
                pedido.telefono_whatsapp || pedido.direccion || "Pedido web";
              const detalleCliente =
                pedido.metodo_pago || (pedido.telefono_whatsapp ? "WhatsApp" : "Sin contacto");

              return `
                <tr>
                  <td data-label="Pedido">
                    <strong class="order-id">#${pedido.id}</strong>
                  </td>
                  <td data-label="Cliente">
                    <span class="cliente-cell">
                      <strong>${escaparHtml(cliente)}</strong>
                      <small>${escaparHtml(detalleCliente)}</small>
                    </span>
                  </td>
                  <td data-label="Estado">
                    <span class="badge-estado ${estado.clase}">
                      ${escaparHtml(estado.label)}
                    </span>
                  </td>
                  <td data-label="Total">
                    <strong>${formatearPrecio(pedido.total)}</strong>
                  </td>
                  <td data-label="Código">
                    ${
                      pedido.codigo_confirmacion &&
                      pedido.estado !== "CANCELADO"
                        ? `<button type="button" class="codigo-chip" data-copiar-codigo="${escaparHtml(
                            pedido.codigo_confirmacion
                          )}" title="Copiar código">${escaparHtml(
                            pedido.codigo_confirmacion
                          )}</button>`
                        : `<span class="text-muted">—</span>`
                    }
                  </td>
                  <td data-label="Fecha">${formatearFecha(pedido.created_at)}</td>
                  <td data-label="Acciones">
                    <div class="acciones-pedido">
                      <button
                        type="button"
                        class="btn-admin btn-admin-sm btn-admin-ghost"
                        data-ver-pedido="${pedido.id}"
                      >
                        Ver
                      </button>

                      ${
                        pendiente
                          ? `
                            <button
                              type="button"
                              class="btn-admin btn-admin-sm btn-admin-primary"
                              data-pagar-pedido="${pedido.id}"
                            >
                              Registrar pago
                            </button>
                          `
                          : ""
                      }

                      ${
                        puedeFinalizar
                          ? `
                            <button
                              type="button"
                              class="btn-admin btn-admin-sm btn-admin-success"
                              data-finalizar-pedido="${pedido.id}"
                            >
                              Finalizar
                            </button>
                          `
                          : ""
                      }

                      ${
                        puedeCancelar
                          ? `
                            <button
                              type="button"
                              class="btn-admin btn-admin-sm btn-admin-danger"
                              data-cancelar-pedido="${pedido.id}"
                            >
                              Cancelar
                            </button>
                          `
                          : ""
                      }
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function actualizarBadgePendientes() {
  const badge = document.querySelector("#nav-pendientes");
  if (!badge) return;

  const cantidad = (Array.isArray(pedidos) ? pedidos : []).filter(
    (pedido) => pedido.estado === "PENDIENTE_PAGO" && !pedido.pago_confirmado
  ).length;

  badge.textContent = String(cantidad);
  badge.hidden = cantidad === 0;
}

async function verPedido(id) {
  const contenedor = document.querySelector("#modal-pedido-contenido");
  if (!contenedor) return;

  try {
    const pedido = await apiFetch(`/pedidos/${id}`);
    const estado = estadoInfo(pedido.estado);
    const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];
    const pendiente = !pedido.pago_confirmado && pedido.estado !== "CANCELADO";
    const puedeFinalizar =
      pedido.pago_confirmado &&
      !pedido.codigo_usado &&
      pedido.estado !== "FINALIZADO" &&
      pedido.estado !== "CANCELADO";
    const puedeCancelar =
      pedido.estado !== "FINALIZADO" && pedido.estado !== "CANCELADO";
    const stockInfo =
      pedido.estado === "CANCELADO"
        ? "Devuelto al inventario"
        : pedido.stock_descontado
          ? "Reservado"
          : "Sin reservar";
    const pagoInfo =
      pedido.estado === "CANCELADO" && pedido.pago_confirmado
        ? "Confirmado · cancelado"
        : pedido.pago_confirmado
          ? "Confirmado"
          : "Pendiente";

    contenedor.innerHTML = `
      <div class="modal-header">
        <div>
          <p class="modal-eyebrow">Detalle del pedido</p>
          <h2 id="modal-pedido-titulo">Pedido #${pedido.id}</h2>
        </div>
        <button type="button" class="modal-close" data-cerrar-modal="modal-pedido" aria-label="Cerrar">×</button>
      </div>

      <div class="modal-body">
        <div class="modal-meta">
          <div class="modal-meta-item">
            <span>Estado</span>
            <span class="badge-estado ${estado.clase}">${escaparHtml(estado.label)}</span>
          </div>
          <div class="modal-meta-item">
            <span>Total</span>
            <strong>${formatearPrecio(pedido.total)}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Pago</span>
            <strong>${pagoInfo}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Stock</span>
            <strong>${stockInfo}</strong>
          </div>
          <div class="modal-meta-item">
            <span>Código</span>
            ${
              pedido.codigo_confirmacion &&
              pedido.estado !== "CANCELADO"
                ? `<button type="button" class="codigo-chip" data-copiar-codigo="${escaparHtml(
                    pedido.codigo_confirmacion
                  )}" title="Copiar código">${escaparHtml(
                    pedido.codigo_confirmacion
                  )}</button>`
                : "<strong>—</strong>"
            }
          </div>
          <div class="modal-meta-item">
            <span>Fecha</span>
            <strong>${formatearFecha(pedido.created_at)}</strong>
          </div>
        </div>

        <div class="modal-data-grid">
          ${
            pedido.telefono_whatsapp
              ? `<div class="modal-data"><span>WhatsApp</span><strong>${escaparHtml(
                  pedido.telefono_whatsapp
                )}</strong></div>`
              : ""
          }
          ${
            pedido.metodo_pago
              ? `<div class="modal-data"><span>Método de pago</span><strong>${escaparHtml(
                  pedido.metodo_pago
                )}</strong></div>`
              : ""
          }
          ${
            pedido.direccion
              ? `<div class="modal-data"><span>Dirección / barrio</span><strong>${escaparHtml(
                  pedido.direccion
                )}</strong></div>`
              : ""
          }
          ${
            pedido.notas
              ? `<div class="modal-data full"><span>Solicitudes</span><strong>${escaparHtml(
                  pedido.notas
                )}</strong></div>`
              : ""
          }
        </div>

        <section class="modal-section">
          <h3>Productos</h3>
          <div class="modal-items">
            <div class="modal-items-head">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>
            ${detalles
              .map(
                (item) => `
                  <div class="modal-item">
                    <span>${escaparHtml(item.pizza_nombre)}</span>
                    <span>${Number(item.cantidad) || 0}</span>
                    <strong>${formatearPrecio(item.subtotal)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>

        <div class="modal-actions">
          ${
            pendiente
              ? `<button type="button" class="btn-admin btn-admin-primary" data-pagar-pedido="${pedido.id}">Registrar pago</button>`
              : ""
          }
          ${
            puedeFinalizar
              ? `<button type="button" class="btn-admin btn-admin-success" data-finalizar-pedido="${pedido.id}">Finalizar entrega</button>`
              : ""
          }
          ${
            puedeCancelar
              ? `<button type="button" class="btn-admin btn-admin-danger" data-cancelar-pedido="${pedido.id}">Cancelar pedido</button>`
              : ""
          }
          <button type="button" class="btn-admin btn-admin-ghost" data-cerrar-modal="modal-pedido">Cerrar</button>
        </div>
      </div>
    `;

    abrirModal("modal-pedido");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function registrarPagoPedido(id) {
  const pedido = pedidos.find((item) => item.id === id);

  if (pedido?.pago_confirmado) {
    toast("Este pedido ya tiene el pago confirmado.", "info");
    return;
  }

  const confirmar = window.confirm(
    `¿Registrar el pago del pedido #${id}?\n\nSe generará el código de entrega y se confirmará la venta.`
  );

  if (!confirmar) return;

  try {
    const data = await apiFetch(`/pedidos/${id}/confirmar-pago`, {
      method: "POST",
    });

    const codigo = data.pedido?.codigo_confirmacion;
    cerrarModal("modal-pedido");
    toast(
      `Pago del pedido #${id} confirmado.${codigo ? ` Código: ${codigo}` : ""}`
    );

    await Promise.all([cargarPedidos(), cargarDashboard(), cargarPizzas()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

async function cancelarPedido(id) {
  const pedido = pedidos.find((item) => item.id === id);
  const avisoStock = pedido?.stock_descontado
    ? "\n\nSe devolverá el stock reservado al inventario."
    : "";

  const confirmar = window.confirm(`¿Cancelar el pedido #${id}?${avisoStock}`);
  if (!confirmar) return;

  try {
    await apiFetch(`/pedidos/${id}/cancelar`, { method: "POST" });
    cerrarModal("modal-pedido");
    toast(`Pedido #${id} cancelado.`);
    await Promise.all([cargarPedidos(), cargarDashboard(), cargarPizzas()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

function abrirFinalizarPedido(id) {
  const pedido = pedidos.find((item) => item.id === id);

  if (!pedido) return;

  if (!pedido.pago_confirmado) {
    toast("Primero registra el pago del pedido.", "info");
    return;
  }

  if (pedido.estado === "FINALIZADO") {
    toast("Este pedido ya fue finalizado.", "info");
    return;
  }

  if (pedido.estado === "CANCELADO") {
    toast("Este pedido está cancelado.", "info");
    return;
  }

  if (!pedido.codigo_confirmacion) {
    toast("El pedido no tiene código de confirmación.", "error");
    return;
  }

  const inputId = document.querySelector("#pedido-id");
  const inputCodigo = document.querySelector("#pedido-codigo");

  if (inputId) inputId.value = pedido.id;
  if (inputCodigo) inputCodigo.value = pedido.codigo_confirmacion;

  cerrarModal("modal-pedido");
  abrirModal("modal-finalizar");
  inputCodigo?.focus();
}

export async function finalizarPedido(event) {
  event.preventDefault();

  const pedidoId = document.querySelector("#pedido-id").value.trim();
  const codigo = document.querySelector("#pedido-codigo").value.trim();
  const boton = event.currentTarget.querySelector('button[type="submit"]');

  if (!pedidoId || !codigo) {
    toast("El ID del pedido y el código son obligatorios.", "error");
    return;
  }

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Finalizando...";
    }

    const data = await apiFetch(`/pedidos/${pedidoId}/finalizar`, {
      method: "POST",
      body: JSON.stringify({ codigo }),
    });

    document.querySelector("#finalizar-pedido-form").reset();
    cerrarModal("modal-finalizar");
    toast(`Pedido #${data.pedido.id} finalizado correctamente.`);

    await Promise.all([cargarPedidos(), cargarDashboard()]);
  } catch (error) {
    toast(error.message, "error");
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Confirmar entrega";
    }
  }
}

async function copiarCodigo(codigo) {
  if (!codigo) return;

  try {
    await navigator.clipboard.writeText(codigo);
    toast(`Código ${codigo} copiado.`);
  } catch {
    toast(`Código: ${codigo}`, "info");
  }
}

export async function cargarPizzas() {
  const contenedor = document.querySelector("#admin-pizzas");
  if (!contenedor) return;

  try {
    const data = await apiFetch("/pizzas/admin");
    pizzas = Array.isArray(data) ? data : [];
    pizzasCargadas = true;
    renderCategoriasFiltro();
    renderPizzas();
    renderDashboardStock();
  } catch (error) {
    pizzasCargadas = false;
    contenedor.innerHTML = `<p class="error">${escaparHtml(error.message)}</p>`;
  }
}

export async function cargarNegocio() {
  try {
    const data = await apiFetch("/configuracion/negocio");
    logoNegocio = data.logo_url || null;
  } catch {
    logoNegocio = null;
  }

  renderizarLogoNegocio();
}

async function guardarLogo(event) {
  event.preventDefault();

  const input = document.querySelector("#logo-archivo");
  const archivo = input?.files?.[0];
  const error = validarArchivoImagen(archivo);

  if (error) {
    toast(error, "error");
    return;
  }

  const boton = event.currentTarget.querySelector('button[type="submit"]');

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Subiendo...";
    }

    const formulario = new FormData();
    formulario.append("imagen", archivo);

    const data = await apiFetch("/configuracion/negocio/logo", {
      method: "POST",
      body: formulario,
    });

    logoNegocio = data.logo_url || null;
    if (input) input.value = "";
    renderizarLogoNegocio();
    toast("Logo del negocio actualizado.");
  } catch (error) {
    toast(error.message, "error");
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Guardar logo";
    }
  }
}

async function quitarLogo() {
  if (!logoNegocio) {
    toast("El negocio ya usa el logo predeterminado.", "info");
    return;
  }

  const confirmar = window.confirm(
    "¿Quitar el logo personalizado y volver al logo predeterminado?"
  );

  if (!confirmar) return;

  try {
    await apiFetch("/configuracion/negocio/logo", { method: "DELETE" });
    logoNegocio = null;
    renderizarLogoNegocio();
    toast("Logo predeterminado restaurado.");
  } catch (error) {
    toast(error.message, "error");
  }
}

function manejarSeleccionImagenProducto(event) {
  const input = event.currentTarget;
  const archivo = input.files?.[0] || null;
  const imagenActual = document.querySelector("#imagen_url").value.trim();

  if (!archivo) {
    archivoImagenProducto = null;
    renderizarPreviewProducto(imagenActual);
    return;
  }

  const error = validarArchivoImagen(archivo);

  if (error) {
    input.value = "";
    archivoImagenProducto = null;
    toast(error, "error");
    renderizarPreviewProducto(imagenActual);
    return;
  }

  archivoImagenProducto = archivo;
  document.querySelector("#imagen_url").value = "";
  renderizarPreviewProducto("", archivo);
}

function quitarImagenProducto() {
  archivoImagenProducto = null;

  const input = document.querySelector("#imagen_archivo");
  if (input) input.value = "";

  document.querySelector("#imagen_url").value = "";
  renderizarPreviewProducto();
}

function renderCategoriasFiltro() {
  const select = document.querySelector("#productos-filtro-categoria");
  const datalist = document.querySelector("#categorias-producto");
  const categorias = [
    ...new Set(
      (Array.isArray(pizzas) ? pizzas : [])
        .map((pizza) => String(pizza.categoria || "").trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "es"));

  if (select) {
    const seleccionada = categorias.includes(filtroCategoria)
      ? filtroCategoria
      : "todas";

    filtroCategoria = seleccionada;

    select.innerHTML = `
      <option value="todas">Todas las categorías</option>
      ${categorias
        .map(
          (categoria) =>
            `<option value="${escaparHtml(categoria)}">${escaparHtml(
              categoria
            )}</option>`
        )
        .join("")}
    `;
    select.value = seleccionada;
  }

  if (datalist) {
    const base = [
      "Pizzas",
      "Hamburguesas",
      "Bebidas",
      "Granizados",
      "Acompañamientos",
      "Postres",
      "Combos",
      "Otros",
    ];
    const todas = [...new Set([...base, ...categorias])];

    datalist.innerHTML = todas
      .map((categoria) => `<option value="${escaparHtml(categoria)}"></option>`)
      .join("");
  }
}

function pizzasFiltradas() {
  const busqueda = textoNormalizado(busquedaProductos);

  return (Array.isArray(pizzas) ? pizzas : []).filter((pizza) => {
    const categoria = String(pizza.categoria || "").trim();
    const coincideCategoria =
      filtroCategoria === "todas" || categoria === filtroCategoria;
    const texto = textoNormalizado(
      `${pizza.nombre} ${pizza.descripcion || ""} ${categoria}`
    );

    return coincideCategoria && (!busqueda || texto.includes(busqueda));
  });
}

function renderPizzas() {
  const contenedor = document.querySelector("#admin-pizzas");
  if (!contenedor) return;

  if (!pizzasCargadas) {
    contenedor.innerHTML = `<p class="loading-text">Cargando productos...</p>`;
    return;
  }

  const filtradas = pizzasFiltradas();

  if (filtradas.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <span aria-hidden="true">📦</span>
        <p>No hay productos que coincidan con los filtros.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = filtradas
    .map((pizza) => {
      const stock = Number(pizza.stock) || 0;
      const claseStock =
        stock === 0 ? "stock-cero" : stock <= 5 ? "stock-bajo" : "stock-ok";
      const categoria = String(pizza.categoria || "Pizzas");

      return `
        <article class="pizza-card ${pizza.activo ? "" : "desactivada"}">
          <div class="pizza-image">
            ${
              pizza.imagen_url
                ? `<img src="${escaparHtml(
                    resolverImagen(pizza.imagen_url)
                  )}" alt="${escaparHtml(pizza.nombre)}" loading="lazy" />`
                : `<div class="pizza-placeholder"><span aria-hidden="true">🍕</span><small>Sin imagen</small></div>`
            }
          </div>

          <div class="pizza-info">
            <div class="pizza-header">
              <div>
                <span class="producto-categoria">${escaparHtml(categoria)}</span>
                <h3>${escaparHtml(pizza.nombre)}</h3>
              </div>
              <span class="estado ${pizza.activo ? "activo" : "inactivo"}">
                ${pizza.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            <p class="pizza-descripcion">${escaparHtml(pizza.descripcion)}</p>

            <div class="pizza-meta">
              <strong>${formatearPrecio(pizza.precio)}</strong>
              <span class="stock-chip ${claseStock}">Stock: ${stock}</span>
            </div>

            <div class="pizza-actions">
              <button
                type="button"
                class="btn-admin btn-admin-sm btn-admin-ghost"
                data-editar-producto="${pizza.id}"
              >
                Editar
              </button>

              ${
                pizza.activo
                  ? `
                    <button
                      type="button"
                      class="btn-admin btn-admin-sm btn-admin-danger"
                      data-desactivar-producto="${pizza.id}"
                    >
                      Desactivar
                    </button>
                  `
                  : `
                    <button
                      type="button"
                      class="btn-admin btn-admin-sm btn-admin-success"
                      data-activar-producto="${pizza.id}"
                    >
                      Activar
                    </button>
                  `
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function editarPizza(id) {
  const pizza = pizzas.find((item) => item.id === id);
  if (!pizza) return;

  document.querySelector("#pizza-id").value = pizza.id;
  document.querySelector("#nombre").value = pizza.nombre;
  document.querySelector("#descripcion").value = pizza.descripcion;
  document.querySelector("#precio").value = pizza.precio;
  document.querySelector("#stock").value = pizza.stock;

  const imagenAnterior = pizza.imagen_url || "";
  const inputImagen = document.querySelector("#imagen_archivo");

  imagenProductoAnterior = imagenAnterior;
  archivoImagenProducto = null;
  if (inputImagen) inputImagen.value = "";
  document.querySelector("#imagen_url").value = imagenAnterior;
  renderizarPreviewProducto(imagenAnterior);

  document.querySelector("#categoria").value = pizza.categoria || "Pizzas";
  document.querySelector("#activo").checked = Boolean(pizza.activo);
  document.querySelector("#form-title").textContent = "Editar producto";

  mostrarSeccion("productos");

  window.setTimeout(() => {
    document
      .querySelector(".product-form-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#nombre")?.focus();
  }, 50);
}

async function desactivarPizza(id) {
  if (!window.confirm("¿Seguro que quieres desactivar este producto?")) return;

  try {
    await apiFetch(`/pizzas/${id}`, { method: "DELETE" });
    toast("Producto desactivado correctamente.");
    await Promise.all([cargarPizzas(), cargarDashboard()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

async function activarPizza(id) {
  try {
    await apiFetch(`/pizzas/${id}/activar`, { method: "PATCH" });
    toast("Producto activado correctamente.");
    await Promise.all([cargarPizzas(), cargarDashboard()]);
  } catch (error) {
    toast(error.message, "error");
  }
}

export async function guardarPizza(event) {
  event.preventDefault();

  const id = document.querySelector("#pizza-id").value;
  const boton = event.currentTarget.querySelector('button[type="submit"]');
  const nombre = document.querySelector("#nombre").value.trim();
  const descripcion = document.querySelector("#descripcion").value.trim();
  const precio = Number(document.querySelector("#precio").value);
  const stock = Number(document.querySelector("#stock").value);
  const categoria =
    document.querySelector("#categoria").value.trim() || "Pizzas";
  const activo = document.querySelector("#activo").checked;
  const imagenActual = document.querySelector("#imagen_url").value.trim();
  const imagenAnterior = imagenProductoAnterior;

  if (!nombre || !descripcion) {
    toast("El nombre y la descripción son obligatorios.", "error");
    return;
  }

  if (!Number.isFinite(precio) || precio < 0) {
    toast("El precio debe ser un número mayor o igual a 0.", "error");
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    toast("El stock debe ser un entero mayor o igual a 0.", "error");
    return;
  }

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = archivoImagenProducto
        ? "Subiendo imagen..."
        : "Guardando...";
    }

    let imagenUrl = imagenActual || null;

    if (archivoImagenProducto) {
      const subida = await subirArchivoImagen(archivoImagenProducto);
      imagenUrl = subida.url;
      if (boton) boton.textContent = "Guardando...";
    }

    const datos = {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url: imagenUrl,
      categoria,
      activo,
    };

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

    if (imagenAnterior && imagenAnterior !== imagenUrl) {
      await eliminarImagenLocal(imagenAnterior);
    }

    limpiarFormulario();
    toast(
      id
        ? "Producto actualizado correctamente."
        : "Producto creado correctamente."
    );

    await Promise.all([cargarPizzas(), cargarDashboard()]);
  } catch (error) {
    toast(error.message, "error");
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Guardar producto";
    }
  }
}

export function limpiarFormulario() {
  const formulario = document.querySelector("#pizza-form");
  if (!formulario) return;

  formulario.reset();
  document.querySelector("#pizza-id").value = "";
  document.querySelector("#activo").checked = true;
  document.querySelector("#categoria").value = "Pizzas";
  document.querySelector("#form-title").textContent = "Nuevo producto";

  archivoImagenProducto = null;
  imagenProductoAnterior = "";

  const inputImagen = document.querySelector("#imagen_archivo");
  if (inputImagen) inputImagen.value = "";

  document.querySelector("#imagen_url").value = "";
  renderizarPreviewProducto();
}

export async function cargarReporteMensual() {
  const contenedor = document.querySelector("#reporte-mensual");
  const anio = Number(document.querySelector("#reporte-anio")?.value);
  const mes = Number(document.querySelector("#reporte-mes")?.value);

  if (!contenedor) return;

  if (!Number.isInteger(anio) || anio < 2000) {
    toast("Ingresa un año válido.", "error");
    return;
  }

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    toast("El mes debe estar entre 1 y 12.", "error");
    return;
  }

  try {
    contenedor.setAttribute("aria-busy", "true");
    const data = await apiFetch(`/reportes/mensual?anio=${anio}&mes=${mes}`);
    renderReporte(data);
  } catch (error) {
    contenedor.innerHTML = `<p class="error">${escaparHtml(error.message)}</p>`;
  } finally {
    contenedor.removeAttribute("aria-busy");
  }
}

function renderReporte(data) {
  const contenedor = document.querySelector("#reporte-mensual");
  if (!contenedor) return;

  const ventas = Array.isArray(data.ventas_por_dia)
    ? data.ventas_por_dia
    : [];
  const producto = data.pizza_mas_vendida;
  const dia = data.dia_mas_ventas;

  contenedor.innerHTML = `
    <div class="reporte-grid">
      <article class="stat-card tone-success">
        <div class="stat-top">
          <span class="stat-label">Total vendido</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("dinero")}</span>
        </div>
        <p class="stat-value">${formatearPrecio(data.total_vendido)}</p>
        <p class="stat-hint">Ventas con pago confirmado</p>
      </article>

      <article class="stat-card tone-info">
        <div class="stat-top">
          <span class="stat-label">Pedidos</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("bolsa")}</span>
        </div>
        <p class="stat-value">${Number(data.total_pedidos) || 0}</p>
        <p class="stat-hint">Pedidos pagados en el mes</p>
      </article>

      <article class="stat-card tone-neutral">
        <div class="stat-top">
          <span class="stat-label">Promedio por pedido</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("tendencia")}</span>
        </div>
        <p class="stat-value">${formatearPrecio(data.promedio_pedido)}</p>
        <p class="stat-hint">Ticket promedio del mes</p>
      </article>

      <article class="stat-card tone-warning">
        <div class="stat-top">
          <span class="stat-label">Producto más vendido</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("estrella")}</span>
        </div>
        <p class="stat-value stat-value-text">
          ${producto ? escaparHtml(producto.nombre) : "Sin datos"}
        </p>
        <p class="stat-hint">
          ${
            producto
              ? `${Number(producto.cantidad_vendida) || 0} unidades vendidas`
              : "Aún no hay ventas este mes"
          }
        </p>
      </article>

      <article class="stat-card tone-info">
        <div class="stat-top">
          <span class="stat-label">Día con más ventas</span>
          <span class="stat-icon" aria-hidden="true">${iconoSvg("calendario")}</span>
        </div>
        <p class="stat-value stat-value-text">
          ${dia ? formatearDia(dia.dia) : "Sin datos"}
        </p>
        <p class="stat-hint">
          ${dia ? formatearPrecio(dia.total) : "Aún no hay ventas este mes"}
        </p>
      </article>
    </div>

    <div class="reporte-panels">
      <article class="panel-card">
        <div class="panel-card-head">
          <div>
            <h2>Ventas por día</h2>
            <p>Compara el ingreso de cada día del mes.</p>
          </div>
        </div>
        ${renderGraficoVentas(ventas)}
      </article>

      <article class="panel-card">
        <div class="panel-card-head">
          <div>
            <h2>Detalle diario</h2>
            <p>Pedidos y total vendido por fecha.</p>
          </div>
        </div>
        ${renderTablaVentas(ventas)}
      </article>
    </div>
  `;
}

function renderGraficoVentas(ventas) {
  if (ventas.length === 0) {
    return `
      <div class="empty-state compact">
        <span aria-hidden="true">📈</span>
        <p>No hay ventas registradas en este mes.</p>
      </div>
    `;
  }

  const maximo = Math.max(
    ...ventas.map((venta) => Number(venta.total) || 0),
    1
  );

  return `
    <div class="report-chart" role="img" aria-label="Gráfico de ventas por día">
      ${ventas
        .map((venta) => {
          const total = Number(venta.total) || 0;
          const altura = Math.max(5, Math.round((total / maximo) * 100));

          return `
            <div
              class="report-bar"
              title="${formatearDia(venta.dia)}: ${formatearPrecio(total)} · ${
                Number(venta.pedidos) || 0
              } pedidos"
            >
              <span class="report-bar-track">
                <span class="report-bar-fill" style="height: ${altura}%"></span>
              </span>
              <span class="report-bar-label">${formatearDiaCorto(venta.dia)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTablaVentas(ventas) {
  if (ventas.length === 0) {
    return `
      <div class="empty-state compact">
        <span aria-hidden="true">🧾</span>
        <p>No hay pedidos pagados en este mes.</p>
      </div>
    `;
  }

  return `
    <div class="tabla-wrap">
      <table class="tabla-pedidos tabla-reporte">
        <thead>
          <tr>
            <th>Día</th>
            <th>Pedidos</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${ventas
            .map(
              (venta) => `
                <tr>
                  <td data-label="Día">${formatearDia(venta.dia)}</td>
                  <td data-label="Pedidos">${Number(venta.pedidos) || 0}</td>
                  <td data-label="Total"><strong>${formatearPrecio(
                    venta.total
                  )}</strong></td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function refrescarTodo() {
  const boton = document.querySelector("#btn-refresh");
  const contenidoOriginal = boton?.innerHTML;

  if (boton) {
    boton.disabled = true;
    boton.textContent = "Actualizando...";
  }

  await Promise.all([
    cargarDashboard(),
    cargarPedidos(),
    cargarPizzas(),
    cargarNegocio(),
    cargarReporteMensual(),
  ]);

  if (boton) {
    boton.disabled = false;
    boton.innerHTML = contenidoOriginal;
  }
}

function configurarEventos() {
  document.querySelector("#btn-refresh")?.addEventListener("click", refrescarTodo);
  document
    .querySelector("#btn-refresh-pedidos")
    ?.addEventListener("click", cargarPedidos);

  document
    .querySelectorAll(".admin-nav-item")
    .forEach((boton) =>
      boton.addEventListener("click", () =>
        mostrarSeccion(boton.dataset.section)
      )
    );

  document.addEventListener("click", (event) => {
    const goto = event.target.closest("[data-goto]");
    if (goto) mostrarSeccion(goto.dataset.goto);
  });

  document.querySelector("#pedidos-busqueda")?.addEventListener("input", (event) => {
    busquedaPedidos = event.target.value;
    renderPedidos();
  });

  document
    .querySelector("#pedidos-filtro-estado")
    ?.addEventListener("change", (event) => {
      filtroPedidos = event.target.value;
      renderPedidos();
    });

  document
    .querySelector("#productos-busqueda")
    ?.addEventListener("input", (event) => {
      busquedaProductos = event.target.value;
      renderPizzas();
    });

  document
    .querySelector("#productos-filtro-categoria")
    ?.addEventListener("change", (event) => {
      filtroCategoria = event.target.value;
      renderPizzas();
    });

  document
    .querySelector("#imagen_archivo")
    ?.addEventListener("change", manejarSeleccionImagenProducto);

  document
    .querySelector("#btn-quitar-imagen")
    ?.addEventListener("click", quitarImagenProducto);

  document.querySelector("#logo-form")?.addEventListener("submit", guardarLogo);
  document
    .querySelector("#btn-quitar-logo")
    ?.addEventListener("click", quitarLogo);

  document.addEventListener("click", (event) => {
    const cerrar = event.target.closest("[data-cerrar-modal]");
    if (cerrar) cerrarModal(cerrar.dataset.cerrarModal);
  });

  document.querySelectorAll("dialog.admin-modal").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  const manejarAccionPedido = (event) => {
    const boton = event.target.closest(
      "[data-ver-pedido], [data-pagar-pedido], [data-finalizar-pedido], [data-cancelar-pedido], [data-copiar-codigo]"
    );

    if (!boton) return;

    if (boton.dataset.verPedido) {
      verPedido(Number(boton.dataset.verPedido));
    } else if (boton.dataset.pagarPedido) {
      registrarPagoPedido(Number(boton.dataset.pagarPedido));
    } else if (boton.dataset.finalizarPedido) {
      abrirFinalizarPedido(Number(boton.dataset.finalizarPedido));
    } else if (boton.dataset.cancelarPedido) {
      cancelarPedido(Number(boton.dataset.cancelarPedido));
    } else if (boton.dataset.copiarCodigo) {
      copiarCodigo(boton.dataset.copiarCodigo);
    }
  };

  document.querySelector("#pedidos-lista")?.addEventListener("click", manejarAccionPedido);
  document
    .querySelector("#dashboard-pedidos")
    ?.addEventListener("click", manejarAccionPedido);
  document
    .querySelector("#modal-pedido-contenido")
    ?.addEventListener("click", manejarAccionPedido);

  const manejarAccionProducto = (event) => {
    const boton = event.target.closest(
      "[data-editar-producto], [data-desactivar-producto], [data-activar-producto]"
    );

    if (!boton) return;

    if (boton.dataset.editarProducto) {
      editarPizza(Number(boton.dataset.editarProducto));
    } else if (boton.dataset.desactivarProducto) {
      desactivarPizza(Number(boton.dataset.desactivarProducto));
    } else if (boton.dataset.activarProducto) {
      activarPizza(Number(boton.dataset.activarProducto));
    }
  };

  document.querySelector("#admin-pizzas")?.addEventListener("click", manejarAccionProducto);
  document
    .querySelector("#dashboard-stock")
    ?.addEventListener("click", manejarAccionProducto);

  // Si una URL de imagen externa falla, muestra el marcador de "Sin imagen".
  document.querySelector("#admin-pizzas")?.addEventListener(
    "error",
    (event) => {
      const imagen = event.target;

      if (!(imagen instanceof HTMLImageElement)) return;

      const contenedorImagen = imagen.closest(".pizza-image");
      if (!contenedorImagen) return;

      contenedorImagen.innerHTML = `
        <div class="pizza-placeholder">
          <span aria-hidden="true">🍕</span>
          <small>Sin imagen</small>
        </div>
      `;
    },
    true
  );

  document.querySelector("#imagen-preview")?.addEventListener(
    "error",
    (event) => {
      if (!(event.target instanceof HTMLImageElement)) return;

      const contenedor = document.querySelector("#imagen-preview");
      if (!contenedor) return;

      contenedor.innerHTML = `
        <div class="imagen-preview-placeholder">
          <span aria-hidden="true">🍕</span>
          <small>Sin imagen</small>
        </div>
      `;
    },
    true
  );

  document.querySelector("#logo-preview")?.addEventListener(
    "error",
    (event) => {
      const imagen = event.target;

      if (!(imagen instanceof HTMLImageElement)) return;
      if (imagen.dataset.fallback === "true") return;

      imagen.dataset.fallback = "true";
      imagen.src = "./el-callejon-logo.png";
    },
    true
  );
}

export async function iniciarPanelAdmin() {
  configurarEventos();
  renderizarPreviewProducto();
  await refrescarTodo();
}
