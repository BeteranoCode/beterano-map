#!/bin/bash

echo "🔧 Compilando el proyecto..."
npm run build || { echo "❌ Falló la compilación"; exit 1; }

echo "🚀 Verificando si existe la rama gh-pages..."
if git show-ref --quiet refs/heads/gh-pages; then
  echo "✅ Rama gh-pages ya existe. Cambiando..."
  git checkout gh-pages
else
  echo "🆕 Rama gh-pages no existe. Creando..."
  git checkout --orphan gh-pages
fi

echo "🧹 Limpiando rama gh-pages..."
git rm -rf . > /dev/null 2>&1

echo "📂 Copiando solo archivos generados de dist/..."
cp -a dist/. .

echo "📦 Haciendo commit y push a gh-pages..."
git add .
git commit -m "🚀 Deploy automático desde dist"
git push origin gh-pages --force

echo "🔄 Volviendo a la rama main..."
git checkout main

echo "✅ Deploy completado con éxito."
