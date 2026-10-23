const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { respuestaAutomatica, prepararMenuParaIA } = require("../src/services/whatsapp-bot");
const { validarFirmaWebhook } = require("../src/services/whatsapp.service");

test("valida la firma HMAC de Meta y rechaza firmas inválidas", () => {
  const body = Buffer.from('{"object":"whatsapp_business_account"}');
  const secret = "app-secret-for-test";
  const signature = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")}`;

  assert.equal(validarFirmaWebhook(body, signature, secret), true);
  assert.equal(validarFirmaWebhook(body, "sha256=invalid", secret), false);
  assert.equal(validarFirmaWebhook(body, signature, "wrong-secret"), false);
});

const pizzas = [
  {
    id: 1,
    nombre: "Margarita",
    descripcion: "Tomate y mozzarella",
    precio: 28000,
    stock: 4,
    activo: true,
  },
  {
    id: 2,
    nombre: "Hawaiana",
    descripcion: "Jamón y piña",
    precio: 31000,
    stock: 0,
    activo: true,
  },
  {
    id: 3,
    nombre: "Pepperoni",
    descripcion: "Mozzarella y pepperoni",
    precio: 32000,
    stock: 8,
    activo: true,
  },
  {
    id: 4,
    nombre: "Especial",
    descripcion: "No disponible al público",
    precio: 35000,
    stock: 5,
    activo: false,
  },
  {
    id: 5,
    nombre: "BBQ Pollo",
    descripcion: "Pollo y salsa BBQ",
    precio: 36000,
    stock: 3,
    activo: true,
  },
];

test("responde la disponibilidad y precio desde el inventario", () => {
  const reply = respuestaAutomatica("¿Tienen margarita?", pizzas);

  assert.match(reply, /Sí tenemos Margarita/);
  assert.match(reply, /\$28\.000/);
});

test("reconoce una parte distintiva del nombre de la pizza", () => {
  const reply = respuestaAutomatica("¿Tienen la BBQ?", pizzas);

  assert.match(reply, /Sí tenemos BBQ Pollo/);
});

test("indica que una pizza agotada no está disponible y ofrece alternativas", () => {
  const reply = respuestaAutomatica("Hay hawaiana", pizzas);

  assert.match(reply, /Hawaiana no está disponible/);
  assert.match(reply, /Margarita/);
  assert.match(reply, /Pepperoni/);
  assert.doesNotMatch(reply, /Especial/);
});

test("el menú incluye solo productos activos con stock", () => {
  const reply = respuestaAutomatica("menú", pizzas);

  assert.match(reply, /Margarita/);
  assert.match(reply, /Pepperoni/);
  assert.doesNotMatch(reply, /Hawaiana/);
  assert.doesNotMatch(reply, /Especial/);
});

test("prepara para Gemini datos de disponibilidad sin revelar cantidades de stock", () => {
  const menu = prepararMenuParaIA(pizzas);

  assert.deepEqual(menu[0], {
    nombre: "Margarita",
    descripcion: "Tomate y mozzarella",
    precio: "$28.000",
    disponible: true,
  });
  assert.equal("stock" in menu[0], false);
  assert.equal(menu[1].disponible, false);
  assert.equal(menu[3].disponible, false);
});

test("reconoce un saludo y ofrece el menú disponible", () => {
  const reply = respuestaAutomatica("¡Hola!", pizzas);

  assert.match(reply, /Soy el asistente de El Callejón/);
  assert.match(reply, /Margarita/);
  assert.doesNotMatch(reply, /Hawaiana/);
});
