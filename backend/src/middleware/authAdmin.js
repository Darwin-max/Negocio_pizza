const jwt = require("jsonwebtoken");

const authAdmin = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token de autenticación requerido",
      });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.rol !== "admin") {
      return res.status(403).json({
        error: "No autorizado",
      });
    }

    req.admin = {
      id: payload.id,
      usuario: payload.usuario,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
};

module.exports = authAdmin;
