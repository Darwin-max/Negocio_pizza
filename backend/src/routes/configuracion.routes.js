const express = require("express");
const configuracionController = require("../controllers/configuracion.controller");
const authAdmin = require("../middleware/authAdmin");
const { subirArchivo } = require("../config/upload");

const router = express.Router();

router.get("/negocio", configuracionController.obtenerNegocio);
router.post(
  "/negocio/logo",
  authAdmin,
  subirArchivo,
  configuracionController.subirLogo
);
router.delete(
  "/negocio/logo",
  authAdmin,
  configuracionController.quitarLogo
);

module.exports = router;
