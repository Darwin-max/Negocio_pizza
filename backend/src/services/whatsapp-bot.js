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

const mensajeRedes =
  "📲 *Síguenos y contáctanos*\n📸 Instagram: https://www.instagram.com/elcallejon_n4496/\n📘 Facebook: https://www.facebook.com/profile.php?id=61595493282153";
const enlaceMenu =
  process.env.WHATSAPP_MENU_URL || "https://darwin-max.github.io/Negocio_pizza/";
const numeroNequi = "312 406 0135";

const pizzaDisponible = (pizza) =>
  pizza.activo === true && Number(pizza.stock) > 0;

const iconoProducto = (producto) => {
  const categoria = normalizar(producto.categoria || "");
  if (categoria.includes("bebida") || categoria.includes("granizado")) return "🥤";
  if (categoria.includes("hamburguesa")) return "🍔";
  if (categoria.includes("acompanamiento")) return "🍟";
  if (categoria.includes("postre")) return "🍰";
  if (categoria.includes("combo")) return "🥡";
  return "🍕";
};

const crearMenuNumerado = (pizzas, omitidaId) => {
  const categorias = new Map();
  const disponibles = pizzas.filter(pizzaDisponible);
  disponibles.forEach((producto, indice) => {
    const categoria = producto.categoria || "Pizzas";
    const productos = categorias.get(categoria) || [];
    productos.push({ ...producto, numeroMenu: indice + 1 });
    categorias.set(categoria, productos);
  });

  const texto = [...categorias]
    .filter(([, productos]) =>
      productos.some((producto) => producto.id !== omitidaId)
    )
    .map(([categoria, productos]) => {
      const encabezado = `*${iconoProducto(productos[0])} ${categoria}*`;
      const opciones = productos
        .filter((producto) => producto.id !== omitidaId)
        .map(
          ({ numeroMenu, nombre, precio }) =>
            `${numeroMenu}. ${nombre} — *${formatearPrecio(precio)}*`
        )
        .join("\n");
      return `${encabezado}\n${opciones}`;
    })
    .join("\n\n");

  const tieneOpciones = disponibles.some(
    (producto) => producto.id !== omitidaId
  );
  return { texto: tieneOpciones ? texto : "", productos: disponibles };
};

const listarPizzas = (pizzas, omitidaId) =>
  crearMenuNumerado(pizzas, omitidaId).texto;

const sugerirDisponibles = (pizzas, omitidaId) => {
  const disponibles = pizzas
    .filter((pizza) => pizzaDisponible(pizza) && pizza.id !== omitidaId);

  if (disponibles.length === 0) {
    return "Por ahora no tengo otros productos disponibles. Escríbenos más tarde para consultar de nuevo.";
  }

  return `✅ *Otras opciones disponibles*\n${listarPizzas(pizzas, omitidaId)}\n\nPuedes responder con el número del menú o escribir el nombre del producto.`;
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
    return `😕 *${pizza.nombre} no está disponible por ahora.*\n\n${sugerirDisponibles(
      pizzas,
      pizza.id
    )}`;
  }

  return `${iconoProducto(pizza)} *¡Sí tenemos ${pizza.nombre}!*\n\n💰 *Precio:* ${formatearPrecio(
    pizza.precio
  )}\n📝 ${pizza.descripcion}\n\n¿Quieres agregarlo a tu pedido?`;
};

const responderMenu = (pizzas) => {
  const lista = listarPizzas(pizzas);

  if (!lista) {
    return "😕 Por ahora no hay productos disponibles. Escríbenos más tarde y con gusto revisamos.";
  }

  return `📋 *Menú disponible:*\n\n${lista}\n\n🛍️ Para pedir, responde con el número y la cantidad, por ejemplo: *1 x 2, 3 x 1*.\nLos números son únicos en todo el menú, aunque esté agrupado por secciones.\n\n🌐 Ver menú completo: ${enlaceMenu}\n\n${mensajeRedes}`;
};

const responderInformacion = (mensaje) => {
  const texto = normalizar(mensaje);
  const respuestas = [];

  if (/\b(pago|pagos|pagar|aceptan|acepta|nequi|efectivo|transferencias?)\b/.test(texto)) {
    respuestas.push(
      `💳 *Métodos de pago:*\n• Efectivo\n• Transferencia (te confirmamos los datos)\n• Nequi: *${numeroNequi}*`
    );
  }

  if (/\b(domicilio|domicilios|domiciliario|envio|envios|entrega)\b/.test(texto)) {
    respuestas.push(
      "🛵 *Domicilios:* el costo y la cobertura están pendientes de confirmación. Envíanos tu barrio o dirección y te confirmamos el valor."
    );
  }

  if (/\b(salsa|salsas)\b/.test(texto)) {
    respuestas.push(
      "🥫 Podemos anotar tu solicitud de salsa adicional. Su disponibilidad y precio están pendientes de confirmación."
    );
  }

  if (/\b(redes|facebook|instagram|informacion|contacto)\b/.test(texto)) {
    respuestas.push(`📲 *Encuéntranos en nuestras redes:*\n${mensajeRedes}`);
  }

  return respuestas.length ? respuestas.join("\n\n") : null;
};

const cantidadAntesDe = (texto, indice) => {
  const antes = texto.slice(Math.max(0, indice - 24), indice);
  const coincidencia = antes.match(
    /(?:^|\s)(\d+|un|uno|una|dos|tres|cuatro|cinco|seis)\s+(?:(?:x|pizza|hamburguesa|bebida|granizado|producto)s?\s+)?$/
  );
  if (!coincidencia) return 1;

  const cantidades = {
    un: 1,
    uno: 1,
    una: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
  };
  const cantidad = cantidades[coincidencia[1]] || Number(coincidencia[1]);
  return Number.isInteger(cantidad) && cantidad > 0 ? cantidad : 1;
};

const detectarSeleccionNumerica = (mensaje, pizzas) => {
  const partes = String(mensaje)
    .trim()
    .split(/\s*(?:[,;]|\by\b)\s*/i);
  const selecciones = partes.map((parte) =>
    parte.match(/^(\d+)(?:\s*[x×]\s*(\d+))?$/i)
  );

  if (partes.length === 0 || selecciones.some((seleccion) => !seleccion)) {
    return null;
  }

  const { productos } = crearMenuNumerado(pizzas);
  const coincidencias = [];
  for (const seleccion of selecciones) {
    const numero = Number(seleccion[1]);
    const cantidad = Number(seleccion[2] || 1);
    if (
      !Number.isSafeInteger(numero) ||
      numero < 1 ||
      numero > productos.length ||
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1
    ) {
      return { error: true, coincidencias: [] };
    }
    coincidencias.push({ pizza: productos[numero - 1], cantidad });
  }

  return { error: false, coincidencias };
};

const detectarPizzasEnMensaje = (mensaje, pizzas) => {
  const seleccionNumerica = detectarSeleccionNumerica(mensaje, pizzas);
  if (seleccionNumerica) return seleccionNumerica.coincidencias;

  const texto = normalizar(mensaje);
  const encontradas = [];
  const ordenadas = [...pizzas].sort(
    (a, b) => normalizar(b.nombre).length - normalizar(a.nombre).length
  );

  for (const pizza of ordenadas) {
    const nombre = normalizar(pizza.nombre);
    let indice = texto.indexOf(nombre);

    if (indice === -1) {
      const palabras = nombre
        .split(" ")
        .filter((palabra) => palabra.length > 2 && palabra !== "pizza");
      const palabra = palabras.find((item) => texto.includes(item));
      if (!palabra) continue;
      indice = texto.indexOf(palabra);
    }

    if (!encontradas.some((item) => item.pizza.id === pizza.id)) {
      encontradas.push({
        pizza,
        cantidad: cantidadAntesDe(texto, indice),
      });
    }
  }

  return encontradas;
};

const detectarMetodoPago = (mensaje) => {
  const texto = normalizar(mensaje);
  if (/\befectivo\b/.test(texto)) return "Efectivo";
  if (/\bnequi\b/.test(texto)) return "Nequi";
  if (/\btransferencias?\b/.test(texto)) return "Transferencia";
  return null;
};

const mensajeEsConsulta = (mensaje) =>
  /\b(tienen|hay|disponible|disponibilidad|precio|cuanto cuesta|cuanto vale|que es|que trae|que tiene|ingredientes|descripcion|cuentame|hablame)\b/.test(
    normalizar(mensaje)
  );

const mensajeConfirmaPedido = (mensaje) =>
  /\b(confirmar|confirmo|confirmar pedido|si confirmo|asi esta bien)\b/.test(
    normalizar(mensaje)
  );

const mensajeCancelaPedido = (mensaje) =>
  /\b(cancelar pedido|cancela pedido|descartar pedido)\b/.test(normalizar(mensaje));

const crearPedidoVacio = () => ({
  items: [],
  notas: [],
  metodo_pago: null,
  direccion: null,
});

const resumirPedido = (pedido, pizzas) => {
  const items = pedido.items
    .map((item) => {
      const pizza = pizzas.find((opcion) => opcion.id === item.pizza_id);
      if (!pizza) return null;
      const subtotal = Number(pizza.precio) * item.cantidad;
      return {
        nombre: pizza.nombre,
        categoria: pizza.categoria || "Pizzas",
        cantidad: item.cantidad,
        subtotal,
      };
    })
    .filter(Boolean);
  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const detalle = items
    .map(
      (item) =>
        `• ${item.cantidad} × ${iconoProducto(item)} *${item.nombre}* — *${formatearPrecio(
          item.subtotal
        )}*`
    )
    .join("\n");
  const notas = [...pedido.notas];
  if (pedido.direccion) notas.push(`Domicilio solicitado: ${pedido.direccion}`);
  if (pedido.metodo_pago) notas.push(`Método de pago preferido: ${pedido.metodo_pago}`);
  const detalleNotas = notas.length
    ? `\n\n📝 *Solicitudes:*\n${notas.map((nota) => `• ${nota}`).join("\n")}`
    : "";
  const detallePago = pedido.metodo_pago
    ? `💳 *Método de pago:* ${pedido.metodo_pago}${
        pedido.metodo_pago === "Nequi" ? ` (${numeroNequi})` : ""
      }`
    : `💳 *Elige cómo pagar:* efectivo, transferencia o Nequi (${numeroNequi}).`;

  return {
    items,
    subtotal,
    respuesta: `🧾 *RESUMEN DE TU PEDIDO*\n\n${detalle}\n\n💵 *Subtotal:* *${formatearPrecio(
      subtotal
    )}*${detalleNotas}\n\n${detallePago}\n🚚 El domicilio y los extras se confirman aparte; por eso el total final puede cambiar.\n\n✅ Cuando estés listo, escribe *CONFIRMAR PEDIDO* para registrarlo.\n➕ Puedes agregar productos o escribir *CANCELAR PEDIDO*.\n\n${mensajeRedes}`,
  };
};

const procesarConversacion = (mensaje, pizzas, pedidoGuardado) => {
  const pedido = pedidoGuardado || crearPedidoVacio();
  const tienePedido = pedido.items.length > 0;

  if (mensajeCancelaPedido(mensaje) && pedidoGuardado) {
    return {
      accion: "cancelar",
      respuesta: "🗑️ Descarté el borrador del pedido. Cuando quieras, empezamos uno nuevo.",
    };
  }

  if (mensajeCancelaPedido(mensaje)) {
    return {
      accion: "ninguna",
      respuesta: "No tienes un borrador de pedido activo para cancelar.",
    };
  }

  const confirmar = mensajeConfirmaPedido(mensaje);
  const seleccionNumerica = detectarSeleccionNumerica(mensaje, pizzas);
  if (seleccionNumerica?.error) {
    return {
      accion: tienePedido ? "guardar" : "ninguna",
      pedido: tienePedido ? pedido : null,
      respuesta: `No encontré ese número en el menú disponible. Escribe *menú* para ver las opciones numeradas${tienePedido ? " y conservaré tu pedido actual" : ""}.`,
    };
  }
  const coincidencias =
    seleccionNumerica?.coincidencias ||
    detectarPizzasEnMensaje(mensaje, pizzas);
  const consulta = mensajeEsConsulta(mensaje);
  const info = responderInformacion(mensaje);
  const metodoPago = detectarMetodoPago(mensaje);
  const solicitaSalsa = /\b(salsa|salsas)\b/.test(normalizar(mensaje));
  const solicitaDomicilio =
    /\b(domicilio|domicilios|domiciliario|envio|envios|entrega)\b/.test(
      normalizar(mensaje)
    );

  if (metodoPago) pedido.metodo_pago = metodoPago;
  if (solicitaSalsa) {
    const nota = "Salsa adicional solicitada; precio y disponibilidad por confirmar";
    if (!pedido.notas.includes(nota)) pedido.notas.push(nota);
  }
  const direccion = mensaje.match(
    /\b(?:direccion|dirección|barrio|ubicacion|ubicación)\s+(?:es\s+)?(.+)$/i
  ) || mensaje.match(
    /\b((?:calle|carrera|cra|cl|diagonal|transversal)\s+.+)$/i
  );
  if ((solicitaDomicilio || pedidoGuardado) && direccion && !pedido.direccion) {
    pedido.direccion = direccion[0].trim();
    const nota = "Dirección o barrio indicado por el cliente";
    if (!pedido.notas.includes(nota)) pedido.notas.push(nota);
  } else if (solicitaDomicilio) {
    const nota = "Domicilio solicitado; cobertura y costo por confirmar";
    if (!pedido.notas.includes(nota)) pedido.notas.push(nota);
  }

  if (consulta && coincidencias.length > 0) {
    return {
      accion: tienePedido ? "guardar" : "ninguna",
      pedido: tienePedido ? pedido : null,
      respuesta: respuestaAutomatica(mensaje, pizzas),
    };
  }

  if (!consulta) {
    for (const { pizza, cantidad } of coincidencias) {
      if (!pizzaDisponible(pizza)) {
        return {
          accion: tienePedido ? "guardar" : "ninguna",
          pedido: tienePedido ? pedido : null,
          respuesta: `😕 ${pizza.nombre} no está disponible ahora. ${
            tienePedido ? "Conservé tu pedido actual. " : ""
          }${sugerirDisponibles(pizzas, pizza.id)}`,
        };
      }

      const existente = pedido.items.find((item) => item.pizza_id === pizza.id);
      const total = (existente?.cantidad || 0) + cantidad;
      if (total > Number(pizza.stock)) {
        return {
          accion: tienePedido ? "guardar" : "ninguna",
          pedido: tienePedido ? pedido : null,
          respuesta: `Solo hay ${pizza.stock} ${pizza.nombre} disponibles. Dime cuántos deseas agregar.`,
        };
      }
      if (existente) existente.cantidad = total;
      else pedido.items.push({ pizza_id: pizza.id, cantidad });
    }
  }

  if (confirmar) {
    if (pedido.items.length === 0) {
      return {
        accion: "ninguna",
        respuesta: "Aún no tienes productos en el pedido. Escribe qué producto y cuántos quieres. 🍕",
      };
    }
    if (!pedido.metodo_pago) {
      return {
        accion: "guardar",
        pedido,
        respuesta: `🧾 Ya tengo tu pedido listo. Antes de registrarlo, dime cómo vas a pagar:\n\n• *Efectivo*\n• *Transferencia*\n• *Nequi* al ${numeroNequi}\n\nDespués escribe *CONFIRMAR PEDIDO* para registrarlo.`,
      };
    }
    return {
      accion: "confirmar",
      pedido,
      datosPedido: {
        pizzas: pedido.items,
        metodo_pago: pedido.metodo_pago,
        telefono_whatsapp: null,
        notas: pedido.notas.join("; "),
        direccion: pedido.direccion,
      },
    };
  }

  if (info && coincidencias.length === 0) {
    const respuesta = tienePedido
      ? `${info}\n\n${resumirPedido(pedido, pizzas).respuesta}`
      : info;
    return {
      accion: tienePedido ? "guardar" : pedido.notas.length > 0 ? "guardar" : "ninguna",
      pedido: tienePedido || pedido.notas.length > 0 ? pedido : null,
      respuesta,
    };
  }

  if (pedido.items.length > 0) {
    const resumen = resumirPedido(pedido, pizzas);
    return {
      accion: "guardar",
      pedido,
      respuesta: info ? `${info}\n\n${resumen.respuesta}` : resumen.respuesta,
    };
  }

  if (info) return { accion: "ninguna", respuesta: info };

  if (pedidoGuardado && pedido.items.length === 0) {
    return {
      accion: "guardar",
      pedido,
      respuesta:
        respuestaAutomatica(mensaje, pizzas) ||
        "Anoté tus solicitudes. Dime qué productos quieres y cuántos para armar el pedido. 🍕",
    };
  }

  if (coincidencias.length > 0 && consulta) {
    return {
      accion: "ninguna",
      respuesta: respuestaAutomatica(mensaje, pizzas),
    };
  }

  if (/\b(quiero pedir|hacer un pedido|iniciar pedido|mi pedido)\b/.test(normalizar(mensaje))) {
    return {
      accion: "guardar",
      pedido,
      respuesta: `¡Claro! Dime qué productos quieres y cuántos. Puedes preguntar por pagos, domicilio o salsa extra. ${info || ""}`,
    };
  }

  return {
    accion: "ninguna",
    respuesta: respuestaAutomatica(mensaje, pizzas),
  };
};

const respuestaAutomatica = (mensaje, pizzas) => {
  const texto = normalizar(mensaje);
  const respuestaInfo = responderInformacion(mensaje);
  const respuestaPizza = responderDisponibilidad(mensaje, pizzas);
  if (respuestaInfo && respuestaPizza) {
    return `${respuestaPizza}\n\n${respuestaInfo}`;
  }
  if (respuestaInfo) return respuestaInfo;
  if (respuestaPizza) return respuestaPizza;

  if (/\b(menu|menus|opciones|disponibles|que tienen|que hay)\b/.test(texto)) {
    return responderMenu(pizzas);
  }

  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|holi)\b/.test(texto)) {
    return `👋 *¡Hola! Soy el asistente de El Callejón.*\nPuedo ayudarte con el menú, tu pedido, pagos, domicilio y salsa extra.\n\n${responderMenu(pizzas)}`;
  }

  return null;
};

const prepararMenuParaIA = (pizzas) =>
  pizzas.map((pizza) => ({
    nombre: pizza.nombre,
    categoria: pizza.categoria || "Pizzas",
    descripcion: pizza.descripcion,
    precio: formatearPrecio(pizza.precio),
    disponible: pizzaDisponible(pizza),
  }));

module.exports = {
  respuestaAutomatica,
  prepararMenuParaIA,
  normalizar,
  crearPedidoVacio,
  procesarConversacion,
  resumirPedido,
};
