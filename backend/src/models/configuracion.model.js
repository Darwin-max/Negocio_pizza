const pool = require("../config/database");

const obtenerConfiguracion = async (clave) => {
  const result = await pool.query(
    `
    SELECT clave, valor, updated_at
    FROM configuracion
    WHERE clave = $1
    `,
    [clave]
  );

  return result.rows[0] || null;
};

const guardarConfiguracion = async (clave, valor) => {
  const result = await pool.query(
    `
    INSERT INTO configuracion (clave, valor)
    VALUES ($1, $2)
    ON CONFLICT (clave)
    DO UPDATE SET
      valor = EXCLUDED.valor,
      updated_at = CURRENT_TIMESTAMP
    RETURNING clave, valor, updated_at
    `,
    [clave, valor]
  );

  return result.rows[0];
};

const eliminarConfiguracion = async (clave) => {
  const result = await pool.query(
    `
    DELETE FROM configuracion
    WHERE clave = $1
    RETURNING clave
    `,
    [clave]
  );

  return result.rows[0] || null;
};

module.exports = {
  obtenerConfiguracion,
  guardarConfiguracion,
  eliminarConfiguracion,
};
