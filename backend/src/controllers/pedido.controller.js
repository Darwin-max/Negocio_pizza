const pedidoService = require("../services/pedido.service");

const crearPedido = async (req, res) => {
  try {
    const pedido = await pedidoService.crearPedido(req.body);

    res.status(201).json({
      mensaje: "Pedido creado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

const confirmarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidoService.confirmarPago(id);

    res.status(200).json({
      mensaje: "Pago confirmado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("Error al confirmar pago:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

const finalizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo } = req.body;
    const pedido = await pedidoService.finalizarPedido(id, codigo);

    res.status(200).json({
      mensaje: "Pedido finalizado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("Error al finalizar pedido:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

const listarPedidos = async (req, res) => {
  try {
    const pedidos = await pedidoService.listarPedidos();

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al listar pedidos:", error);

    res.status(500).json({
      error: "No se pudieron obtener los pedidos",
    });
  }
};

const obtenerPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidoService.obtenerPedidoPorId(id);

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);

    res.status(404).json({
      error: error.message,
    });
  }
};

const cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidoService.cancelarPedido(id);

    res.status(200).json({
      mensaje: "Pedido cancelado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  crearPedido,
  confirmarPago,
  finalizarPedido,
  listarPedidos,
  obtenerPedido,
  cancelarPedido,
};
