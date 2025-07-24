#!/bin/bash

echo "🔧 Compilando el proyecto..."
npm run build || { echo "❌ Falló la compilación"; exit 1; }

echo "🚀 Cambiando a rama gh-pages..."
git checkout gh-pages || { echo "❌ No se pudo cambiar a gh-pages"; exit 1; }

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
