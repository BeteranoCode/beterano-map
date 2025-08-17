#!/bin/bash
set -e

# === Config ===
REQUIRED_BRANCH="main"

# 🧭 Asegura que estamos en un repo git
git rev-parse --is-inside-work-tree > /dev/null 2>&1 || {
  echo "❌ ERROR: Ejecuta dentro de un repositorio Git."; exit 1;
}

# 🧭 Verifica rama actual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
  echo "❌ Estás en '$CURRENT_BRANCH'. Cambia a '$REQUIRED_BRANCH' antes de desplegar."
  exit 1
fi

# 💾 Verifica árbol limpio
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️ Tienes cambios sin commitear. Haz commit o stash antes del deploy."
  exit 1
fi

# 🔄 Asegura última versión
echo "⬇️ Pull de '$REQUIRED_BRANCH'…"
git pull --rebase origin "$REQUIRED_BRANCH"

# 📦 Dependencias
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias…"
  npm ci || npm install
fi

# ✅ Vite disponible
npx --no vite --version > /dev/null 2>&1 || {
  echo "❌ Vite no disponible. Reinstalando deps…"
  rm -rf node_modules package-lock.json
  npm ci || npm install
}

# 🛠️ Build
echo "🔧 Compilando…"
npm run build || { echo "❌ Falló la compilación"; exit 1; }

# 📁 Verificación de dist
[ -d "dist" ] || { echo "❌ No existe 'dist/'."; exit 1; }
if [ -z "$(ls -A dist)" ]; then
  echo "⚠️ 'dist/' está vacía. Continuo, pero no habrá cambios visibles."
fi

# 🌐 SPA 404 + nojekyll
cp dist/index.html dist/404.html 2>/dev/null || true
touch dist/.nojekyll

# (Opcional) CNAME desde archivo o variable de entorno
if [ -n "$CNAME_DOMAIN" ]; then
  echo "$CNAME_DOMAIN" > dist/CNAME
elif [ -f "CNAME" ]; then
  cp CNAME dist/CNAME
fi

# 🔄 Limpia rama temporal
git show-ref --verify --quiet refs/heads/deploy-temp && git branch -D deploy-temp

# 🪄 Rama temporal
echo "🔀 Creando rama 'deploy-temp'…"
git checkout -b deploy-temp

# 🧹 Elimina todo del árbol de trabajo
git rm -rf . > /dev/null 2>&1 || true

# 📤 Copia build
cp -r dist/* ./

# 📤 Commit + push forzado a gh-pages
git add .
git commit -m "🚀 Deploy automático desde dist"
git push -f origin deploy-temp:gh-pages

# 🔙 Regresa a main y limpia
echo "🔄 Volviendo a '$REQUIRED_BRANCH'…"
git checkout "$REQUIRED_BRANCH"
git branch -D deploy-temp || true

echo "✅ Deploy completado con éxito en 'gh-pages'."
