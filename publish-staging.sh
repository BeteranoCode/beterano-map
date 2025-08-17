#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
PROJECT_DIR="${1:-"$(cd "$(dirname "$0")" && pwd)"}"
BRANCH_DEV="dev"
BRANCH_MAIN="main"

say(){ echo -e "$*"; }

cd "$PROJECT_DIR"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "❌ No es un repo Git: $PROJECT_DIR"; exit 1; }

# 1) Commit en dev (interactivo)
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "$BRANCH_DEV" ]]; then
  say "ℹ️ Cambiando a '$BRANCH_DEV'…"
  git checkout "$BRANCH_DEV"
fi

say "📌 Estado actual en 'dev':"
git status --short

read -r -p "¿Quieres commitear los cambios en 'dev' ahora? (y/N): " DO_COMMIT
if [[ "${DO_COMMIT,,}" == "y" ]]; then
  read -r -p "Escribe el mensaje de commit (o deja vacío para usar uno por defecto): " COMMIT_MSG
  if [[ -z "${COMMIT_MSG:-}" ]]; then
    COMMIT_MSG="fix: ajustes validados en preview local; listo para merge a main"
  fi
  git add -A
  if git diff --cached --quiet; then
    say "ℹ️ No hay cambios para commit."
  else
    git commit -m "$COMMIT_MSG"
    git push origin "$BRANCH_DEV"
  fi
else
  say "⏭️ Saltando commit en dev."
fi

# 2) Merge a main
say "🔀 Merge '${BRANCH_DEV}' → '${BRANCH_MAIN}'…"
git checkout "$BRANCH_MAIN"
git pull
git merge --no-ff "$BRANCH_DEV" -m "merge: ${BRANCH_DEV} → ${BRANCH_MAIN} (staging publish)"
git push origin "$BRANCH_MAIN"

# 3) Deploy staging
say "🚀 Ejecutando deploy.sh (staging en gh-pages de beterano-map)…"
bash ./deploy.sh --branch "$BRANCH_MAIN"

say ""
say "✅ Listo: staging actualizado."
say "ℹ️ Para PRO: ve a 'beterano-web', actualiza el submódulo y despliega su gh-pages:"
say "   cd ../beterano-web"
say "   git pull"
say "   git submodule update --init --recursive"
say "   git submodule update --remote --merge submodules/beterano-map"
say "   git add submodules/beterano-map"
say "   git commit -m \"chore(submodule): bump beterano-map to latest main\""
say "   git push"
say "   bash deploy_web.sh"
