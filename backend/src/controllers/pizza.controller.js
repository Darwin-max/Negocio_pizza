const pizzaService = require("../services/pizza.service");

// Obtener pizzas para el administrador
const obtenerPizzas = async (req, res) => {
  try {
    const pizzas = await pizzaService.obtenerPizzas();

    res.status(200).json(pizzas);
  } catch (error) {
    console.error("Error al obtener las pizzas:", error);

    res.status(500).json({
      error: "No se pudieron obtener las pizzas",
    });
  }
};

// Obtener pizzas para el cliente
const obtenerPizzasCliente = async (req, res) => {
  try {
    const pizzas = await pizzaService.obtenerPizzasCliente();

    res.status(200).json(pizzas);
  } catch (error) {
    console.error("Error al obtener las pizzas para el cliente:", error);

    res.status(500).json({
      error: "No se pudieron obtener las pizzas",
    });
  }
};

// Crear una pizza
const crearPizza = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
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
    });

    res.status(201).json(pizza);
  } catch (error) {
    console.error("Error al crear la pizza:", error);

    res.status(500).json({
      error: "No se pudo crear la pizza",
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
      activo,
    } = req.body;

    const pizza = await pizzaService.actualizarPizza(id, {
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url,
      activo,
    });

    res.status(200).json({
      mensaje: "Pizza actualizada correctamente",
      pizza,
    });
  } catch (error) {
    console.error("Error al actualizar pizza:", error);

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
    console.error("Error al desactivar la pizza:", error);

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
    console.error("Error al activar la pizza:", error);

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