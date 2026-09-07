CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id SERIAL PRIMARY KEY,

    pedido_id INTEGER NOT NULL,

    pizza_id INTEGER NOT NULL,

    cantidad INTEGER NOT NULL,

    precio_unitario NUMERIC(12, 2) NOT NULL,

    subtotal NUMERIC(12, 2) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_pizza
        FOREIGN KEY (pizza_id)
        REFERENCES pizzas(id)
);