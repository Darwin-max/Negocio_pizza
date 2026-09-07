CREATE TABLE IF NOT EXISTS administradores (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- password: admin123
INSERT INTO administradores (usuario, password_hash)
VALUES (
  'admin',
  '$2b$10$WJ6rc8cjr4ht199ZB/HWKew9DJJBn4dm/nbmYsA3DrLR3govZIURe'
)
ON CONFLICT (usuario) DO NOTHING;
