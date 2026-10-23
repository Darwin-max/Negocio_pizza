const whatsappService = require("../services/whatsapp.service");

const verificarWebhook = (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (!verifyToken) {
    return res.status(503).send("WhatsApp webhook is not configured");
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

const recibirWebhook = async (req, res) => {
  const appSecret = process.env.META_APP_SECRET;
  const signature = req.get("x-hub-signature-256");
  const messageCount = (req.body?.entry || []).reduce(
    (total, entry) =>
      total +
      (entry.changes || []).reduce(
        (count, change) => count + (change.value?.messages || []).length,
        0
      ),
    0
  );

  console.info("Webhook de WhatsApp recibido", {
    object: req.body?.object || null,
    messageCount,
    signaturePresent: Boolean(signature),
  });

  if (!appSecret) {
    console.error("Webhook de WhatsApp rechazado: META_APP_SECRET no está configurado");
    return res.status(503).json({ error: "WhatsApp webhook is not configured" });
  }

  if (!whatsappService.validarFirmaWebhook(req.rawBody, signature, appSecret)) {
    console.error("Webhook de WhatsApp rechazado: firma inválida");
    return res.sendStatus(401);
  }

  if (req.body?.object !== "whatsapp_business_account") {
    console.error("Webhook de WhatsApp rechazado: objeto inesperado");
    return res.sendStatus(404);
  }

  try {
    await whatsappService.procesarWebhook(req.body);
    console.info("Webhook de WhatsApp procesado", { messageCount });
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error al procesar el webhook de WhatsApp:", error);
    return res.sendStatus(500);
  }
};

module.exports = {
  verificarWebhook,
  recibirWebhook,
};
