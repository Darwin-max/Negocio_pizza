const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/auth.model");

const login = async ({ usuario, password }) => {
  if (!usuario || !password) {
    throw new Error("Usuario y contraseña son obligatorios");
  }

  const admin = await authModel.buscarPorUsuario(usuario.trim());

  if (!admin || !admin.activo) {
    throw new Error("Credenciales inválidas");
  }

  const valido = await bcrypt.compare(password, admin.password_hash);

  if (!valido) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      id: admin.id,
      usuario: admin.usuario,
      rol: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );

  return {
    token,
    admin: {
      id: admin.id,
      usuario: admin.usuario,
    },
  };
};

module.exports = {
  login,
};
