const pool = require("../config/database");
const crypto = require("crypto");

// Genera un codigo de confirmacion criptograficamente seguro
function generarCodigo() {
  return `PZ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

// Une productos repetidos para descontar el stock una sola vez por producto.
function agruparItems(items) {
  const agrupados = new Map();

  for (const item of items) {
    const pizzaId = Number(item.pizza_id);
    const cantidad = Number(item.cantidad);
    const existente = agrupados.get(pizzaId);

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      agrupados.set(pizzaId, { ...item, pizza_id: pizzaId, cantidad });
    }
  }

  return [...agrupados.values()];
}

function agruparDetalles(detalles) {
  const agrupados = new Map();

  for (const detalle of detalles) {
    const pizzaId = Number(detalle.pizza_id);
    const existente = agrupados.get(pizzaId);

    if (existente) {
      existente.cantidad += Number(detalle.cantidad);
    } else {
      agrupados.set(pizzaId, {
        pizza_id: pizzaId,
        cantidad: Number(detalle.cantidad),
        nombre: detalle.nombre,
        stock: Number(detalle.stock),
      });
    }
  }

  return [...agrupados.values()];
}

// Crear un pedido
const crearPedido = async (cliente) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let total = 0;
    // Ordena por producto para que dos pedidos simultáneos bloqueen las filas
    // siempre en el mismo orden y no se produzcan interbloqueos.
    const items = agruparItems(cliente.pizzas).sort(
      (a, b) => a.pizza_id - b.pizza_id
    );
    // Almacenamos los precios del primer loop para reutilizarlos sin queries extra
    const preciosPorPizzaId = {};
    const nombresPorPizzaId = {};

    for (const item of items) {
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
      nombresPorPizzaId[item.pizza_id] = pizza.nombre;
      total += Number(pizza.precio) * item.cantidad;
    }

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (
         estado, total, pago_confirmado, stock_descontado,
         telefono_whatsapp, metodo_pago, direccion, notas
       )
       VALUES ($1, $2, FALSE, TRUE, $3, $4, $5, $6)
       RETURNING *`,
      [
        "PENDIENTE_PAGO",
        total,
        cliente.telefono_whatsapp || null,
        cliente.metodo_pago || null,
        cliente.direccion || null,
        cliente.notas || null,
      ]
    );

    const pedido = pedidoResult.rows[0];

    for (const item of items) {
      const precioUnitario = preciosPorPizzaId[item.pizza_id];
      const subtotal = Number(precioUnitario) * item.cantidad;

      await client.query(
        `UPDATE pizzas
         SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [item.cantidad, item.pizza_id]
      );

      await client.query(
        `INSERT INTO detalle_pedidos (pedido_id, pizza_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, item.pizza_id, item.cantidad, precioUnitario, subtotal]
      );
    }

    await client.query("COMMIT");
    return cliente.incluir_detalles
      ? {
          ...pedido,
          detalles: items.map((item) => ({
            pizza_nombre: nombresPorPizzaId[item.pizza_id],
            cantidad: item.cantidad,
            subtotal:
              Number(preciosPorPizzaId[item.pizza_id]) * item.cantidad,
          })),
        }
      : pedido;
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
       ORDER BY dp.pizza_id
       FOR UPDATE OF p`,
      [pedidoId]
    );

    if (detallesResult.rows.length === 0) throw new Error("El pedido no tiene pizzas");

    // Los pedidos nuevos reservan el stock al crearse. Los pedidos antiguos,
    // creados antes de esta regla, lo descuentan aqui por primera vez.
    if (!pedido.stock_descontado) {
      const detalles = agruparDetalles(detallesResult.rows).sort(
        (a, b) => a.pizza_id - b.pizza_id
      );

      for (const detalle of detalles) {
        if (detalle.stock < detalle.cantidad) {
          throw new Error(
            `Stock insuficiente para "${detalle.nombre}". Stock disponible: ${detalle.stock}`
          );
        }
      }

      for (const detalle of detalles) {
        await client.query(
          `UPDATE pizzas SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [detalle.cantidad, detalle.pizza_id]
        );
      }
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
      `UPDATE pedidos
       SET pago_confirmado = TRUE,
           stock_descontado = TRUE,
           codigo_confirmacion = $1,
           estado = 'PAGO_CONFIRMADO',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
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
    `SELECT id, estado, total, pago_confirmado, stock_descontado,
            codigo_confirmacion, codigo_usado, telefono_whatsapp, metodo_pago,
            direccion, notas, created_at, updated_at
     FROM pedidos ORDER BY id DESC`
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

    // Se libera el stock reservado. El segundo caso cubre pedidos pagados
    // antiguos que descontaron stock antes de existir stock_descontado.
    if (pedido.stock_descontado || pedido.pago_confirmado) {
      const detallesResult = await client.query(
        `SELECT dp.pizza_id, dp.cantidad FROM detalle_pedidos dp WHERE dp.pedido_id = $1`,
        [pedidoId]
      );

      const detalles = agruparDetalles(
        detallesResult.rows.map((detalle) => ({
          ...detalle,
          nombre: "",
          stock: 0,
        }))
      ).sort((a, b) => a.pizza_id - b.pizza_id);

      for (const detalle of detalles) {
        await client.query(
          `UPDATE pizzas SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [detalle.cantidad, detalle.pizza_id]
        );
      }
    }

    const actualizado = await client.query(
      `UPDATE pedidos
       SET estado = 'CANCELADO',
           stock_descontado = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
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
