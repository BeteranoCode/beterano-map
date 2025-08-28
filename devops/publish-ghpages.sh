#!/bin/bash
set -e

echo "🚀 Deploy a GitHub Pages iniciado..."

# 1. Elimina worktrees viejos
echo "🧹 Limpiando worktrees antiguos..."
git worktree remove .gh-pages -f 2>/dev/null || true
rm -rf .gh-pages 2>/dev/null || true

# 2. Build fresco
echo "🏗️ Compilando proyecto con Vite..."
git pull origin main
npm ci
npm run build

# 3. Publica SOLO dist/ en gh-pages usando subtree
echo "📤 Publicando en rama gh-pages..."
git subtree split --prefix dist -b gh-pages-tmp
git push -f origin gh-pages-tmp:gh-pages
git branch -D gh-pages-tmp

echo "✅ Deploy completado con éxito."
echo "🌍 Verifica en: https://beteranocode.github.io/beterano-map/"
