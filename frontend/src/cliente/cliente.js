import { apiUrl } from "../config/api.js";
import { whatsappUrl } from "../config/whatsapp.js";

const API_PIZZAS = apiUrl("/api/pizzas");

const carrito = [];
let pizzasCatalogo = [];
let categoriaSeleccionada = "todo";
let busquedaMenu = "";
let soloDisponibles = false;
let ordenMenu = "featured";

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

function textoNormalizado(valor) {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function categoriaPizza(pizza) {
  if (pizza.categoria || pizza.category) {
    return String(pizza.categoria || pizza.category);
  }

  const nombre = textoNormalizado(pizza.nombre);
  if (/margarita|pepperoni|hawaiana/.test(nombre)) return "Pizzas clásicas";
  if (/pizza|quesos|bbq|pollo/.test(nombre)) return "Pizzas especiales";
  return "Otros";
}

function pizzaDisponible(pizza) {
  return (
    pizza.disponible === true ||
    pizza.disponible === "t" ||
    Number(pizza.stock) > 0
  );
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
  const whatsappPedido = document.querySelector("#btn-whatsapp-pedido");

  if (contador) {
    contador.textContent = String(totalItemsCarrito());
  }

  if (total) {
    total.textContent = formatearPrecio(totalCarrito());
  }

  if (whatsappPedido && carrito.length > 0) {
    const detalle = carrito
      .map(
        (item) =>
          `- ${item.cantidad} x ${item.nombre}: ${formatearPrecio(
            Number(item.precio) * item.cantidad
          )}`
      )
      .join("\n");

    whatsappPedido.href = whatsappUrl(
      `Hola, El Callejón. Quiero hacer este pedido:\n\n${detalle}\n\nTotal: ${formatearPrecio(
        totalCarrito()
      )}`
    );
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

export function agregarAlCarrito(pizzaId) {
  const pizza = pizzasCatalogo.find((p) => p.id === pizzaId);

  if (!pizza || !pizzaDisponible(pizza)) return;

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

function voltearCarta(card, forzar) {
  const abrir = forzar ?? !card.classList.contains("is-flipped");

  document.querySelectorAll(".pizza-card-3d.is-flipped").forEach((otra) => {
    if (otra !== card) {
      otra.classList.remove("is-flipped");
    }
  });

  card.classList.toggle("is-flipped", abrir);
}

function cerrarRedes() {
  const panel = document.querySelector("#social-panel");

  if (!panel) return;

  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
  document
    .querySelectorAll('.pizza-card-3d button[data-share-pizza][aria-expanded="true"]')
    .forEach((button) => button.setAttribute("aria-expanded", "false"));
}

export function inicializarCarrito() {
  document.querySelector("#btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document
    .querySelector("#btn-abrir-carrito-flotante")
    ?.addEventListener("click", abrirCarrito);
  document
    .querySelector("#btn-abrir-carrito-contacto")
    ?.addEventListener("click", abrirCarrito);
  document.querySelector("#btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.querySelector("#carrito-fondo")?.addEventListener("click", cerrarCarrito);
  document.querySelector("#social-panel-close")?.addEventListener("click", cerrarRedes);

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

    const compartir = event.target.closest("button[data-share-pizza]");
    if (compartir) {
      event.stopPropagation();
      const panel = document.querySelector("#social-panel");
      if (panel) {
        document
          .querySelectorAll('.pizza-card-3d button[data-share-pizza][aria-expanded="true"]')
          .forEach((button) => button.setAttribute("aria-expanded", "false"));
        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        compartir.setAttribute("aria-expanded", "true");
        panel.querySelector("#social-panel-close")?.focus();
      }
      return;
    }

    const whatsapp = event.target.closest("a[data-card-whatsapp]");
    if (whatsapp) {
      event.stopPropagation();
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
    if (!card || (event.target !== card && event.target.closest("button, a"))) return;
    event.preventDefault();
    voltearCarta(card);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarCarrito();
      cerrarRedes();
    }
  });

  renderCarrito();
}

export function inicializarNavegacion() {
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");
  const header = document.querySelector(".site-header");

  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.href = whatsappUrl("Hola, quisiera información sobre el menú de El Callejón.");
  });

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

function renderCategoriasMenu() {
  const contenedor = document.querySelector("#menu-categories");
  if (!contenedor) return;

  const categorias = [
    ...new Set(pizzasCatalogo.map(categoriaPizza)),
  ];
  const opciones = [
    { id: "todo", nombre: "Todo", cantidad: pizzasCatalogo.length },
    ...categorias.map((nombre) => ({
      id: textoNormalizado(nombre),
      nombre,
      cantidad: pizzasCatalogo.filter(
        (pizza) => categoriaPizza(pizza) === nombre
      ).length,
    })),
  ];

  contenedor.innerHTML = opciones
    .map(
      (opcion) => `
        <button type="button" class="menu-category${categoriaSeleccionada === opcion.id ? " activo" : ""}"
          data-category="${escapeHtml(opcion.id)}" aria-pressed="${categoriaSeleccionada === opcion.id}">
          <span>${escapeHtml(opcion.nombre)}</span>
          <span class="category-count">${opcion.cantidad}</span>
        </button>
      `
    )
    .join("");
}

function pizzasFiltradas() {
  let resultado = pizzasCatalogo.filter((pizza) => {
    const categoria = categoriaPizza(pizza);
    const coincideCategoria =
      categoriaSeleccionada === "todo" ||
      textoNormalizado(categoria) === categoriaSeleccionada;
    const texto = textoNormalizado(`${pizza.nombre} ${pizza.descripcion || ""}`);
    const coincideBusqueda = texto.includes(textoNormalizado(busquedaMenu));
    const coincideDisponibilidad = !soloDisponibles || pizzaDisponible(pizza);

    return coincideCategoria && coincideBusqueda && coincideDisponibilidad;
  });

  if (ordenMenu === "price-asc") {
    resultado = resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
  } else if (ordenMenu === "price-desc") {
    resultado = resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
  } else if (ordenMenu === "name") {
    resultado = resultado.sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
  }

  return resultado;
}

function renderPizzasFiltradas() {
  const contenedor = document.querySelector("#pizzas-cliente");
  const contador = document.querySelector("#menu-results-count");
  if (!contenedor) return;

  const pizzas = pizzasFiltradas();

  if (contador) {
    contador.textContent = `Mostrando ${pizzas.length} de ${pizzasCatalogo.length} ${
      pizzasCatalogo.length === 1 ? "producto" : "productos"
    }`;
  }

  if (pizzas.length === 0) {
    contenedor.innerHTML = `
      <div class="menu-empty" role="status">
        <p>No encontramos pizzas con esos filtros.</p>
        <button type="button" class="btn btn-secondary" id="clear-menu-filters">Limpiar filtros</button>
      </div>
    `;
    contenedor.querySelector("#clear-menu-filters")?.addEventListener("click", () => {
      categoriaSeleccionada = "todo";
      busquedaMenu = "";
      soloDisponibles = false;
      ordenMenu = "featured";
      const busqueda = document.querySelector("#menu-search");
      const disponibles = document.querySelector("#available-only");
      const orden = document.querySelector("#menu-sort");
      if (busqueda) busqueda.value = "";
      if (disponibles) disponibles.checked = false;
      if (orden) orden.value = "featured";
      const borrar = document.querySelector("#clear-menu-search");
      if (borrar) borrar.hidden = true;
      renderCategoriasMenu();
      renderPizzasFiltradas();
    });
    return;
  }

  contenedor.innerHTML = pizzas
    .map((pizza) => {
      const nombre = escapeHtml(pizza.nombre);
      const descripcion = escapeHtml(pizza.descripcion);
      const disponible = pizzaDisponible(pizza);
      const imagen = `<div class="pizza-img-wrapper">${imagenPizza(pizza)}</div>`;
      const pedidoDirecto = whatsappUrl(
        `Hola, El Callejón. Quiero pedir ${pizza.nombre} por ${formatearPrecio(
          pizza.precio
        )}.`
      );

      return `
        <article class="pizza-card-3d ${disponible ? "" : "pizza-card-agotada"}"
          data-flip
          role="group"
          tabindex="0"
          aria-label="${nombre}: carta 3D. Pulsa para ver detalles"
        >
          <div class="pizza-face pizza-face-1">
            <div class="pizza-face-top">
              <span class="pizza-badge-3d ${disponible ? "disponible" : "agotada"}">
                ${disponible ? "✓ Disponible" : "✗ Agotada"}
              </span>
              <h3 class="pizza-nombre-3d hide">${nombre}</h3>
              <p class="pizza-desc-3d hide">${descripcion}</p>
            </div>
            ${imagen}
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
            ${imagen}
            <div class="pizza-face-bottom">
              <strong class="pizza-precio-back hide">${formatearPrecio(pizza.precio)}</strong>
              <div class="pizza-actions hide">
                <a class="pizza-whatsapp" data-card-whatsapp href="${escapeHtml(
                  pedidoDirecto
                )}" target="_blank" rel="noopener noreferrer" aria-label="Pedir ${nombre} por WhatsApp">
                  <svg class="whatsapp-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path d="M20.4 11.7a8.3 8.3 0 0 1-12.3 7.2L3.8 20l1.1-4.2a8.3 8.3 0 1 1 15.5-4.1Z" />
                    <path d="M9 8.7c.2-.4.4-.4.7-.4h.5l.9 2.1-1 .9c.6 1.2 1.5 2.1 2.8 2.8l.8-1 2.1.9v.5c0 .3-.1.6-.4.7-.8.4-1.7.4-2.6.1-2.2-.8-4.2-2.7-5-5-.3-.9-.2-1.8.2-2.6Z" />
                  </svg>
                </a>
                ${
                  disponible
                    ? `<button type="button" class="btn-add-3d" data-add="${pizza.id}"><span aria-hidden="true">+</span> Añadir</button>`
                    : `<span class="btn-add-3d btn-add-3d-disabled">Sin stock</span>`
                }
                <button type="button" class="pizza-share" data-share-pizza aria-label="Ver redes sociales" aria-controls="social-panel" aria-expanded="false">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function inicializarFiltrosMenu() {
  const busqueda = document.querySelector("#menu-search");
  const borrarBusqueda = document.querySelector("#clear-menu-search");
  const categorias = document.querySelector("#menu-categories");
  const disponibles = document.querySelector("#available-only");
  const orden = document.querySelector("#menu-sort");

  busqueda?.addEventListener("input", () => {
    busquedaMenu = busqueda.value.trim();
    if (borrarBusqueda) borrarBusqueda.hidden = !busquedaMenu;
    renderPizzasFiltradas();
  });

  borrarBusqueda?.addEventListener("click", () => {
    if (busqueda) {
      busqueda.value = "";
      busqueda.focus();
    }
    busquedaMenu = "";
    borrarBusqueda.hidden = true;
    renderPizzasFiltradas();
  });

  categorias?.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-category]");
    if (!boton) return;
    categoriaSeleccionada = boton.dataset.category;
    renderCategoriasMenu();
    renderPizzasFiltradas();
  });

  disponibles?.addEventListener("change", () => {
    soloDisponibles = disponibles.checked;
    renderPizzasFiltradas();
  });

  orden?.addEventListener("change", () => {
    ordenMenu = orden.value;
    renderPizzasFiltradas();
  });
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

    renderCategoriasMenu();
    renderPizzasFiltradas();
    inicializarFiltrosMenu();
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
