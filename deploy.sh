#!/bin/bash

echo "🔧 Compilando el proyecto..."
npm run build || { echo "❌ Falló la compilación"; exit 1; }

echo "🚀 Cambiando o creando rama gh-pages..."
git show-ref --quiet refs/heads/gh-pages && \
  git checkout gh-pages || \
  git checkout --orphan gh-pages
  
echo "🧹 Eliminando archivos anteriores..."
git rm -r * || echo "ℹ️ No había archivos anteriores o ya estaban eliminados"

echo "📂 Copiando archivos nuevos desde dist/..."
cp -r dist/* .

echo "📦 Haciendo commit y push a gh-pages..."
git add .
git commit -m "🚀 Deploy automático desde dist"
git push origin gh-pages

echo "🔄 Volviendo a rama main..."
git checkout main

echo "✅ Deploy completado con éxito."
