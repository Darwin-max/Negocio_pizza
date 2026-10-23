const pizzaService = require("../services/pizza.service");

// Obtener productos para el administrador
const obtenerPizzas = async (req, res) => {
  try {
    const pizzas = await pizzaService.obtenerPizzas();

    res.status(200).json(pizzas);
  } catch (error) {
    console.error("Error al obtener los productos:", error);

    res.status(500).json({
      error: "No se pudieron obtener los productos",
    });
  }
};

// Obtener productos para el cliente
const obtenerPizzasCliente = async (req, res) => {
  try {
    const pizzas = await pizzaService.obtenerPizzasCliente();

    res.status(200).json(pizzas);
  } catch (error) {
    console.error("Error al obtener los productos para el cliente:", error);

    res.status(500).json({
      error: "No se pudieron obtener los productos",
    });
  }
};

// Crear un producto
const crearPizza = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      categoria,
    } = req.body;

    if (
      !nombre ||
      !descripcion ||
      precio === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        error: "Nombre, descripción, precio y stock son obligatorios",
      });
    }

    const pizza = await pizzaService.crearPizza({
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      categoria,
    });

    res.status(201).json(pizza);
  } catch (error) {
    console.error("Error al crear el producto:", error);

    res.status(500).json({
      error: "No se pudo crear el producto",
    });
  }
};

const actualizarPizza = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      categoria,
      activo,
    } = req.body;

    const pizza = await pizzaService.actualizarPizza(id, {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      categoria,
      activo,
    });

    res.status(200).json({
      mensaje: "Pizza actualizada correctamente",
      pizza,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

const desactivarPizza = async (req, res) => {
  try {
    const { id } = req.params;

    const pizza = await pizzaService.desactivarPizza(id);

    res.status(200).json({
      mensaje: "Pizza desactivada correctamente",
      pizza,
    });
  } catch (error) {
    console.error("Error al desactivar el producto:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

const activarPizza = async (req, res) => {
  try {
    const { id } = req.params;

    const pizza = await pizzaService.activarPizza(id);

    res.status(200).json({
      mensaje: "Pizza activada correctamente",
      pizza,
    });
  } catch (error) {
    console.error("Error al activar el producto:", error);

    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  obtenerPizzas,
  obtenerPizzasCliente,
  crearPizza,
  actualizarPizza,
  desactivarPizza,
  activarPizza,
};