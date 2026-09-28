const pool = require("./database");

/**
 * Crea todas las tablas si no existen y siembra el admin por defecto.
 * Se ejecuta al arrancar el servidor — seguro de correr múltiples veces (IF NOT EXISTS).
 */
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pizzas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT NOT NULL,
        precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        imagen_url TEXT,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_PAGO',
        total NUMERIC(12, 2) NOT NULL DEFAULT 0,
        pago_confirmado BOOLEAN NOT NULL DEFAULT FALSE,
        codigo_confirmacion VARCHAR(20) UNIQUE,
        codigo_usado BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS detalle_pedidos (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL,
        pizza_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario NUMERIC(12, 2) NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        CONSTRAINT fk_detalle_pizza FOREIGN KEY (pizza_id) REFERENCES pizzas(id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        usuario VARCHAR(80) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Admin por defecto: usuario=admin, password=admin123
    await client.query(`
      INSERT INTO administradores (usuario, password_hash)
      VALUES ('admin', '$2b$10$WJ6rc8cjr4ht199ZB/HWKew9DJJBn4dm/nbmYsA3DrLR3govZIURe')
      ON CONFLICT (usuario) DO NOTHING;
    `);

    // Pizzas de ejemplo si la tabla está vacía
    await client.query(`
      INSERT INTO pizzas (nombre, descripcion, precio, stock, imagen_url)
      SELECT * FROM (VALUES
        ('Margarita',    'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.', 28000, 50, 'https://cdn.phototourl.com/free/2026-09-07-b35015f9-5802-479a-b957-88c23d3bc54c.jpg'),
        ('Pepperoni',    'Mozzarella, salsa de tomate y pepperoni crujiente.',               32000, 50, 'https://cdn.phototourl.com/free/2026-09-07-ff80d755-69e0-41a5-a05d-957b953a4062.jpg'),
        ('Hawaiana',     'Jamón, piña, mozzarella y salsa de tomate.',                      31000, 50, 'https://cdn.phototourl.com/free/2026-09-07-54037523-01a1-4be0-9fdc-d88c19de9634.jpg'),
        ('Cuatro quesos','Mozzarella, parmesano, gorgonzola y queso crema.',                34000, 50, 'https://cdn.phototourl.com/free/2026-09-07-ed05b62a-9488-42e5-9e1e-bde937888be4.jpg'),
        ('BBQ Pollo',    'Pollo, salsa BBQ, cebolla morada y mozzarella.',                  36000, 50, 'https://cdn.phototourl.com/free/2026-09-07-ab0433f0-a92a-4bd1-8a95-be575dfdb712.jpg')
      ) AS v(nombre, descripcion, precio, stock, imagen_url)
      WHERE NOT EXISTS (SELECT 1 FROM pizzas LIMIT 1);
    `);

    console.log("Base de datos inicializada correctamente");
  } catch (err) {
    console.error("Error al inicializar la base de datos:", err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = initDb;
