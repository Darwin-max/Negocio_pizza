const express = require("express");
const pizzaController = require("../controllers/pizza.controller");
const authAdmin = require("../middleware/authAdmin");

const router = express.Router();

router.get("/", pizzaController.obtenerPizzasCliente);

router.get("/admin", authAdmin, pizzaController.obtenerPizzas);
router.post("/", authAdmin, pizzaController.crearPizza);
router.put("/:id", authAdmin, pizzaController.actualizarPizza);
router.delete("/:id", authAdmin, pizzaController.desactivarPizza);
router.patch("/:id/activar", authAdmin, pizzaController.activarPizza);

module.exports = router;
