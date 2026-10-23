const test = require("node:test");
const assert = require("node:assert/strict");
const whatsappController = require("../src/controllers/whatsapp.controller");

const crearRespuesta = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  send(body) {
    this.body = body;
    return this;
  },
  sendStatus(code) {
    this.statusCode = code;
    return this;
  },
});

test("verifica el webhook de Meta con el token configurado", () => {
  const previousToken = process.env.WHATSAPP_VERIFY_TOKEN;
  process.env.WHATSAPP_VERIFY_TOKEN = "verify-test";
  const response = crearRespuesta();

  whatsappController.verificarWebhook(
    {
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "verify-test",
        "hub.challenge": "challenge-test",
      },
    },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "challenge-test");

  if (previousToken === undefined) {
    delete process.env.WHATSAPP_VERIFY_TOKEN;
  } else {
    process.env.WHATSAPP_VERIFY_TOKEN = previousToken;
  }
});

test("rechaza la verificación si el token no coincide", () => {
  const previousToken = process.env.WHATSAPP_VERIFY_TOKEN;
  process.env.WHATSAPP_VERIFY_TOKEN = "verify-test";
  const response = crearRespuesta();

  whatsappController.verificarWebhook(
    {
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "wrong-token",
        "hub.challenge": "challenge-test",
      },
    },
    response
  );

  assert.equal(response.statusCode, 403);

  if (previousToken === undefined) {
    delete process.env.WHATSAPP_VERIFY_TOKEN;
  } else {
    process.env.WHATSAPP_VERIFY_TOKEN = previousToken;
  }
});
