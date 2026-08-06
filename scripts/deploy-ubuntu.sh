#!/usr/bin/env bash
#
# deploy-ubuntu.sh
# Instala Docker y despliega el ERP Eléctrico en Ubuntu Server (Debian/Ubuntu).
#
# Uso:
#   ./deploy-ubuntu.sh                    # despliega en ~/servicios/ERP-contenerizado
#   DEPLOY_DIR=/ruta ./deploy-ubuntu.sh   # ruta personalizada
#
set -euo pipefail

REPO_URL="https://github.com/marcelodvpm/ERP-contenerizado.git"
DEPLOY_DIR="${DEPLOY_DIR:-$HOME/servicios/ERP-contenerizado}"

# ---- Colores ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Solo Debian/Ubuntu (usa apt-get)
command -v apt-get >/dev/null 2>&1 || error "Este script solo soporta Debian/Ubuntu."

# Privilegios
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
    command -v sudo >/dev/null 2>&1 || error "Se necesita sudo."
    SUDO="sudo"
fi

# docker (via sudo si es necesario para esta sesion)
docker_cmd() { $SUDO docker "$@"; }

info "Actualizando paquetes..."
$SUDO apt-get update
$SUDO apt-get install -y curl ca-certificates git openssl

# ---- Docker ----
if command -v docker >/dev/null 2>&1; then
    info "Docker ya está instalado."
else
    info "Instalando Docker (script oficial de Docker)..."
    curl -fsSL https://get.docker.com | $SUDO sh
fi

if ! docker_cmd compose version >/dev/null 2>&1; then
    error "El plugin 'docker compose' no quedó disponible. Revisá la instalación de Docker."
fi

$SUDO systemctl enable --now docker
info "Docker $($SUDO docker --version | awk '{print $3}' | tr -d ',') listo."

# Agregar usuario al grupo docker (aplica en próximas sesiones)
if [ -n "$SUDO" ]; then
    $SUDO usermod -aG docker "$USER" || true
    info "Usuario '$USER' agregado al grupo docker (logout/login para usar docker sin sudo)."
fi

# ---- Obtener el codigo ----
if [ -d "$DEPLOY_DIR/.git" ]; then
    info "Repo ya existe en $DEPLOY_DIR, actualizando con git pull..."
    git -C "$DEPLOY_DIR" pull
else
    if [ -d "$DEPLOY_DIR" ]; then
        error "La ruta $DEPLOY_DIR existe pero no es un repo git."
    fi
    info "Clonando el repo en $DEPLOY_DIR..."
    mkdir -p "$(dirname "$DEPLOY_DIR")"
    git clone "$REPO_URL" "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR/latina-home-solutions"

# ---- Configuracion .env ----
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    info "Creando .env con SECRET_KEY generada automaticamente..."
    cp .env.example "$ENV_FILE"
    SECRET_KEY="$(openssl rand -hex 32)"
    sed -i "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" "$ENV_FILE"
    warn "Revisa '$ENV_FILE' si queres cambiar valores."
else
    info ".env ya existe, se conserva."
fi

# ---- Desplegar ----
info "Construyendo y levantando contenedores (la primera vez tarda unos minutos)..."
docker_cmd compose up -d --build

echo
info "Estado de los servicios:"
docker_cmd compose ps

IP="$(hostname -I | awk '{print $1}')"
echo
info "!ERP desplegado!"
echo -e "  Web:   ${GREEN}http://${IP}${NC}"
echo -e "  API:   ${GREEN}http://${IP}:8000/docs${NC}"
echo
warn "Si activas ufw (firewall), abri los puertos 80 y 8000:"
warn "  sudo ufw allow 80/tcp && sudo ufw allow 8000/tcp"
