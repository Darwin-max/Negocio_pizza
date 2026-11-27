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
const maximoSugerencias = 3;

const pizzaDisponible = (pizza) =>
  pizza.activo === true && Number(pizza.stock) > 0;

const categoriaProducto = (producto) =>
  String(producto.categoria || "Pizzas").trim() || "Pizzas";

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
    const categoria = categoriaProducto(producto);
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

const crearListaCompacta = (productos) =>
  productos
    .map(
      (producto) =>
        `• ${iconoProducto(producto)} *${producto.nombre}* — ${formatearPrecio(
          producto.precio
        )}`
    )
    .join("\n");

const seleccionarSugerencias = (pizzas, limite = maximoSugerencias, omitidaId) => {
  const disponibles = pizzas.filter(
    (pizza) => pizzaDisponible(pizza) && pizza.id !== omitidaId
  );
  const seleccionadas = [];
  const categorias = new Set();

  for (const producto of disponibles) {
    const categoria = categoriaProducto(producto);
    if (categorias.has(categoria)) continue;
    categorias.add(categoria);
    seleccionadas.push(producto);
    if (seleccionadas.length >= limite) return seleccionadas;
  }

  for (const producto of disponibles) {
    if (seleccionadas.includes(producto)) continue;
    seleccionadas.push(producto);
    if (seleccionadas.length >= limite) break;
  }

  return seleccionadas;
};

const sugerirDisponibles = (pizzas, omitidaId) => {
  const disponibles = seleccionarSugerencias(pizzas, maximoSugerencias, omitidaId);

  if (disponibles.length === 0) {
    return "Por ahora no tengo otros productos disponibles. Escríbenos más tarde para consultar de nuevo.";
  }

  return `✅ *Otras opciones disponibles*\n${crearListaCompacta(
    disponibles
  )}\n\nPuedes responder con el número del menú o escribir el nombre del producto.`;
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
    return `😔 *${pizza.nombre} no está disponible por ahora.*\n\n${sugerirDisponibles(
      pizzas,
      pizza.id
    )}\n\n¿Quieres que cambiemos tu elección por alguna de estas opciones?`;
  }

  return `${iconoProducto(pizza)} *¡Sí tenemos ${pizza.nombre}!*\n\n💰 *Precio:* ${formatearPrecio(
    pizza.precio
  )}\n📝 ${pizza.descripcion}\n\n✅ Está disponible para tu pedido.\n¿Te lo agrego? Si quieres, también te sugiero una bebida o un combo para completar.`;
};

const responderMenu = (pizzas) => {
  const lista = listarPizzas(pizzas);
  const disponibles = pizzas.filter(pizzaDisponible);

  if (!lista) {
    return "😔 Por ahora no hay productos disponibles. Escríbenos más tarde y con gusto revisamos el menú contigo.";
  }

  return `📋 *Menú de El Callejón*\nTenemos *${
    disponibles.length
  } opciones disponibles hoy*.\n\n${lista}\n\n🛍️ *Cómo pedir:* responde con el número y la cantidad, por ejemplo *1 x 2* o *3 x 1*. Los números son únicos en todo el menú.\n\n💵 Los precios están en pesos colombianos. El costo del domicilio se confirma según tu zona.\n\n🌐 Menú con fotos: ${enlaceMenu}\n\n${mensajeRedes}`;
};

const responderInformacion = (mensaje) => {
  const texto = normalizar(mensaje);
  const respuestas = [];

  if (/\b(pago|pagos|pagar|aceptan|acepta|nequi|efectivo|transferencias?)\b/.test(texto)) {
    respuestas.push(
      `💳 *Métodos de pago*\n• Efectivo\n• Transferencia\n• Nequi: *${numeroNequi}*\n\nCuando elijas, el equipo te confirma los datos y valida el pago antes de despachar tu pedido.`
    );
  }

  if (/\b(domicilio|domicilios|domiciliario|envio|envios|entrega)\b/.test(texto)) {
    respuestas.push(
      "🛵 *Domicilios*\nEl costo y la cobertura están pendientes de confirmación porque dependen de tu zona. Escríbeme tu barrio o dirección y el equipo te confirma el valor antes de cerrar el pedido."
    );
  }

  if (/\b(salsa|salsas)\b/.test(texto)) {
    respuestas.push(
      "🥫 *Salsa adicional*\nPodemos dejar tu solicitud anotada. La disponibilidad y el precio están pendientes de confirmación; el equipo te cuenta al revisar el pedido."
    );
  }

  if (/\b(redes|facebook|instagram|contacto)\b/.test(texto)) {
    respuestas.push(
      `${mensajeRedes}\n\nTambién puedes escribirnos por aquí para armar tu pedido.`
    );
  }

  if (/\b(horario|horarios|abren|cierran|abierto|cerrado|a que hora)\b/.test(texto)) {
    respuestas.push(
      "🕒 *Horario*\nNo tengo el horario confirmado en este momento. El equipo puede confirmártelo por aquí antes de que vengas o hagas tu pedido."
    );
  }

  if (/\b(estado de mi pedido|mi pedido va|ya salio|cuanto demora|demora|tiempo de entrega)\b/.test(texto)) {
    respuestas.push(
      "⏱️ *Estado de tu pedido*\nPuedo ayudarte a armarlo, pero el estado y el tiempo de entrega los confirma el equipo. Si ya lo registraste, compártenos el número de pedido y lo revisan por aquí."
    );
  }

  if (/\b(promocion|promociones|descuento|descuentos|oferta|ofertas)\b/.test(texto)) {
    respuestas.push(
      "🏷️ *Promociones*\nNo tengo promociones confirmadas para hoy. Te comparto el menú con los precios actuales y, si hay alguna novedad, el equipo te la confirma por aquí."
    );
  }

  if (/\b(donde estan|donde queda|donde es el local|ubicacion del local|direccion del local)\b/.test(texto)) {
    respuestas.push(
      "📍 *Ubicación*\nNo tengo la dirección del local confirmada en este chat. El equipo te la comparte por aquí con gusto."
    );
  }

  return respuestas.length ? respuestas.join("\n\n") : null;
};

const responderRecomendacion = (pizzas) => {
  const sugerencias = seleccionarSugerencias(pizzas);

  if (sugerencias.length === 0) {
    return "😔 Por ahora no tengo productos disponibles para recomendarte. Escríbenos más tarde y revisamos las opciones juntos.";
  }

  return `✨ *Te ayudo a elegir*\n\n${crearListaCompacta(
    sugerencias
  )}\n\n¿Buscas algo clásico, con carne, picante o para compartir? Cuéntame y te recomiendo la mejor opción. También puedo sumar una bebida o un combo.`;
};

const responderSaludo = (pizzas) => {
  const sugerencias = seleccionarSugerencias(pizzas);
  const bloqueSugerencias = sugerencias.length
    ? `\n\n🍕 *Algunas opciones disponibles hoy:*\n${crearListaCompacta(
        sugerencias
      )}`
    : "";

  return `👋 *¡Hola! Soy el asistente de El Callejón.*\n\nBienvenido. Te acompaño con el menú, tu pedido, pagos y domicilio.${bloqueSugerencias}\n\n¿Qué se te antoja? Escríbeme *menú* para ver todo, o cuéntame qué buscas y te ayudo a elegir.`;
};

const responderAgradecimiento = () =>
  "¡Con gusto! 🍕 Si se te antoja algo más, aquí estoy. También puedes escribir *menú* para ver las opciones disponibles.";

const responderDespedida = () =>
  "¡Gracias por escribirnos! Que disfrutes tu pedido. Cuando quieras volver, aquí estaremos. 👋";

const responderIdentidad = () =>
  "Soy el asistente virtual de El Callejón. 😊 Puedo ayudarte con el menú, armar tu pedido, métodos de pago, domicilio y solicitudes especiales. Si necesitas hablar con una persona del equipo, escribe *asesor* y te atienden por aquí.";

const responderAsesor = () =>
  "Claro. Cuéntame tu duda o déjame los datos de tu pedido y el equipo te responde por aquí lo antes posible. Mientras tanto, también puedo ayudarte con el menú y disponibilidad.";

const cantidadAntesDe = (texto, indice) => {
  const antes = texto.slice(Math.max(0, indice - 28), indice);
  const coincidencia = antes.match(
    /(?:^|\s)(\d+|un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(?:(?:x|pizza|hamburguesa|bebida|granizado|producto)s?\s+)?$/
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
    siete: 7,
    ocho: 8,
    nueve: 9,
    diez: 10,
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
  /\b(tienen|hay|disponible|disponibilidad|precio|cuanto cuesta|cuanto vale|que es|que trae|que tiene|ingredientes|descripcion|cuentame|hablame|lleva)\b/.test(
    normalizar(mensaje)
  );

const mensajeConfirmaPedido = (mensaje) => {
  const texto = normalizar(mensaje);
  if (/\b(no|aun no|todavia no)\b.*\bconfirm/.test(texto)) return false;
  return /\b(confirmar|confirmo|confirmar pedido|si confirmo|asi esta bien)\b/.test(
    texto
  );
};

const mensajeCancelaPedido = (mensaje) =>
  /\b(cancelar pedido|cancela pedido|descartar pedido)\b/.test(normalizar(mensaje));

const crearPedidoVacio = () => ({
  items: [],
  notas: [],
  metodo_pago: null,
  direccion: null,
});

const normalizarPedidoGuardado = (pedidoGuardado) => {
  const base = crearPedidoVacio();
  if (!pedidoGuardado || typeof pedidoGuardado !== "object") {
    return { pedido: base, existia: false };
  }

  return {
    pedido: {
      ...base,
      ...pedidoGuardado,
      items: Array.isArray(pedidoGuardado.items) ? pedidoGuardado.items : [],
      notas: Array.isArray(pedidoGuardado.notas) ? pedidoGuardado.notas : [],
    },
    existia: true,
  };
};

const resumirPedido = (pedido, pizzas) => {
  const items = pedido.items
    .map((item) => {
      const pizza = pizzas.find((opcion) => opcion.id === item.pizza_id);
      if (!pizza) return null;
      const subtotal = Number(pizza.precio) * item.cantidad;
      return {
        nombre: pizza.nombre,
        categoria: categoriaProducto(pizza),
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
  const notas = pedido.notas.filter(
    (nota) => nota !== "Dirección o barrio indicado por el cliente"
  );
  if (pedido.direccion) notas.push(`Domicilio: ${pedido.direccion}`);
  const detalleNotas = notas.length
    ? `\n\n📝 *Solicitudes:*\n${notas.map((nota) => `• ${nota}`).join("\n")}`
    : "";
  const detallePago = pedido.metodo_pago
    ? `💳 *Método de pago:* ${pedido.metodo_pago}${
        pedido.metodo_pago === "Nequi" ? ` (${numeroNequi})` : ""
      }`
    : `💳 *Elige cómo pagar:* Efectivo, transferencia o Nequi (${numeroNequi}).`;

  return {
    items,
    subtotal,
    respuesta: `🧾 *Tu pedido hasta ahora*\n\n${detalle}\n\n💵 *Subtotal:* *${formatearPrecio(
      subtotal
    )}*${detalleNotas}\n\n${detallePago}\n🚚 El domicilio y los extras se confirman aparte; por eso el total final puede cambiar.\n\n✅ Si todo está bien, escribe *CONFIRMAR PEDIDO* para registrarlo.\n➕ También puedes agregar más productos o escribir *CANCELAR PEDIDO*.`,
  };
};

const resumenCompacto = (pedido) => {
  const cantidad = pedido.items.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );
  return `🧾 Tu pedido sigue guardado con ${cantidad} ${
    cantidad === 1 ? "producto" : "productos"
  }. Escribe *resumen* para verlo completo o *CONFIRMAR PEDIDO* cuando estés listo.`;
};

const procesarConversacion = (mensaje, pizzas, pedidoGuardado) => {
  const { pedido } = normalizarPedidoGuardado(pedidoGuardado);
  const texto = normalizar(mensaje);
  let cambioPedido = false;

  if (mensajeCancelaPedido(mensaje)) {
    if (pedidoGuardado && (pedido.items.length > 0 || pedido.notas.length > 0)) {
      return {
        accion: "cancelar",
        respuesta:
          "🗑️ Descarté el borrador del pedido. Cuando quieras, empezamos uno nuevo. Si necesitas ayuda para elegir, aquí estoy.",
      };
    }

    return {
      accion: "ninguna",
      respuesta:
        "No tienes un borrador de pedido activo para cancelar. Si quieres, cuéntame qué se te antoja y lo armamos juntos.",
    };
  }

  const confirmar = mensajeConfirmaPedido(mensaje);
  const seleccionNumerica = detectarSeleccionNumerica(mensaje, pizzas);
  if (seleccionNumerica?.error) {
    return {
      accion: pedido.items.length > 0 ? "guardar" : "ninguna",
      pedido: pedido.items.length > 0 ? pedido : null,
      respuesta: `No encontré ese número en el menú disponible. Escribe *menú* para ver las opciones numeradas${
        pedido.items.length > 0 ? " y conservaré tu pedido actual" : ""
      }.`,
    };
  }

  const coincidencias =
    seleccionNumerica?.coincidencias ||
    detectarPizzasEnMensaje(mensaje, pizzas);
  const consulta = mensajeEsConsulta(mensaje);
  const info = responderInformacion(mensaje);
  const metodoPago = detectarMetodoPago(mensaje);
  const solicitaSalsa = /\b(salsa|salsas)\b/.test(texto);
  const solicitaDomicilio =
    /\b(domicilio|domicilios|domiciliario|envio|envios|entrega)\b/.test(texto);
  const solicitaQuitar =
    /\b(quita|quitas|quitar|elimina|eliminas|eliminar|borra|borras|borrar|saca|sacas|sacar)\b/.test(
      texto
    );
  const solicitaResumen =
    /\b(resumen|mi pedido|que llevo|cuanto llevo|ver pedido)\b/.test(texto);

  if (solicitaQuitar && coincidencias.length > 0) {
    if (pedido.items.length === 0) {
      return {
        accion: "ninguna",
        respuesta:
          "No veo ese producto en un pedido activo. Si quieres, dime qué te gustaría pedir y lo armamos desde cero.",
      };
    }

    let removidos = 0;
    for (const { pizza, cantidad } of coincidencias) {
      const indice = pedido.items.findIndex((item) => item.pizza_id === pizza.id);
      if (indice === -1) continue;
      const item = pedido.items[indice];
      item.cantidad -= cantidad;
      removidos += cantidad;
      if (item.cantidad <= 0) pedido.items.splice(indice, 1);
    }

    if (removidos === 0) {
      return {
        accion: "guardar",
        pedido,
        respuesta:
          "Ese producto no estaba en tu pedido actual. Si quieres, escribe *resumen* para revisar lo que llevas.",
      };
    }

    cambioPedido = true;

    if (pedido.items.length === 0) {
      return {
        accion: "cancelar",
        respuesta:
          "Listo, quité ese producto y tu pedido quedó vacío. Cuando quieras empezamos de nuevo. 🍕",
      };
    }
  }

  const esPregunta =
    /[?¿]/.test(mensaje) ||
    /\b(saber|preguntar|aceptan|acepta|puedo|se puede|tienen|hay)\b/.test(texto);
  const solicitudExplicita =
    /\b(agrega|agregar|añade|anade|sumale|súmale|ponle|quiero|quisiera|necesito|extra|adicional|con|salsa|salsas|domicilio|domicilios|envio|envios|entrega)\b/.test(
      texto
    );
  const coincidenciaDireccion =
    mensaje.match(/\bmi\s+(?:direccion|dirección)\s+(?:es\s+)?(.+)$/i) ||
    mensaje.match(/\b(?:barrio)\s+([\p{L}\p{N}\s.#-]{3,})$/iu) ||
    mensaje.match(
      /\b((?:calle|carrera|cra|cl|diagonal|transversal)\s+[^\n]+)$/i
    );
  const direccion = coincidenciaDireccion?.[1]?.trim() || null;
  const esConsultaInformativa =
    Boolean(info) &&
    coincidencias.length === 0 &&
    !direccion &&
    (esPregunta || !solicitudExplicita);

  if (
    metodoPago &&
    pedido.metodo_pago !== metodoPago &&
    (!esPregunta || pedido.items.length > 0)
  ) {
    pedido.metodo_pago = metodoPago;
    cambioPedido = true;
  }

  if (solicitaSalsa && !esConsultaInformativa) {
    const nota = "Salsa adicional solicitada; precio y disponibilidad por confirmar";
    if (!pedido.notas.includes(nota)) {
      pedido.notas.push(nota);
      cambioPedido = true;
    }
  }

  if (direccion && !pedido.direccion) {
    pedido.direccion = direccion;
    const nota = "Dirección o barrio indicado por el cliente";
    if (!pedido.notas.includes(nota)) {
      pedido.notas.push(nota);
      cambioPedido = true;
    }
  } else if (solicitaDomicilio && !esConsultaInformativa) {
    const nota = "Domicilio solicitado; cobertura y costo por confirmar";
    if (!pedido.notas.includes(nota)) {
      pedido.notas.push(nota);
      cambioPedido = true;
    }
  }

  if (consulta && coincidencias.length > 0) {
    return {
      accion: pedido.items.length > 0 ? "guardar" : "ninguna",
      pedido: pedido.items.length > 0 ? pedido : null,
      respuesta: respuestaAutomatica(mensaje, pizzas),
    };
  }

  if (!consulta && coincidencias.length > 0 && !solicitaQuitar) {
    const cantidadesSolicitadas = new Map();
    for (const { pizza, cantidad } of coincidencias) {
      cantidadesSolicitadas.set(
        pizza.id,
        (cantidadesSolicitadas.get(pizza.id) || 0) + cantidad
      );
    }

    for (const [pizzaId, cantidad] of cantidadesSolicitadas) {
      const pizza = pizzas.find((opcion) => opcion.id === pizzaId);
      if (!pizza || !pizzaDisponible(pizza)) {
        return {
          accion: pedido.items.length > 0 ? "guardar" : "ninguna",
          pedido: pedido.items.length > 0 ? pedido : null,
          respuesta: `😔 ${
            pizza?.nombre || "Ese producto"
          } no está disponible ahora. ${
            pedido.items.length > 0 ? "Conservé tu pedido actual. " : ""
          }${sugerirDisponibles(pizzas, pizza?.id)}`,
        };
      }

      const existente = pedido.items.find((item) => item.pizza_id === pizza.id);
      const total = (existente?.cantidad || 0) + cantidad;
      if (total > Number(pizza.stock)) {
        return {
          accion: pedido.items.length > 0 ? "guardar" : "ninguna",
          pedido: pedido.items.length > 0 ? pedido : null,
          respuesta: `Solo hay ${pizza.stock} ${
            pizza.stock === 1 ? "unidad disponible" : "unidades disponibles"
          } de ${pizza.nombre}. Dime cuántas quieres agregar y ajusto tu pedido.`,
        };
      }
    }

    for (const [pizzaId, cantidad] of cantidadesSolicitadas) {
      const existente = pedido.items.find((item) => item.pizza_id === pizzaId);
      if (existente) existente.cantidad += cantidad;
      else pedido.items.push({ pizza_id: pizzaId, cantidad });
    }
    cambioPedido = true;
  }

  if (confirmar) {
    if (pedido.items.length === 0) {
      return {
        accion: "ninguna",
        respuesta:
          "Todavía no tienes productos en el pedido. Cuéntame qué se te antoja y cuántos quieres, y lo armamos juntos. 🍕",
      };
    }
    if (!pedido.metodo_pago) {
      return {
        accion: "guardar",
        pedido,
        respuesta: `🧾 *Ya casi está listo.*\nAntes de registrarlo, dime cómo prefieres pagar:\n\n• *Efectivo*\n• *Transferencia*\n• *Nequi* al ${numeroNequi}\n\nCuando me lo digas, escribe *CONFIRMAR PEDIDO* y lo dejo registrado.`,
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

  if (solicitaResumen && pedido.items.length > 0) {
    return {
      accion: "guardar",
      pedido,
      respuesta: resumirPedido(pedido, pizzas).respuesta,
    };
  }

  if (info && coincidencias.length === 0) {
    const notaPedido =
      pedido.items.length > 0 ? `\n\n${resumenCompacto(pedido)}` : "";
    const debeGuardar =
      pedido.items.length > 0 ||
      pedido.notas.length > 0 ||
      Boolean(pedido.direccion) ||
      Boolean(pedido.metodo_pago);
    return {
      accion: debeGuardar ? "guardar" : "ninguna",
      pedido: debeGuardar ? pedido : null,
      respuesta: `${info}${notaPedido}`,
    };
  }

  if (pedido.items.length > 0) {
    if (cambioPedido) {
      return {
        accion: "guardar",
        pedido,
        respuesta: resumirPedido(pedido, pizzas).respuesta,
      };
    }

    return {
      accion: "guardar",
      pedido,
      respuesta: respuestaAutomatica(mensaje, pizzas),
    };
  }

  if (
    pedido.items.length === 0 &&
    (pedido.notas.length > 0 || pedido.direccion || pedido.metodo_pago)
  ) {
    const detalles = [];
    if (pedido.direccion) detalles.push(`domicilio en *${pedido.direccion}*`);
    if (pedido.metodo_pago) detalles.push(`pago con *${pedido.metodo_pago}*`);
    if (pedido.notas.length > 0) detalles.push("tus solicitudes");

    return {
      accion: "guardar",
      pedido,
      respuesta:
        respuestaAutomatica(mensaje, pizzas) ||
        `Listo, dejé anotado ${detalles.join(" y ")}. Ahora dime qué productos quieres y cuántos para armar el pedido. 🍕`,
    };
  }

  if (/\b(quiero pedir|hacer un pedido|iniciar pedido|pedir)\b/.test(texto)) {
    return {
      accion: "ninguna",
      respuesta: `¡Perfecto! Vamos a armarlo juntos. 🍕\n\n1️⃣ Dime el producto y la cantidad (por ejemplo, *2 Margarita*).\n2️⃣ Si quieres, agrega una bebida o un acompañamiento.\n3️⃣ Te muestro el resumen y eliges cómo pagar.\n\nPuedes escribir el nombre o el número del menú. Si quieres verlo completo, escribe *menú*.`,
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

  if (
    /\b(recomienda|recomiendas|recomiendame|recomiendan|recomienden|sugerencia|sugerencias|sugiereme|que me aconsejan|que me recomiendan)\b/.test(
      texto
    )
  ) {
    return responderRecomendacion(pizzas);
  }

  if (
    /\b(menu|menus|carta|opciones|disponibles|precio|precios|combos?|bebidas?|postres?|que tienen|que hay|cuanto cuesta|cuanto vale)\b/.test(
      texto
    )
  ) {
    return responderMenu(pizzas);
  }

  if (
    /^(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal|buen dia)\b/.test(
      texto
    )
  ) {
    return responderSaludo(pizzas);
  }

  if (/\b(gracias|muchas gracias|mil gracias|te agradezco)\b/.test(texto)) {
    return responderAgradecimiento();
  }

  if (/\b(adios|chao|hasta luego|nos vemos|bye|hasta pronto)\b/.test(texto)) {
    return responderDespedida();
  }

  if (/\b(quien eres|eres un bot|eres humano|como funcionas|que haces)\b/.test(texto)) {
    return responderIdentidad();
  }

  if (/\b(asesor|asesora|persona|agente)\b/.test(texto)) {
    return responderAsesor();
  }

  return null;
};

const prepararMenuParaIA = (pizzas) =>
  pizzas.map((pizza) => ({
    nombre: pizza.nombre,
    categoria: categoriaProducto(pizza),
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
