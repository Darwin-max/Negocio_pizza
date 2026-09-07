const reporteModel = require("../models/reporte.model");

const obtenerDashboard = async () => {
  return await reporteModel.obtenerDashboard();
};

const obtenerReporteMensual = async (query) => {
  const ahora = new Date();
  const anio = Number(query.anio) || ahora.getFullYear();
  const mes = Number(query.mes) || ahora.getMonth() + 1;

  if (!Number.isInteger(anio) || anio < 2000) {
    throw new Error("Año inválido");
  }

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error("Mes inválido");
  }

  return await reporteModel.obtenerReporteMensual(anio, mes);
};

module.exports = {
  obtenerDashboard,
  obtenerReporteMensual,
};
