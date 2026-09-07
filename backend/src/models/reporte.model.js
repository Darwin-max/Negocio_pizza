const pool = require("../config/database");

const obtenerDashboard = async () => {
  const ventasHoy = await pool.query(
    `
    SELECT COALESCE(SUM(total), 0) AS total
    FROM pedidos
    WHERE pago_confirmado = TRUE
      AND estado <> 'CANCELADO'
      AND created_at::date = CURRENT_DATE
    `
  );

  const pedidosHoy = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM pedidos
    WHERE created_at::date = CURRENT_DATE
    `
  );

  const stockBajo = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM pizzas
    WHERE activo = TRUE
      AND stock > 0
      AND stock <= 5
    `
  );

  const agotadas = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM pizzas
    WHERE activo = TRUE
      AND stock = 0
    `
  );

  const pendientes = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM pedidos
    WHERE estado = 'PENDIENTE_PAGO'
    `
  );

  return {
    ventas_hoy: Number(ventasHoy.rows[0].total),
    pedidos_hoy: pedidosHoy.rows[0].total,
    stock_bajo: stockBajo.rows[0].total,
    pizzas_agotadas: agotadas.rows[0].total,
    pedidos_pendientes: pendientes.rows[0].total,
  };
};

const obtenerReporteMensual = async (anio, mes) => {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(p.total), 0) AS total_vendido,
      COUNT(*)::int AS total_pedidos,
      COALESCE(AVG(p.total), 0) AS promedio_pedido
    FROM pedidos p
    WHERE p.pago_confirmado = TRUE
      AND p.estado <> 'CANCELADO'
      AND EXTRACT(YEAR FROM p.created_at) = $1
      AND EXTRACT(MONTH FROM p.created_at) = $2
    `,
    [anio, mes]
  );

  const pizzaMasVendida = await pool.query(
    `
    SELECT
      pz.nombre,
      SUM(dp.cantidad)::int AS cantidad_vendida
    FROM detalle_pedidos dp
    INNER JOIN pedidos p ON p.id = dp.pedido_id
    INNER JOIN pizzas pz ON pz.id = dp.pizza_id
    WHERE p.pago_confirmado = TRUE
      AND p.estado <> 'CANCELADO'
      AND EXTRACT(YEAR FROM p.created_at) = $1
      AND EXTRACT(MONTH FROM p.created_at) = $2
    GROUP BY pz.nombre
    ORDER BY cantidad_vendida DESC
    LIMIT 1
    `,
    [anio, mes]
  );

  const diaMasVentas = await pool.query(
    `
    SELECT
      created_at::date AS dia,
      SUM(total) AS total
    FROM pedidos
    WHERE pago_confirmado = TRUE
      AND estado <> 'CANCELADO'
      AND EXTRACT(YEAR FROM created_at) = $1
      AND EXTRACT(MONTH FROM created_at) = $2
    GROUP BY created_at::date
    ORDER BY total DESC
    LIMIT 1
    `,
    [anio, mes]
  );

  const ventasPorDia = await pool.query(
    `
    SELECT
      created_at::date AS dia,
      COUNT(*)::int AS pedidos,
      COALESCE(SUM(total), 0) AS total
    FROM pedidos
    WHERE pago_confirmado = TRUE
      AND estado <> 'CANCELADO'
      AND EXTRACT(YEAR FROM created_at) = $1
      AND EXTRACT(MONTH FROM created_at) = $2
    GROUP BY created_at::date
    ORDER BY dia ASC
    `,
    [anio, mes]
  );

  return {
    anio,
    mes,
    total_vendido: Number(result.rows[0].total_vendido),
    total_pedidos: result.rows[0].total_pedidos,
    promedio_pedido: Number(result.rows[0].promedio_pedido),
    pizza_mas_vendida: pizzaMasVendida.rows[0] || null,
    dia_mas_ventas: diaMasVentas.rows[0]
      ? {
          dia: diaMasVentas.rows[0].dia,
          total: Number(diaMasVentas.rows[0].total),
        }
      : null,
    ventas_por_dia: ventasPorDia.rows.map((row) => ({
      dia: row.dia,
      pedidos: row.pedidos,
      total: Number(row.total),
    })),
  };
};

module.exports = {
  obtenerDashboard,
  obtenerReporteMensual,
};
