require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const pizzaRoutes = require("./routes/pizza.routes");
const pedidoRoutes = require("./routes/pedido.routes");
const authRoutes = require("./routes/auth.routes");
const reporteRoutes = require("./routes/reporte.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/pizzas", pizzaRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/reportes", reporteRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API Pizza Negocio funcionando",
    status: "OK",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      database: "PostgreSQL conectado",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error("Error de conexión con PostgreSQL:", error);

    res.status(500).json({
      status: "ERROR",
      database: "No conectado",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
