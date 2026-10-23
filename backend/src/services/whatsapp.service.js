const crypto = require("node:crypto");
const pool = require("../config/database");
const pizzaModel = require("../models/pizza.model");
const { prepararMenuParaIA, respuestaAutomatica } = require("./whatsapp-bot");

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

const generarRespuestaIA = async (mensaje, pizzas) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent`;
  const menu = prepararMenuParaIA(pizzas);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: "Eres el asistente de WhatsApp de la pizzería El Callejón en Colombia. Responde en español, breve, amable y natural. Usa solo el menú JSON proporcionado. Nunca inventes precios, ingredientes, horarios, domicilios ni disponibilidad. Si no conoces un dato, indica que el equipo lo confirmará. No afirmes que registraste o confirmaste un pedido o pago. Para productos no disponibles, ofrece solo alternativas marcadas como disponibles.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `MENÚ ACTUAL (JSON): ${JSON.stringify(
                menu
              )}\n\nMENSAJE DEL CLIENTE: ${mensaje}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 220,
      },
    }),
    signal: AbortSignal.timeout(10000),
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
};

const responderMensaje = async (mensaje) => {
  const pizzas = await pizzaModel.obtenerTodas();
  const respuestaDeterminista = respuestaAutomatica(mensaje, pizzas);
  if (respuestaDeterminista) return respuestaDeterminista;

  const respuestaIA = await generarRespuestaIA(mensaje, pizzas);
  if (respuestaIA) return respuestaIA;

  return "Puedo ayudarte con el menú y la disponibilidad. Dime qué pizza te interesa o escribe “menú” para ver las opciones.";
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
      ? await responderMensaje(texto)
      : "Por ahora puedo leer mensajes de texto. Escribe “menú” para consultar pizzas y disponibilidad.";

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
