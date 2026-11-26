const configuracionModel = require("../models/configuracion.model");
const imagenModel = require("../models/imagen.model");
const { urlImagen, idImagenDesdeUrl } = require("../utils/imagen");

const CLAVE_LOGO = "logo_imagen_url";

async function eliminarImagenLocal(url) {
  const id = idImagenDesdeUrl(url);

  if (!id) return;

  try {
    await imagenModel.eliminarImagen(id);
  } catch (error) {
    console.error("No se pudo eliminar la imagen anterior:", error);
  }
}

const obtenerNegocio = async (req, res) => {
  try {
    const logo = await configuracionModel.obtenerConfiguracion(CLAVE_LOGO);

    return res.status(200).json({
      logo_url: logo?.valor || null,
    });
  } catch (error) {
    console.error("Error al obtener la configuración del negocio:", error);

    return res.status(500).json({
      error: "No se pudo obtener la configuración del negocio",
    });
  }
};

const subirLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Selecciona una imagen para el logo",
      });
    }

    const anterior = await configuracionModel.obtenerConfiguracion(CLAVE_LOGO);
    const imagen = await imagenModel.crearImagen({
      datos: req.file.buffer,
      mimeType: req.file.mimetype,
      tamano: req.file.size,
    });
    const logoUrl = urlImagen(imagen.id);

    try {
      await configuracionModel.guardarConfiguracion(CLAVE_LOGO, logoUrl);
    } catch (error) {
      await imagenModel.eliminarImagen(imagen.id).catch(() => {});
      throw error;
    }

    await eliminarImagenLocal(anterior?.valor);

    return res.status(201).json({
      logo_url: logoUrl,
    });
  } catch (error) {
    console.error("Error al subir el logo del negocio:", error);

    return res.status(500).json({
      error: "No se pudo subir el logo del negocio",
    });
  }
};

const quitarLogo = async (req, res) => {
  try {
    const anterior = await configuracionModel.obtenerConfiguracion(CLAVE_LOGO);

    await configuracionModel.eliminarConfiguracion(CLAVE_LOGO);
    await eliminarImagenLocal(anterior?.valor);

    return res.status(200).json({
      logo_url: null,
    });
  } catch (error) {
    console.error("Error al quitar el logo del negocio:", error);

    return res.status(500).json({
      error: "No se pudo quitar el logo del negocio",
    });
  }
};

module.exports = {
  obtenerNegocio,
  subirLogo,
  quitarLogo,
};
