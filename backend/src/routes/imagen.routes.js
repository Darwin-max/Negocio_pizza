const express = require("express");
const imagenController = require("../controllers/imagen.controller");
const authAdmin = require("../middleware/authAdmin");
const { subirArchivo } = require("../config/upload");

const router = express.Router();

router.post("/", authAdmin, subirArchivo, imagenController.subirImagen);
router.get("/:id", imagenController.obtenerImagen);
router.delete("/:id", authAdmin, imagenController.eliminarImagen);

module.exports = router;
