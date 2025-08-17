#!/bin/bash
set -e

# =========================================
# Config
# =========================================
TARGET_BRANCH="main"  # por defecto
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      TARGET_BRANCH="$2"; shift 2;;
    *)
      echo "Uso: bash deploy.sh [--branch main|dev]"; exit 1;;
  esac
done

# =========================================
# Helpers
# =========================================
die(){ echo "❌ $1"; exit 1; }
info(){ echo "👉 $1"; }

require_clean_tree(){
  git diff --quiet || die "Tienes cambios sin commit (working tree)."
  git diff --cached --quiet || die "Tienes cambios indexados sin commit."
}

is_inside_git || true
is_inside_git(){
  git rev-parse --is-inside-work-tree > /dev/null 2>&1
}

is_submodule(){
  # Devuelve 0 si estamos dentro de un submódulo (hay superproyecto)
  [[ -n "$(git rev-parse --show-superproject-working-tree 2>/dev/null || true)" ]]
}

submodule_path(){
  # Deriva la ruta del submódulo dentro del superproyecto a partir de .git dir
  # .git/modules/<ruta/submodulo>
  local gd
  gd="$(git rev-parse --git-dir)" || return 1
  echo "$gd" | sed -E 's#.git/modules/(.*)#\1#'
}

# =========================================
# Checks iniciales
# =========================================
is_inside_git || die "Ejecuta dentro de un repo Git."

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[[ "$CURRENT_BRANCH" == "$TARGET_BRANCH" ]] || die "Estás en '$CURRENT_BRANCH'. Cambia a '$TARGET_BRANCH' (git checkout $TARGET_BRANCH)."

require_clean_tree

info "Sincronizando '$TARGET_BRANCH'…"
git pull --rebase origin "$TARGET_BRANCH"

# =========================================
# Dependencias y build
# =========================================
if [ ! -d "node_modules" ]; then
  info "Instalando dependencias…"
  npm ci || npm install
fi

npx --no vite --version > /dev/null 2>&1 || {
  rm -rf node_modules package-lock.json
  npm ci || npm install
}

info "Compilando…"
npm run build || die "Falló la compilación"

[ -d dist ] || die "No existe 'dist/'"
[ -f dist/index.html ] || die "No existe 'dist/index.html'"

cp dist/index.html dist/404.html || true
touch dist/.nojekyll

# =========================================
# Deploy a gh-pages (del propio beterano-map)
# =========================================
# Rama temporal limpia
git show-ref --verify --quiet refs/heads/deploy-temp && git branch -D deploy-temp
git checkout -b deploy-temp

# vaciar árbol y copiar dist
git rm -rf . > /dev/null 2>&1 || true
cp -r dist/* ./

git add .
git commit -m "🚀 Deploy automático desde dist ($TARGET_BRANCH)"
git push -f origin deploy-temp:gh-pages

git checkout "$TARGET_BRANCH"
git branch -D deploy-temp || true
info "✅ Deploy en gh-pages de beterano-map completado."

# =========================================
# Si estamos dentro de un superproyecto (beterano-web),
# actualizamos el puntero del submódulo a este commit.
# =========================================
if is_submodule; then
  SUPER_ROOT="$(git rev-parse --show-superproject-working-tree)"
  SUB_PATH="$(submodule_path)"
  THIS_SHA="$(git rev-parse --short HEAD)"

  if [[ -n "$SUPER_ROOT" && -n "$SUB_PATH" ]]; then
    info "Detectado superproyecto en: $SUPER_ROOT"
    info "Ruta del submódulo: $SUB_PATH"
    pushd "$SUPER_ROOT" > /dev/null

      # Nos aseguramos de estar en la rama por defecto del superproyecto
      SUPER_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
      info "Superproyecto en rama '$SUPER_BRANCH'."
      require_clean_tree

      # Añadimos el cambio del puntero del submódulo
      git add "$SUB_PATH"
      if git commit -m "chore(submodule): bump beterano-map to $THIS_SHA ($TARGET_BRANCH)"; then
        git push origin "$SUPER_BRANCH"
        info "✅ Actualizado submódulo en superproyecto y pusheado."
      else
        info "ℹ️ No hubo cambios de puntero que commitear en superproyecto."
      fi

    popd > /dev/null
  fi
fi

info "🎉 Proceso finalizado."
