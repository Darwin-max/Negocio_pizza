const pedidoModel = require("../models/pedido.model");

const crearPedido = async (datosPedido) => {
  if (!datosPedido.pizzas || datosPedido.pizzas.length === 0) {
    throw new Error("El pedido debe contener al menos una pizza");
  }

  for (const pizza of datosPedido.pizzas) {
    const pizzaId = Number(pizza.pizza_id);
    const cantidad = Number(pizza.cantidad);

    if (!Number.isInteger(pizzaId) || pizzaId <= 0) {
      throw new Error("Cada pizza debe tener un pizza_id válido");
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error("La cantidad debe ser un entero mayor que 0");
    }

    pizza.pizza_id = pizzaId;
    pizza.cantidad = cantidad;
  }

  return await pedidoModel.crearPedido(datosPedido);
};

const confirmarPago = async (pedidoId) => {
  const id = Number(pedidoId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del pedido es obligatorio");
  }

  return await pedidoModel.confirmarPago(id);
};

const finalizarPedido = async (pedidoId, codigo) => {
  const id = Number(pedidoId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del pedido es obligatorio");
  }

  if (!codigo || !String(codigo).trim()) {
    throw new Error("El código de confirmación es obligatorio");
  }

  return await pedidoModel.finalizarPedido(id, String(codigo).trim().toUpperCase());
};

const listarPedidos = async () => {
  return await pedidoModel.listarPedidos();
};

const obtenerPedidoPorId = async (pedidoId) => {
  const id = Number(pedidoId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del pedido es obligatorio");
  }

  return await pedidoModel.obtenerPedidoPorId(id);
};

const cancelarPedido = async (pedidoId) => {
  const id = Number(pedidoId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del pedido es obligatorio");
  }

  return await pedidoModel.cancelarPedido(id);
};

module.exports = {
  crearPedido,
  confirmarPago,
  finalizarPedido,
  listarPedidos,
  obtenerPedidoPorId,
  cancelarPedido,
};
