import { apiUrl } from "../config/api.js";

const API_PIZZAS = apiUrl("/api/pizzas");
const API_PEDIDOS = apiUrl("/api/pedidos");

const carrito = [];
let pizzasCatalogo = [];

function escapeHtml(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
}

function imagenPizza(pizza) {
  const nombre = escapeHtml(pizza.nombre);

  if (!pizza.imagen_url) {
    return `<div class="pizza-placeholder" aria-hidden="true">🍕</div>`;
  }

  return `<img src="${escapeHtml(pizza.imagen_url)}" alt="${nombre}" loading="lazy" decoding="async" width="480" height="360" />`;
}

function totalItemsCarrito() {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function totalCarrito() {
  return carrito.reduce(
    (total, item) => total + Number(item.precio) * item.cantidad,
    0
  );
}

function actualizarResumenCarrito() {
  const contador = document.querySelector("#carrito-count");
  const total = document.querySelector("#carrito-total");

  if (contador) {
    contador.textContent = String(totalItemsCarrito());
  }

  if (total) {
    total.textContent = formatearPrecio(totalCarrito());
  }
}

function renderCarrito() {
  const lista = document.querySelector("#carrito-lista");
  const vacio = document.querySelector("#carrito-vacio");
  const acciones = document.querySelector("#carrito-acciones");

  if (!lista) return;

  if (carrito.length === 0) {
    lista.innerHTML = "";
    if (vacio) vacio.hidden = false;
    if (acciones) acciones.hidden = true;
    actualizarResumenCarrito();
    return;
  }

  if (vacio) vacio.hidden = true;
  if (acciones) acciones.hidden = false;

  lista.innerHTML = carrito
    .map(
      (item) => `
        <article class="carrito-item">
          <div>
            <h4>${escapeHtml(item.nombre)}</h4>
            <p>${formatearPrecio(item.precio)} c/u</p>
          </div>
          <div class="carrito-item-actions">
            <button type="button" data-action="menos" data-id="${item.pizza_id}" aria-label="Reducir cantidad">−</button>
            <span>${item.cantidad}</span>
            <button type="button" data-action="mas" data-id="${item.pizza_id}" aria-label="Aumentar cantidad">+</button>
            <button type="button" class="quitar" data-action="quitar" data-id="${item.pizza_id}">Quitar</button>
          </div>
        </article>
      `
    )
    .join("");

  actualizarResumenCarrito();
}

function limpiarResultadoPedido() {
  const resultado = document.querySelector("#pedido-resultado");
  if (resultado) resultado.innerHTML = "";
}

export function agregarAlCarrito(pizzaId) {
  const pizza = pizzasCatalogo.find((p) => p.id === pizzaId);

  if (!pizza || !pizza.disponible) return;

  limpiarResultadoPedido();

  const existente = carrito.find((item) => item.pizza_id === pizzaId);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      pizza_id: pizza.id,
      nombre: pizza.nombre,
      precio: pizza.precio,
      cantidad: 1,
    });
  }

  renderCarrito();
  abrirCarrito();
}

function cambiarCantidad(pizzaId, delta) {
  const item = carrito.find((p) => p.pizza_id === pizzaId);

  if (!item) return;

  limpiarResultadoPedido();
  item.cantidad += delta;

  if (item.cantidad <= 0) {
    const index = carrito.findIndex((p) => p.pizza_id === pizzaId);
    carrito.splice(index, 1);
  }

  renderCarrito();
}

function quitarDelCarrito(pizzaId) {
  const index = carrito.findIndex((p) => p.pizza_id === pizzaId);

  if (index === -1) return;

  limpiarResultadoPedido();
  carrito.splice(index, 1);
  renderCarrito();
}

function abrirCarrito() {
  const panel = document.querySelector("#carrito-panel");
  const fondo = document.querySelector("#carrito-fondo");

  panel?.classList.add("abierto");
  fondo?.classList.add("visible");
  panel?.setAttribute("aria-hidden", "false");
  document.body.classList.add("carrito-abierto");
}

function cerrarCarrito() {
  const panel = document.querySelector("#carrito-panel");
  const fondo = document.querySelector("#carrito-fondo");

  panel?.classList.remove("abierto");
  fondo?.classList.remove("visible");
  panel?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("carrito-abierto");
}

function mostrarPedidoExito(pedido) {
  const resultado = document.querySelector("#pedido-resultado");
  const vacio = document.querySelector("#carrito-vacio");

  if (vacio) vacio.hidden = true;

  if (resultado) {
    resultado.innerHTML = `
      <div class="pedido-exito" role="status">
        <h3>Pedido confirmado</h3>
        <p>Pedido #${escapeHtml(pedido.id)}</p>
        <p>Total: ${formatearPrecio(pedido.total)}</p>
        <p>
          Código de confirmación:
          <strong>${escapeHtml(pedido.codigo_confirmacion)}</strong>
        </p>
        <p class="pedido-ayuda">
          Guarda este código para retirar tu pedido en el local.
        </p>
      </div>
    `;
  }
}

async function crearYConfirmarPedido() {
  const boton = document.querySelector("#btn-confirmar-pedido");

  if (carrito.length === 0) return;

  try {
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Procesando...";
    }

    const cuerpo = {
      pizzas: carrito.map((item) => ({
        pizza_id: item.pizza_id,
        cantidad: item.cantidad,
      })),
    };

    const crearResponse = await fetch(API_PEDIDOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

    const crearData = await crearResponse.json();

    if (!crearResponse.ok) {
      throw new Error(crearData.error || "No se pudo crear el pedido");
    }

    const pedidoId = crearData.pedido.id;
    const pagoResponse = await fetch(`${API_PEDIDOS}/${pedidoId}/confirmar-pago`, {
      method: "POST",
    });
    const pagoData = await pagoResponse.json();

    if (!pagoResponse.ok) {
      throw new Error(pagoData.error || "No se pudo confirmar el pago");
    }

    carrito.splice(0, carrito.length);
    renderCarrito();
    mostrarPedidoExito(pagoData.pedido);
    await cargarPizzasCliente();
  } catch (error) {
    console.error(error);

    const esLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
    if (!esLocal) {
      // Sin backend (GitHub Pages u otro host estático) → modo demo con número único
      const totalDemo = carrito.reduce((s, i) => s + Number(i.precio) * i.cantidad, 0);
      const codigoDemo = `PZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const idDemo = Date.now().toString().slice(-6);
      const pedidoDemo = { id: idDemo, total: totalDemo, codigo_confirmacion: codigoDemo };

      carrito.splice(0, carrito.length);
      renderCarrito();
      mostrarPedidoExito(pedidoDemo);

      const nota = document.createElement("p");
      nota.className = "pedido-ayuda";
      nota.style.cssText = "color:var(--color-muted,#888);font-size:.85em;margin-top:.5rem;";
      nota.textContent =
        "Vista de demostración: el servidor no está activo. Presenta este código en el local para confirmar.";
      document.querySelector("#pedido-resultado .pedido-exito")?.appendChild(nota);
    } else {
      // En local mostrar el error en pantalla (no alert) para poder diagnosticarlo
      const resultado = document.querySelector("#pedido-resultado");
      if (resultado) {
        resultado.innerHTML = `
          <div class="pedido-error" role="alert">
            <p><strong>No se pudo procesar el pedido</strong></p>
            <p>${escapeHtml(error.message || "Error desconocido")}</p>
            <p class="pedido-ayuda">Asegúrate de que el backend esté corriendo: <code>docker compose up -d</code></p>
          </div>
        `;
      }
    }
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Confirmar y pagar";
    }
  }
}

function voltearCarta(card, forzar) {
  const abrir = forzar ?? !card.classList.contains("is-flipped");

  document.querySelectorAll(".pizza-card-3d.is-flipped").forEach((otra) => {
    if (otra !== card) {
      otra.classList.remove("is-flipped");
      otra.setAttribute("aria-expanded", "false");
    }
  });

  card.classList.toggle("is-flipped", abrir);
  card.setAttribute("aria-expanded", abrir ? "true" : "false");
}

export function inicializarCarrito() {
  document.querySelector("#btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document
    .querySelector("#btn-abrir-carrito-contacto")
    ?.addEventListener("click", abrirCarrito);
  document.querySelector("#btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.querySelector("#carrito-fondo")?.addEventListener("click", cerrarCarrito);
  document
    .querySelector("#btn-confirmar-pedido")
    ?.addEventListener("click", crearYConfirmarPedido);

  document.querySelector("#carrito-lista")?.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-action]");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    const action = boton.dataset.action;

    if (action === "mas") cambiarCantidad(id, 1);
    if (action === "menos") cambiarCantidad(id, -1);
    if (action === "quitar") quitarDelCarrito(id);
  });

  document.querySelector("#pizzas-cliente")?.addEventListener("click", (event) => {
    const add = event.target.closest("button[data-add]");
    if (add) {
      event.stopPropagation();
      agregarAlCarrito(Number(add.dataset.add));
      return;
    }

    const card = event.target.closest(".pizza-card-3d");
    if (card) {
      voltearCarta(card);
    }
  });

  document.querySelector("#pizzas-cliente")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".pizza-card-3d");
    if (!card) return;
    event.preventDefault();
    voltearCarta(card);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarCarrito();
  });

  renderCarrito();
}

export function inicializarNavegacion() {
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");
  const header = document.querySelector(".site-header");

  toggle?.addEventListener("click", () => {
    const abierto = nav?.classList.toggle("abierto");
    toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("abierto");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener(
    "scroll",
    () => {
      header?.classList.toggle("scrolled", window.scrollY > 8);
    },
    { passive: true }
  );
}

async function obtenerPizzas() {
  // Intenta el backend; si no está disponible (GitHub Pages, sin servidor) carga el JSON estático
  try {
    const response = await fetch(API_PIZZAS);
    if (!response.ok) throw new Error("API no disponible");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Respuesta inválida del servidor");
    return data;
  } catch {
    // Fallback a menú estático (modo demo / GitHub Pages)
    const fallback = await fetch("./menu.json");
    if (!fallback.ok) throw new Error("No se pudo cargar el menú");
    return fallback.json();
  }
}

export async function cargarPizzasCliente() {
  const contenedor = document.querySelector("#pizzas-cliente");
  if (!contenedor) return;

  try {
    pizzasCatalogo = await obtenerPizzas();

    if (pizzasCatalogo.length === 0) {
      contenedor.innerHTML = `<div class="menu-empty"><p>No hay pizzas disponibles.</p></div>`;
      return;
    }

    contenedor.innerHTML = pizzasCatalogo
      .map((pizza) => {
        const nombre = escapeHtml(pizza.nombre);
        const descripcion = escapeHtml(pizza.descripcion);
        const disponible =
          pizza.disponible === true ||
          pizza.disponible === "t" ||
          Number(pizza.stock) > 0;

        return `
          <article class="pizza-card-3d ${disponible ? "" : "pizza-card-agotada"}"
            data-flip
            role="button"
            tabindex="0"
            aria-expanded="false"
            aria-label="${nombre}: tocar para ver detalles"
          >
            <div class="pizza-face pizza-face-1">
              <div class="pizza-face-top">
                <span class="pizza-badge-3d ${disponible ? "disponible" : "agotada"} hide">
                  ${disponible ? "✓ Disponible" : "✗ Agotada"}
                </span>
                <h3 class="pizza-nombre-3d hide">${nombre}</h3>
                <p class="pizza-desc-3d hide">${descripcion}</p>
              </div>
              <div class="pizza-face-bottom">
                <strong class="pizza-precio-3d hide">${formatearPrecio(pizza.precio)}</strong>
                <span class="pizza-hint hide">👆 Ver detalles</span>
              </div>
            </div>

            <div class="pizza-face pizza-face-2">
              <div class="pizza-face-top">
                <h3 class="pizza-nombre-back hide">${nombre}</h3>
                <p class="pizza-desc-back hide">${descripcion}</p>
              </div>
              <div class="pizza-face-bottom">
                <strong class="pizza-precio-back hide">${formatearPrecio(pizza.precio)}</strong>
                ${
                  disponible
                    ? `<button type="button" class="btn-add-3d hide" data-add="${pizza.id}">🛒 Agregar al pedido</button>`
                    : `<span class="btn-add-3d btn-add-3d-disabled hide">Sin stock</span>`
                }
              </div>
            </div>

            <div class="pizza-img-wrapper">
              <div class="pizza-img-float">
                ${imagenPizza(pizza)}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `
      <div class="menu-error" role="alert">
        <p>No pudimos conectar con el servidor.</p>
        <p class="menu-error-hint">Arranca el backend: docker compose up -d</p>
        <button type="button" class="btn btn-secondary" id="btn-reintentar-menu">Reintentar</button>
      </div>
    `;
    contenedor.querySelector("#btn-reintentar-menu")?.addEventListener("click", () => {
      location.reload();
    });
  }
}
