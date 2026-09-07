CREATE TABLE IF NOT EXISTS pizzas (
    id SERIAL PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    descripcion TEXT NOT NULL,

    precio DECIMAL(10, 2) NOT NULL
        CHECK (precio >= 0),

    stock INTEGER NOT NULL DEFAULT 0
        CHECK (stock >= 0),

    imagen_url TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);