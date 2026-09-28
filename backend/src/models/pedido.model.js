const pool = require("../config/database");
const crypto = require("crypto");

// Genera un codigo de confirmacion criptograficamente seguro
function generarCodigo() {
  return `PZ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

// Crear un pedido
const crearPedido = async (cliente) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let total = 0;
    // Almacenamos los precios del primer loop para reutilizarlos sin queries extra
    const preciosPorPizzaId = {};

    for (const item of cliente.pizzas) {
      const result = await client.query(
        `SELECT id, nombre, precio, stock, activo FROM pizzas WHERE id = $1 FOR UPDATE`,
        [item.pizza_id]
      );

      if (result.rows.length === 0) {
        throw new Error(`La pizza ${item.pizza_id} no existe`);
      }

      const pizza = result.rows[0];

      if (!pizza.activo) {
        throw new Error(`La pizza "${pizza.nombre}" no esta disponible`);
      }

      if (pizza.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para "${pizza.nombre}". Stock disponible: ${pizza.stock}`
        );
      }

      preciosPorPizzaId[item.pizza_id] = pizza.precio;
      total += Number(pizza.precio) * item.cantidad;
    }

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (estado, total) VALUES ($1, $2) RETURNING *`,
      ["PENDIENTE_PAGO", total]
    );

    const pedido = pedidoResult.rows[0];

    for (const item of cliente.pizzas) {
      const precioUnitario = preciosPorPizzaId[item.pizza_id];
      const subtotal = Number(precioUnitario) * item.cantidad;

      await client.query(
        `INSERT INTO detalle_pedidos (pedido_id, pizza_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, item.pizza_id, item.cantidad, precioUnitario, subtotal]
      );
    }

    await client.query("COMMIT");
    return pedido;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const confirmarPago = async (pedidoId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pedidoResult = await client.query(
      `SELECT * FROM pedidos WHERE id = $1 FOR UPDATE`,
      [pedidoId]
    );

    if (pedidoResult.rows.length === 0) throw new Error("El pedido no existe");
    const pedido = pedidoResult.rows[0];

    if (pedido.pago_confirmado) throw new Error("El pedido ya tiene el pago confirmado");
    if (pedido.estado === "CANCELADO") throw new Error("El pedido esta cancelado");
    if (pedido.estado === "FINALIZADO") throw new Error("El pedido ya fue finalizado");

    const detallesResult = await client.query(
      `SELECT dp.pizza_id, dp.cantidad, p.nombre, p.stock
       FROM detalle_pedidos dp
       INNER JOIN pizzas p ON p.id = dp.pizza_id
       WHERE dp.pedido_id = $1
       FOR UPDATE OF p`,
      [pedidoId]
    );

    if (detallesResult.rows.length === 0) throw new Error("El pedido no tiene pizzas");

    for (const detalle of detallesResult.rows) {
      if (detalle.stock < detalle.cantidad) {
        throw new Error(
          `Stock insuficiente para "${detalle.nombre}". Stock disponible: ${detalle.stock}`
        );
      }
    }

    for (const detalle of detallesResult.rows) {
      await client.query(
        `UPDATE pizzas SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [detalle.cantidad, detalle.pizza_id]
      );
    }

    let codigo = generarCodigo();
    let intentos = 0;
    while (intentos < 10) {
      const existe = await client.query(
        `SELECT id FROM pedidos WHERE codigo_confirmacion = $1`,
        [codigo]
      );
      if (existe.rows.length === 0) break;
      codigo = generarCodigo();
      intentos++;
    }

    const actualizado = await client.query(
      `UPDATE pedidos SET pago_confirmado = TRUE, codigo_confirmacion = $1, estado = 'PAGADO', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [codigo, pedidoId]
    );

    await client.query("COMMIT");
    return actualizado.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const finalizarPedido = async (pedidoId, codigo) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT * FROM pedidos WHERE id = $1 FOR UPDATE`,
      [pedidoId]
    );

    if (result.rows.length === 0) throw new Error("El pedido no existe");
    const pedido = result.rows[0];

    if (pedido.estado === "CANCELADO") throw new Error("El pedido esta cancelado");
    if (pedido.estado === "FINALIZADO") throw new Error("El pedido ya fue finalizado");
    if (!pedido.pago_confirmado) throw new Error("El pedido todavia no ha sido pagado");
    if (pedido.codigo_usado) throw new Error("El codigo ya fue utilizado");
    if (pedido.codigo_confirmacion !== codigo) throw new Error("El codigo de confirmacion es incorrecto");

    const actualizado = await client.query(
      `UPDATE pedidos SET estado = 'FINALIZADO', codigo_usado = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [pedidoId]
    );

    await client.query("COMMIT");
    return actualizado.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listarPedidos = async () => {
  const result = await pool.query(
    `SELECT id, estado, total, pago_confirmado, codigo_confirmacion, codigo_usado, created_at, updated_at FROM pedidos ORDER BY id DESC`
  );
  return result.rows;
};

const obtenerPedidoPorId = async (pedidoId) => {
  const pedidoResult = await pool.query(
    `SELECT * FROM pedidos WHERE id = $1`,
    [pedidoId]
  );

  if (pedidoResult.rows.length === 0) throw new Error("El pedido no existe");

  const detallesResult = await pool.query(
    `SELECT dp.id, dp.pizza_id, p.nombre AS pizza_nombre, dp.cantidad, dp.precio_unitario, dp.subtotal
     FROM detalle_pedidos dp
     INNER JOIN pizzas p ON p.id = dp.pizza_id
     WHERE dp.pedido_id = $1
     ORDER BY dp.id ASC`,
    [pedidoId]
  );

  return { ...pedidoResult.rows[0], detalles: detallesResult.rows };
};

const cancelarPedido = async (pedidoId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pedidoResult = await client.query(
      `SELECT * FROM pedidos WHERE id = $1 FOR UPDATE`,
      [pedidoId]
    );

    if (pedidoResult.rows.length === 0) throw new Error("El pedido no existe");
    const pedido = pedidoResult.rows[0];

    if (pedido.estado === "CANCELADO") throw new Error("El pedido ya esta cancelado");
    if (pedido.estado === "FINALIZADO") throw new Error("No se puede cancelar un pedido finalizado");

    if (pedido.pago_confirmado) {
      const detallesResult = await client.query(
        `SELECT dp.pizza_id, dp.cantidad FROM detalle_pedidos dp WHERE dp.pedido_id = $1`,
        [pedidoId]
      );

      for (const detalle of detallesResult.rows) {
        await client.query(
          `UPDATE pizzas SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [detalle.cantidad, detalle.pizza_id]
        );
      }
    }

    const actualizado = await client.query(
      `UPDATE pedidos SET estado = 'CANCELADO', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [pedidoId]
    );

    await client.query("COMMIT");
    return actualizado.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  crearPedido,
  confirmarPago,
  finalizarPedido,
  listarPedidos,
  obtenerPedidoPorId,
  cancelarPedido,
};
