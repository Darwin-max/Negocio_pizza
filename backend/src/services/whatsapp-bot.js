const normalizar = (texto) =>
  String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatearPrecio = (precio) =>
  `$${Number(precio).toLocaleString("es-CO")}`;

const pizzaDisponible = (pizza) => pizza.activo === true && Number(pizza.stock) > 0;

const listarPizzas = (pizzas) =>
  pizzas
    .filter(pizzaDisponible)
    .map((pizza) => `• ${pizza.nombre} — ${formatearPrecio(pizza.precio)}`)
    .join("\n");

const sugerirDisponibles = (pizzas, omitidaId) => {
  const disponibles = pizzas
    .filter((pizza) => pizzaDisponible(pizza) && pizza.id !== omitidaId)
    .slice(0, 3);

  if (disponibles.length === 0) {
    return "Por ahora no tengo otras pizzas disponibles. Escríbenos más tarde para consultar de nuevo.";
  }

  return `Estas sí están disponibles:\n${listarPizzas(disponibles)}`;
};

const encontrarPizza = (mensaje, pizzas) => {
  const texto = normalizar(mensaje);

  let mejorCoincidencia = null;
  let mejorPuntaje = 0;

  for (const pizza of pizzas) {
    const nombre = normalizar(pizza.nombre);
    if (texto.includes(nombre)) return pizza;

    const palabras = nombre
      .split(" ")
      .filter((palabra) => palabra.length > 2 && palabra !== "pizza");
    const puntaje = palabras.filter((palabra) => texto.includes(palabra)).length;

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorCoincidencia = pizza;
    }
  }

  return mejorCoincidencia;
};

const responderDisponibilidad = (mensaje, pizzas) => {
  const pizza = encontrarPizza(mensaje, pizzas);

  if (!pizza) return null;

  if (!pizzaDisponible(pizza)) {
    return `En este momento ${pizza.nombre} no está disponible 😕.\n${sugerirDisponibles(
      pizzas,
      pizza.id
    )}`;
  }

  return `¡Sí tenemos ${pizza.nombre}! 🍕\nPrecio: ${formatearPrecio(
    pizza.precio
  )}.\n${pizza.descripcion}\n\n¿Quieres consultar otra pizza o ver el menú?`;
};

const responderMenu = (pizzas) => {
  const lista = listarPizzas(pizzas);

  if (!lista) {
    return "Por ahora no hay pizzas disponibles. Escríbenos más tarde y con gusto revisamos.";
  }

  return `¡Hola! 👋 Este es nuestro menú disponible:\n${lista}\n\nDime cuál te interesa y te cuento más.`;
};

const respuestaAutomatica = (mensaje, pizzas) => {
  const texto = normalizar(mensaje);
  const respuestaPizza = responderDisponibilidad(mensaje, pizzas);
  if (respuestaPizza) return respuestaPizza;

  if (/\b(menu|menus|opciones|disponibles|que tienen|que hay)\b/.test(texto)) {
    return responderMenu(pizzas);
  }

  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|holi)\b/.test(texto)) {
    const lista = listarPizzas(pizzas);
    const menu = lista
      ? `Nuestro menú disponible:\n${lista}\n\nDime cuál te interesa y te cuento más.`
      : "Por ahora no hay pizzas disponibles. Escríbenos más tarde y con gusto revisamos.";
    return `¡Hola! 👋 Soy el asistente de El Callejón. Puedo ayudarte con el menú y la disponibilidad.\n\n${menu}`;
  }

  return null;
};

const prepararMenuParaIA = (pizzas) =>
  pizzas.map((pizza) => ({
    nombre: pizza.nombre,
    descripcion: pizza.descripcion,
    precio: formatearPrecio(pizza.precio),
    disponible: pizzaDisponible(pizza),
  }));

module.exports = {
  respuestaAutomatica,
  prepararMenuParaIA,
  normalizar,
};
