const reporteService = require("../services/reporte.service");

const obtenerDashboard = async (req, res) => {
  try {
    const data = await reporteService.obtenerDashboard();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ error: "No se pudo obtener el dashboard" });
  }
};

const obtenerReporteMensual = async (req, res) => {
  try {
    const data = await reporteService.obtenerReporteMensual(req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en reporte mensual:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  obtenerDashboard,
  obtenerReporteMensual,
};
