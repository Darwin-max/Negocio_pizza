const crypto = require("node:crypto");
const pool = require("../config/database");
const pizzaModel = require("../models/pizza.model");
const pedidoService = require("./pedido.service");
const {
  prepararMenuParaIA,
  respuestaAutomatica,
  procesarConversacion,
} = require("./whatsapp-bot");

const bloqueosConversacion = new Map();
const maximoMensajesHistorial = 12;

const formatearPrecio = (precio) =>
  `$${Number(precio).toLocaleString("es-CO")}`;

const respuestaFallback =
  "No estoy seguro de haber entendido bien, pero quiero ayudarte. 😊\n\nPuedo ayudarte con:\n• Ver el menú y precios\n• Armar tu pedido paso a paso\n• Métodos de pago, domicilio y salsa adicional\n\n¿Cuál de estos te gustaría revisar? También puedes escribir *menú*.";

const ejecutarConversacionEnOrden = async (clave, operacion) => {
  const anterior = bloqueosConversacion.get(clave) || Promise.resolve();
  let liberar;
  const turno = new Promise((resolve) => {
    liberar = resolve;
  });
  const cola = anterior.then(() => turno);
  bloqueosConversacion.set(clave, cola);

  await anterior;
  try {
    return await operacion();
  } finally {
    liberar();
    if (bloqueosConversacion.get(clave) === cola) {
      bloqueosConversacion.delete(clave);
    }
  }
};

const limpiarConversacionesExpiradas = async () => {
  await pool.query(
    `DELETE FROM whatsapp_conversaciones
     WHERE updated_at <= CURRENT_TIMESTAMP - INTERVAL '24 hours'`
  );
};

const intervaloLimpiezaConversaciones = setInterval(() => {
  limpiarConversacionesExpiradas().catch((error) => {
    console.error("No se pudieron eliminar conversaciones de WhatsApp expiradas:", error);
  });
}, 60 * 60 * 1000);
intervaloLimpiezaConversaciones.unref();

const validarFirmaWebhook = (rawBody, signature, appSecret) => {
  if (!Buffer.isBuffer(rawBody) || !signature || !appSecret) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
};

const obtenerTextoMensaje = (message) => {
  if (message.type === "text") return message.text?.body?.trim() || "";
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.title ||
      ""
    );
  }

  return "";
};

const normalizarHistorial = (historial) =>
  (Array.isArray(historial) ? historial : [])
    .filter(
      (item) =>
        item &&
        typeof item.text === "string" &&
        item.text.trim().length > 0
    )
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      text: item.text.trim(),
    }))
    .slice(-maximoMensajesHistorial);

const construirContenidoGemini = (historial) => {
  const contents = [];

  for (const item of normalizarHistorial(historial)) {
    const role = item.role === "assistant" ? "model" : "user";
    const ultimo = contents[contents.length - 1];

    if (ultimo?.role === role) {
      ultimo.parts[0].text += `\n${item.text}`;
    } else {
      contents.push({ role, parts: [{ text: item.text }] });
    }
  }

  return contents;
};

const prepararBorradorParaIA = (pedido, pizzas) => {
  if (!pedido?.items?.length) return null;

  const productos = pedido.items
    .map((item) => {
      const pizza = pizzas.find((opcion) => opcion.id === item.pizza_id);
      if (!pizza) return null;
      return {
        producto: pizza.nombre,
        cantidad: item.cantidad,
        precio_unitario: formatearPrecio(pizza.precio),
        subtotal: formatearPrecio(Number(pizza.precio) * item.cantidad),
      };
    })
    .filter(Boolean);

  const subtotal = pedido.items.reduce((total, item) => {
    const pizza = pizzas.find((opcion) => opcion.id === item.pizza_id);
    return total + (pizza ? Number(pizza.precio) * item.cantidad : 0);
  }, 0);

  return {
    productos,
    subtotal: formatearPrecio(subtotal),
    metodo_pago: pedido.metodo_pago || null,
    direccion: pedido.direccion || null,
    solicitudes: Array.isArray(pedido.notas) ? pedido.notas : [],
  };
};

const generarRespuestaIA = async (
  mensaje,
  pizzas,
  historial = [],
  pedido = null
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent`;
    const menu = prepararMenuParaIA(pizzas);
    const borrador = prepararBorradorParaIA(pedido, pizzas);

    const systemInstruction = `Eres el anfitrión digital de El Callejón, una pizzería colombiana que atiende pedidos por WhatsApp.

TU OBJETIVO
Que el cliente se sienta bien atendido, entienda el menú y logre pedir sin fricción. Ayuda también con dudas de pago, domicilio, salsa adicional, horario y contacto.

ESTILO
- Español colombiano neutro, cálido, cercano y profesional.
- Tutea al cliente. Usa frases cortas y naturales.
- Máximo 1 emoji por mensaje.
- Respuestas de 2 a 5 frases cortas o 3 a 5 líneas. Si el cliente pide el menú, puedes usar una lista breve.
- Termina con una pregunta breve o un siguiente paso útil cuando sea natural.
- No repitas el menú completo en cada respuesta ni saludes de nuevo si la conversación ya está en curso.

REGLAS DE DATOS
- Usa únicamente el MENÚ ACTUAL y el BORRADOR ACTUAL que recibes.
- Nunca inventes productos, precios, ingredientes, horarios, dirección, promociones, tiempos de entrega ni costos de domicilio.
- Si falta un dato, di que el equipo lo confirma por el mismo chat.
- No afirmes que registraste, confirmaste, cobraste ni despachaste un pedido. El sistema solo registra cuando el cliente escribe CONFIRMAR PEDIDO.
- Si el cliente quiere agregar, quitar o cambiar productos, indícale que lo escriba de forma clara. No digas que ya lo hiciste.
- Para productos agotados, ofrece solo alternativas marcadas como disponibles.
- No prometas descuentos ni beneficios que no estén confirmados.
- Si el cliente pregunta por una persona, dile que el equipo revisa el chat y le responde por aquí.`;

    const contents = construirContenidoGemini(historial);
    const mensajeActual = `MENÚ ACTUAL (JSON): ${JSON.stringify(
      menu
    )}\n\nBORRADOR ACTUAL (JSON): ${
      borrador ? JSON.stringify(borrador) : "Sin borrador activo."
    }\n\nMENSAJE DEL CLIENTE: ${mensaje}`;
    const ultimo = contents[contents.length - 1];

    if (ultimo?.role === "user") {
      ultimo.parts[0].text += `\n\n${mensajeActual}`;
    } else {
      contents.push({ role: "user", parts: [{ text: mensajeActual }] });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          maxOutputTokens: 480,
        },
      }),
      signal: AbortSignal.timeout(12000),
    });

    const result = await response.json();
    if (!response.ok) {
      const detail = result.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini no pudo responder: ${detail}`);
    }

    const answer = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      throw new Error("Gemini devolvió una respuesta vacía");
    }

    return answer;
  } catch (error) {
    console.error("No se pudo generar la respuesta con Gemini:", error);
    return null;
  }
};

const obtenerConversacionWhatsapp = async (telefono) => {
  await pool.query(
    `DELETE FROM whatsapp_conversaciones
     WHERE telefono = $1
       AND updated_at <= CURRENT_TIMESTAMP - INTERVAL '24 hours'`,
    [telefono]
  );
  const result = await pool.query(
    `SELECT pedido, historial
     FROM whatsapp_conversaciones
     WHERE telefono = $1
       AND updated_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'`,
    [telefono]
  );
  const fila = result.rows[0];

  return {
    pedido: fila?.pedido || null,
    historial: normalizarHistorial(fila?.historial),
  };
};

const guardarConversacionWhatsapp = async (telefono, pedido, historial = []) => {
  await pool.query(
    `INSERT INTO whatsapp_conversaciones (telefono, pedido, historial, updated_at)
     VALUES ($1, $2::jsonb, $3::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (telefono) DO UPDATE
       SET pedido = EXCLUDED.pedido,
           historial = EXCLUDED.historial,
           updated_at = CURRENT_TIMESTAMP`,
    [
      telefono,
      pedido ? JSON.stringify(pedido) : null,
      JSON.stringify(normalizarHistorial(historial)),
    ]
  );
};

const crearRespuestaPedidoGuardado = (pedidoCreado) => {
  const detalle = pedidoCreado.detalles
    .map(
      (item) =>
        `• ${item.cantidad} × ${item.pizza_nombre}: $${Number(
          item.subtotal
        ).toLocaleString("es-CO")}`
    )
    .join("\n");
  const metodo = pedidoCreado.metodo_pago
    ? `\n💳 *Método de pago:* ${pedidoCreado.metodo_pago}${
        pedidoCreado.metodo_pago === "Nequi" ? " (312 406 0135)" : ""
      }.`
    : "";
  const solicitudes = pedidoCreado.notas
    ? `\n📝 *Solicitudes:* ${pedidoCreado.notas}.`
    : "";

  return `✅ *¡Pedido #${pedidoCreado.id} registrado!*\nQuedó *pendiente de pago*.\n\n🧾 *Resumen:*\n${detalle}\n\n💵 *Subtotal:* $${Number(
    pedidoCreado.total
  ).toLocaleString(
    "es-CO"
  )}${metodo}${solicitudes}\n\n🚚 El costo del domicilio y de cualquier salsa adicional está pendiente de confirmación; por eso el total final puede cambiar. El equipo te confirmará el total final y coordinará contigo el pago y la entrega por este mismo chat.\n\n📲 *Más información:*\nInstagram: https://www.instagram.com/elcallejon_n4496/\nFacebook: https://www.facebook.com/profile.php?id=61595493282153`;
};

const responderMensaje = async (mensaje, destinatario) => {
  return ejecutarConversacionEnOrden(destinatario, async () => {
    const pizzas = await pizzaModel.obtenerTodas();
    const conversacionPrevia = await obtenerConversacionWhatsapp(destinatario);
    const pedidoGuardado = conversacionPrevia.pedido;
    const historialPrevio = conversacionPrevia.historial;
    const conversacion = procesarConversacion(mensaje, pizzas, pedidoGuardado);
    const historialConMensaje = [
      ...historialPrevio,
      { role: "user", text: mensaje },
    ].slice(-maximoMensajesHistorial);

    const guardarRespuesta = async (respuesta, pedido = null) => {
      const historial = [
        ...historialConMensaje,
        { role: "assistant", text: respuesta },
      ].slice(-maximoMensajesHistorial);
      await guardarConversacionWhatsapp(destinatario, pedido, historial);
      return respuesta;
    };

    if (conversacion.accion === "cancelar") {
      return guardarRespuesta(conversacion.respuesta, null);
    }

    if (conversacion.accion === "confirmar") {
      let pedidoCreado;
      try {
        pedidoCreado = await pedidoService.crearPedido({
          ...conversacion.datosPedido,
          telefono_whatsapp: destinatario,
          incluir_detalles: true,
        });
      } catch (error) {
        console.error("Error al registrar pedido recibido por WhatsApp:", error);
        await guardarConversacionWhatsapp(
          destinatario,
          conversacion.pedido,
          historialConMensaje
        );
        return `No pude registrar el pedido todavía: ${error.message}. Conservé el borrador; revisemos la disponibilidad y vuelve a escribir “confirmar pedido”.`;
      }

      const respuesta = crearRespuestaPedidoGuardado(pedidoCreado);
      return guardarRespuesta(respuesta, null);
    }

    if (conversacion.accion === "guardar") {
      if (conversacion.respuesta) {
        return guardarRespuesta(conversacion.respuesta, conversacion.pedido);
      }

      const respuestaIA = await generarRespuestaIA(
        mensaje,
        pizzas,
        historialPrevio,
        conversacion.pedido
      );
      const respuesta =
        respuestaIA || respuestaAutomatica(mensaje, pizzas) || respuestaFallback;
      return guardarRespuesta(respuesta, conversacion.pedido);
    }

    const respuestaIA = await generarRespuestaIA(
      mensaje,
      pizzas,
      historialPrevio,
      pedidoGuardado
    );
    const respuesta =
      conversacion.respuesta ||
      respuestaAutomatica(mensaje, pizzas) ||
      respuestaIA ||
      respuestaFallback;

    return guardarRespuesta(respuesta, null);
  });
};

const enviarMensaje = async (destinatario, texto) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_API_VERSION;

  if (!accessToken || !phoneNumberId || !version) {
    throw new Error(
      "Faltan WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_GRAPH_API_VERSION"
    );
  }

  if (!/^v\d+\.\d+$/.test(version)) {
    throw new Error("WHATSAPP_GRAPH_API_VERSION debe tener formato vNN.N");
  }

  const response = await fetch(
    `https://graph.facebook.com/${version}/${encodeURIComponent(
      phoneNumberId
    )}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: destinatario,
        type: "text",
        text: { preview_url: false, body: texto },
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    const detail = result.error?.message || `HTTP ${response.status}`;
    throw new Error(`Meta rechazó el mensaje de WhatsApp: ${detail}`);
  }
};

const reservarMensaje = async (messageId) => {
  const result = await pool.query(
    `
    INSERT INTO whatsapp_mensajes_procesados (mensaje_id, estado)
    VALUES ($1, 'processing')
    ON CONFLICT (mensaje_id) DO UPDATE
      SET estado = 'processing', updated_at = CURRENT_TIMESTAMP
      WHERE whatsapp_mensajes_procesados.estado = 'failed'
    RETURNING mensaje_id
    `,
    [messageId]
  );

  return result.rowCount > 0;
};

const actualizarEstadoMensaje = async (messageId, estado) => {
  await pool.query(
    `
    UPDATE whatsapp_mensajes_procesados
    SET estado = $2, updated_at = CURRENT_TIMESTAMP
    WHERE mensaje_id = $1
    `,
    [messageId, estado]
  );
};

const procesarMensaje = async (message) => {
  const messageId = message.id;
  const destinatario = message.from;
  if (!messageId || !destinatario) return;

  const reservado = await reservarMensaje(messageId);
  if (!reservado) return;

  try {
    const texto = obtenerTextoMensaje(message);
    const respuesta = texto
      ? await responderMensaje(texto, destinatario)
      : "Por ahora puedo leer mensajes de texto 😊. Escríbeme *menú* para ver las opciones disponibles o cuéntame qué se te antoja.";

    await enviarMensaje(destinatario, respuesta);
    await actualizarEstadoMensaje(messageId, "processed");
  } catch (error) {
    await actualizarEstadoMensaje(messageId, "failed");
    throw error;
  }
};

const procesarWebhook = async (payload) => {
  const messages = (payload.entry || []).flatMap((entry) =>
    (entry.changes || []).flatMap(
      (change) => change.value?.messages || []
    )
  );

  for (const message of messages) {
    await procesarMensaje(message);
  }
};

module.exports = {
  validarFirmaWebhook,
  procesarWebhook,
};
