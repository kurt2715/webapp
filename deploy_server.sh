#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/kurt2715/webapp.git"
APP_DIR="/opt/webapp"
SRC_DIR="${APP_DIR}/source"
FRONTEND_DIR="${SRC_DIR}/frontend"
BACKEND_DIR="${SRC_DIR}/backend"
FRONTEND_DIST="${APP_DIR}/frontend-dist"
BACKEND_SERVICE="webapp-backend"

confirm() {
  local prompt="$1"
  read -r -p "${prompt} [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

step() {
  echo "\n==> $1"
}

step "Prepare source code"
if [[ -d "${SRC_DIR}/.git" ]]; then
  cd "${SRC_DIR}"
  git fetch --all
  git pull --rebase
else
  if [[ -d "${SRC_DIR}" && -n "$(ls -A "${SRC_DIR}" 2>/dev/null)" ]]; then
    echo "ERROR: ${SRC_DIR} exists but is not a git repo."
    echo "Either remove it or initialize it as a git repo, then rerun."
    exit 1
  fi
  mkdir -p "${APP_DIR}"
  git clone "${REPO_URL}" "${SRC_DIR}"
fi

step "Build frontend"
cd "${FRONTEND_DIR}"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
npm run build

step "Publish frontend dist"
mkdir -p "${FRONTEND_DIST}"
rm -rf "${FRONTEND_DIST:?}"/*
cp -R "${FRONTEND_DIR}/dist/." "${FRONTEND_DIST}/"

step "Setup backend virtualenv"
cd "${BACKEND_DIR}"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt

step "Update systemd service (optional)"
SERVICE_FILE="/etc/systemd/system/${BACKEND_SERVICE}.service"
if confirm "Write/update systemd service file at ${SERVICE_FILE}?"; then
  sudo tee "${SERVICE_FILE}" > /dev/null <<SERVICE
[Unit]
Description=Webapp FastAPI Backend
After=network.target

[Service]
User=root
WorkingDirectory=${BACKEND_DIR}
ExecStart=${BACKEND_DIR}/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

  sudo systemctl daemon-reload
  sudo systemctl enable "${BACKEND_SERVICE}"
fi

if confirm "Restart backend service (${BACKEND_SERVICE}) now?"; then
  sudo systemctl restart "${BACKEND_SERVICE}"
fi

if confirm "Restart nginx now?"; then
  sudo systemctl restart nginx
fi

echo "\nDone. Frontend dist is at ${FRONTEND_DIST} and backend source is at ${BACKEND_DIR}."
