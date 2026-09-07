const authService = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      mensaje: "Inicio de sesión correcto",
      ...result,
    });
  } catch (error) {
    console.error("Error en login:", error);

    res.status(401).json({
      error: error.message,
    });
  }
};

module.exports = {
  login,
};
