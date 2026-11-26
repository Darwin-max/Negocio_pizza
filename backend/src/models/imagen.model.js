const pool = require("../config/database");

const crearImagen = async ({ datos, mimeType, tamano }) => {
  const result = await pool.query(
    `
    INSERT INTO imagenes (datos, mime_type, tamano)
    VALUES ($1, $2, $3)
    RETURNING id, mime_type, tamano, created_at
    `,
    [datos, mimeType, tamano]
  );

  return result.rows[0];
};

const obtenerImagen = async (id) => {
  const result = await pool.query(
    `
    SELECT id, datos, mime_type, tamano, created_at
    FROM imagenes
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

const eliminarImagen = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM imagenes
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  crearImagen,
  obtenerImagen,
  eliminarImagen,
};
