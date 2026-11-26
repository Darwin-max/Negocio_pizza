function urlImagen(id) {
  return `/api/imagenes/${id}`;
}

function idImagenDesdeUrl(url) {
  const coincidencia = String(url || "").match(/^\/api\/imagenes\/(\d+)$/);
  return coincidencia ? Number(coincidencia[1]) : null;
}

module.exports = {
  urlImagen,
  idImagenDesdeUrl,
};
