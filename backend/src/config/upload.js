const multer = require("multer");

const MAX_BYTES = 5 * 1024 * 1024;

const TIPOS_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_BYTES,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return callback(
        new Error("Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF.")
      );
    }

    callback(null, true);
  },
});

function subirArchivo(req, res, next) {
  upload.single("imagen")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "La imagen no puede superar los 5 MB",
        });
      }

      return res.status(400).json({
        error: "No se pudo procesar la imagen",
      });
    }

    return res.status(400).json({
      error: error.message || "Archivo no válido",
    });
  });
}

module.exports = {
  subirArchivo,
  MAX_BYTES,
};
