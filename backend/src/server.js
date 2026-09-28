require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const initDb = require("./config/init-db");
const pizzaRoutes = require("./routes/pizza.routes");
const pedidoRoutes = require("./routes/pedido.routes");
const authRoutes = require("./routes/auth.routes");
const reporteRoutes = require("./routes/reporte.routes");

const app = express();

// Origenes siempre permitidos (GitHub Pages del proyecto)
const ORIGINS_FIJOS = ["https://darwin-max.github.io"];

// Origenes adicionales desde variable de entorno (separados por coma)
const origenesEnv = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const allowedOrigins = [...new Set([...ORIGINS_FIJOS, ...origenesEnv])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origen (curl, Postman, mismo servidor)
      if (!origin) return callback(null, true);
      // En desarrollo acepta cualquier origen
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origen no permitido: ${origin}`));
    },
    credentials: true,
  })
);

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
    console.error("Error de conexion con PostgreSQL:", error);

    res.status(500).json({
      status: "ERROR",
      database: "No conectado",
    });
  }
});

const PORT = process.env.PORT || 3000;

// Inicializa tablas y arranca el servidor
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo inicializar la base de datos:", err);
    process.exit(1);
  });

