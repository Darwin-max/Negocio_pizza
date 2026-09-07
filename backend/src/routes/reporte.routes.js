const express = require("express");
const reporteController = require("../controllers/reporte.controller");
const authAdmin = require("../middleware/authAdmin");

const router = express.Router();

router.get("/dashboard", authAdmin, reporteController.obtenerDashboard);
router.get("/mensual", authAdmin, reporteController.obtenerReporteMensual);

module.exports = router;
