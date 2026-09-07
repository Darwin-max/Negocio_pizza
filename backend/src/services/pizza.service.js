const pizzaModel = require("../models/pizza.model");

const validarDatosPizza = ({ nombre, descripcion, precio, stock }, parcial = false) => {
  if (!parcial || nombre !== undefined) {
    if (!nombre || !String(nombre).trim()) {
      throw new Error("El nombre es obligatorio");
    }
  }

  if (!parcial || descripcion !== undefined) {
    if (!descripcion || !String(descripcion).trim()) {
      throw new Error("La descripción es obligatoria");
    }
  }

  if (!parcial || precio !== undefined) {
    const precioNum = Number(precio);

    if (Number.isNaN(precioNum) || precioNum < 0) {
      throw new Error("El precio debe ser un número mayor o igual a 0");
    }
  }

  if (!parcial || stock !== undefined) {
    const stockNum = Number(stock);

    if (!Number.isInteger(stockNum) || stockNum < 0) {
      throw new Error("El stock debe ser un entero mayor o igual a 0");
    }
  }
};

const obtenerPizzas = async () => {
  return await pizzaModel.obtenerTodas();
};

const obtenerPizzasCliente = async () => {
  return await pizzaModel.obtenerDisponiblesCliente();
};

const crearPizza = async (datosPizza) => {
  validarDatosPizza(datosPizza);

  return await pizzaModel.crearPizza({
    ...datosPizza,
    nombre: String(datosPizza.nombre).trim(),
    descripcion: String(datosPizza.descripcion).trim(),
    precio: Number(datosPizza.precio),
    stock: Number(datosPizza.stock),
  });
};

const actualizarPizza = async (id, datosPizza) => {
  const pizzaId = Number(id);

  if (!Number.isInteger(pizzaId) || pizzaId <= 0) {
    throw new Error("ID de pizza inválido");
  }

  validarDatosPizza(datosPizza);

  return await pizzaModel.actualizarPizza(pizzaId, {
    ...datosPizza,
    nombre: String(datosPizza.nombre).trim(),
    descripcion: String(datosPizza.descripcion).trim(),
    precio: Number(datosPizza.precio),
    stock: Number(datosPizza.stock),
  });
};

const desactivarPizza = async (id) => {
  return await pizzaModel.desactivarPizza(id);
};

const activarPizza = async (id) => {
  return await pizzaModel.activarPizza(id);
};

module.exports = {
  obtenerPizzas,
  obtenerPizzasCliente,
  crearPizza,
  actualizarPizza,
  desactivarPizza,
  activarPizza,
};
