const API_PIZZAS = "http://localhost:3000/api/pizzas";
const API_PEDIDOS = "http://localhost:3000/api/pedidos";

const carrito = [];
let pizzasCatalogo = [];

function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString("es-CO")}`;
}

function imagenPizza(pizza) {
  if (!pizza.imagen_url) {
    return `<div class="pizza-placeholder">Sin imagen</div>`;
  }

  return `<img src="${pizza.imagen_url}" alt="${pizza.nombre}" />`;
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
            <h4>${item.nombre}</h4>
            <p>${formatearPrecio(item.precio)} c/u</p>
          </div>

          <div class="carrito-item-actions">
            <button
              type="button"
              data-action="menos"
              data-id="${item.pizza_id}"
            >
              −
            </button>
            <span>${item.cantidad}</span>
            <button
              type="button"
              data-action="mas"
              data-id="${item.pizza_id}"
            >
              +
            </button>
            <button
              type="button"
              class="quitar"
              data-action="quitar"
              data-id="${item.pizza_id}"
            >
              Quitar
            </button>
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
  document.querySelector("#carrito-panel")?.classList.add("abierto");
  document.querySelector("#carrito-fondo")?.classList.add("visible");
}

function cerrarCarrito() {
  document.querySelector("#carrito-panel")?.classList.remove("abierto");
  document.querySelector("#carrito-fondo")?.classList.remove("visible");
}

async function crearYConfirmarPedido() {
  const boton = document.querySelector("#btn-confirmar-pedido");
  const resultado = document.querySelector("#pedido-resultado");

  if (carrito.length === 0) return;

  try {
    if (boton) boton.disabled = true;

    const crearResponse = await fetch(API_PEDIDOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pizzas: carrito.map((item) => ({
          pizza_id: item.pizza_id,
          cantidad: item.cantidad,
        })),
      }),
    });

    const crearData = await crearResponse.json();

    if (!crearResponse.ok) {
      throw new Error(crearData.error || "No se pudo crear el pedido");
    }

    const pedidoId = crearData.pedido.id;

    const pagoResponse = await fetch(
      `${API_PEDIDOS}/${pedidoId}/confirmar-pago`,
      {
        method: "POST",
      }
    );

    const pagoData = await pagoResponse.json();

    if (!pagoResponse.ok) {
      throw new Error(pagoData.error || "No se pudo confirmar el pago");
    }

    carrito.splice(0, carrito.length);
    renderCarrito();

    const vacio = document.querySelector("#carrito-vacio");
    if (vacio) vacio.hidden = true;

    if (resultado) {
      resultado.innerHTML = `
        <div class="pedido-exito">
          <h3>Pedido confirmado</h3>
          <p>Pedido #${pagoData.pedido.id}</p>
          <p>Total: ${formatearPrecio(pagoData.pedido.total)}</p>
          <p>
            Código de confirmación:
            <strong>${pagoData.pedido.codigo_confirmacion}</strong>
          </p>
          <p class="pedido-ayuda">
            Guarda este código para retirar tu pedido.
          </p>
        </div>
      `;
    }

    await cargarPizzasCliente();
  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    if (boton) boton.disabled = false;
  }
}

export function inicializarCarrito() {
  document
    .querySelector("#btn-abrir-carrito")
    ?.addEventListener("click", abrirCarrito);

  document
    .querySelector("#btn-cerrar-carrito")
    ?.addEventListener("click", cerrarCarrito);

  document
    .querySelector("#carrito-fondo")
    ?.addEventListener("click", cerrarCarrito);

  document
    .querySelector("#btn-confirmar-pedido")
    ?.addEventListener("click", crearYConfirmarPedido);

  document
    .querySelector("#carrito-lista")
    ?.addEventListener("click", (event) => {
      const boton = event.target.closest("button[data-action]");

      if (!boton) return;

      const id = Number(boton.dataset.id);
      const action = boton.dataset.action;

      if (action === "mas") cambiarCantidad(id, 1);
      if (action === "menos") cambiarCantidad(id, -1);
      if (action === "quitar") quitarDelCarrito(id);
    });

  document
    .querySelector("#pizzas-cliente")
    ?.addEventListener("click", (event) => {
      const boton = event.target.closest("button[data-add]");

      if (!boton) return;

      agregarAlCarrito(Number(boton.dataset.add));
    });

  renderCarrito();
}

export async function cargarPizzasCliente() {
  const contenedor = document.querySelector("#pizzas-cliente");

  try {
    const response = await fetch(API_PIZZAS);

    if (!response.ok) {
      throw new Error("No se pudieron cargar las pizzas");
    }

    pizzasCatalogo = await response.json();

    if (pizzasCatalogo.length === 0) {
      contenedor.innerHTML = `
        <p>No hay pizzas disponibles.</p>
      `;
      return;
    }

    contenedor.innerHTML = pizzasCatalogo
      .map(
        (pizza) => `
          <article class="pizza-card">

            <div class="pizza-image">
              ${imagenPizza(pizza)}
            </div>

            <div class="pizza-info">
              <h3>${pizza.nombre}</h3>

              <p>${pizza.descripcion}</p>

              <strong>
                ${formatearPrecio(pizza.precio)}
              </strong>

              <span class="${
                pizza.disponible ? "disponible" : "agotada"
              }">
                ${pizza.disponible ? "Disponible" : "Agotada"}
              </span>

              ${
                pizza.disponible
                  ? `
                    <button type="button" data-add="${pizza.id}">
                      Agregar al pedido
                    </button>
                  `
                  : ""
              }

            </div>

          </article>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);

    contenedor.innerHTML = `
      <p>
        No pudimos cargar las pizzas.
        Verifica que el backend esté funcionando.
      </p>
    `;
  }
}
