const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const {
  respuestaAutomatica,
  prepararMenuParaIA,
  procesarConversacion,
} = require("../src/services/whatsapp-bot");
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

test("el menú y los pedidos incluyen productos de otras categorías", () => {
  const productos = [
    ...pizzas,
    {
      id: 6,
      nombre: "Hamburguesa clásica",
      categoria: "Hamburguesas",
      descripcion: "Carne, queso y vegetales",
      precio: 18000,
      stock: 5,
      activo: true,
    },
    {
      id: 7,
      nombre: "Granizado de fresa",
      categoria: "Granizados",
      descripcion: "Fresa",
      precio: 8000,
      stock: 3,
      activo: true,
    },
    {
      id: 8,
      nombre: "Combo familiar",
      categoria: "Combos",
      descripcion: "Pizza, papas y bebida",
      precio: 45000,
      stock: 2,
      activo: true,
    },
  ];

  const menu = respuestaAutomatica("menú", productos);
  assert.match(menu, /\*🍔 Hamburguesas\*/);
  assert.match(menu, /4\. Hamburguesa clásica — \*\$18\.000\*/);
  assert.match(menu, /5\. Granizado de fresa — \*\$8\.000\*/);
  assert.match(menu, /\*🥡 Combos\*/);
  assert.match(menu, /6\. Combo familiar — \*\$45\.000\*/);
  assert.match(menu, /WHATSAPP_MENU_URL|darwin-max\.github\.io/);
  assert.equal(prepararMenuParaIA(productos)[5].categoria, "Hamburguesas");

  const pedido = procesarConversacion("Quiero 2 combos familiares", productos);
  assert.deepEqual(pedido.pedido.items, [{ pizza_id: 8, cantidad: 2 }]);
  assert.match(pedido.respuesta, /2 × 🥡 \*Combo familiar\* — \*\$90\.000\*/);
  assert.match(pedido.respuesta, /\*Subtotal:\* \*\$90\.000\*/);
  assert.match(pedido.respuesta, /\*CONFIRMAR PEDIDO\*/);
});

test("acepta números del menú con cantidades para pedir por WhatsApp", () => {
  const resultado = procesarConversacion("2 x 2, 3", pizzas);

  assert.equal(resultado.accion, "guardar");
  assert.deepEqual(resultado.pedido.items, [
    { pizza_id: 3, cantidad: 2 },
    { pizza_id: 5, cantidad: 1 },
  ]);
  assert.match(resultado.respuesta, /2 × 🍕 \*Pepperoni\* — \*\$64\.000\*/);
  assert.match(resultado.respuesta, /1 × 🍕 \*BBQ Pollo\* — \*\$36\.000\*/);
});

test("rechaza números de producto que no existen en el menú disponible", () => {
  const resultado = procesarConversacion("99", pizzas);

  assert.equal(resultado.accion, "ninguna");
  assert.match(resultado.respuesta, /No encontré ese número/);
});

test("prepara para Gemini datos de disponibilidad sin revelar cantidades de stock", () => {
  const menu = prepararMenuParaIA(pizzas);

  assert.deepEqual(menu[0], {
    nombre: "Margarita",
    categoria: "Pizzas",
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
  assert.match(reply, /instagram\.com\/elcallejon_n4496/);
  assert.match(reply, /facebook\.com\/profile\.php\?id=61595493282153/);
  assert.doesNotMatch(reply, /Hawaiana/);
});

test("responde métodos de pago, domicilio, salsa y redes sin inventar valores", () => {
  const pagos = respuestaAutomatica("¿Qué métodos de pago aceptan?", pizzas);
  assert.match(pagos, /Efectivo/);
  assert.match(pagos, /Transferencia/);
  assert.match(pagos, /Nequi: \*312 406 0135\*/);
  assert.match(respuestaAutomatica("¿Cuánto cuesta el domicilio?", pizzas), /pendientes de confirmación/);
  assert.match(respuestaAutomatica("¿Puedo pedir más salsa?", pizzas), /precio están pendientes/);

  const redes = respuestaAutomatica("¿Cuáles son sus redes?", pizzas);
  assert.match(redes, /instagram\.com\/elcallejon_n4496/);
  assert.match(redes, /facebook\.com\/profile\.php\?id=61595493282153/);
});

test("arma un borrador con cantidades de varios productos y calcula el subtotal", () => {
  const resultado = procesarConversacion("Quiero 2 Margarita y una Pepperoni", pizzas);

  assert.equal(resultado.accion, "guardar");
  assert.deepEqual(resultado.pedido.items, [
    { pizza_id: 1, cantidad: 2 },
    { pizza_id: 3, cantidad: 1 },
  ]);
  assert.match(resultado.respuesta, /\*Subtotal:\* \*\$88\.000\*/);
  assert.match(resultado.respuesta, /total final puede cambiar/);
});

test("agrega productos en mensajes separados y registra salsa/pago como solicitudes", () => {
  const primero = procesarConversacion("2 Margarita", pizzas);
  const segundo = procesarConversacion(
    "Agrega una Pepperoni, una salsa extra y pago por Nequi",
    pizzas,
    primero.pedido
  );

  assert.equal(segundo.accion, "guardar");
  assert.equal(segundo.pedido.items.length, 2);
  assert.equal(segundo.pedido.metodo_pago, "Nequi");
  assert.match(segundo.pedido.notas.join(" "), /Salsa adicional solicitada/);
  assert.match(segundo.respuesta, /Nequi \(312 406 0135\)/);
  assert.match(segundo.respuesta, /2 × 🍕 \*Margarita\*/);
  assert.match(segundo.respuesta, /1 × 🍕 \*Pepperoni\*/);
});

test("guarda el pedido solo cuando el cliente lo confirma", () => {
  const borrador = procesarConversacion("una Margarita", pizzas);
  const pago = procesarConversacion("Nequi", pizzas, borrador.pedido);
  const confirmado = procesarConversacion(
    "confirmar pedido",
    pizzas,
    pago.pedido
  );

  assert.equal(confirmado.accion, "confirmar");
  assert.equal(confirmado.datosPedido.metodo_pago, "Nequi");
  assert.deepEqual(confirmado.datosPedido.pizzas, [
    { pizza_id: 1, cantidad: 1 },
  ]);
});

test("solicita método de pago antes de aceptar la confirmación del pedido", () => {
  const borrador = procesarConversacion("1", pizzas);
  const intentoConfirmar = procesarConversacion(
    "confirmar pedido",
    pizzas,
    borrador.pedido
  );

  assert.equal(intentoConfirmar.accion, "guardar");
  assert.match(intentoConfirmar.respuesta, /Efectivo/);
  assert.match(intentoConfirmar.respuesta, /Transferencia/);
  assert.match(intentoConfirmar.respuesta, /Nequi.*312 406 0135/);
  assert.match(intentoConfirmar.respuesta, /CONFIRMAR PEDIDO/);
});

test("permite descartar el borrador antes de registrarlo", () => {
  const borrador = procesarConversacion("una Margarita", pizzas);
  const cancelado = procesarConversacion(
    "cancelar pedido",
    pizzas,
    borrador.pedido
  );

  assert.equal(cancelado.accion, "cancelar");
  assert.match(cancelado.respuesta, /Descarté el borrador/);
});

test("una consulta de disponibilidad no agrega el producto al borrador", () => {
  const borrador = procesarConversacion("una Margarita", pizzas);
  const consulta = procesarConversacion(
    "¿Tienen Pepperoni?",
    pizzas,
    borrador.pedido
  );

  assert.equal(consulta.accion, "guardar");
  assert.deepEqual(consulta.pedido.items, [
    { pizza_id: 1, cantidad: 1 },
  ]);
  assert.match(consulta.respuesta, /Sí tenemos Pepperoni/);
});

test("una pregunta sobre ingredientes no agrega automáticamente la pizza", () => {
  const respuesta = procesarConversacion("¿Qué trae Margarita?", pizzas);

  assert.equal(respuesta.accion, "ninguna");
  assert.equal(respuesta.pedido, null);
  assert.match(respuesta.respuesta, /Tomate y mozzarella/);
});
