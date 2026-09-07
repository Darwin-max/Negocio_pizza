const pool = require("../config/database");

const obtenerTodas = async () => {
  const result = await pool.query(`
    SELECT
      id,
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      created_at,
      updated_at
    FROM pizzas
    ORDER BY id ASC
  `);

  return result.rows;
};

const obtenerDisponiblesCliente = async () => {
  const result = await pool.query(`
    SELECT
      id,
      nombre,
      descripcion,
      precio,
      imagen_url,
      CASE
        WHEN stock > 0 AND activo = true THEN true
        ELSE false
      END AS disponible
    FROM pizzas
    ORDER BY id ASC
  `);

  return result.rows;
};

const crearPizza = async ({
  nombre,
  descripcion,
  precio,
  stock,
  imagen_url,
}) => {
  const result = await pool.query(
    `
    INSERT INTO pizzas (
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      created_at,
      updated_at
    `,
    [nombre, descripcion, precio, stock, imagen_url]
  );

  return result.rows[0];
};

const actualizarPizza = async (
  id,
  {
    nombre,
    descripcion,
    precio,
    stock,
    imagen_url,
    activo,
  }
) => {
  const result = await pool.query(
    `
    UPDATE pizzas
    SET
      nombre = $1,
      descripcion = $2,
      precio = $3,
      stock = $4,
      imagen_url = $5,
      activo = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING
      id,
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      created_at,
      updated_at
    `,
    [
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      id,
    ]
  );

  if (result.rows.length === 0) {
    throw new Error("La pizza no existe");
  }

  return result.rows[0];
};

const desactivarPizza = async (id) => {
  const result = await pool.query(
    `
    UPDATE pizzas
    SET
      activo = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      created_at,
      updated_at
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("La pizza no existe");
  }

  return result.rows[0];
};

const activarPizza = async (id) => {
  const result = await pool.query(
    `
    UPDATE pizzas
    SET
      activo = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
      created_at,
      updated_at
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("La pizza no existe");
  }

  return result.rows[0];
};

module.exports = {
  obtenerTodas,
  obtenerDisponiblesCliente,
  crearPizza,
  actualizarPizza,
  desactivarPizza,
  activarPizza,
};