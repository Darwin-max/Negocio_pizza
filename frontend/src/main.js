import "./style.css";

import {
  cargarPizzasCliente,
  inicializarCarrito,
} from "./cliente/cliente.js";

import "./cliente/cliente.css";

document.querySelector("#app").innerHTML = `
  <main class="cliente">

    <header class="cliente-header">
      <div class="cliente-header-text">
        <h1> Pizza Negocio</h1>
        <p>Elige tu pizza favorita</p>
      </div>

      <button
        type="button"
        id="btn-abrir-carrito"
        class="btn-carrito"
      >
        Pedido
        <span id="carrito-count">0</span>
      </button>
    </header>

    <section
      id="pizzas-cliente"
      class="pizzas-cliente"
    >
      <p>Cargando pizzas...</p>
    </section>

    <div id="carrito-fondo" class="carrito-fondo"></div>

    <aside id="carrito-panel" class="carrito-panel">
      <div class="carrito-header">
        <h2>Tu pedido</h2>
        <button
          type="button"
          id="btn-cerrar-carrito"
          class="btn-cerrar"
        >
          Cerrar
        </button>
      </div>

      <p id="carrito-vacio" class="carrito-vacio">
        Aún no has agregado pizzas.
      </p>

      <div id="carrito-lista" class="carrito-lista"></div>

      <div id="carrito-acciones" class="carrito-acciones" hidden>
        <div class="carrito-total">
          <span>Total</span>
          <strong id="carrito-total">$0</strong>
        </div>

        <button
          type="button"
          id="btn-confirmar-pedido"
          class="btn-confirmar"
        >
          Confirmar y pagar
        </button>
      </div>

      <div id="pedido-resultado"></div>
    </aside>

  </main>
`;

inicializarCarrito();
cargarPizzasCliente();
