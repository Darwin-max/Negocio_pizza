const imagenModel = require("../models/imagen.model");
const { urlImagen } = require("../utils/imagen");

const ID_INVALIDO = "ID de imagen inválido";

const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Selecciona una imagen para subir",
      });
    }

    const imagen = await imagenModel.crearImagen({
      datos: req.file.buffer,
      mimeType: req.file.mimetype,
      tamano: req.file.size,
    });

    return res.status(201).json({
      id: imagen.id,
      url: urlImagen(imagen.id),
      mime_type: imagen.mime_type,
      tamano: imagen.tamano,
    });
  } catch (error) {
    console.error("Error al subir la imagen:", error);

    return res.status(500).json({
      error: "No se pudo subir la imagen",
    });
  }
};

const obtenerImagen = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: ID_INVALIDO });
    }

    const imagen = await imagenModel.obtenerImagen(id);

    if (!imagen) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    res.set({
      "Content-Type": imagen.mime_type,
      "Content-Length": String(imagen.tamano),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });

    return res.send(imagen.datos);
  } catch (error) {
    console.error("Error al obtener la imagen:", error);

    return res.status(500).json({
      error: "No se pudo obtener la imagen",
    });
  }
};

const eliminarImagen = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: ID_INVALIDO });
    }

    const eliminada = await imagenModel.eliminarImagen(id);

    if (!eliminada) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);

    return res.status(500).json({
      error: "No se pudo eliminar la imagen",
    });
  }
};

module.exports = {
  subirImagen,
  obtenerImagen,
  eliminarImagen,
};
