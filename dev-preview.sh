#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
# Si pasas una ruta como primer argumento, la usa.
# Si no, se posiciona en el directorio del script (asumiendo que está en la raíz del repo).
PROJECT_DIR="${1:-"$(cd "$(dirname "$0")" && pwd)"}"
PREVIEW_PORT="${PORT:-4173}"   # puedes export PORT=xxxx si quieres cambiarlo
PREVIEW_BASE_HINT="/beterano-map/"  # si tu vite.config.js tiene base distinta, cámbialo
BRANCH_DEV="dev"

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
say(){ echo -e "$*"; }
open_url(){
  local url="$1"
  if command -v xdg-open >/dev/null 2>&1; then xdg-open "$url" >/dev/null 2>&1 || true
  elif [[ "$OSTYPE" == "darwin"* ]]; then open "$url" >/dev/null 2>&1 || true
  elif command -v cmd.exe >/dev/null 2>&1; then cmd.exe /c start "" "$url" >/dev/null 2>&1 || true
  fi
}

# ─────────────────────────────────────────────
# Go!
# ─────────────────────────────────────────────
cd "$PROJECT_DIR"

# 1) Verificaciones básicas
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "❌ No es un repo Git: $PROJECT_DIR"; exit 1; }

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "$BRANCH_DEV" ]]; then
  say "ℹ️ Estás en '$CURRENT_BRANCH'. Cambiando a '$BRANCH_DEV'…"
  git checkout "$BRANCH_DEV"
fi

# 2) Dependencias
if [[ ! -d node_modules ]]; then
  say "📦 Instalando dependencias (npm ci fallback npm install)…"
  npm ci || npm install
fi

# 3) Build + Preview
say "🔧 Compilando (npm run build)…"
npm run build

say "🟢 Lanzando preview de producción en http://localhost:${PREVIEW_PORT}${PREVIEW_BASE_HINT}"
# Arrancamos preview en background y lo cerramos al pulsar ENTER
npm run preview -- --port "${PREVIEW_PORT}" --strictPort >/dev/null 2>&1 &
PREVIEW_PID=$!

# Abrimos navegador si es posible (best effort)
open_url "http://localhost:${PREVIEW_PORT}${PREVIEW_BASE_HINT}"

say ""
say "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
say "✅ Preview en marcha."
say "   ➤ URL típica: http://localhost:${PREVIEW_PORT}${PREVIEW_BASE_HINT}"
say ""
say "👉 Revisa el mapa en ESCRITORIO y MÓVIL."
say "   Si está correcto:"
say "   1) Haz commit en 'dev' con el mensaje que te dio ChatGPT."
say "      Ejemplo:"
say "         git add -A"
say "         git commit -m \"fix(css): mapa ok escritorio; wrapper a 100% y root sin absolute\""
say "         git push origin dev"
say "   2) Sincroniza con main:"
say "         git checkout main"
say "         git pull"
say "         git merge --no-ff dev -m \"merge: dev → main (lote de fixes)\""
say "         git push origin main"
say "   3) Publica staging:"
say "         bash deploy.sh --branch main"
say ""
say "   Si NO está resuelto, ajusta el código y vuelve a ejecutar este script."
say "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
say ""
read -r -p "Pulsa ENTER para detener el preview…" _

kill "$PREVIEW_PID" 2>/dev/null || true
say "👋 Preview detenido."
