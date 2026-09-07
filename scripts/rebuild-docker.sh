#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Deteniendo contenedores y borrando volumen de datos..."
docker compose down -v --remove-orphans

echo "==> Liberando puerto 5432 (PostgreSQL local de Windows, si existe)..."
powershell.exe -NoProfile -Command "
  \$service = Get-Service -Name 'postgresql-x64-17' -ErrorAction SilentlyContinue
  if (\$service -and \$service.Status -eq 'Running') {
    Stop-Service -Name 'postgresql-x64-17' -Force
    Write-Host 'PostgreSQL local detenido.'
  } else {
    Write-Host 'No hay PostgreSQL local en ejecución.'
  }
" || true

echo "==> Construyendo e iniciando contenedores..."
docker compose up -d --build

echo "==> Esperando base de datos..."
sleep 8

echo "==> Health check..."
curl -s http://localhost:3000/api/health || true
echo ""

echo "==> Login admin..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"admin123"}' || true
echo ""

echo ""
echo "Listo."
echo "  API:     http://localhost:3000"
echo "  Cliente: http://localhost:5173"
echo "  Admin:   http://localhost:5173/admin.html"
echo "  Usuario: admin"
echo "  Clave:   admin123"
