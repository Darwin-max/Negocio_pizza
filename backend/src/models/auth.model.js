const pool = require("../config/database");

const buscarPorUsuario = async (usuario) => {
  const result = await pool.query(
    `
    SELECT id, usuario, password_hash, activo
    FROM administradores
    WHERE usuario = $1
    `,
    [usuario]
  );

  return result.rows[0] || null;
};

module.exports = {
  buscarPorUsuario,
};
