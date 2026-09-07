const express = require("express");
const pedidoController = require("../controllers/pedido.controller");
const authAdmin = require("../middleware/authAdmin");

const router = express.Router();

router.post("/", pedidoController.crearPedido);
router.post("/:id/confirmar-pago", pedidoController.confirmarPago);

router.get("/", authAdmin, pedidoController.listarPedidos);
router.get("/:id", authAdmin, pedidoController.obtenerPedido);
router.post("/:id/finalizar", authAdmin, pedidoController.finalizarPedido);
router.post("/:id/cancelar", authAdmin, pedidoController.cancelarPedido);

module.exports = router;
